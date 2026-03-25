import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Mail, Phone, MapPin, MoreVertical, Loader2, UserCheck, X, Eye, EyeOff, Edit2, Trash2, Key, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import toast from 'react-hot-toast';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '' });

  const fetchVendors = async () => {
    setLoading(true);
    const { data } = await supabaseAdmin.from('profiles').select('*').eq('role', 'vendor');
    if (data) {
        setVendors(data);
        setFilteredVendors(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchVendors(); }, []);

  useEffect(() => {
    const low = searchTerm.toLowerCase();
    setFilteredVendors(vendors.filter(v => 
        (v.full_name || '').toLowerCase().includes(low) || 
        (v.email || '').toLowerCase().includes(low)
    ));
  }, [searchTerm, vendors]);

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let retVal = "";
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
        phone: vendor.phone || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        if (editingVendor) {
            const { error } = await supabaseAdmin.from('profiles').update({
                full_name: formData.fullName,
                phone: formData.phone
            }).eq('id', editingVendor.id);
            if (error) throw error;
            toast.success('Partner details updated.');
        } else {
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: formData.email,
                password: formData.password,
                email_confirm: true,
                user_metadata: { full_name: formData.fullName, role: 'vendor' }
            });
            if (authError) throw authError;

            await supabaseAdmin.from('profiles').upsert({
                id: authData.user.id,
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                role: 'vendor',
                is_active: true
            });
            toast.success('New vendor activated successfully!');
        }
        setIsModalOpen(false);
        fetchVendors();
    } catch (err) { toast.error('Error: ' + err.message); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (vendor) => {
    if (window.confirm(`Suspend ${vendor.full_name}?`)) {
        const { error } = await supabaseAdmin.from('profiles').update({ is_active: false }).eq('id', vendor.id);
        if (error) toast.error(error.message);
        else { toast.success('Partner access suspended.'); fetchVendors(); }
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="var(--accent)" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ONBOARDING MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
           <div className="card" style={{ width: '90%', maxWidth: '480px', padding: '32px', position: 'relative' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '20px', top: '20px', border: 'none', background: 'none' }}><X size={24} color="var(--text-muted)" /></button>
              <h2 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--primary)' }}>{editingVendor ? 'Edit Partner Details' : 'Onboard New Partner'}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Admin control for vendor authentication and profile management.</p>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>MEMBER FULL NAME</label>
                    <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="e.g., John Doe" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>EMAIL ADDRESS</label>
                        <input type="email" disabled={!!editingVendor} required={!editingVendor} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="vendor@vit.ac.in" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: editingVendor ? '#F8FAFC' : 'white' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>PHONE NO.</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+91" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                    </div>
                 </div>

                 {!editingVendor && (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>INITIAL PASSWORD</label>
                            <button type="button" onClick={generatePassword} style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 'bold' }}>GENERATE SECURE</button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? 'text' : 'password'} required minLength={8} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Enter temporary password" style={{ width: '100%', padding: '12px', paddingRight: '70px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
                                <button type="button" onClick={copyToClipboard} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>{copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}</button>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                            </div>
                        </div>
                   </div>
                 )}

                 <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Discard</button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 1 }}>{isSubmitting ? 'Syncing...' : 'Save Member'}</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div><h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Authorized Vendors</h1><p style={{ color: 'var(--text-muted)' }}>Campus partner identity management.</p></div>
        <button onClick={handleOpenOnboard} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> Onboard Vendor</button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}><div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}><Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} /><input type="text" placeholder="Filter vendors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', paddingLeft: '40px', height: '42px', borderRadius: '10px', border: '1px solid var(--border)' }} /></div></div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="card" style={{ padding: '24px', border: '1px solid var(--border)', position: 'relative' }}>
              <div style={{ position: 'absolute', right: '16px', top: '16px', display: 'flex', gap: '8px' }}><button onClick={() => handleOpenEdit(vendor)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={16} /></button><button onClick={() => handleDelete(vendor)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={16} /></button></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#6366F115', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 'bold' }}>{vendor.full_name?.[0] || 'V'}</div>
                <div><h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>{vendor.full_name}</h3><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{vendor.id.slice(0, 16)}...</p></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-main)' }}><Mail size={14} color="var(--text-muted)" />{vendor.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-main)' }}><UserCheck size={14} color="var(--text-muted)" />Role: Verified Partner</div>
              </div>
              <div style={{ marginTop: '20px', borderTop: '1px solid #F1F5F9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span className={`status-badge ${vendor.is_active ? 'status-active' : 'status-inactive'}`}>{vendor.is_active ? 'Authorized' : 'Suspended'}</span>
              </div>
            </div>
          ))}
          {filteredVendors.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', width: '100%' }}>No vendors discovered.</p>}
        </div>
      </div>
    </div>
  );
};

export default Vendors;
