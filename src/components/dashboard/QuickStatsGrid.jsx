import React, { useState, useEffect } from 'react';
import { MapPin, Store, UserCheck, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const QuickStatsGrid = () => {
  const [counts, setCounts] = useState({ locations: 0, shops: 0, vendors: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const [l, s, v, o] = await Promise.all([
        supabase.from('locations').select('*', { count: 'exact', head: true }),
        supabase.from('shops').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'vendor'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ]);

      setCounts({
        locations: l.count || 0,
        shops: s.count || 0,
        vendors: v.count || 0,
        orders: o.count || 0,
      });
      setLoading(false);
    };

    fetchCounts();
  }, []);

  const stats = [
    { label: 'Locations', value: counts.locations, icon: MapPin, accent: '#6366f1' },
    { label: 'Live shops', value: counts.shops, icon: Store, accent: '#10b981' },
    { label: 'Vendors', value: counts.vendors, icon: UserCheck, accent: '#f59e0b' },
    { label: 'Orders', value: counts.orders, icon: ShoppingBag, accent: '#0f172a' },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card" style={{ padding: '22px', minHeight: '112px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="skeleton-block" style={{ width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-block" style={{ height: '14px', width: '72%', marginBottom: '12px' }} />
              <div className="skeleton-block" style={{ height: '26px', width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-card glass-card--interactive"
          style={{
            padding: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: `linear-gradient(145deg, ${stat.accent}22, ${stat.accent}08)`,
              border: `1px solid ${stat.accent}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stat.accent,
              flexShrink: 0,
            }}
          >
            <stat.icon size={26} strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{stat.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {stat.value.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStatsGrid;
