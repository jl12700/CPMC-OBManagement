import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('cpmc_user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure saved user has a valid id before restoring
        if (parsed?.id) setCurrentUser(parsed)
        else localStorage.removeItem('cpmc_user')
      } catch {
        localStorage.removeItem('cpmc_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (cpmcId, pin) => {
    const { data, error } = await supabase.rpc('verify_user_pin', {
      p_cpmc_id: cpmcId,
      p_pin:     pin,
    })

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('Invalid CPMC ID or PIN.')

    const raw = data[0]
    console.log('Raw RPC response keys:', Object.keys(raw))
    console.log('Raw RPC response:', raw)

    // Supabase may return out_* prefixed OR plain column names depending on version
    const user = {
      id:        raw.out_id        || raw.id,
      cpmc_id:   raw.out_cpmc_id   || raw.cpmc_id,
      full_name: raw.out_full_name || raw.full_name,
      role:      raw.out_role      || raw.role,
      is_locked: raw.out_is_locked ?? raw.is_locked ?? false,
    }

    console.log('Mapped user:', user)

    if (!user.id) {
      throw new Error(
        `Login failed: user.id is undefined. Raw keys: ${Object.keys(raw).join(', ')}`
      )
    }

    setCurrentUser(user)
    localStorage.setItem('cpmc_user', JSON.stringify(user))
    return user
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('cpmc_user')
  }

  const updateCurrentUser = (updates) => {
    const updated = { ...currentUser, ...updates }
    setCurrentUser(updated)
    localStorage.setItem('cpmc_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}