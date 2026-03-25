import React, { useState, useEffect } from 'react';
import QuickStatsGrid from '../components/dashboard/QuickStatsGrid';
import SystemHealthCard from '../components/dashboard/SystemHealthCard';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
  const [activityFeed, setActivityFeed] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, activeShops: new Set() });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    
    // 1. Fetch Real Activity Logs
    supabase.from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => { if (data) setActivityFeed(data); });

    // 2. Fetch Real Stats
    const fetchStats = async () => {
        const { data: orders } = await supabase.from('orders').select('total_amount, status, created_at');
        const { data: shops } = await supabase.from('shops').select('id, is_active');
        
        if (orders) {
            const totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
            setStats({
                totalOrders: orders.length,
                totalRevenue,
                activeShops: new Set(shops?.filter(s => s.is_active).map(s => s.id) || [])
            });

            // Mock revenue chart from real order history
            const daily = orders.reduce((acc, curr) => {
                const day = new Date(curr.created_at).toLocaleDateString('en-US', { weekday: 'short' });
                acc[day] = (acc[day] || 0) + (curr.total_amount || 0);
                return acc;
            }, {});
            
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            setRevenueData(days.map(d => ({ name: d, revenue: daily[d] || 0 })));
        }
    };

    fetchStats();

    // Real-time listener for logs
    const channel = supabase.channel('admin-activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_logs' }, (payload) => {
         setActivityFeed(prev => [payload.new, ...prev].slice(0, 6));
      })
      .subscribe();

    return () => {
        window.removeEventListener('resize', handleResize);
        supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', color: 'var(--primary)' }}>System Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Campus administrative intelligence.</p>
        </div>
      </div>

      <QuickStatsGrid />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
        <SystemHealthCard stats={stats} />
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Campus Revenue</h3>
          <div style={{ height: '240px', width: '100%' }}>
            {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                    <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--card-shadow)', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Generating chart...
                </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '24px' }}>
        <RecentActivityFeed activities={activityFeed} />
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Engagement Statistics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cross-platform analytics will be available in the version 2 release.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
