import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useShopStatusWatcher() {
  const [shopStatuses, setShopStatuses] = useState({})

  useEffect(() => {
    const channel = supabase
      .channel('admin-shops-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'shops' },
        (payload) => {
          setShopStatuses(prev => ({
            ...prev,
            [payload.new.id]: {
              is_active: payload.new.is_active,
              is_accepting_orders: payload.new.is_accepting_orders
            }
          }))
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { shopStatuses }
}
