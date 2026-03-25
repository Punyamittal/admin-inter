import React, { useState, useEffect } from 'react';
import { Store, Plus, Search, Filter, MoreVertical, Star, MapPin, User, Loader2, X, Edit2, Trash2, Package, ExternalLink, Clock, DollarSign, ChevronRight, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import toast from 'react-hot-toast';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [editingShop, setEditingShop] = useState(null);
  
  const [locations, setLocations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [shopStats, setShopStats] = useState({ item_count: 0, order_count: 0 });
  const [catalogItems, setCatalogItems] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Form State
  const [shopData, setShopData] = useState({ name: '', location_id: '', owner_id: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [sData, lData, vData] = await Promise.all([
        supabaseAdmin.from('shops').select('*, locations(name), profiles:owner_id(full_name)'),
        supabaseAdmin.from('locations').select('id, name'),
        supabaseAdmin.from('profiles').select('id, full_name').eq('role', 'vendor')
    ]);
    if (sData.data) {
        setShops(sData.data);
        setFilteredShops(sData.data);
    }
    if (lData.data) setLocations(lData.data);
    if (vData.data) setVendors(vData.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const low = searchTerm.toLowerCase();
    setFilteredShops(shops.filter(s => 
        (s.name || '').toLowerCase().includes(low) || 
        (s.locations?.name || '').toLowerCase().includes(low) ||
        (s.profiles?.full_name || '').toLowerCase().includes(low)
    ));
  }, [searchTerm, shops]);

  const handleOpenDetail = async (shop) => {
    setSelectedShop(shop);
    setIsDetailOpen(true);
    setLoadingCatalog(true);
    // Fetch quick stats and full catalog for detail view
    const [itemCountRes, orderCountRes, catalogRes] = await Promise.all([
        supabaseAdmin.from('menu_items').select('id', { count: 'exact', head: true }).eq('shop_id', shop.id),
        supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('shop_id', shop.id),
        supabaseAdmin.from('menu_items').select('*, categories(name)').eq('shop_id', shop.id).limit(20)
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
        description: shop.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { ...shopData, is_active: true };
    const res = editingShop 
        ? await supabaseAdmin.from('shops').update(payload).eq('id', editingShop.id) 
        : await supabaseAdmin.from('shops').insert([payload]);
    if (res.error) toast.error(res.error.message);
    else {
        toast.success(`Success!`);
        setIsModalOpen(false);
        fetchData();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (shop, e) => {
    e.stopPropagation();
    if (window.confirm(`Permanently remove ${shop.name}?`)) {
        const { error } = await supabaseAdmin.from('shops').delete().eq('id', shop.id);
        if (!error) { toast.success('Removed.'); fetchData(); }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SHOP DETAIL MODAL WITH CATALOG */}
      {isDetailOpen && selectedShop && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '0', overflow: 'hidden', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
             <button onClick={() => setIsDetailOpen(false)} style={{ position: 'absolute', right: '20px', top: '20px', border: 'none', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '8px', cursor: 'pointer', zIndex: 10 }}>
                <X size={20} color="var(--primary)" />
             </button>
             
             {/* Header Section */}
             <div style={{ flexShrink: 0, backgroundColor: 'var(--accent)', backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', padding: '40px', color: '#fff' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>{selectedShop.name}</h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', opacity: 0.9 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} />{selectedShop.locations?.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={14} fill="#FFD700" color="#FFD700" />4.8 Rating</span>
                </div>
             </div>
             
             {/* Content Section - Scrollable */}
             <div style={{ overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Package size={20} color="var(--accent)" />
                      <div><p style={{ fontSize: '18px', fontWeight: '800' }}>{shopStats.item_count}</p><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Catalog Items</p></div>
                   </div>
                   <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <DollarSign size={20} color="var(--success)" />
                      <div><p style={{ fontSize: '18px', fontWeight: '800' }}>{shopStats.order_count}</p><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Orders</p></div>
                   </div>
                </div>

                {/* Catalog List */}
                <div>
                   <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 'bold' }}>Current Catalog Preview</h4>
                   {loadingCatalog ? <Loader2 className="animate-spin" size={24} /> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                         {catalogItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={16} color="var(--accent)" /></div>
                                  <div>
                                     <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</p>
                                     <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.categories?.name || 'General'}</p>
                                  </div>
                               </div>
                               <div style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{item.price}</div>
                            </div>
                         ))}
                         {catalogItems.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No catalog found.</p>}
                      </div>
                   )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                   <button onClick={() => setIsDetailOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
                   <button onClick={(e) => { setIsDetailOpen(false); handleOpenEdit(selectedShop, e); }} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Edit2 size={16} /> Update Shop
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>{editingShop ? 'Edit Shop' : 'Register Shop'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Shop Name *</label><input type="text" required value={shopData.name} onChange={(e) => setShopData({...shopData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Hub *</label>
                   <select required value={shopData.location_id} onChange={(e) => setShopData({...shopData, location_id: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                     <option value="">Select</option>
                     {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                   </select>
                </div>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Partner</label>
                   <select value={shopData.owner_id} onChange={(e) => setShopData({...shopData, owner_id: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                     <option value="">None</option>
                     {vendors.map(v => <option key={v.id} value={v.id}>{v.full_name}</option>)}
                   </select>
                </div>
              </div>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Description</label><textarea value={shopData.description} onChange={(e) => setShopData({...shopData, description: e.target.value})} rows="2" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', resize: 'none' }}></textarea></div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Discard</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 1 }}>{isSubmitting ? 'Syncing...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Campus Shops ({filteredShops.length})</h1><p style={{ color: 'var(--text-muted)' }}>Real-time retail metrics.</p></div>
        <button onClick={() => { setEditingShop(null); setShopData({ name: '', location_id: '', owner_id: '', description: '' }); setIsModalOpen(true); }} className="btn btn-primary"><Plus size={18} /> Register Shop</button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px' }}><div style={{ position: 'relative', maxWidth: '400px' }}><Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} /><input type="text" placeholder="Search shops..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', paddingLeft: '40px', height: '42px', borderRadius: '10px', border: '1px solid var(--border)' }} /></div></div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>NAME</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>HUB</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>PARTNER</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop) => (
                <tr key={shop.id} onClick={() => handleOpenDetail(shop)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                  <td style={{ padding: '20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Store size={20} color="var(--accent)" /><span style={{ fontWeight: '600' }}>{shop.name}</span></div></td>
                  <td style={{ padding: '20px' }}>{shop.locations?.name || '---'}</td>
                  <td style={{ padding: '20px' }}>{shop.profiles?.full_name || 'Unassigned'}</td>
                  <td style={{ padding: '20px' }}><span className={`status-badge ${shop.is_active ? 'status-active' : 'status-inactive'}`}>{shop.is_active ? 'Online' : 'Offline'}</span></td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={(e) => handleOpenEdit(shop, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={18} /></button>
                        <button onClick={(e) => handleDelete(shop, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Shops;
