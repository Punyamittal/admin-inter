import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, User, Store, CheckCircle, Search, Filter, Home, ArrowRight, Bell } from 'lucide-react';

const OrderFeedCard = ({ order }) => (
  <div style={{ 
    padding: '16px', 
    backgroundColor: 'white', 
    borderRadius: '12px', 
    border: '1px solid var(--border)',
    borderLeft: `4px solid ${
      order.status === 'Pending' ? 'var(--warning)' : 
      order.status === 'Accepted' ? 'var(--accent)' : 
      'var(--success)'
    }`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: '700', fontSize: '15px' }}>#{order.id}</span>
        <span className={`status-badge ${
          order.status === 'Pending' ? 'status-pending' :
          order.status === 'Accepted' ? 'status-active' : 'status-active'
        }`} style={{ fontSize: '10px' }}>{order.status}</span>
      </div>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={12} />
        {order.time}
      </span>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F1F5F9', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Store size={16} color="var(--accent)" />
      </div>
      <div>
        <p style={{ fontWeight: '600', fontSize: '14px' }}>{order.shop}</p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.location}</p>
      </div>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#6366F115', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={12} />
        </div>
        <span style={{ fontSize: '12px', fontWeight: '500' }}>{order.student}</span>
      </div>
      <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--primary)' }}>₹{order.amount}</span>
    </div>
  </div>
);

const OrderMonitor = () => {
  const liveOrders = [
    { id: '4521', shop: 'Hungry Hub', student: 'Amit Kumar', location: 'Gazebo Area', amount: 320, status: 'Pending', time: '2 mins ago' },
    { id: '4520', shop: 'Brew & Bite', student: 'Sarah Khan', location: 'Gazebo Area', amount: 145, status: 'Accepted', time: '5 mins ago' },
    { id: '4519', shop: 'Tiffin Corner', student: 'Rohan P.', location: 'Hostel Gate', amount: 85, status: 'Pending', time: '8 mins ago' },
    { id: '4518', shop: 'Hungry Hub', student: 'Priya M.', location: 'Gazebo Area', amount: 210, status: 'Accepted', time: '12 mins ago' },
  ];

  const completedToday = [
    { id: '4515', shop: 'Juice Junc', student: 'Nitin J.', location: 'Library Sq', amount: 65, status: 'Completed', time: '10:45 AM' },
    { id: '4514', shop: 'Samosa Hub', student: 'Karan G.', location: 'Block A', amount: 40, status: 'Completed', time: '10:30 AM' },
    { id: '4512', shop: 'Hungry Hub', student: 'Ali Raza', location: 'Gazebo Area', amount: 450, status: 'Completed', time: '10:15 AM' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        <Home size={14} />
        <ArrowRight size={12} />
        <span>Admin</span>
        <ArrowRight size={12} />
        <span style={{ color: 'var(--accent)', fontWeight: '600' }}>Live Order Monitor</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Live Feed
            <div style={{ padding: '4px 10px', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#EF4444', borderRadius: '50%' }}></div>
              LIVE
            </div>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Observe all ongoing orders across the entire college campus.</p>
        </div>
        
        <div style={{ textAlignment: 'right' }}>
           <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>78 orders today — ₹32,400 total</p>
           <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>Updated just now</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="var(--warning)" />
              Incoming & Active ({liveOrders.length})
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ padding: '6px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}><Search size={14} /></button>
              <button style={{ padding: '6px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}><Filter size={14} /></button>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px' }}>
             {liveOrders.map(order => (
               <OrderFeedCard key={order.id} order={order} />
             ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} color="var(--success)" />
              Completed Today ({completedToday.length})
            </h3>
            <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>View All</button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px' }}>
             {completedToday.map(order => (
               <OrderFeedCard key={order.id} order={order} />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderMonitor;
