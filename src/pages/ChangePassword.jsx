import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';
import { AdminPage, AdminPageHeader } from '../components/layout/AdminPage';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = zxcvbn(newPassword);
  const score = strength.score;

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
  const canSubmit = !loading && score >= 3 && newPassword === confirmPassword && newPassword.length > 0;

  return (
    <AdminPage>
      <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <AdminPageHeader
          eyebrow="Account"
          title="Security settings"
          description="Update your administrative password. Strong credentials help protect campus operations data."
        />

        <div className="glass-card" style={{ padding: '32px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', color: '#6366F1' }}>
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
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Update password</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Minimum strength: Strong (3/4) on the meter below.</p>
            </div>
          </div>

          <div
            className="glass-inset"
            style={{ padding: '16px 18px', marginBottom: '28px', display: 'flex', gap: '14px', alignItems: 'flex-start', border: '1px solid rgba(99, 102, 241, 0.2)' }}
          >
            <AlertCircle size={20} color="#6366F1" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: '#4338ca', lineHeight: 1.55 }}>
              <strong>Policy:</strong> Use at least 12 characters and a mix of characters. Weak passwords cannot be saved.
            </p>
          </div>

          <form onSubmit={handleUpdate}>
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>New password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 12 characters"
                  className="input-modal-glass"
                  style={{ paddingLeft: '44px', paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '4px', height: '6px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'rgba(241, 245, 249, 0.9)', marginBottom: '8px' }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ flex: 1, backgroundColor: i < score ? getStrengthColor(score) : 'transparent', borderRadius: '2px' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: getStrengthColor(score) }}>
                    {newPassword.length > 0 ? ['Very weak', 'Weak', 'So-so', 'Strong', 'Excellent'][score] : 'Enter a password'}
                  </span>
                  {score < 3 && newPassword.length > 0 && (
                    <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 600 }}>Requirements not met</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="input-modal-glass"
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="btn btn-primary btn-rounded"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                opacity: canSubmit ? 1 : 0.55,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit ? '0 12px 28px rgba(99, 102, 241, 0.35)' : 'none',
              }}
            >
              <Save size={20} />
              {loading ? 'Updating…' : 'Update admin password'}
            </button>
          </form>
        </div>
      </div>
    </AdminPage>
  );
};

export default ChangePassword;
