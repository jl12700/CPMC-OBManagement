import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useAuth } from '../../../lib/AuthContext'
import { supabase } from '../../../lib/supabase'
import { getInitials, timeAgo } from '../../../utils/helpers'
// Inline SVG icons - no package needed
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', visibility: 'visible', overflow: 'visible' }}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
)
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const KeyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
)
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const ROLE_COLORS = {
  admin:      { bg: 'rgba(237, 233, 254, 0.1)', color: '#A78BFA' },
  supervisor: { bg: 'rgba(219, 234, 254, 0.1)', color: '#60A5FA' },
  user:       { bg: 'rgba(209, 250, 229, 0.1)', color: '#34D399' },
  guard:      { bg: 'rgba(254, 243, 199, 0.1)', color: '#FBBF24' },
}

export default function Topbar({ notifications = [], unreadCount = 0, onMarkRead, onMarkAllRead, onLogout, onToggleSidebar }) {
  const { currentUser, updateCurrentUser } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifs,  setShowNotifs]  = useState(false)
  const [editName,    setEditName]    = useState(false)
  const [editPin,     setEditPin]     = useState(false)
  const [newName,     setNewName]     = useState('')
  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [pin3, setPin3] = useState('')
  const [pin4, setPin4] = useState('')
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState('')

  const name     = currentUser?.full_name || 'User'
  const role     = currentUser?.role      || 'user'
  const initials = getInitials(name)
  const roleStyle = ROLE_COLORS[role] || ROLE_COLORS.user

  const colors = {
    bg: '#0F1C2E',
    border: 'rgba(255,255,255,0.1)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0AEC0',
    hover: 'rgba(255,255,255,0.08)',
    dropdownBg: '#1A202C',
    unreadBg: 'rgba(49, 130, 206, 0.15)',
  }

  const openEditName = () => {
    setNewName(currentUser?.full_name || '')
    setSaveError('')
    setShowProfile(false)
    setEditName(true)
  }

  const openEditPin = () => {
    setPin1(''); setPin2(''); setPin3(''); setPin4('')
    setSaveError('')
    setShowProfile(false)
    setEditPin(true)
  }

  const saveName = async () => {
    if (!newName.trim()) return
    if (!currentUser?.id) { setSaveError('Session error. Please log out and back in.'); return }
    setSaving(true); setSaveError('')
    const { error } = await supabase.from('users').update({ full_name: newName.trim() }).eq('id', currentUser.id)
    if (error) { setSaveError(error.message); setSaving(false); return }
    updateCurrentUser({ full_name: newName.trim() })
    setEditName(false)
    setSaving(false)
  }

  const savePin = async () => {
    const newPin = pin1 + pin2 + pin3 + pin4
    if (newPin.length !== 4) { setSaveError('Enter all 4 digits.'); return }
    if (!currentUser?.id)    { setSaveError('Session error. Please log out and back in.'); return }
    setSaving(true); setSaveError('')
    const { error } = await supabase.rpc('change_pin', { p_user_id: currentUser.id, p_new_pin: newPin })
    if (error) { setSaveError(error.message); setSaving(false); return }
    setEditPin(false)
    setSaving(false)
  }

  const handlePinInput = (index, value, setter, nextId, prevId) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setter(digit)
    if (digit && nextId) document.getElementById(nextId)?.focus()
    if (!digit && prevId) document.getElementById(prevId)?.focus()
  }

  return (
    <>
      {/* Responsive helpers */}
      <style>{`
        @media (max-width: 480px) {
          .topbar-profile-text { display: none !important; }
          .topbar-notif-dropdown {
            position: fixed !important;
            top: 68px !important;
            left: 16px !important;
            right: 16px !important;
            width: auto !important;
          }
        }
        @media (max-width: 768px) {
          .topbar-profile-name { max-width: 80px !important; }
        }
        @media (min-width: 769px) and (max-width: 1100px) {
          .topbar-profile-name { max-width: 110px !important; }
        }
      `}</style>

      {/* ── Topbar ── */}
      <header style={{ background: colors.bg, borderBottom: `1px solid ${colors.border}`, height: 60, minHeight: 60, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.25)', position: 'relative', zIndex: 1000, boxSizing: 'border-box', width: '100%', maxWidth: '100vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <button 
            onClick={() => { setShowNotifs(false); setShowProfile(false); onToggleSidebar(); }}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textPrimary, padding: 8, borderRadius: '50%', transition: 'background 0.2s', marginLeft: -8
            }}
            onMouseEnter={e => e.currentTarget.style.background = colors.hover}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Menu size={24} style={{ display: 'block', visibility: 'visible' }} />
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1, color: colors.textPrimary }}>
              CHIYODA
            </div>
            <div className="topbar-subtitle" style={{ marginTop: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textSecondary }}>
              Official Business Request
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowNotifs(v => !v); setShowProfile(false) }}
              style={{ position: 'relative', width: 38, height: 38, borderRadius: '50%', border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textPrimary, transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = colors.hover}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <BellIcon />
              </div>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -1, right: -1, width: 18, height: 18, background: '#E53E3E', color: 'white', borderRadius: '50%', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2.5px solid ${colors.bg}` }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="topbar-notif-dropdown" style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 340, background: colors.dropdownBg, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BellIcon /> Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button onClick={onMarkAllRead} style={{ fontSize: 11, color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {notifications.length === 0
                    ? <div style={{ padding: '48px 16px', textAlign: 'center', color: colors.textSecondary, fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: '50%' }}><BellIcon /></div>
                        No notifications
                      </div>
                    : notifications.map(n => (
                      <div key={n.id} onClick={() => onMarkRead?.(n.id)}
                        style={{ padding: '14px 18px', borderBottom: `1px solid ${colors.border}`, cursor: 'pointer', background: !n.is_read ? colors.unreadBg : 'transparent', display: 'flex', gap: 12, transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = colors.hover}
                        onMouseLeave={e => e.currentTarget.style.background = !n.is_read ? colors.unreadBg : 'transparent'}>
                        {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3182ce', marginTop: 5, flexShrink: 0 }} />}
                        <div style={n.is_read ? { marginLeft: 20 } : {}}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{n.title}</div>
                          <div style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 4, lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: 11, color: '#718096', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {timeAgo(n.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{ position: 'relative', minWidth: 0 }}>
            <button
              onClick={() => { setShowProfile(v => !v); setShowNotifs(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 10px 5px 6px',
                borderRadius: 24,
                border: `1px solid ${colors.border}`,
                background: 'rgba(255,255,255,0.05)',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.2s',
                height: 38,
                maxWidth: 220,
                minWidth: 0,
                overflow: 'hidden',
              }}
              onMouseEnter={e => e.currentTarget.style.background = colors.hover}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              {/* Avatar */}
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3182ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                {initials}
              </div>

              {/* Name + Role — hidden on very small screens */}
              <div className="topbar-profile-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                <span
                  className="topbar-profile-name"
                  title={name}
                  style={{
                    fontSize: 13, fontWeight: 600, color: colors.textPrimary,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    maxWidth: 140, width: '100%', display: 'block',
                  }}
                >
                  {name}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: roleStyle.color, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                  {role}
                </span>
              </div>

              {/* Chevron — never shrinks */}
              <div style={{ color: colors.textSecondary, flexShrink: 0 }}>
                <ChevronIcon />
              </div>
            </button>

            {showProfile && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: colors.dropdownBg, border: `1px solid ${colors.border}`, borderRadius: 12, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden' }}>
                {/* User info header inside dropdown */}
                <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, wordBreak: 'break-word', lineHeight: 1.4 }}>{name}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: roleStyle.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{role}</div>
                </div>

                <div onClick={openEditName} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', fontSize: 13, cursor: 'pointer', color: colors.textPrimary, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = colors.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <UserIcon /> Change Name
                </div>
                <div onClick={openEditPin} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', fontSize: 13, cursor: 'pointer', color: colors.textPrimary, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = colors.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <KeyIcon /> Change PIN
                </div>
                <div style={{ height: 1, background: colors.border }} />
                <div onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', fontSize: 13, cursor: 'pointer', color: '#F87171', fontWeight: 600, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LogoutIcon /> Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Change Name Modal ── */}
      {editName && (
        <div onClick={() => setEditName(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: colors.dropdownBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 32, width: 380, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: colors.textPrimary }}>Change Full Name</div>
            {saveError && <div style={{ color: '#F87171', fontSize: 12.5, marginBottom: 12, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>{saveError}</div>}
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${colors.border}`, borderRadius: 10, fontSize: 14, color: colors.textPrimary, fontFamily: 'inherit', marginBottom: 24, outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditName(false)} style={{ padding: '10px 20px', border: `1px solid ${colors.border}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: colors.textPrimary }}>Cancel</button>
              <button onClick={saveName} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 10, background: '#3182ce', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change PIN Modal ── */}
      {editPin && (
        <div onClick={() => setEditPin(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: colors.dropdownBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 32, width: 380, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: colors.textPrimary }}>Change PIN</div>
            {saveError && <div style={{ color: '#F87171', fontSize: 12.5, marginBottom: 12, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>{saveError}</div>}
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New 4-Digit PIN</label>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
              {[
                { id: 'cp1', val: pin1, set: setPin1, next: 'cp2', prev: null },
                { id: 'cp2', val: pin2, set: setPin2, next: 'cp3', prev: 'cp1' },
                { id: 'cp3', val: pin3, set: setPin3, next: 'cp4', prev: 'cp2' },
                { id: 'cp4', val: pin4, set: setPin4, next: null,  prev: 'cp3' },
              ].map(({ id, val, set, next, prev }) => (
                <input key={id} id={id} type="password" inputMode="numeric" maxLength={1} value={val}
                  onChange={e => handlePinInput(id, e.target.value, set, next, prev)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !val) document.getElementById(prev)?.focus() }}
                  style={{ width: 56, height: 64, background: 'rgba(255,255,255,0.03)', border: `2px solid ${colors.border}`, borderRadius: 10, fontSize: 24, fontWeight: 700, color: colors.textPrimary, textAlign: 'center', outline: 'none', fontFamily: 'monospace' }}
                  onFocus={e => e.target.style.borderColor = '#3182ce'}
                  onBlur={e => e.target.style.borderColor = colors.border}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditPin(false)} style={{ padding: '10px 20px', border: `1px solid ${colors.border}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: colors.textPrimary }}>Cancel</button>
              <button onClick={savePin} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 10, background: '#3182ce', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save PIN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}