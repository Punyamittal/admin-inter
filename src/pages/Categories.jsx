import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, Store, Loader2, X } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import toast from 'react-hot-toast';
import { AdminPage, AdminPageHeader } from '../components/layout/AdminPage';

const CategoriesGrid = ({ refreshTrigger, onEdit, onDetail }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryMeta = {
    'Full Meals': { emoji: '🍱', color: '#FFEDD5' },
    Snacks: { emoji: '🍟', color: '#DBEAFE' },
    Beverages: { emoji: '☕', color: '#D1FAE5' },
    Desserts: { emoji: '🍰', color: '#F3E8FF' },
    Healthy: { emoji: '🥗', color: '#FEF3C7' },
    'Fast Food': { emoji: '🍔', color: '#FEE2E2' },
    Sandwiches: { emoji: '🥪', color: '#FFEDD5' },
    'Chaat Items': { emoji: '🥘', color: '#DBEAFE' },
    'Pasta Menu': { emoji: '🍝', color: '#D1FAE5' },
    'Italian Specials': { emoji: '🍕', color: '#F3E8FF' },
    Fries: { emoji: '🍟', color: '#FEE2E2' },
    Shawarma: { emoji: '🌯', color: '#FEF3C7' },
    'Egg Items': { emoji: '🥚', color: '#DBEAFE' },
    Maggi: { emoji: '🍜', color: '#D1FAE5' },
    Rolls: { emoji: '🌯', color: '#F3E8FF' },
    Burgers: { emoji: '🍔', color: '#FEE2E2' },
    Omelette: { emoji: '🍳', color: '#FEF3C7' },
    Juices: { emoji: '🥤', color: '#D1FAE5' },
    Milkshakes: { emoji: '🥤', color: '#F3E8FF' },
    Lassi: { emoji: '🥛', color: '#DBEAFE' },
    'Cold Drinks': { emoji: '🧊', color: '#DBEAFE' },
    Plates: { emoji: '🍽️', color: '#F3E8FF' },
  };

  const fetchRealData = async () => {
    setLoading(true);
    const { data: cats } = await supabaseAdmin.from('categories').select('*');
    const { data: items } = await supabaseAdmin.from('menu_items').select('category_id, shop_id');

    if (cats && items) {
      setCategories(
        cats
          .map((c) => {
            const categoryItems = items.filter((i) => i.category_id === c.id);
            const uniqueShops = new Set(categoryItems.map((i) => i.shop_id));
            const meta = categoryMeta[c.name] || { emoji: '🍴', color: '#F1F5F9' };
            return {
              id: c.id,
              name: c.name,
              shopsCount: uniqueShops.size,
              itemsCount: categoryItems.length,
              emoji: meta.emoji,
              color: meta.color,
            };
          })
          .sort((a, b) => b.itemsCount - a.itemsCount)
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRealData();
  }, [refreshTrigger]);

  const handleDelete = async (cat, e) => {
    e.stopPropagation();
    if (window.confirm(`Permanently remove category "${cat.name}"?`)) {
      const { error } = await supabaseAdmin.from('categories').delete().eq('id', cat.id);
      if (!error) {
        toast.success('Removed.');
        fetchRealData();
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card" style={{ padding: '24px', minHeight: '168px' }}>
            <div className="skeleton-block" style={{ height: '64px', width: '64px', borderRadius: '16px', marginBottom: '18px' }} />
            <div className="skeleton-block" style={{ height: '22px', width: '72%', marginBottom: '14px' }} />
            <div className="skeleton-block" style={{ height: '14px', width: '48%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return <div className="empty-state-muted glass-card" style={{ borderRadius: 'var(--glass-radius)' }}>No categories yet — create one to classify menu items.</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="glass-card glass-card--interactive"
          onClick={() => onDetail(cat)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '22px',
            borderTop: `4px solid ${cat.color}`,
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
            <div
              style={{
                fontSize: '32px',
                width: '64px',
                height: '64px',
                backgroundColor: cat.color,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 14px rgba(15,23,42,0.08)',
              }}
            >
              {cat.emoji}
            </div>
            <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(cat); }} className="icon-circle-btn" style={{ width: '38px', height: '38px' }} aria-label="Edit category">
                <Edit2 size={16} />
              </button>
              <button type="button" onClick={(e) => handleDelete(cat, e)} className="icon-circle-btn" style={{ width: '38px', height: '38px', color: 'var(--danger)' }} aria-label="Delete category">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>{cat.name}</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Store size={14} />
                {cat.shopsCount} shops
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={14} />
                {cat.itemsCount} items
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [catItems, setCatItems] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenDetail = async (cat) => {
    setSelectedCat(cat);
    setIsDetailOpen(true);
    setLoadingDetail(true);
    const { data } = await supabaseAdmin
      .from('menu_items')
      .select(
        `
            id, name, price,
            shops (name)
        `
      )
      .eq('category_id', cat.id);
    setCatItems(data || []);
    setLoadingDetail(false);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = editingCat
      ? await supabaseAdmin.from('categories').update({ name: catName }).eq('id', editingCat.id)
      : await supabaseAdmin.from('categories').insert([{ name: catName }]);
    if (!res.error) {
      toast.success('Saved.');
      setIsModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    }
    setIsSubmitting(false);
  };

  return (
    <AdminPage>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {isDetailOpen && selectedCat && (
          <div className="modal-overlay" onClick={() => setIsDetailOpen(false)} role="presentation">
            <div
              className="modal-glass modal-glass--wide"
              style={{ padding: 0, maxWidth: '520px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
            >
              <button type="button" className="modal-close-btn" onClick={() => setIsDetailOpen(false)} aria-label="Close">
                <X size={20} />
              </button>

              <div style={{ padding: '28px 32px', backgroundColor: selectedCat.color, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      fontSize: '32px',
                      width: '64px',
                      height: '64px',
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                    }}
                  >
                    {selectedCat.emoji}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{selectedCat.name}</h2>
                    <p style={{ color: '#475569', fontSize: '13px', fontWeight: 500 }}>Items across all shops</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '22px 28px', overflowY: 'auto', flex: 1 }}>
                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 800, letterSpacing: '0.06em' }}>Menu items</h4>
                {loadingDetail ? (
                  <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={28} color="var(--accent)" />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {catItems.map((item) => (
                      <div key={item.id} className="glass-inset" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{item.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.shops?.name}</p>
                        </div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>₹{item.price}</div>
                      </div>
                    ))}
                    {catItems.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No items in this category.</p>}
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: '18px 28px',
                  borderTop: '1px solid rgba(226, 232, 240, 0.95)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Total: <strong style={{ color: '#0f172a' }}>{selectedCat.itemsCount}</strong>
                </span>
                <button type="button" onClick={() => setIsDetailOpen(false)} className="btn btn-primary btn-rounded" style={{ padding: '10px 22px' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)} role="presentation">
            <div className="modal-glass modal-glass--compact" onClick={(e) => e.stopPropagation()} role="dialog">
              <button type="button" className="modal-close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', paddingRight: '40px' }}>{editingCat ? 'Rename category' : 'New category'}</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" required className="input-modal-glass" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category name" />
                <div style={{ display: 'flex', gap: '12px' }}>
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
          eyebrow="Catalog"
          title="Food categories"
          description="Taxonomy for menu items across shops. Open a card to inspect every item using that category."
          actions={
            <button
              type="button"
              onClick={() => {
                setEditingCat(null);
                setCatName('');
                setIsModalOpen(true);
              }}
              className="btn btn-primary btn-rounded"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={18} /> New category
            </button>
          }
        />

        <CategoriesGrid refreshTrigger={refreshTrigger} onEdit={handleOpenEdit} onDetail={handleOpenDetail} />
      </div>
    </AdminPage>
  );
};

export default Categories;
