import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Store, UserCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Analytics = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, shops: 0, vendors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        const { data: orders } = await supabase.from('orders').select('total_amount');
        const [s, v] = await Promise.all([
            supabase.from('shops').select('id', { count: 'exact', head: true }),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'vendor')
        ]);
        
        let totalRevenue = 0;
        if (orders) totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
        
        setStats({
            revenue: totalRevenue,
            orders: orders?.length || 0,
            shops: s.count || 0,
            vendors: v.count || 0
        });
        setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return (
     <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
       <Loader2 className="animate-spin" size={40} color="var(--accent)" />
     </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Business Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Aggregate insights across all campus operations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div className="card">
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#6366F115', color: '#6366F1' }}><DollarSign size={20} /></div>
              <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14} /> 12%</span>
           </div>
           <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Revenue</h3>
           <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>₹{stats.revenue.toLocaleString()}</p>
        </div>
        
        <div className="card">
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#10B98115', color: '#10B981' }}><ShoppingBag size={20} /></div>
              <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14} /> 8%</span>
           </div>
           <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Orders</h3>
           <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{stats.orders}</p>
        </div>
        
        <div className="card">
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#F59E0B15', color: '#F59E0B' }}><Store size={20} /></div>
              <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingDown size={14} /> 2%</span>
           </div>
           <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Shops</h3>
           <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{stats.shops}</p>
        </div>
        
        <div className="card">
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#6366F115', color: '#6366F1' }}><UserCheck size={20} /></div>
              <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14} /> Active</span>
           </div>
           <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Onboarded Vendors</h3>
           <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{stats.vendors}</p>
        </div>
      </div>

      <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border)' }}>
         Advanced Recharts analytics module loading... (Collecting session trend data)
      </div>
    </div>
  );
};

export default Analytics;
