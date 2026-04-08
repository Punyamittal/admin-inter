import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import QuickStatsGrid from '../components/dashboard/QuickStatsGrid';
import SystemHealthCard from '../components/dashboard/SystemHealthCard';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { useAuthContext } from '../auth/AuthContext';
import { TrendingUp, Sparkles } from 'lucide-react';

/** Aligned with Shops: online unless explicitly inactive or not accepting orders. */
function shopRowIsLive(row) {
  if (!row?.id) return false;
  if (row.is_active === false) return false;
  if (row.is_accepting_orders === false) return false;
  return true;
}

function liveShopIdsFromRows(shops) {
  return new Set((shops || []).filter(shopRowIsLive).map((s) => s.id));
}

async function fetchShopRowsAdmin() {
  let { data, error } = await supabaseAdmin.from('shops').select('id, is_active, is_accepting_orders');
  if (error) {
    const r2 = await supabaseAdmin.from('shops').select('id, is_active');
    data = r2.data;
  }
  return data || [];
}

/** Instant UI from Realtime payload; debounced admin refetch reconciles (matches Shops list). */
function mergeDashboardShopStats(prev, payload) {
  if (!payload?.eventType) return prev;

  const active = new Set(prev.activeShops);
  let total = prev.totalShops;

  switch (payload.eventType) {
    case 'INSERT': {
      const row = payload.new;
      if (!row?.id) return prev;
      total += 1;
      if (shopRowIsLive(row)) active.add(row.id);
      else active.delete(row.id);
      break;
    }
    case 'UPDATE': {
      const row = payload.new;
      if (!row?.id) return prev;
      if (shopRowIsLive(row)) active.add(row.id);
      else active.delete(row.id);
      break;
    }
    case 'DELETE': {
      const row = payload.old;
      if (!row?.id) return prev;
      total = Math.max(0, total - 1);
      active.delete(row.id);
      break;
    }
    default:
      return prev;
  }

  return { ...prev, activeShops: active, totalShops: total };
}

