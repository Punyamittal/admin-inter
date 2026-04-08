import { Clock, Store, User } from 'lucide-react';
import { formatRelativeTime } from '../../lib/formatTime';

/**
 * Compact row for a live order. `created_at` may be missing after Realtime partial updates;
 * relative time falls back to "—" instead of throwing.
 */
export default function LiveOrderCard({ order }) {
  if (!order?.id) return null;

  const shopName = order.shop?.name || '—';
  const studentName = order.student?.full_name || 'Guest';
  const locName = order.shop?.location?.name;
  const status = (order.status || 'pending').toLowerCase();

  return (
    <div
      className="glass-card glass-card--interactive"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '12px',
        borderLeft: `4px solid ${
          status === 'pending' ? 'var(--warning, #f59e0b)' : status === 'accepted' ? '#6366f1' : '#10b981'
        }`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'ui-monospace, monospace' }}>
            #{String(order.id).slice(0, 8)}
          </span>
          <span className={`status-badge status-${status}`} style={{ fontSize: '10px', textTransform: 'capitalize' }}>
            {order.status || 'pending'}
          </span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <Clock size={12} />
          {formatRelativeTime(order.created_at)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Store size={16} color="#6366f1" />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{shopName}</p>
          {locName ? <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{locName}</p> : null}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(226, 232, 240, 0.9)', paddingTop: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} />
          {studentName}
        </span>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>₹{Number(order.total_amount) || 0}</span>
      </div>
    </div>
  );
}
