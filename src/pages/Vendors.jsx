import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, UserCheck, X, Edit2, Trash2, Ban, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import toast from 'react-hot-toast';
import { AdminPage, AdminPageHeader, PageLoading } from '../components/layout/AdminPage';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [deletingId, setDeletingId] = useState(null);
  const [reactivatingId, setReactivatingId] = useState(null);

  const fetchVendors = async () => {
    setLoading(true);
    const { data } = await supabaseAdmin.from('profiles').select('*').eq('role', 'vendor');
    if (data) {
      setVendors(data);
      setFilteredVendors(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    const low = searchTerm.toLowerCase();
    setFilteredVendors(
      vendors.filter(
        (v) => (v.full_name || '').toLowerCase().includes(low) || (v.email || '').toLowerCase().includes(low)
      )
    );
  }, [searchTerm, vendors]);

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let retVal = '';
    for (let i = 0, n = charset.length; i < 12; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setFormData({ ...formData, password: retVal });
    setShowPassword(true);
    toast.success('Generated secure password');
  };

  const copyToClipboard = () => {
    if (!formData.password) return;
    navigator.clipboard.writeText(formData.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Password copied to clipboard!');
  };

  const handleOpenOnboard = () => {
    setEditingVendor(null);
    setFormData({ fullName: '', email: '', password: '', phone: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      fullName: vendor.full_name || '',
      email: vendor.email || '',
      password: '',
      phone: vendor.phone || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingVendor) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            full_name: formData.fullName,
            phone: formData.phone,
          })
          .eq('id', editingVendor.id);
        if (error) throw error;
        toast.success('Partner details updated.');
      } else {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: { full_name: formData.fullName, role: 'vendor' },
        });
        if (authError) throw authError;

        await supabaseAdmin.from('profiles').upsert({
          id: authData.user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: 'vendor',
          is_active: true,
        });
        toast.success('New vendor activated successfully!');
      }
      setIsModalOpen(false);
      fetchVendors();
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspend = async (vendor) => {
    if (!window.confirm(`Suspend ${vendor.full_name}? They cannot sign in until you reactivate them.`)) return;
    const { error } = await supabaseAdmin.from('profiles').update({ is_active: false }).eq('id', vendor.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Partner access suspended.');
      fetchVendors();
    }
  };

  const handleReactivate = async (vendor) => {
    setReactivatingId(vendor.id);
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: true })
        .eq('id', vendor.id)
        .eq('role', 'vendor');
      if (error) throw error;
      toast.success('Vendor reactivated — they can sign in again.');
      fetchVendors();
    } catch (err) {
      toast.error(err.message || String(err));
    } finally {
      setReactivatingId(null);
    }
  };

  const handlePermanentDelete = async (vendor) => {
    if (
      !window.confirm(
        `Permanently delete ${vendor.full_name} (${vendor.email})?\n\nThis removes their auth account and profile. Any shops they own will be unassigned (not deleted). This cannot be undone.`
      )
    ) {
      return;
    }
    if (window.prompt('Type DELETE in capital letters to confirm permanent removal:') !== 'DELETE') {
      toast.error('Permanent delete cancelled.');
      return;
    }

    setDeletingId(vendor.id);
    try {
      const { error: shopsErr } = await supabaseAdmin.from('shops').update({ owner_id: null }).eq('owner_id', vendor.id);
      if (shopsErr) throw shopsErr;

      const { error: profileErr } = await supabaseAdmin.from('profiles').delete().eq('id', vendor.id).eq('role', 'vendor');
      if (profileErr) throw profileErr;

      const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(vendor.id);
      if (authErr) throw authErr;

      toast.success('Vendor permanently removed.');
      fetchVendors();
    } catch (err) {
      toast.error(err.message || String(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <PageLoading message="Loading vendors…" />;

  return (
    <AdminPage>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <AdminPageHeader
          eyebrow="Partners"
          title="Authorized vendors"
          description="Onboard partners, update profiles, suspend or reactivate access, or permanently delete accounts."
          actions={
            <button type="button" onClick={handleOpenOnboard} className="btn btn-primary btn-rounded" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Onboard vendor
            </button>
          }
        />

        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)} role="presentation">
            <div className="modal-glass" onClick={(e) => e.stopPropagation()} role="dialog">
              <button type="button" className="modal-close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', paddingRight: '40px' }}>
                {editingVendor ? 'Edit partner' : 'Onboard partner'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '22px', lineHeight: 1.5 }}>
                Admin control for vendor authentication and profile management.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>FULL NAME</label>
                  <input
                    type="text"
                    required
                    className="input-modal-glass"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>EMAIL</label>
                    <input
                      type="email"
                      disabled={!!editingVendor}
                      required={!editingVendor}
                      className="input-modal-glass"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="vendor@campus.edu"
                      style={{ backgroundColor: editingVendor ? 'rgba(241,245,249,0.9)' : undefined }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>PHONE</label>
                    <input
                      type="tel"
                      className="input-modal-glass"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91"
                    />
                  </div>
                </div>

                {!editingVendor && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>INITIAL PASSWORD</label>
                      <button type="button" onClick={generatePassword} style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                        Generate
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        className="input-modal-glass"
                        style={{ paddingRight: '80px' }}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Temporary password"
                      />
                      <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '4px' }}>
                        <button type="button" onClick={copyToClipboard} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}>
                          {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                        </button>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}>
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

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
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="search"
                className="input-search-glass"
                placeholder="Filter by name or email…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Filter vendors"
              />
            </div>
          </div>
          <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="tile-glass" style={{ padding: '22px', position: 'relative' }}>
                <div style={{ position: 'absolute', right: '14px', top: '14px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '120px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(vendor)}
                    className="icon-circle-btn"
                    style={{ width: '36px', height: '36px' }}
                    aria-label="Edit vendor"
                    disabled={deletingId === vendor.id || reactivatingId === vendor.id}
                  >
                    <Edit2 size={16} />
                  </button>
                  {vendor.is_active ? (
                    <button
                      type="button"
                      onClick={() => handleSuspend(vendor)}
                      className="icon-circle-btn"
                      style={{ width: '36px', height: '36px', color: '#d97706' }}
                      aria-label="Suspend vendor"
                      disabled={deletingId === vendor.id || reactivatingId === vendor.id}
                      title="Suspend access"
                    >
                      <Ban size={16} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handlePermanentDelete(vendor)}
                    className="icon-circle-btn"
                    style={{ width: '36px', height: '36px', color: 'var(--danger)' }}
                    aria-label="Permanently delete vendor"
                    disabled={deletingId === vendor.id || reactivatingId === vendor.id}
                    title="Delete permanently"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(145deg, rgba(99,102,241,0.2), rgba(99,102,241,0.08))',
                      border: '1px solid rgba(99,102,241,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                      fontWeight: 800,
                      fontSize: '18px',
                    }}
                  >
                    {vendor.full_name?.[0] || 'V'}
                  </div>
                  <div style={{ minWidth: 0, paddingRight: '118px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{vendor.full_name}</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{vendor.id.slice(0, 12)}…</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                    <Mail size={14} color="var(--text-muted)" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{vendor.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                    <UserCheck size={14} color="var(--text-muted)" />
                    Verified partner
                  </div>
                </div>
                <div style={{ marginTop: '18px', borderTop: '1px solid rgba(226,232,240,0.9)', paddingTop: '14px' }}>
                  <span className={`status-badge ${vendor.is_active ? 'status-active' : 'status-inactive'}`}>{vendor.is_active ? 'Authorized' : 'Suspended'}</span>
                  {!vendor.is_active && (
                    <button
                      type="button"
                      className="btn btn-primary btn-rounded"
                      style={{
                        width: '100%',
                        marginTop: '12px',
                        padding: '11px 16px',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                      onClick={() => handleReactivate(vendor)}
                      disabled={deletingId === vendor.id || reactivatingId === vendor.id}
                    >
                      <UserCheck size={17} />
                      {reactivatingId === vendor.id ? 'Reactivating…' : 'Reactivate vendor'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredVendors.length === 0 && (
              <div className="empty-state-muted" style={{ gridColumn: '1 / -1' }}>
                {searchTerm ? 'No vendors match your filter.' : 'No vendors discovered.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPage>
  );
};

export default Vendors;
