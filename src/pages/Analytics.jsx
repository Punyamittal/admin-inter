import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Store, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { AdminPage, AdminPageHeader, PageLoading } from '../components/layout/AdminPage';

const Analytics = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, shops: 0, vendors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: orders } = await supabase.from('orders').select('total_amount');
      const [s, v] = await Promise.all([
        supabase.from('shops').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'vendor'),
      ]);

      let totalRevenue = 0;
      if (orders) totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

      setStats({
        revenue: totalRevenue,
        orders: orders?.length || 0,
        shops: s.count || 0,
        vendors: v.count || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <PageLoading message="Crunching numbers…" />;

  const statCards = [
    {
      label: 'Total revenue',
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      tint: '#6366f1',
      trend: { icon: TrendingUp, text: 'Live data', positive: true },
    },
    {
      label: 'Total orders',
      value: stats.orders.toLocaleString(),
      icon: ShoppingBag,
      tint: '#10b981',
      trend: { icon: TrendingUp, text: 'All time', positive: true },
    },
    {
      label: 'Shops in directory',
      value: stats.shops.toLocaleString(),
      icon: Store,
      tint: '#f59e0b',
      trend: { icon: TrendingDown, text: 'Net count', positive: false },
    },
    {
      label: 'Onboarded vendors',
      value: stats.vendors.toLocaleString(),
      icon: UserCheck,
      tint: '#8b5cf6',
      trend: { icon: TrendingUp, text: 'Active pool', positive: true },
    },
  ];

  return (
    <AdminPage>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <AdminPageHeader
          eyebrow="Insights"
          title="Business analytics"
          description="Aggregate totals across orders, shops, and vendors. Deeper charts can plug in here when trend data is available."
          actions={
            <div className="glass-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '14px' }}>
              <BarChart3 size={20} color="#6366f1" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Snapshot</span>
            </div>
          }
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {statCards.map((card) => (
            <div key={card.label} className="glass-card glass-card--interactive" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '14px',
                    background: `${card.tint}18`,
                    color: card.tint,
                    border: `1px solid ${card.tint}33`,
                  }}
                >
                  <card.icon size={22} />
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: card.trend.positive ? '#059669' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <card.trend.icon size={14} /> {card.trend.text}
                </span>
              </div>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{card.label}</h3>
              <p style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{card.value}</p>
            </div>
          ))}
        </div>

        <div
          className="glass-card"
          style={{
            minHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 28px',
            textAlign: 'center',
            border: '2px dashed rgba(148, 163, 184, 0.45)',
            background: 'rgba(255,255,255,0.35)',
          }}
        >
          <BarChart3 size={40} color="#94a3b8" style={{ marginBottom: '16px', opacity: 0.85 }} />
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Trend charts</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.55 }}>
            Session and time-series analytics can mount here (for example Recharts) when you define the metrics and date range filters.
          </p>
        </div>
      </div>
    </AdminPage>
  );
};

export default Analytics;
