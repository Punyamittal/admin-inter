import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Store, Users, X, Edit2, Trash2 } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import toast from 'react-hot-toast';
import { AdminPage, AdminPageHeader, PageLoading } from '../components/layout/AdminPage';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);

  const [locData, setLocData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabaseAdmin.from('locations').select(`*, shops (count)`);
    if (error) {
      toast.error('Failed to sync hubs');
    } else {
      setLocations(data || []);
      setFilteredLocations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const low = searchTerm.toLowerCase();
    setFilteredLocations(
      locations.filter(
        (loc) =>
          (loc.name || '').toLowerCase().includes(low) || (loc.description || '').toLowerCase().includes(low)
      )
    );
  }, [searchTerm, locations]);

  const handleOpenCreate = () => {
    setEditingLoc(null);
    setLocData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setLocData({ name: loc.name || '', description: loc.description || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      name: locData.name.trim(),
      description: locData.description.trim() || null,
      is_active: editingLoc ? editingLoc.is_active !== false : true,
    };
    const res = editingLoc
      ? await supabaseAdmin.from('locations').update(payload).eq('id', editingLoc.id)
      : await supabaseAdmin.from('locations').insert([payload]);
    if (res.error) toast.error(res.error.message);
    else {
      toast.success('Sync success');
      setIsModalOpen(false);
      fetchLocations();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (loc) => {
    if (window.confirm(`Permanently decommission ${loc.name}?`)) {
      const { error } = await supabaseAdmin.from('locations').delete().eq('id', loc.id);
      if (!error) {
        toast.success('Removed.');
        fetchLocations();
      }
    }
  };

  if (loading) return <PageLoading message="Syncing campus hubs…" />;

  return (
    <AdminPage>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <AdminPageHeader
          eyebrow="Geography"
          title="Campus hubs"
          description="Create and maintain pickup zones, link shops, and keep the directory accurate."
          actions={
            <button type="button" onClick={handleOpenCreate} className="btn btn-primary btn-rounded" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Register hub
            </button>
          }
        />

        {isModalOpen && (
          <div className="modal-overlay" role="presentation" onClick={() => setIsModalOpen(false)}>
            <div className="modal-glass" role="dialog" aria-labelledby="hub-modal-title" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
              <h2 id="hub-modal-title" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', paddingRight: '36px' }}>
                {editingLoc ? 'Edit hub' : 'New hub'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '22px' }}>Name and describe this location for vendors and students.</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="text"
                  required
                  className="input-modal-glass"
                  value={locData.name}
                  onChange={(e) => setLocData({ ...locData, name: e.target.value })}
                  placeholder="Hub name *"
                />
                <textarea
                  className="input-modal-glass"
                  value={locData.description}
                  onChange={(e) => setLocData({ ...locData, description: e.target.value })}
                  rows={3}
                  placeholder="Description…"
                  style={{ resize: 'none' }}
                />
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

        <div className="panel-glass">
          <div className="data-toolbar">
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
              />
              <input
                type="search"
                className="input-search-glass"
                placeholder="Filter hubs by name or description…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Filter hubs"
              />
            </div>
          </div>
          <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
            {filteredLocations.map((loc) => (
              <div key={loc.id} className="tile-glass" style={{ padding: '22px', position: 'relative' }}>
                <div style={{ position: 'absolute', right: '14px', top: '14px', display: 'flex', gap: '4px' }}>
                  <button type="button" onClick={() => handleOpenEdit(loc)} className="icon-circle-btn" style={{ width: '36px', height: '36px' }} aria-label="Edit hub">
                    <Edit2 size={16} />
                  </button>
                  <button type="button" onClick={() => handleDelete(loc)} className="icon-circle-btn" style={{ width: '36px', height: '36px', color: 'var(--danger)' }} aria-label="Delete hub">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '14px',
                      background: 'linear-gradient(145deg, rgba(99,102,241,0.18), rgba(99,102,241,0.06))',
                      border: '1px solid rgba(99,102,241,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                    }}
                  >
                    <MapPin size={26} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '56px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{loc.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                      {loc.description || 'Verified retail segment.'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Store size={14} color="var(--accent)" /> {loc.shops?.[0]?.count || 0} shops
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} color="var(--success)" /> {loc.is_active ? 'Active' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredLocations.length === 0 && (
              <div className="empty-state-muted" style={{ gridColumn: '1 / -1' }}>
                {searchTerm ? 'No hubs match your filter.' : 'No hubs yet — register your first campus location.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPage>
  );
};

export default Locations;
