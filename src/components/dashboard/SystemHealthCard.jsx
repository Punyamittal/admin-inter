import { Globe, ShoppingCart, Zap } from 'lucide-react';

const SystemHealthCard = ({
  stats = { totalOrders: 0, totalRevenue: 0, activeShops: new Set() },
  loading = false,
}) => {
  return (
    <div className="glass-card glass-card--interactive" style={{ padding: '24px', height: 'fit-content' }}>
      <h3 style={{ marginBottom: '22px', fontSize: '17px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Zap size={20} color="#6366f1" />
        System health
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div className="glass-inset" style={{ padding: '18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Globe size={18} color="#6366f1" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Active presence</span>
          </div>
          {loading ? (
            <div className="skeleton-block" style={{ height: '28px', width: '80px', marginBottom: '10px' }} />
          ) : (
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {stats.activeShops.size}{' '}
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>shops online</span>
            </p>
          )}
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>
            <Zap size={14} />
            <span>Operational</span>
          </div>
        </div>

        <div className="glass-inset" style={{ padding: '18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <ShoppingCart size={18} color="#10b981" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Order volume</span>
          </div>
          {loading ? (
            <>
              <div className="skeleton-block" style={{ height: '28px', width: '100px', marginBottom: '8px' }} />
              <div className="skeleton-block" style={{ height: '16px', width: '120px' }} />
            </>
          ) : (
            <>
              <p style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {stats.totalOrders}{' '}
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>orders</span>
              </p>
              <p style={{ marginTop: '10px', fontSize: '15px', fontWeight: 700, color: '#059669' }}>₹{stats.totalRevenue.toLocaleString()}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Total revenue</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthCard;
