import React, { useState, useEffect, useCallback } from 'react';
import { Store, Plus, Search, MapPin, Star, Loader2, X, Edit2, Trash2, Package, DollarSign, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import toast from 'react-hot-toast';
import { AdminPage, AdminPageHeader, PageLoading } from '../components/layout/AdminPage';

/** Vendor "offline" may be `is_active: false` or (still active listing but) `is_accepting_orders: false`. */
function getShopPresence(shop) {
  if (shop.is_active === false) return { label: 'Offline', className: 'status-inactive' };
  if (shop.is_accepting_orders === false) return { label: 'Paused', className: 'status-pending' };
  return { label: 'Online', className: 'status-active' };
}

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [editingShop, setEditingShop] = useState(null);

  const [locations, setLocations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [shopStats, setShopStats] = useState({ item_count: 0, order_count: 0 });
  const [catalogItems, setCatalogItems] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const [shopData, setShopData] = useState({ name: '', location_id: '', owner_id: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [sData, lData, vData] = await Promise.all([
      supabaseAdmin.from('shops').select('*, locations(name), profiles:owner_id(full_name)'),
      supabaseAdmin.from('locations').select('id, name'),
      supabaseAdmin.from('profiles').select('id, full_name').eq('role', 'vendor'),
    ]);
    if (sData.data) {
      setShops(sData.data);
      setFilteredShops(sData.data);
    }
    if (lData.data) setLocations(lData.data);
    if (vData.data) setVendors(vData.data);
    setLoading(false);
  };

  const refetchShopsSilently = useCallback(async () => {
    const { data, error } = await supabaseAdmin.from('shops').select('*, locations(name), profiles:owner_id(full_name)');
    if (error) {
      console.warn('[Shops] refresh failed', error.message);
      return;
    }
    if (data) setShops(data);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let debounceTimer;
    const scheduleRefetch = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => refetchShopsSilently(), 320);
    };

    const channel = supabase
      .channel('admin-shops-list-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, scheduleRefetch)
      .subscribe((status, err) => {
        if (import.meta.env.DEV) {
          if (status === 'SUBSCRIBED') {
            console.info('[Realtime] public.shops → admin list (subscribed)');
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || err) {
            console.warn('[Realtime] shops list channel:', status, err?.message ?? err);
          }
        }
      });

    const onVisible = () => {
      if (document.visibilityState === 'visible') refetchShopsSilently();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refetchShopsSilently]);

  useEffect(() => {
    if (!isDetailOpen || !selectedShop?.id) return;
    const next = shops.find((s) => s.id === selectedShop.id);
    if (next) setSelectedShop(next);
  }, [shops, isDetailOpen, selectedShop?.id]);

  useEffect(() => {
    const low = searchTerm.toLowerCase();
    setFilteredShops(
      shops.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(low) ||
          (s.locations?.name || '').toLowerCase().includes(low) ||
          (s.profiles?.full_name || '').toLowerCase().includes(low)
      )
    );
  }, [searchTerm, shops]);

  const handleOpenDetail = async (shop) => {
    setSelectedShop(shop);
    setIsDetailOpen(true);
    setLoadingCatalog(true);
    const [itemCountRes, orderCountRes, catalogRes] = await Promise.all([
      supabaseAdmin.from('menu_items').select('id', { count: 'exact', head: true }).eq('shop_id', shop.id),
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('shop_id', shop.id),
      supabaseAdmin.from('menu_items').select('*, categories(name)').eq('shop_id', shop.id).limit(20),
    ]);
    setShopStats({ item_count: itemCountRes.count || 0, order_count: orderCountRes.count || 0 });
    setCatalogItems(catalogRes.data || []);
    setLoadingCatalog(false);
  };

  const handleOpenEdit = (shop, e) => {
    e.stopPropagation();
    setEditingShop(shop);
    setShopData({
      name: shop.name || '',
      location_id: shop.location_id || '',
      owner_id: shop.owner_id || '',
      description: shop.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let payload = { ...shopData };
    if (editingShop) {
      payload.is_active = editingShop.is_active;
      if ('is_accepting_orders' in editingShop) {
        payload.is_accepting_orders = editingShop.is_accepting_orders;
      }
    } else {
      payload.is_active = true;
    }
    const res = editingShop
      ? await supabaseAdmin.from('shops').update(payload).eq('id', editingShop.id)
      : await supabaseAdmin.from('shops').insert([payload]);
    if (res.error) toast.error(res.error.message);
    else {
      toast.success('Saved.');
      setIsModalOpen(false);
      fetchData();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (shop, e) => {
    e.stopPropagation();
    if (window.confirm(`Permanently remove ${shop.name}?`)) {
      const { error } = await supabaseAdmin.from('shops').delete().eq('id', shop.id);
      if (!error) {
        toast.success('Removed.');
        fetchData();
      }
    }
  };

  if (loading) return <PageLoading message="Loading shops…" />;

  return (
    <AdminPage>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {isDetailOpen && selectedShop && (
          <div className="modal-overlay" onClick={() => setIsDetailOpen(false)} role="presentation">
            <div className="modal-glass modal-glass--wide" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} role="dialog">
              <button type="button" className="modal-close-btn" onClick={() => setIsDetailOpen(false)} aria-label="Close">
                <X size={20} />
              </button>

              <div
                style={{
                  flexShrink: 0,
                  backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  padding: '36px 32px',
                  color: '#fff',
                  borderRadius: '0',
                }}
              >
                <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px', paddingRight: '40px' }}>{selectedShop.name}</h2>
                <div style={{ display: 'flex', gap: '18px', fontSize: '14px', opacity: 0.95, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} />
                    {selectedShop.locations?.name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    {getShopPresence(selectedShop).label}
                  </span>
                </div>
              </div>

              <div style={{ overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="glass-inset" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Package size={22} color="var(--accent)" />
                    <div>
                      <p style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{shopStats.item_count}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Catalog items</p>
                    </div>
                  </div>
                  <div className="glass-inset" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <DollarSign size={22} color="var(--success)" />
                    <div>
                      <p style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{shopStats.order_count}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Orders</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 800, letterSpacing: '0.06em' }}>Catalog preview</h4>
                  {loadingCatalog ? (
                    <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
                      <Loader2 className="animate-spin" size={28} color="var(--accent)" />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {catalogItems.map((item) => (
                        <div key={item.id} className="glass-inset" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.8)',
                                border: '1px solid rgba(226,232,240,0.9)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Tag size={16} color="var(--accent)" />
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{item.name}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.categories?.name || 'General'}</p>
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>₹{item.price}</div>
                        </div>
                      ))}
                      {catalogItems.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No catalog items found.</p>}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setIsDetailOpen(false)} className="btn btn-outline btn-rounded" style={{ flex: 1 }}>
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      setIsDetailOpen(false);
                      handleOpenEdit(selectedShop, e);
                    }}
                    className="btn btn-primary btn-rounded"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Edit2 size={16} /> Edit shop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)} role="presentation">
            <div className="modal-glass" onClick={(e) => e.stopPropagation()} role="dialog">
              <button type="button" className="modal-close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', paddingRight: '40px' }}>{editingShop ? 'Edit shop' : 'Register shop'}</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Shop name *</label>
                  <input
                    type="text"
                    required
                    className="input-modal-glass"
                    value={shopData.name}
                    onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Hub *</label>
                    <select
                      required
                      className="input-modal-glass"
                      value={shopData.location_id}
                      onChange={(e) => setShopData({ ...shopData, location_id: e.target.value })}
                    >
                      <option value="">Select</option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Partner</label>
                    <select className="input-modal-glass" value={shopData.owner_id} onChange={(e) => setShopData({ ...shopData, owner_id: e.target.value })}>
                      <option value="">None</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Description</label>
                  <textarea
                    className="input-modal-glass"
                    value={shopData.description}
                    onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
                    rows={2}
                    style={{ resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline btn-rounded" style={{ flex: 1 }}>
                    Discard
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-rounded" style={{ flex: 1 }}>
                    {isSubmitting ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <AdminPageHeader
          eyebrow="Retail"
          title={`Campus shops (${filteredShops.length})`}
          description="Browse outlets, open details, and manage hub assignments and partners."
          actions={
            <button
              type="button"
              onClick={() => {
                setEditingShop(null);
                setShopData({ name: '', location_id: '', owner_id: '', description: '' });
                setIsModalOpen(true);
              }}
              className="btn btn-primary btn-rounded"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={18} /> Register shop
            </button>
          }
        />

        <div className="panel-glass">
          <div className="data-toolbar">
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="search"
                className="input-search-glass"
                placeholder="Search shops, hub, or partner…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search shops"
              />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(248, 250, 252, 0.85)', borderBottom: '1px solid rgba(226, 232, 240, 0.95)' }}>
                  {['Name', 'Hub', 'Partner', 'Status', ''].map((h) => (
                    <th
                      key={h || 'a'}
                      style={{
                        padding: '16px 20px',
                        textAlign: h === '' ? 'right' : 'left',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredShops.map((shop) => (
                  <tr key={shop.id} className="table-row-glass" onClick={() => handleOpenDetail(shop)} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Store size={20} color="var(--accent)" />
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{shop.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '18px 20px', color: '#475569' }}>{shop.locations?.name || '—'}</td>
                    <td style={{ padding: '18px 20px', color: '#475569' }}>{shop.profiles?.full_name || 'Unassigned'}</td>
                    <td style={{ padding: '18px 20px' }}>
                      {(() => {
                        const p = getShopPresence(shop);
                        return <span className={`status-badge ${p.className}`}>{p.label}</span>;
                      })()}
                    </td>
                    <td style={{ padding: '18px 20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={(e) => handleOpenEdit(shop, e)} className="icon-circle-btn" style={{ width: '38px', height: '38px' }} aria-label="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button type="button" onClick={(e) => handleDelete(shop, e)} className="icon-circle-btn" style={{ width: '38px', height: '38px', color: 'var(--danger)' }} aria-label="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredShops.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state-muted">{searchTerm ? 'No shops match your search.' : 'No shops registered yet.'}</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPage>
  );
};

export default Shops;
