import React from 'react'

const SessionTimeoutWarning = ({ secondsLeft, onStay, onLogout }) => (
  <div style={{ 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    backdropFilter: 'blur(4px)',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 99999 
  }}>
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      padding: '32px', 
      borderRadius: '16px', 
      maxWidth: '400px', 
      width: '90%', 
      textAlign: 'center',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
    }}>
      <div style={{ 
        width: '56px', 
        height: '56px', 
        backgroundColor: '#FEF2F2', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        margin: '0 auto 20px',
        color: '#EF4444' 
      }}>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '28px', height: '28px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Session Expiring Soon</h3>
      <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: '1.5', marginBottom: '24px' }}>
        You will be signed out in <span style={{ fontWeight: '700', color: '#EF4444' }}>{secondsLeft} seconds</span> due to inactivity. Do you want to stay signed in?
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={onLogout} 
          style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#F3F4F6', color: '#374151', fontWeight: '600', cursor: 'pointer', border: 'none' }}
        >
          Sign Out Now
        </button>
        <button 
          onClick={onStay} 
          style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#6366F1', color: '#FFFFFF', fontWeight: '600', cursor: 'pointer', border: 'none' }}
        >
          Stay Signed In
        </button>
      </div>
    </div>
  </div>
)

export default SessionTimeoutWarning
