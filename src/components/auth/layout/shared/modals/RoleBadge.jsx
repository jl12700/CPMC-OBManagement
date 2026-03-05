import { ROLE_COLORS, capitalize } from '../../../../../utils/helpers'

export default function RoleBadge({ role }) {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.user
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: colors.bg, color: colors.color,
    }}>
      {capitalize(role)}
    </span>
  )
}
