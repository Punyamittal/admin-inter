import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Security Scoring
  const strength = zxcvbn(newPassword);
  const score = strength.score; // 0-4

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (score < 3) {
      toast.error('Password is not strong enough for admin access.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Administrator password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  const getStrengthColor = (s) => ['#EF4444', '#F97316', '#FBBF24', '#10B981', '#059669'][s];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1E1B4B', marginBottom: '8px' }}>Security Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Update your administrative credentials and security policy.</p>
      </div>

      <div className="card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', color: '#6366F1' }}>
          <ShieldCheck size={28} />
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Update Password</h3>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#EEF2FF', borderRadius: '12px', border: '1px solid #E0E7FF', marginBottom: '32px', display: 'flex', gap: '12px' }}>
          <AlertCircle size={20} color="#6366F1" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#4338CA', lineHeight: '1.5' }}>
            <strong>Security Policy:</strong> Passwords must be at least 12 characters and score "Strong" (3/4) on our complexity meter to protect system integrity.
          </p>
        </div>

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 12 characters"
                style={{ width: '100%', padding: '14px 48px 14px 48px', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength Meter */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '4px', height: '6px', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#F1F5F9', marginBottom: '8px' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ flex: 1, backgroundColor: i < score ? getStrengthColor(score) : 'transparent' }}></div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '12px', fontWeight: '700', color: getStrengthColor(score) }}>
                    {newPassword.length > 0 ? ['Very Weak', 'Weak', 'So-so', 'Strong', 'Excellent!'][score] : 'Enter a password'}
                 </span>
                 {score < 3 && newPassword.length > 0 && (
                   <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: '600' }}>Requirements not met</span>
                 )}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || score < 3 || newPassword !== confirmPassword}
            style={{ 
              width: '100%', 
              padding: '16px', 
              backgroundColor: (loading || score < 3 || newPassword !== confirmPassword) ? '#94A3B8' : '#6366F1', 
              color: '#FFFFFF', 
              borderRadius: '12px', 
              fontSize: '16px', 
              fontWeight: '700', 
              border: 'none', 
              cursor: (loading || score < 3) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: (score >= 3) ? '0 10px 15px -3px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            <Save size={20} />
            {loading ? 'Securing Identity...' : 'Update Admin Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
