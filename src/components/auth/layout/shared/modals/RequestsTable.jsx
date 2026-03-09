import { useState } from 'react'
import RequestDetailModal from './RequestDetailModal'
import StatusBadge from './StatusBadge'
import Icon from './Icon'
import { formatDate, displayPickupLocation } from '../../../../../utils/helpers'
import { useAuth } from '../../../../../lib/AuthContext'
const FILTERS = ['all', 'pending', 'approved', 'declined']

export default function RequestsTable({
  requests = [],
  title,
  subtitle,
  showEmployee = false,
  onApprove,
  onDecline,
  loading = false,
}) {
  const { currentUser }   = useAuth()
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')

  const filtered = requests
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) => {
      if (!search) return true
      const s = search.toLowerCase()
      const pickup = displayPickupLocation(r)
      return (
        r.employee_name?.toLowerCase().includes(s) ||
        r.destination?.toLowerCase().includes(s) ||
        r.purpose?.toLowerCase().includes(s) ||
        pickup?.toLowerCase().includes(s)
      )
    })

  const Btn = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 6, border: active ? 'none' : '1px solid #E2E8F0',
        background: active ? '#1E56A0' : 'white',
        color: active ? 'white' : '#718096',
        fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </button>
  )
const formatTime = (t) => {
  if (!t) return '—'
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A202C' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>{subtitle}</p>}
      </div>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1A202C' }}>
            {filtered.length} Request{filtered.length !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Icon name="search" size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{ padding: '6px 10px 6px 28px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', width: '100%', minWidth: 120, maxWidth: 200 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {FILTERS.map((f) => <Btn key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />)}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#A0AEC0' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#A0AEC0' }}>
            <Icon name="list" size={40} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
            No requests found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {showEmployee && <th style={thStyle}>Employee</th>}
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Pickup</th>
                  <th style={thStyle}>Destination</th>
                  <th style={thStyle}>Purpose</th>
                  <th style={thStyle}>Shift</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={{ transition: 'background 0.1s' }}
                    onMouseEnter={(e) => { Array.from(e.currentTarget.children).forEach((td) => td.style.background = '#FAFBFC') }}
                    onMouseLeave={(e) => { Array.from(e.currentTarget.children).forEach((td) => td.style.background = '') }}
                  >
                    {showEmployee && <td style={tdStyle}><strong style={{ fontSize: 13 }}>{r.employee_name}</strong></td>}
                    <td style={tdStyle}>{formatDate(r.scheduled_date)}</td>
                    <td style={tdStyle}>{formatTime(r.departure_time)}</td>
                    <td style={tdStyle}>{displayPickupLocation(r)}</td>
                    <td style={tdStyle}>{r.destination}</td>
                    <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.purpose}</td>
                    <td style={tdStyle}><span style={{ fontSize: 11, color: '#718096' }}>{r.shift}</span></td>
                    <td style={tdStyle}><StatusBadge status={r.status} /></td>
                    <td style={tdStyle}>
                      <button onClick={() => setSelected(r)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: '1px solid #E2E8F0', borderRadius: 6, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#718096' }}>
                        <Icon name="eye" size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <RequestDetailModal
          request={selected}
          currentUser={currentUser}
          onClose={() => setSelected(null)}
          onApprove={(id) => { onApprove && onApprove(id); setSelected(null) }}
          onDecline={(id, reason) => { onDecline && onDecline(id, reason); setSelected(null) }}
        />
      )}
    </div>
  )
}

const thStyle = {
  background: '#F7FAFC', textAlign: 'left',
  padding: '10px 14px',
  fontSize: 11, fontWeight: 700,
  color: '#718096', textTransform: 'uppercase', letterSpacing: '0.06em',
  borderBottom: '1px solid #E2E8F0',
}

const tdStyle = {
  padding: '12px 14px',
  fontSize: 13, color: '#1A202C',
  borderBottom: '1px solid #E2E8F0',
  verticalAlign: 'middle',
}
