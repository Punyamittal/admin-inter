import React from 'react';
import { Loader2 } from 'lucide-react';

export function AdminPage({ children }) {
  return <div className="admin-page">{children}</div>;
}

export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <header
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <div>
        {eyebrow && (
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--accent)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          style={{
            fontSize: 'clamp(22px, 2.4vw, 28px)',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '14px',
              marginTop: '8px',
              maxWidth: '540px',
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>{actions}</div>}
    </header>
  );
}

export function PageLoading({ message = 'Loading…' }) {
  return (
    <div className="admin-page page-load-center">
      <div className="glass-card" style={{ padding: '40px 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <Loader2 className="animate-spin" size={34} color="#6366f1" />
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>{message}</p>
      </div>
    </div>
  );
}
