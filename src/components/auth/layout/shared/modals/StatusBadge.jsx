import Icon from './Icon'
import { STATUS_COLORS, capitalize } from '../../../../../utils/helpers'

const iconMap = { pending: 'clock', approved: 'check', declined: 'x' }

export default function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: colors.bg, color: colors.color,
      whiteSpace: 'nowrap',
    }}>
      <Icon name={iconMap[status] || 'clock'} size={10} />
      {capitalize(status)}
    </span>
  )
}
