import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import {
  showToastNotification,
  sendSystemNotification,
  requestNotificationPermission,
  flashTabTitle,
  resetTabTitle
} from '../utils/adminNotifications'

/**
 * Subscribes to new Official Business request INSERTs and triggers
 * toast, OS notification, and tab title flash for admin users only.
 * No-op for non-admins. Cleans up on unmount.
 */
export function useAdminNewRequestNotifications() {
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return

    requestNotificationPermission()
  }, [currentUser])

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return

    function handleVisibilityChange() {
      if (!document.hidden) {
        resetTabTitle()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return

    const channel = supabase
      .channel('admin-new-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'official_business_requests'
        },
        (payload) => {
          console.log('New request received:', payload)
          showToastNotification()
          sendSystemNotification()
          flashTabTitle()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])
}
