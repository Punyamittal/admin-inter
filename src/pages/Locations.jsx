import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Filter, MoreVertical, Store, Users, Loader2, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import toast from 'react-hot-toast';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  
  // Form State
  const [locData, setLocData] = useState({ name: '', description: '', image_url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabaseAdmin.from('locations').select(`*, shops (count)`);
    if (error) { toast.error('Failed to sync hubs'); } else {
        setLocations(data || []);
        setFilteredLocations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLocations(); }, []);

  useEffect(() => {
    const low = searchTerm.toLowerCase();
    setFilteredLocations(locations.filter(loc => 
        (loc.name || '').toLowerCase().includes(low) || 
        (loc.description || '').toLowerCase().includes(low)
    ));
  }, [searchTerm, locations]);

  const handleOpenCreate = () => {
    setEditingLoc(null);
    setLocData({ name: '', description: '', image_url: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setLocData({ name: loc.name || '', description: loc.description || '', image_url: loc.image_url || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { ...locData, is_active: true };
    const res = editingLoc 
        ? await supabaseAdmin.from('locations').update(payload).eq('id', editingLoc.id)
        : await supabaseAdmin.from('locations').insert([payload]);
    if (res.error) toast.error(res.error.message);
    else { toast.success('Sync success'); setIsModalOpen(false); fetchLocations(); }
    setIsSubmitting(false);
  };

  const handleDelete = async (loc) => {
    if (window.confirm(`Permanently decommission ${loc.name}?`)) {
        const { error } = await supabaseAdmin.from('locations').delete().eq('id', loc.id);
        if (!error) { toast.success('Removed.'); fetchLocations(); }
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="var(--accent)" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div><h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Campus Hubs</h1><p style={{ color: 'var(--text-muted)' }}>Geography management.</p></div>
        <button onClick={handleOpenCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> Register New Hub</button>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div className="card" style={{ width: '90%', maxWidth: '480px', padding: '32px' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '20px', top: '20px', border: 'none', background: 'none' }}><X size={24} color="var(--text-muted)" /></button>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Manage Hub</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" required value={locData.name} onChange={(e) => setLocData({...locData, name: e.target.value})} placeholder="Hub Name *" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
              <textarea value={locData.description} onChange={(e) => setLocData({...locData, description: e.target.value})} rows="3" placeholder="Description..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', resize: 'none' }}></textarea>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Discard</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 1 }}>{isSubmitting ? 'Syncing...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}><div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}><Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} /><input type="text" placeholder="Filter hubs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', paddingLeft: '40px', height: '42px', borderRadius: '10px', border: '1px solid var(--border)' }} /></div></div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredLocations.map((loc) => (
            <div key={loc.id} className="card" style={{ padding: '24px', border: '1px solid var(--border)', position: 'relative' }}>
               <div style={{ position: 'absolute', right: '16px', top: '16px', display: 'flex', gap: '8px' }}><button onClick={() => handleOpenEdit(loc)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={18} /></button><button onClick={() => handleDelete(loc)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button></div>
               <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#6366F115', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><MapPin size={28} /></div>
                  <div style={{ flex: 1 }}>
                     <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>{loc.name}</h3>
                     <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{loc.description || 'Verified retail segment.'}</p>
                     <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}><Store size={14} color="var(--accent)" /> {loc.shops?.[0]?.count || 0} Shops</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}><Users size={14} color="var(--success)" /> {loc.is_active ? 'Active' : 'Offline'}</div>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Locations;
