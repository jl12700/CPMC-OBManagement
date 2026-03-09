/** Format ISO date to readable string */
export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

/** Format ISO datetime */
export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

/** Relative time */
export const timeAgo = (d) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/** Get initials from full name */
export const getInitials = (name) =>
  name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?'

/** Today's ISO date string */
export const todayISO = () => new Date().toISOString().split('T')[0]

/** Validate PIN: exactly 4 digits */
export const isValidPin = (pin) => /^\d{4}$/.test(pin)

/** Validate CPMC ID: numeric only */
export const isValidCpmcId = (id) => /^\d+$/.test(id)

/** Capitalize first letter */
export const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

/** Display pickup location: custom text when Others, otherwise the option value */
export const displayPickupLocation = (r) =>
  !r?.pickup_location ? '—' : (r.pickup_location === 'Others' ? (r.pickup_location_custom ?? '—') : r.pickup_location)

/** Role color map for badges */
export const ROLE_COLORS = {
  admin:      { bg: '#EDE9FE', color: '#6D28D9' },
  supervisor: { bg: '#DBEAFE', color: '#1D4ED8' },
  user:       { bg: '#D1FAE5', color: '#065F46' },
  guard:      { bg: '#FEF3C7', color: '#92400E' },
}

/** Status color map */
export const STATUS_COLORS = {
  pending:  { bg: '#FFFBEB', color: '#D97706' },
  approved: { bg: '#F0FFF4', color: '#38A169' },
  declined: { bg: '#FFF5F5', color: '#E53E3E' },
}
