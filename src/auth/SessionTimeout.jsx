import React from 'react';

const SessionTimeoutWarning = ({ secondsLeft, onStay, onLogout }) => (
  <div className="modal-overlay" style={{ zIndex: 99999 }}>
    <div
      className="modal-glass modal-glass--compact"
      style={{ textAlign: 'center', padding: '32px 28px' }}
      role="alertdialog"
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-desc"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'rgba(254, 242, 242, 0.95)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#EF4444',
          border: '1px solid rgba(252, 165, 165, 0.6)',
        }}
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '28px', height: '28px' }}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 id="session-timeout-title" style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
        Session expiring soon
      </h3>
      <p id="session-timeout-desc" style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.55, marginBottom: '26px' }}>
        You will be signed out in{' '}
        <span style={{ fontWeight: '800', color: '#DC2626' }}>{secondsLeft} seconds</span> due to inactivity. Stay signed in?
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={onLogout}
          className="btn btn-outline btn-rounded"
          style={{ flex: 1, padding: '12px', fontWeight: 700 }}
        >
          Sign out
        </button>
        <button type="button" onClick={onStay} className="btn btn-primary btn-rounded" style={{ flex: 1, padding: '12px', fontWeight: 700 }}>
          Stay signed in
        </button>
      </div>
    </div>
  </div>
);

export default SessionTimeoutWarning;
