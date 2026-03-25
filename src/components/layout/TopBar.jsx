import React, { useState } from 'react';
import { 
  Search, Bell, MessageSquare, 
  Menu, User, Settings, LogOut, Loader2, ChevronDown,
  ShieldCheck, Smartphone, Eye, EyeOff, LayoutPanelLeft
} from 'lucide-react';
import { useAuthContext } from '../../auth/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const TopBar = ({ toggleSidebar }) => {
  const { user, logout } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
  };

  return (
    <header style={{ 
      height: '70px', 
      backgroundColor: '#fff', 
      borderBottom: '1px solid var(--border)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 997,
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={toggleSidebar} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: 'var(--primary)',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex'
          }}
          className="icon-btn-hover"
        >
          <Menu size={24} />
        </button>
        <div style={{ position: 'relative', maxWidth: '400px', width: '100%', display: 'none', md: 'block' }}>
           {/* Desktop search - optionally hidden on small mobile */}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid var(--border)', position: 'relative', cursor: 'pointer' }} onClick={() => setShowProfileMenu(!showProfileMenu)}>
           <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.email?.charAt(0).toUpperCase()}
           </div>
           <div style={{ display: 'none', md: 'block' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>Super Admin</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email}</p>
           </div>
           
           {/* DROPDOWN MENU */}
           {showProfileMenu && (
             <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '220px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', border: '1px solid var(--border)', overflow: 'hidden', zIndex: 1001 }}>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                   <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Access Control</p>
                   <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified Super Admin Instance</p>
                </div>
                <div style={{ padding: '8px' }}>
                   <button onClick={handleLogout} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', borderRadius: '8px', fontSize: '13px' }} className="btn-logout-hover">
                      <LogOut size={16} />
                      {loading ? 'Processing...' : 'Secure Sign Out'}
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
