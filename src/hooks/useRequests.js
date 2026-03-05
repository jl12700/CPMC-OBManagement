import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export function useRequests() {
  const { currentUser }         = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const buildQuery = useCallback(() => {
    const base = supabase
      .from('official_business_requests')
      .select(`
        *,
        supervisor:supervisor_id (id, full_name),
        approver:approved_by (id, full_name)
      `)
      .order('created_at', { ascending: false })

    if (!currentUser) return null

    switch (currentUser.role) {
      case 'user':       return base.eq('employee_id', currentUser.id)
      case 'supervisor': return base.eq('supervisor_id', currentUser.id)
      case 'guard':      return base.eq('status', 'approved')
      case 'admin':
      default:           return base
    }
  }, [currentUser])

  const fetchRequests = useCallback(async () => {
    const query = buildQuery()
    if (!query) return
    setLoading(true)
    const { data, error } = await query
    if (error) setError(error.message)
    else setRequests(data || [])
    setLoading(false)
  }, [buildQuery])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  useEffect(() => {
    if (!currentUser) return

    let filter = undefined
    if (currentUser.role === 'supervisor') filter = `supervisor_id=eq.${currentUser.id}`
    if (currentUser.role === 'user')       filter = `employee_id=eq.${currentUser.id}`
    if (currentUser.role === 'guard')      filter = `status=eq.approved`

    const channel = supabase
      .channel('ob_requests_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'official_business_requests',
          ...(filter ? { filter } : {}),
        },
        () => { fetchRequests() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUser, fetchRequests])

  const notify = async (userId, title, message) => {
    await supabase.from('notifications').insert({ user_id: userId, title, message })
  }

  const getAdminIds = async () => {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
    return (data || []).map(a => a.id)
  }

  const createRequest = async (payload) => {
    const { data, error } = await supabase
      .from('official_business_requests')
      .insert(payload)
      .select('*, supervisor:supervisor_id (id, full_name)')
      .single()
    if (error) throw new Error(error.message)

    const dateStr      = new Date(data.scheduled_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    const employeeName = data.employee_name

    if (data.supervisor_id) {
      await notify(
        data.supervisor_id,
        '🔔 New OB Request Assigned',
        `${employeeName} submitted an OB request for ${dateStr} — awaiting your approval.`
      )
    }

    const adminIds = await getAdminIds()
    for (const adminId of adminIds) {
      if (adminId !== currentUser.id) {
        await notify(
          adminId,
          '🔔 New OB Request Submitted',
          `${employeeName} submitted an OB request for ${dateStr}.`
        )
      }
    }

    return data
  }

  const approveRequest = async (requestId) => {
    const { data: req } = await supabase
      .from('official_business_requests')
      .select('*, supervisor:supervisor_id (id, full_name)')
      .eq('id', requestId)
      .single()

    if (!req) throw new Error('Request not found.')

    const { error } = await supabase
      .from('official_business_requests')
      .update({
        status:           'approved',
        approved_by:      currentUser.id,
        approved_by_role: currentUser.role,
        approved_at:      new Date().toISOString(),
      })
      .eq('id', requestId)
      .eq('status', 'pending')

    if (error) throw new Error(error.message)

    setRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'approved', approved_by: currentUser.id, approved_by_role: currentUser.role, approved_at: new Date().toISOString() }
          : r
      )
    )

    const dateStr      = new Date(req.scheduled_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    const approverName = currentUser.full_name
    const approverRole = currentUser.role === 'admin' ? 'Admin' : 'Supervisor'

    await notify(
      req.employee_id,
      '✅ OB Request Approved',
      `Your OB request for ${dateStr} to ${req.destination} has been approved by ${approverRole} ${approverName}.`
    )

    if (currentUser.role === 'admin' && req.supervisor_id && req.supervisor_id !== currentUser.id) {
      await notify(
        req.supervisor_id,
        'ℹ️ OB Request Approved by Admin',
        `${req.employee_name}'s OB request for ${dateStr} was approved by Admin ${approverName}.`
      )
    }

    if (currentUser.role === 'supervisor') {
      const adminIds = await getAdminIds()
      for (const adminId of adminIds) {
        await notify(
          adminId,
          'ℹ️ OB Request Approved by Supervisor',
          `${currentUser.full_name} approved ${req.employee_name}'s OB request for ${dateStr}.`
        )
      }
    }
  }

  const declineRequest = async (requestId, reason) => {
    if (!reason?.trim()) throw new Error('Decline reason is required.')

    const { data: req } = await supabase
      .from('official_business_requests')
      .select('*, supervisor:supervisor_id (id, full_name)')
      .eq('id', requestId)
      .single()

    if (!req) throw new Error('Request not found.')

    const { error } = await supabase
      .from('official_business_requests')
      .update({ status: 'declined', declined_reason: reason })
      .eq('id', requestId)
      .eq('status', 'pending')

    if (error) throw new Error(error.message)

    setRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'declined', declined_reason: reason }
          : r
      )
    )

    const dateStr      = new Date(req.scheduled_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    const declinerName = currentUser.full_name
    const declinerRole = currentUser.role === 'admin' ? 'Admin' : 'Supervisor'

    await notify(
      req.employee_id,
      '❌ OB Request Declined',
      `Your OB request for ${dateStr} to ${req.destination} was declined by ${declinerRole} ${declinerName}. Reason: ${reason}`
    )

    if (currentUser.role === 'admin' && req.supervisor_id && req.supervisor_id !== currentUser.id) {
      await notify(
        req.supervisor_id,
        'ℹ️ OB Request Declined by Admin',
        `${req.employee_name}'s OB request for ${dateStr} was declined by Admin ${declinerName}. Reason: ${reason}`
      )
    }

    if (currentUser.role === 'supervisor') {
      const adminIds = await getAdminIds()
      for (const adminId of adminIds) {
        await notify(
          adminId,
          'ℹ️ OB Request Declined by Supervisor',
          `${currentUser.full_name} declined ${req.employee_name}'s OB request for ${dateStr}. Reason: ${reason}`
        )
      }
    }
  }

  return { requests, loading, error, fetchRequests, createRequest, approveRequest, declineRequest }
}