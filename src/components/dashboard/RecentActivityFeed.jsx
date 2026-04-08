import { Activity, UserPlus, Store, Trash2, ShieldCheck, UserCheck, ChevronRight } from 'lucide-react';
import { formatRelativeTime } from '../../lib/formatTime';
import { Link } from 'react-router-dom';

const RecentActivityFeed = ({ activities = [] }) => {
  const getIcon = (action) => {
    switch (action) {
      case 'created_shop':
        return Store;
      case 'assigned_vendor':
        return UserPlus;
      case 'deleted_shop':
        return Trash2;
      case 'deactivated_vendor':
        return ShieldCheck;
      case 'created_location':
        return UserCheck;
      default:
        return Activity;
    }
  };

  const getColor = (action) => {
    if (action.includes('created')) return '#10B981';
    if (action.includes('deleted') || action.includes('deactivated')) return '#EF4444';
    return '#6366F1';
  };

  return (
    <div className="glass-card" style={{ padding: '24px', height: 'fit-content' }}>
      <h3 style={{ marginBottom: '22px', fontSize: '17px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity size={20} color="#6366f1" />
        Recent activity
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {activities.length === 0 && (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '28px 16px', lineHeight: 1.5 }}>
            No recent admin actions. Changes to shops, vendors, and locations will appear here.
          </p>
        )}
        {activities.map((activity, index) => {
          const Icon = getIcon(activity.action);
          const color = getColor(activity.action);
          return (
            <div
              key={activity.id || index}
              className="dashboard-animate-in"
              style={{
                display: 'flex',
                gap: '14px',
                position: 'relative',
                padding: '14px 12px',
                borderRadius: '16px',
                transition: 'background 0.2s ease',
                animationDelay: `${Math.min(index, 8) * 0.05}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {index !== activities.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '29px',
                    top: '48px',
                    width: '2px',
                    height: 'calc(100% - 20px)',
                    background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.45) 0%, rgba(148, 163, 184, 0.08) 100%)',
                    borderRadius: '2px',
                  }}
                />
              )}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '14px',
                  backgroundColor: color + '18',
                  border: `1px solid ${color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: color,
                  zIndex: 1,
                  flexShrink: 0,
                }}
              >
                <Icon size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', lineHeight: 1.35 }}>
                  {activity.action.split('_').join(' ')}: {activity.target_type}{' '}
                  {activity.target_id?.slice(0, 8)}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
                  {formatRelativeTime(activity.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        to="/analytics"
        className="btn btn-outline"
        style={{
          marginTop: '20px',
          width: '100%',
          fontSize: '13px',
          fontWeight: 600,
          borderRadius: '14px',
          padding: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          border: '1px solid rgba(226, 232, 240, 0.95)',
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(8px)',
          transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
        }}
      >
        View analytics
        <ChevronRight size={16} />
      </Link>
    </div>
  );
};

export default RecentActivityFeed;
