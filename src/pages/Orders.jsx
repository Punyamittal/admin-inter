import React, { useState, useEffect } from 'react';
import { ListOrdered, Search, Filter, ShoppingBag, Clock, MoreVertical, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                shops (name),
                profiles:user_id (full_name)
            `)
            .order('created_at', { ascending: false });
        
        if (data) setOrders(data);
        setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return (
     <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
       <Loader2 className="animate-spin" size={40} color="var(--accent)" />
     </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Order Monitor ({orders.length})</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time stream of all transactions across campus food outlets.</p>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
           <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search by Order ID, Shop, or Customer..." style={{ width: '100%', paddingLeft: '40px', height: '42px', borderRadius: '10px', border: '1px solid var(--border)' }} />
           </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order ID</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shop</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px', fontFamily: 'monospace', fontSize: '13px' }}>#{order.id.slice(0, 8)}</td>
                  <td style={{ padding: '20px', fontWeight: '600' }}>{order.shops?.name || 'TBD'}</td>
                  <td style={{ padding: '20px' }}>{order.profiles?.full_name || 'Anonymous User'}</td>
                  <td style={{ padding: '20px', fontWeight: '700' }}>₹{order.total_amount || 0}</td>
                  <td style={{ padding: '20px' }}>
                     <span className={`status-badge status-${order.status?.toLowerCase() || 'pending'}`}>
                        {order.status || 'Received'}
                     </span>
                  </td>
                  <td style={{ padding: '20px', color: 'var(--text-muted)' }}>
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                  <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Monitoring live transactions... No orders registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
