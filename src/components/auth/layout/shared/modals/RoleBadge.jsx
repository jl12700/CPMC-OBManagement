// RoleBadge.jsx
import { ROLE_COLORS, ROLE_DISPLAY } from '../../../../../utils/helpers'

export default function RoleBadge({ role }) {
  const colors = ROLE_COLORS[role] ?? { bg: '#F3F4F6', color: '#6B7280' }
  const label  = ROLE_DISPLAY[role] ?? role  // 'supervisor' → 'Approver'

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: colors.bg,
      color: colors.color,
      textTransform: 'capitalize',
    }}>
      {label}
    </span>
  )
}