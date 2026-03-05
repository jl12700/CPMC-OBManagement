import { useState } from 'react'
import { useUsers } from '../../hooks/useUsers'
import Icon from '../../components/auth/layout/shared/modals/Icon'
import { getInitials, formatDate } from '../../utils/helpers'
import { ROLES } from '../../types/index'
import RoleBadge from '../../components/auth/layout/shared/modals/RoleBadge'

export default function ManageUsersPage() {
  const { users, loading, updateRole } = useUsers()
  const [editUser, setEditUser] = useState(null)
  const [newRole,  setNewRole]  = useState('')
  const [search,   setSearch]   = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.cpmc_id.includes(search)
  )

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await updateRole(editUser.id, newRole)
      setEditUser(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A202C' }}>Manage Users</h1>
        <p style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Assign and manage roles for all registered users.</p>
      </div>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{users.length} Users</span>
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or CPMC ID..."
              style={{ padding: '7px 10px 7px 28px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', width: '100%', maxWidth: 220 }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#A0AEC0' }}>Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Full Name', 'CPMC ID', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ background: '#F7FAFC', textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1E56A0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {getInitials(u.full_name)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{u.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}>{u.cpmc_id}</span>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0' }}>
                      <RoleBadge role={u.role} />
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0', fontSize: 12, color: '#718096' }}>
                      {formatDate(u.created_at)}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0' }}>
                      {u.is_locked
                        ? <span style={{ fontSize: 11, color: '#E53E3E', fontWeight: 600 }}> Locked</span>
                        : <span style={{ fontSize: 11, color: '#38A169', fontWeight: 600 }}>Active</span>
                      }
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0' }}>
                      <button
                        onClick={() => { setEditUser(u); setNewRole(u.role); setError('') }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: '1px solid #E2E8F0', borderRadius: 6, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#1E56A0', fontWeight: 600 }}
                      >
                        <Icon name="edit" size={12} /> Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editUser && (
        <div onClick={() => setEditUser(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.16)', width: '100%', maxWidth: 380 }}>
            <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Change Role</span>
              <button onClick={() => setEditUser(null)} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#718096' }}>
                <Icon name="x" size={14} />
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {/* User info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, padding: 12, background: '#F7FAFC', borderRadius: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1E56A0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>
                  {getInitials(editUser.full_name)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{editUser.full_name}</div>
                  <div style={{ fontSize: 12, color: '#718096' }}>CPMC ID: {editUser.cpmc_id}</div>
                </div>
              </div>

              {error && <div style={{ color: '#E53E3E', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: '#FFF5F5', borderRadius: 6 }}>{error}</div>}

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assign Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', marginBottom: 12 }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>

              {newRole === 'supervisor' && (
                <div style={{ padding: '10px 12px', background: '#EBF4FF', borderRadius: 6, fontSize: 12, color: '#1E56A0' }}>
                  ℹ️ This user will appear in the supervisor dropdown for new OB requests.
                </div>
              )}
              {newRole === 'admin' && (
                <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 6, fontSize: 12, color: '#D97706', marginTop: 8 }}>
                  ⚠️ Admin role grants full system access including user management.
                </div>
              )}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditUser(null)} style={{ padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || newRole === editUser.role}
                style={{ padding: '8px 18px', border: 'none', borderRadius: 6, background: '#1E56A0', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', opacity: (saving || newRole === editUser.role) ? 0.5 : 1 }}>
                {saving ? 'Saving…' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
