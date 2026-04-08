import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Store,
  UserCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from 'date-fns';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { AdminPage, AdminPageHeader, PageLoading } from '../components/layout/AdminPage';

const TREND_DAYS = 30;

function buildDailySeries(orderRows, days = TREND_DAYS) {
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(end, days - 1));
  const byDay = new Map();
  for (const row of orderRows || []) {
    if (!row.created_at) continue;
    const day = startOfDay(new Date(row.created_at));
    if (day < start || day > end) continue;
    const key = day.getTime();
    const cur = byDay.get(key) || { revenue: 0, orders: 0 };
    cur.revenue += Number(row.total_amount) || 0;
    cur.orders += 1;
    byDay.set(key, cur);
  }
  return eachDayOfInterval({ start, end }).map((d) => {
    const key = startOfDay(d).getTime();
    const agg = byDay.get(key) || { revenue: 0, orders: 0 };
    return {
      name: format(d, 'MMM d'),
      revenue: agg.revenue,
      orders: agg.orders,
    };
  });
}

const Analytics = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, shops: 0, vendors: 0 });
  const [trendSeries, setTrendSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const rangeStart = startOfDay(subDays(new Date(), TREND_DAYS - 1)).toISOString();

      const [{ data: orders }, { data: ordersForTrend }, s, v] = await Promise.all([
        supabaseAdmin.from('orders').select('total_amount'),
        supabaseAdmin.from('orders').select('created_at, total_amount').gte('created_at', rangeStart),
        supabaseAdmin.from('shops').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'vendor'),
      ]);

      let totalRevenue = 0;
      if (orders) totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

      setStats({
        revenue: totalRevenue,
        orders: orders?.length || 0,
        shops: s.count || 0,
        vendors: v.count || 0,
      });
      setTrendSeries(buildDailySeries(ordersForTrend, TREND_DAYS));
      setLoading(false);
    };
    fetchStats();
  }, []);

  const hasTrendActivity = useMemo(() => trendSeries.some((d) => d.revenue > 0 || d.orders > 0), [trendSeries]);

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

  const tooltipStyle = {
    borderRadius: '14px',
    border: '1px solid rgba(226, 232, 240, 0.9)',
    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
    fontSize: '12px',
  };

  return (
    <AdminPage>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <AdminPageHeader
          eyebrow="Insights"
          title="Business analytics"
          description={`Summary KPIs plus the last ${TREND_DAYS} days of revenue and order volume from your campus orders.`}
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
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: '16px',
          }}
        >
          <div className="glass-card glass-card--interactive" style={{ padding: '22px 24px 18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Revenue trend</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>Daily totals — last {TREND_DAYS} days</p>
            <div style={{ height: 260, width: '100%' }}>
              {hasTrendActivity ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendSeries} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(v) => `₹${v}`}
                      width={44}
                    />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#analyticsRevenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    textAlign: 'center',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(241, 245, 249, 0.65)',
                    border: '1px dashed rgba(148, 163, 184, 0.45)',
                  }}
                >
                  No orders in this window — chart will appear once there is daily activity.
                </div>
              )}
            </div>
          </div>

          <div className="glass-card glass-card--interactive" style={{ padding: '22px 24px 18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Order volume</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>Orders per day — last {TREND_DAYS} days</p>
            <div style={{ height: 260, width: '100%' }}>
              {hasTrendActivity ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendSeries} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} width={36} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, 'Orders']} />
                    <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    textAlign: 'center',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(241, 245, 249, 0.65)',
                    border: '1px dashed rgba(148, 163, 184, 0.45)',
                  }}
                >
                  No orders in this window — bars will fill in as orders are placed.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminPage>
  );
};

export default Analytics;