const Dashboard = () => {
  const { admin } = useAuthContext();
  const [activityFeed, setActivityFeed] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeShops: new Set(),
    totalShops: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const displayName = useMemo(() => {
    const n = admin?.full_name?.trim();
    if (n) return n.split(/\s+/)[0];
    const email = admin?.email;
    if (email) return email.split('@')[0];
    return 'Admin';
  }, [admin]);

  const activeShopCount = stats.activeShops.size;
  const shopUptimePct = useMemo(() => {
    if (!stats.totalShops) return 0;
    return Math.min(100, Math.round((activeShopCount / stats.totalShops) * 100));
  }, [stats.totalShops, activeShopCount]);

  const avgOrder = useMemo(() => {
    if (!stats.totalOrders) return 0;
    return Math.round(stats.totalRevenue / stats.totalOrders);
  }, [stats.totalOrders, stats.totalRevenue]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);

    supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setActivityFeed(data);
      });

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const { data: orders } = await supabaseAdmin.from('orders').select('total_amount, status, created_at');
        const shops = await fetchShopRowsAdmin();

        const liveIds = liveShopIdsFromRows(shops);
        const totalShopCount = shops.length;

        if (orders) {
          const totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
          setStats({
            totalOrders: orders.length,
            totalRevenue,
            activeShops: liveIds,
            totalShops: totalShopCount,
          });

          const daily = orders.reduce((acc, curr) => {
            const day = new Date(curr.created_at).toLocaleDateString('en-US', { weekday: 'short' });
            acc[day] = (acc[day] || 0) + (curr.total_amount || 0);
            return acc;
          }, {});

          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          setRevenueData(days.map((d) => ({ name: d, revenue: daily[d] || 0 })));
        } else {
          setStats((prev) => ({
            ...prev,
            activeShops: liveIds,
            totalShops: totalShopCount,
          }));
        }
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();

    const refreshShopStats = async () => {
      const shops = await fetchShopRowsAdmin();
      setStats((prev) => ({
        ...prev,
        activeShops: liveShopIdsFromRows(shops),
        totalShops: shops.length,
      }));
    };

    let shopStatsDebounce;
    const scheduleShopStatsRefresh = () => {
      clearTimeout(shopStatsDebounce);
      shopStatsDebounce = setTimeout(() => refreshShopStats(), 200);
    };

    const pollMs = 8000;
    const pollId = setInterval(() => {
      refreshShopStats();
    }, pollMs);

    const activityChannel = supabase
      .channel('admin-activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_logs' }, (payload) => {
        setActivityFeed((prev) => [payload.new, ...prev].slice(0, 6));
      })
      .subscribe();

    const shopsChannel = supabase
      .channel('admin-dashboard-shops')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, (payload) => {
        setStats((prev) => mergeDashboardShopStats(prev, payload));
        scheduleShopStatsRefresh();
      })
      .subscribe((status, err) => {
        if (import.meta.env.DEV) {
          if (status === 'SUBSCRIBED') {
            console.info('[Realtime] public.shops → dashboard stats (subscribed)');
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || err) {
            console.warn('[Realtime] dashboard shops channel:', status, err?.message ?? err);
          }
        }
      });

    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshShopStats();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(pollId);
      clearTimeout(shopStatsDebounce);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(shopsChannel);
    };
  }, []);

  const ringSize = isMobile ? 132 : 152;
  const ringStroke = 10;
  const ringR = (ringSize - ringStroke) / 2;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC - (shopUptimePct / 100) * ringC;

  return (
    <div className="dashboard-page">
      <header
        className="dashboard-animate-in"
        style={{
          marginBottom: isMobile ? '20px' : '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.02em', marginBottom: '6px' }}>
            Welcome back
          </p>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Hi, {displayName}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', maxWidth: '420px' }}>
            Campus operations at a glance — live shops, revenue, and recent admin activity.
          </p>
        </div>
        <Link to="/shops" className="btn-pill-dark" style={{ flexShrink: 0 }}>
          <Sparkles size={18} />
          Manage shops
        </Link>
      </header>

      <section
        className="glass-card glass-card--dark dashboard-animate-in"
        style={{
          padding: isMobile ? '20px' : '26px 28px',
          marginBottom: isMobile ? '18px' : '22px',
          animationDelay: '0.05s',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(148, 163, 184, 0.95)', marginBottom: '10px' }}>
              Overall snapshot
            </p>
            {statsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="skeleton-block" style={{ height: '36px', width: '200px', background: 'rgba(255,255,255,0.08)' }} />
                <div className="skeleton-block" style={{ height: '20px', width: '140px', background: 'rgba(255,255,255,0.06)' }} />
              </div>
            ) : (
              <>
                <p style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>
                  {stats.totalOrders.toLocaleString()}{' '}
                  <span style={{ fontSize: '15px', fontWeight: 500, color: 'rgba(148, 163, 184, 0.95)' }}>orders recorded</span>
                </p>
                <p style={{ marginTop: '8px', fontSize: '15px', color: 'rgba(203, 213, 225, 0.95)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} style={{ opacity: 0.85 }} />
                  ₹{stats.totalRevenue.toLocaleString()} total revenue
                </p>
              </>
            )}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(100px, 1fr))',
              gap: '12px',
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? 'unset' : '280px',
            }}
          >
            {[
              { label: 'Shops live', value: statsLoading ? '—' : activeShopCount },
              { label: 'Shop directory', value: statsLoading ? '—' : stats.totalShops },
              { label: 'Avg. order', value: statsLoading ? '—' : `₹${avgOrder.toLocaleString()}` },
            ].map((cell) => (
              <div key={cell.label} className="glass-inset--dark" style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: '11px', color: 'rgba(148, 163, 184, 0.9)', marginBottom: '6px' }}>{cell.label}</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>{cell.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="dashboard-animate-in" style={{ marginBottom: isMobile ? '18px' : '22px', animationDelay: '0.1s' }}>
        <QuickStatsGrid />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '18px' : '22px',
          marginBottom: isMobile ? '18px' : '22px',
        }}
      >
        <SystemHealthCard stats={stats} loading={statsLoading} />
        <div className="glass-card glass-card--interactive" style={{ padding: isMobile ? '20px' : '24px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '18px', fontSize: '17px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
              }}
            />
            Revenue by weekday
          </h3>
          <div style={{ height: '260px', width: '100%' }}>
            {statsLoading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                <div className="skeleton-block" style={{ width: '100%', height: '200px', borderRadius: '16px' }} />
              </div>
            ) : revenueData.some((d) => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenueGlass" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => `₹${val}`}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '14px',
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
                      fontSize: '12px',
                      backdropFilter: 'blur(12px)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenueGlass)"
                    dot={{ fill: '#6366f1', strokeWidth: 2, stroke: '#fff', r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  />
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
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.35)',
                  border: '1px dashed rgba(148, 163, 184, 0.45)',
                }}
              >
                No order revenue yet — chart will fill in as orders arrive.
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.45fr 1fr', gap: isMobile ? '18px' : '22px' }}>
        <RecentActivityFeed activities={activityFeed} />
        <div className="glass-card glass-card--interactive" style={{ padding: isMobile ? '20px' : '24px' }}>
          <h3 style={{ marginBottom: '8px', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Shop availability</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '22px', lineHeight: 1.5 }}>
            Shops that are active and accepting orders (same rules as the Shops page). Refreshes automatically.
          </p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '28px' }}>
            <div style={{ position: 'relative', width: ringSize, height: ringSize, flexShrink: 0 }}>
              <svg width={ringSize} height={ringSize} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringR}
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.25)"
                  strokeWidth={ringStroke}
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringR}
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth={ringStroke}
                  strokeLinecap="round"
                  strokeDasharray={ringC}
                  strokeDashoffset={statsLoading ? ringC : ringOffset}
                  style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                  {statsLoading ? '—' : `${shopUptimePct}%`}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  active
                </span>
              </div>
            </div>
            <div style={{ flex: 1, width: '100%' }}>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Live shops', value: statsLoading ? '…' : activeShopCount, color: '#6366f1' },
                  { label: 'Total shops', value: statsLoading ? '…' : stats.totalShops, color: '#94a3b8' },
                  {
                    label: 'Cross-platform analytics',
                    value: 'v2',
                    color: '#cbd5e1',
                    muted: true,
                  },
                ].map((row) => (
                  <li
                    key={row.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      background: row.muted ? 'rgba(241, 245, 249, 0.65)' : 'rgba(255,255,255,0.55)',
                      border: '1px solid rgba(255,255,255,0.7)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: row.muted ? 500 : 600, color: row.muted ? 'var(--text-muted)' : '#334155' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.color }} />
                      {row.label}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: row.muted ? 'var(--text-muted)' : '#0f172a' }}>{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
