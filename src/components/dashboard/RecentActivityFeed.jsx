import { Activity, UserPlus, Store, Trash2, Edit2, ShieldCheck, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RecentActivityFeed = ({ activities = [] }) => {
  const getIcon = (action) => {
    switch (action) {
      case 'created_shop': return Store;
      case 'assigned_vendor': return UserPlus;
      case 'deleted_shop': return Trash2;
      case 'deactivated_vendor': return ShieldCheck;
      case 'created_location': return UserCheck;
      default: return Activity;
    }
  };

  const getColor = (action) => {
    if (action.includes('created')) return '#10B981';
    if (action.includes('deleted') || action.includes('deactivated')) return '#EF4444';
    return '#6366F1';
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '24px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={20} color="var(--accent)" />
        Recent Activities
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {activities.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>No recent admin actions.</p>}
        {activities.map((activity, index) => {
          const Icon = getIcon(activity.action);
          const color = getColor(activity.action);
          return (
            <div key={activity.id || index} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
              {index !== activities.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '18px',
                  top: '40px',
                  width: '2px',
                  height: 'calc(100% - 16px)',
                  backgroundColor: '#F1F5F9'
                }}></div>
              )}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: color + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                zIndex: 1
              }}>
                <Icon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                  {activity.action.split('_').join(' ')}: {activity.target_type} {activity.target_id?.slice(0, 8)}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn btn-outline" style={{ marginTop: '24px', width: '100%', fontSize: '13px' }}>
        View All History
      </button>
    </div>
  );
};

export default RecentActivityFeed;
