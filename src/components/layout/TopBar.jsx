import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Menu, LogOut, Loader2 } from 'lucide-react';
import { useAuthContext } from '../../auth/AuthContext';
import toast from 'react-hot-toast';

const TopBar = ({ toggleSidebar }) => {
  const { admin, logout } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
  };

  const initial = admin?.email?.charAt(0).toUpperCase() || admin?.full_name?.charAt(0).toUpperCase() || 'A';

  return (
    <header
      className="topbar-glass"
      style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 22px',
        position: 'sticky',
        top: 0,
        zIndex: 997,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open menu"
          className="icon-circle-btn"
          style={{ flexShrink: 0 }}
        >
          <Menu size={22} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <button
          type="button"
          className="icon-circle-btn"
          aria-label="Search"
          onClick={() => toast('Search is coming soon.', { icon: '🔎' })}
        >
          <Search size={20} />
        </button>
        <button
          type="button"
          className="icon-circle-btn"
          aria-label="Notifications"
          style={{ position: 'relative' }}
          onClick={() => toast('No new notifications.', { icon: '✓' })}
        >
          <Bell size={20} />
          <span
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#6366f1',
              border: '2px solid rgba(255,255,255,0.95)',
              boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)',
            }}
          />
        </button>

        <div ref={menuRef} style={{ position: 'relative', marginLeft: '4px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowProfileMenu(!showProfileMenu);
            }}
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px 8px 10px',
              borderRadius: '999px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.75)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(145deg, #6366f1, #4f46e5)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              {initial}
            </div>
            <div className="topbar-profile-text">
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>Super Admin</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {admin?.email}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="glass-card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '240px',
                padding: 0,
                overflow: 'hidden',
                zIndex: 1001,
                borderRadius: '18px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(226, 232, 240, 0.9)' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Signed in</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', wordBreak: 'break-all' }}>{admin?.email}</p>
              </div>
              <div style={{ padding: '8px' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    background: 'rgba(254, 242, 242, 0.85)',
                    border: '1px solid rgba(254, 226, 226, 0.9)',
                    cursor: loading ? 'wait' : 'pointer',
                    color: '#b91c1c',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
                  {loading ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
