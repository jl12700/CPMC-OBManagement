import { useState } from 'react'
import Modal from './Modal'
import Icon from './Icon'
import StatusBadge from './StatusBadge'
import { formatDate, formatDateTime, displayPickupLocation } from '../../../../../utils/helpers'
const Row = ({ label, children }) => (
  <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
    <div style={{ width: 140, fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>{label}</div>
    <div style={{ fontSize: 13.5, color: '#1A202C', flex: 1 }}>{children}</div>
  </div>
)

export default function RequestDetailModal({ request, currentUser, onClose, onApprove, onDecline }) {
  const [declineReason,   setDeclineReason]   = useState('')
  const [showDeclineForm, setShowDeclineForm] = useState(false)
  const [error, setError]                     = useState('')

  const canAct =
    request.status === 'pending' &&
    (currentUser.role === 'admin' ||
      (currentUser.role === 'supervisor' && request.supervisor_id === currentUser.id))

  const handleDecline = () => {
    if (!declineReason.trim()) { setError('Reason is required.'); return }
    onDecline(request.id, declineReason)
  }

  const supervisorName = request.supervisor?.full_name ?? request.supervisor_id
  const approverName   = request.approver?.full_name   ?? request.approved_by

  const footer = (
    <>
      {canAct && !showDeclineForm && (
        <>
          <button onClick={() => setShowDeclineForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, border: 'none', background: '#E53E3E', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="x" size={13} /> Decline
          </button>
          <button onClick={() => onApprove(request.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, border: 'none', background: '#38A169', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="check" size={13} /> Approve
          </button>
        </>
      )}
      {showDeclineForm && (
        <>
          <button onClick={() => setShowDeclineForm(false)}
            style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={handleDecline}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, border: 'none', background: '#E53E3E', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Confirm Decline
          </button>
        </>
      )}
      {!canAct && (
        <button onClick={onClose}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
          Close
        </button>
      )}
    </>
  )

  return (
    <Modal title="OB Request Details" onClose={onClose} maxWidth={520} footer={footer}>
      <Row label="Employee">{request.employee_name}</Row>
      <Row label="Date">{formatDate(request.scheduled_date)}</Row>
      <Row label="Pickup Location">{displayPickupLocation(request)}</Row>
      <Row label="Destination">{request.destination}</Row>
      <Row label="Purpose">{request.purpose}</Row>
      <Row label="Approver">{supervisorName}</Row>
      <Row label="Shift">{request.shift}</Row>
      <Row label="Status"><StatusBadge status={request.status} /></Row>
      {request.declined_reason && (
        <Row label="Decline Reason"><span style={{ color: '#E53E3E' }}>{request.declined_reason}</span></Row>
      )}
      {approverName && (
        <Row label="Approved By">{approverName} <span style={{ fontSize: 11, color: '#718096' }}>({request.approved_by_role})</span></Row>
      )}
      {request.approved_at && (
        <Row label="Approved At">{formatDateTime(request.approved_at)}</Row>
      )}
      <Row label="Submitted">{formatDateTime(request.created_at)}</Row>

      {showDeclineForm && (
        <div style={{ marginTop: 16 }}>
          {error && <div style={{ color: '#E53E3E', fontSize: 12, marginBottom: 8 }}>{error}</div>}
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Reason for Declining *
          </label>
          <textarea
            rows={3}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Enter reason..."
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
          />
        </div>
      )}
    </Modal>
  )
}
