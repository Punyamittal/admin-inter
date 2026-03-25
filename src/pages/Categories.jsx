import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Home, ArrowRight, Package, Store, Loader2, X, ExternalLink, MapPin, Search, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import toast from 'react-hot-toast';

const CategoriesGrid = ({ refreshTrigger, onEdit, onDetail }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryMeta = {
    'Full Meals': { emoji: '🍱', color: '#FFEDD5' },
    'Snacks': { emoji: '🍟', color: '#DBEAFE' },
    'Beverages': { emoji: '☕', color: '#D1FAE5' },
    'Desserts': { emoji: '🍰', color: '#F3E8FF' },
    'Healthy': { emoji: '🥗', color: '#FEF3C7' },
    'Fast Food': { emoji: '🍔', color: '#FEE2E2' },
    'Sandwiches': { emoji: '🥪', color: '#FFEDD5' },
    'Chaat Items': { emoji: '🥘', color: '#DBEAFE' },
    'Pasta Menu': { emoji: '🍝', color: '#D1FAE5' },
    'Italian Specials': { emoji: '🍕', color: '#F3E8FF' },
    'Fries': { emoji: '🍟', color: '#FEE2E2' },
    'Shawarma': { emoji: '🌯', color: '#FEF3C7' },
    'Egg Items': { emoji: '🥚', color: '#DBEAFE' },
    'Maggi': { emoji: '🍜', color: '#D1FAE5' },
    'Rolls': { emoji: '🌯', color: '#F3E8FF' },
    'Burgers': { emoji: '🍔', color: '#FEE2E2' },
    'Omelette': { emoji: '🍳', color: '#FEF3C7' },
    'Juices': { emoji: '🥤', color: '#D1FAE5' },
    'Milkshakes': { emoji: '🥤', color: '#F3E8FF' },
    'Lassi': { emoji: '🥛', color: '#DBEAFE' },
    'Cold Drinks': { emoji: '🧊', color: '#DBEAFE' },
    'Plates': { emoji: '🍽️', color: '#F3E8FF' },
  };

  const fetchRealData = async () => {
    setLoading(true);
    const { data: cats } = await supabaseAdmin.from('categories').select('*');
    const { data: items } = await supabaseAdmin.from('menu_items').select('category_id, shop_id');
    
    if (cats && items) {
        setCategories(cats.map(c => {
            const categoryItems = items.filter(i => i.category_id === c.id);
            const uniqueShops = new Set(categoryItems.map(i => i.shop_id));
            const meta = categoryMeta[c.name] || { emoji: '🍴', color: '#F1F5F9' };
            return {
                id: c.id,
                name: c.name,
                shopsCount: uniqueShops.size,
                itemsCount: categoryItems.length,
                emoji: meta.emoji,
                color: meta.color
            };
        }).sort((a, b) => b.itemsCount - a.itemsCount));
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
        if (!error) { toast.success('Removed.'); fetchRealData(); }
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="var(--accent)" /></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginTop: '32px' }}>
      {categories.map((cat) => (
        <div key={cat.id} className="card clickable" onClick={() => onDetail(cat)} style={{ 
          display: 'flex', flexDirection: 'column', 
          justifyContent: 'space-between', borderTop: `4px solid ${cat.color}`,
          cursor: 'pointer'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ fontSize: '32px', width: '64px', height: '64px', backgroundColor: cat.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat.emoji}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={(e) => { e.stopPropagation(); onEdit(cat); }} style={{ padding: '8px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={16} /></button>
              <button onClick={(e) => handleDelete(cat, e)} style={{ padding: '8px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--primary)' }}>{cat.name}</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}><Store size={14} /><span>{cat.shopsCount} Shops</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}><Package size={14} /><span>{cat.itemsCount} Items</span></div>
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
    // Fetch all items in this category across all shops
    const { data } = await supabaseAdmin
        .from('menu_items')
        .select(`
            id, name, price,
            shops (name)
        `)
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
        toast.success(`Success!`);
        setIsModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* CATEGORY DETAIL MODAL WITH ITEM GLOBAL LIST */}
      {isDetailOpen && selectedCat && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '0', overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
             <button onClick={() => setIsDetailOpen(false)} style={{ position: 'absolute', right: '16px', top: '16px', border: 'none', background: 'white', borderRadius: '50%', padding: '6px', cursor: 'pointer', zIndex: 10 }}><X size={20} color="var(--text-muted)" /></button>
             
             <div style={{ padding: '32px', backgroundColor: selectedCat.color, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '32px', width: '64px', height: '64px', backgroundColor: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>{selectedCat.emoji}</div>
                    <div>
                        <h2 style={{ fontSize: '20px', color: 'var(--primary)' }}>{selectedCat.name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Segment Analysis & Global Catalog</p>
                    </div>
                </div>
             </div>

             <div style={{ padding: '24px', overflowY: 'auto' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 'bold' }}>Globally Tracked Items</h4>
                {loadingDetail ? <Loader2 className="animate-spin" size={24} /> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     {catItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                           <div>
                              <p style={{ fontWeight: '600', fontSize: '13px' }}>{item.name}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sold at: {item.shops?.name}</p>
                           </div>
                           <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '13px' }}>₹{item.price}</div>
                        </div>
                     ))}
                     {catItems.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No items discovered.</p>}
                  </div>
                )}
             </div>

             <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Variations: <strong>{selectedCat.itemsCount}</strong></span>
                <button onClick={() => setIsDetailOpen(false)} className="btn btn-primary" style={{ padding: '8px 20px' }}>Close</button>
             </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div className="card" style={{ width: '400px', padding: '32px' }}>
             <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>{editingCat ? 'Rename' : 'New Category'}</h2>
             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" required value={catName} onChange={(e) => setCatName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Discard</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Food Classification System</h1><p style={{ color: 'var(--text-muted)' }}>Global food taxonomies.</p></div>
        <button onClick={() => { setEditingCat(null); setCatName(''); setIsModalOpen(true); }} className="btn btn-primary"><Plus size={18} /> New Category</button>
      </div>

      <CategoriesGrid refreshTrigger={refreshTrigger} onEdit={handleOpenEdit} onDetail={handleOpenDetail} />
    </div>
  );
};

export default Categories;
