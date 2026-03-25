import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuthContext } from '../../auth/AuthContext';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import SessionTimeoutWarning from '../../auth/SessionTimeout';

const AdminShell = () => {
  const { logout } = useAuthContext();
  const { showWarning, secondsLeft, staySignedIn } = useSessionTimeout(logout);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
       const mobile = window.innerWidth < 1024;
       setIsMobile(mobile);
       if (!mobile) setIsSidebarOpen(true);
       else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', position: 'relative' }}>
      {/* Sidebar - Handles its own mobile vs desktop logic based on isOpen prop */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />
      
      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
         <div 
           onClick={toggleSidebar}
           style={{
             position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
             backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998, backdropFilter: 'blur(2px)'
           }}
         />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <TopBar toggleSidebar={toggleSidebar} />
        <main style={{ 
            padding: isMobile ? '16px' : '24px', 
            overflowY: 'auto', 
            backgroundColor: 'var(--bg-app)', 
            flex: 1 
        }}>
          <Outlet />
        </main>
      </div>

      {showWarning && (
        <SessionTimeoutWarning 
          secondsLeft={secondsLeft} 
          onStay={staySignedIn} 
          onLogout={logout} 
        />
      )}
    </div>
  );
};

export default AdminShell;
