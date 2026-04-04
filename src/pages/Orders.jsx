import React, { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { AdminPage, AdminPageHeader, PageLoading } from '../components/layout/AdminPage';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select(
          `
                *,
                shops (name),
                profiles:user_id (full_name)
            `
        )
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) => {
      const id = order.id?.toLowerCase() || '';
      const shop = order.shops?.name?.toLowerCase() || '';
      const customer = order.profiles?.full_name?.toLowerCase() || '';
      return id.includes(q) || shop.includes(q) || customer.includes(q);
    });
  }, [orders, searchQuery]);

  if (loading) return <PageLoading message="Loading orders…" />;

  return (
    <AdminPage>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <AdminPageHeader
          eyebrow="Operations"
          title={`Order monitor (${orders.length})`}
          description="Latest transactions across campus outlets. Search by order id fragment, shop, or customer name."
        />

        <div className="panel-glass">
          <div className="data-toolbar">
            <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="search"
                className="input-search-glass"
                style={{ maxWidth: '100%' }}
                placeholder="Search order id, shop, or customer…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search orders"
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(248, 250, 252, 0.85)', borderBottom: '1px solid rgba(226, 232, 240, 0.95)' }}>
                  {['Order', 'Shop', 'Customer', 'Amount', 'Status', 'Time'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '16px 20px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="table-row-glass">
                    <td style={{ padding: '18px 20px', fontFamily: 'ui-monospace, monospace', fontSize: '13px', fontWeight: 600, color: '#334155' }}>#{order.id.slice(0, 8)}</td>
                    <td style={{ padding: '18px 20px', fontWeight: 700, color: '#0f172a' }}>{order.shops?.name || '—'}</td>
                    <td style={{ padding: '18px 20px', color: '#475569' }}>{order.profiles?.full_name || 'Guest'}</td>
                    <td style={{ padding: '18px 20px', fontWeight: 800, color: '#0f172a' }}>₹{order.total_amount || 0}</td>
                    <td style={{ padding: '18px 20px' }}>
                      <span className={`status-badge status-${order.status?.toLowerCase() || 'pending'}`}>{order.status || 'Received'}</span>
                    </td>
                    <td style={{ padding: '18px 20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state-muted" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <ShoppingBag size={36} color="#cbd5e1" />
                        {searchQuery.trim() ? 'No orders match your search.' : 'No orders yet — new transactions will show up here.'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPage>
  );
};

export default Orders;
