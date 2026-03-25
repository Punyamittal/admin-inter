import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { supabaseAdmin } from '../lib/supabaseAdmin'

export function useCampusOrderMonitor() {
  const [allLiveOrders, setAllLiveOrders] = useState([])
  const [todayStats, setTodayStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeShops: new Set()
  })

  useEffect(() => {
    fetchTodaysOrders()
    const unsubscribe = subscribeToAllOrders()
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  async function fetchTodaysOrders() {
    const todayStart = new Date()
    todayStart.setHours(0,0,0,0)

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        student:profiles!student_id(full_name, college_id),
        shop:shops(name, location:locations(name)),
        order_items(item_name, quantity, subtotal)
      `)
      .in('status', ['pending', 'accepted'])
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching today orders:', error)
      return
    }

    setAllLiveOrders(data || [])
    computeTodayStats(data || [])
  }

  function subscribeToAllOrders() {
    const channel = supabase
      .channel('admin-all-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
          // No filter — super admin sees ALL shops
        },
        async (payload) => {
          // Fetch full order with joins
          const { data: fullOrder } = await supabaseAdmin
            .from('orders')
            .select(`
              *,
              student:profiles!student_id(full_name, college_id),
              shop:shops(name, location:locations(name)),
              order_items(item_name, quantity, subtotal)
            `)
            .eq('id', payload.new.id)
            .single()

          if (fullOrder) {
            setAllLiveOrders(prev => [fullOrder, ...prev].slice(0, 100))

            // Update today's running totals
            setTodayStats(prev => ({
              totalOrders: prev.totalOrders + 1,
              totalRevenue: prev.totalRevenue + fullOrder.total_amount,
              activeShops: new Set([...prev.activeShops, fullOrder.shop_id])
            }))
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setAllLiveOrders(prev =>
            prev.map(o =>
              o.id === payload.new.id ? { ...o, ...payload.new } : o
            )
          )
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  function computeTodayStats(orders) {
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + (o.total_amount || 0), 0),
      activeShops: new Set(orders.map(o => o.shop_id))
    }
    setTodayStats(stats)
  }

  return { allLiveOrders, todayStats }
}
