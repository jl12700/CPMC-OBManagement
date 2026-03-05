import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export function useNotifications() {
  const { currentUser }               = useAuth()
  const [notifications, setNotifs]    = useState([])
  const [loading, setLoading]         = useState(true)
  const unreadCount                   = notifications.filter((n) => !n.is_read).length

  const fetchNotifs = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error) setNotifs(data || [])
    setLoading(false)
  }, [currentUser])

  useEffect(() => { fetchNotifs() }, [fetchNotifs])

  // Realtime: only listen to own notifications
  useEffect(() => {
    if (!currentUser) return
    const channel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          setNotifs((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentUser])

  const markRead = async (notifId) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId)
    setNotifs((prev) => prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)))
  }

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false)
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return { notifications, unreadCount, loading, markRead, markAllRead }
}
