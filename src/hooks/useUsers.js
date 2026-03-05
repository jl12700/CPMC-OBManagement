import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('id, cpmc_id, full_name, role, is_locked, created_at')
      .order('full_name')
    if (error) setError(error.message)
    else setUsers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const updateRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
    if (error) throw new Error(error.message)
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
  }

  const updateName = async (userId, fullName) => {
    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', userId)
    if (error) throw new Error(error.message)
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, full_name: fullName } : u)))
  }

  const supervisors = users.filter((u) => u.role === 'supervisor')

  return { users, supervisors, loading, error, fetchUsers, updateRole, updateName }
}
