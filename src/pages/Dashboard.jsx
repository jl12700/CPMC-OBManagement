import { useAuth } from '../lib/AuthContext.jsx'
import { formatDate, displayPickupLocation } from '../utils/helpers'
import StatusBadge from '../components/auth/layout/shared/modals/StatusBadge.jsx'

const ClipboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)

const XCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
)

const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

const HourglassIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2H3"></path>
    <path d="M21 22H3"></path>
    <path d="M16 2h-8c0 3 2 5.5 4 7 2-1.5 4-4 4-7z"></path>
    <path d="M16 22h-8c0-3 2-5.5 4-7 2 1.5 4 4 4 7z"></path>
  </svg>
)

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const StatCard = ({ label, value, iconBg, color, icon }) => (
  <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: iconBg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#1A202C' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{label}</div>
    </div>
  </div>
)

export default function Dashboard({ requests = [], allUsers = [] }) {
  const { currentUser } = useAuth()
  const today = new Date().toISOString().split('T')[0]

  if (!currentUser) return null

  const statsByRole = {
    user: [
      { label: 'Total Requests', value: requests.length,                                          iconBg: '#EBF4FF', color: '#3182CE', icon: <ClipboardIcon /> },
      { label: 'Pending',        value: requests.filter((r) => r.status === 'pending').length,    iconBg: '#FFFBEB', color: '#D69E2E', icon: <HourglassIcon /> },
      { label: 'Approved',       value: requests.filter((r) => r.status === 'approved').length,   iconBg: '#F0FFF4', color: '#38A169', icon: <CheckCircleIcon /> },
      { label: 'Declined',       value: requests.filter((r) => r.status === 'declined').length,   iconBg: '#FFF5F5', color: '#E53E3E', icon: <XCircleIcon /> },
    ],
    supervisor: [
      { label: 'Pending Approval', value: requests.filter((r) => r.status === 'pending').length,              iconBg: '#FFFBEB', color: '#D69E2E', icon: <HourglassIcon /> },
      { label: 'Approved by Me',   value: requests.filter((r) => r.approved_by === currentUser.id).length,    iconBg: '#F0FFF4', color: '#38A169', icon: <CheckCircleIcon /> },
      { label: 'Total Assigned',   value: requests.length,                                                    iconBg: '#EBF4FF', color: '#3182CE', icon: <ClipboardIcon /> },
    ],
    admin: [
      { label: 'Total Requests', value: requests.length,                                          iconBg: '#EBF4FF', color: '#3182CE', icon: <ClipboardIcon /> },
      { label: 'Pending',        value: requests.filter((r) => r.status === 'pending').length,    iconBg: '#FFFBEB', color: '#D69E2E', icon: <HourglassIcon /> },
      { label: 'Approved',       value: requests.filter((r) => r.status === 'approved').length,   iconBg: '#F0FFF4', color: '#38A169', icon: <CheckCircleIcon /> },
      { label: 'Total Users',    value: allUsers.length,                                          iconBg: '#EDE9FE', color: '#805AD5', icon: <UsersIcon /> },
    ],
    guard: [
      { label: 'Approved Today', value: requests.filter((r) => r.scheduled_date === today).length, iconBg: '#F0FFF4', color: '#38A169', icon: <CheckCircleIcon /> },
      { label: 'Total Approved', value: requests.length,                                           iconBg: '#EBF4FF', color: '#3182CE', icon: <ShieldIcon /> },
    ],
  }

  const stats  = statsByRole[currentUser.role] || statsByRole.user
  const recent = [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6)
  const firstName = currentUser.full_name?.split(' ')[0] ?? currentUser.full_name

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A202C' }}>
          Welcome back, {firstName} 
        </h1>
        <p style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Here's your OB request overview.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E2E8F0' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Recent Activity</span>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#A0AEC0' }}>No activity yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Employee', 'Pickup', 'Destination', 'Date', 'Shift', 'Status', 'Notes'].map((h) => (
                    <th key={h} style={{ background: '#F7FAFC', textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: '11px 14px', fontSize: 13, borderBottom: '1px solid #E2E8F0', fontWeight: 600 }}>{r.employee_name}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, borderBottom: '1px solid #E2E8F0' }}>{displayPickupLocation(r)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, borderBottom: '1px solid #E2E8F0' }}>{r.destination}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, borderBottom: '1px solid #E2E8F0' }}>{formatDate(r.scheduled_date)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, borderBottom: '1px solid #E2E8F0', color: '#718096' }}>{r.shift}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #E2E8F0' }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: '11px 14px', fontSize: 12, borderBottom: '1px solid #E2E8F0', color: r.status === 'declined' ? '#E53E3E' : '#A0AEC0', fontStyle: r.status === 'declined' ? 'italic' : 'normal', maxWidth: 180, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {r.status === 'declined' && r.declined_reason ? r.declined_reason : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}