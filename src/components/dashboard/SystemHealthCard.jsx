import { Globe, ShoppingCart, Zap, AlertTriangle } from 'lucide-react';

const SystemHealthCard = ({ stats = { totalOrders: 0, totalRevenue: 0, activeShops: new Set() } }) => {

  return (
    <div className="card" style={{ height: 'fit-content' }}>
      <h3 style={{ marginBottom: '24px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap size={20} color="var(--accent)" />
        System Health
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Globe size={18} color="var(--accent)" />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Active Presence</span>
          </div>
          <p style={{ fontSize: '20px', fontWeight: '700' }}>{stats.activeShops.size} <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--text-muted)' }}>Shops Online</span></p>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--success)' }}>
            <Zap size={14} />
            <span>Operational & Listening</span>
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <ShoppingCart size={18} color="var(--success)" />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Daily Activity</span>
          </div>
          <p style={{ fontSize: '20px', fontWeight: '700' }}>{stats.totalOrders} <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--text-muted)' }}>Orders Today</span></p>
          <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: '600', color: 'var(--success)' }}>₹{stats.totalRevenue.toLocaleString()}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Revenue</p>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '36px', 
          height: '36px', 
          borderRadius: '50%', 
          backgroundColor: '#EF4444', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white'
        }}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#991B1B' }}>Attention Needed!</p>
          <p style={{ fontSize: '12px', color: '#B91C1C' }}>"Brew & Bite" has reported a connectivity issue at Gazebo location.</p>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthCard;
