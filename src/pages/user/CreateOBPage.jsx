import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { useRequests } from '../../hooks/useRequests'
import { useUsers } from '../../hooks/useUsers'
import { todayISO, formatDate } from '../../utils/helpers'
import { SHIFTS } from '../../types'

const DESTINATIONS = ['F1', 'F2', 'F3', 'Others']

// ── Inline icons ──────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
)
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Reusable field components ─────────────────────────────────
const Label = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}{required && <span style={{ color: '#E53E3E' }}> *</span>}
  </label>
)

const inputStyle = (disabled) => ({
  width: '100%', padding: '9px 12px',
  border: '1px solid #E2E8F0', borderRadius: 6,
  fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
  background: disabled ? '#F7FAFC' : 'white',
  color: disabled ? '#718096' : '#1A202C',
  boxSizing: 'border-box',
})

const FieldError = ({ msg }) => msg
  ? <div style={{ color: '#E53E3E', fontSize: 12, marginTop: 4 }}>{msg}</div>
  : null

// ── Confirmation Modal ────────────────────────────────────────
const ConfirmModal = ({ data, onClose, onConfirm, submitting, submitError }) => (
  <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.16)', width: '100%', maxWidth: 480 }}>
      <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Confirm Submission</span>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#718096', display: 'flex', alignItems: 'center' }}>
          <XIcon />
        </button>
      </div>
      <div style={{ padding: '20px 24px' }}>
        {submitError && (
          <div style={{ color: '#E53E3E', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#FFF5F5', borderRadius: 6 }}>{submitError}</div>
        )}
        <div style={{ padding: '10px 14px', background: '#EBF4FF', borderRadius: 6, fontSize: 13, color: '#1E56A0', marginBottom: 16 }}>
          Please review your request before final submission.
        </div>
        {data.map(([label, val]) => (
          <div key={label} style={{ display: 'flex', padding: '9px 0', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ width: 140, fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>{label}</div>
            <div style={{ fontSize: 13.5, color: '#1A202C' }}>{val || '—'}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: 6, background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
          Edit
        </button>
        <button onClick={onConfirm} disabled={submitting}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', border: 'none', borderRadius: 6, background: '#1E56A0', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
          <CheckIcon />
          {submitting ? 'Submitting…' : 'Confirm & Submit'}
        </button>
      </div>
    </div>
  </div>
)

// ── Main Page ─────────────────────────────────────────────────
export default function CreateOBPage() {
  const { currentUser }   = useAuth()
  const { createRequest } = useRequests()
  const { supervisors }   = useUsers()
  const today             = todayISO()

  const [form, setForm] = useState({
    scheduled_date:     '',
    departure_time:     '',
    destination:        'F1',
    destination_custom: '',
    purpose:            '',
    supervisor_id:      '',
    shift:              'Day Shift',
  })
  const [errors,      setErrors]      = useState({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [submitError, setSubmitError] = useState('')

  const field = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.scheduled_date)                 e.scheduled_date = 'Date is required.'
    else if (form.scheduled_date < today)     e.scheduled_date = 'Date cannot be in the past.'
    if (!form.departure_time)                 e.departure_time = 'Departure time is required.'
    if (!form.purpose.trim())                 e.purpose = 'Purpose is required.'
    if (!form.supervisor_id)                  e.supervisor_id = 'Select a supervisor.'
    if (form.destination === 'Others' && !form.destination_custom.trim())
                                              e.destination_custom = 'Please specify the destination.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleReview = () => { if (validate()) setShowConfirm(true) }

  const handleConfirm = async () => {
    setSubmitting(true); setSubmitError('')
    try {
      await createRequest({
        employee_id:        currentUser.id,
        employee_name:      currentUser.full_name,
        scheduled_date:     form.scheduled_date,
        departure_time:     form.departure_time || null,
        destination:        form.destination === 'Others'
                              ? `Others - ${form.destination_custom}`
                              : form.destination,
        destination_custom: form.destination === 'Others' ? form.destination_custom : null,
        purpose:            form.purpose,
        supervisor_id:      form.supervisor_id,
        shift:              form.shift,
      })
      setSubmitted(true)
      setShowConfirm(false)
      setForm({ scheduled_date: '', departure_time: '', destination: 'F1', destination_custom: '', purpose: '', supervisor_id: '', shift: 'Day Shift' })
    } catch (e) {
      setSubmitError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const supervisor       = supervisors.find(s => s.id === form.supervisor_id)
  const destinationLabel = form.destination === 'Others'
    ? `Others - ${form.destination_custom || '(not specified)'}`
    : form.destination

  // Format time for display (e.g. "14:30" → "2:30 PM")
  const formatTime = (t) => {
    if (!t) return '—'
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
  }

  const confirmData = [
    ['Employee',    currentUser?.full_name],
    ['Date',        formatDate(form.scheduled_date)],
    ['Departure',   formatTime(form.departure_time)],
    ['Destination', destinationLabel],
    ['Purpose',     form.purpose],
    ['Supervisor',  supervisor?.full_name],
    ['Shift',       form.shift],
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>

      {/* Page header */}
      <div style={{ width: '100%', maxWidth: 640, marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A202C' }}>Create OB Request</h1>
        <p style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Fill out the form below to submit an official business request.</p>
      </div>

      {/* Success banner */}
      {submitted && (
        <div style={{ width: '100%', maxWidth: 640, padding: '12px 16px', borderRadius: 6, background: '#F0FFF4', color: '#38A169', border: '1px solid #9AE6B4', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckIcon /> Request submitted! Your supervisor has been notified.
        </div>
      )}

      {/* Form card */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', width: '100%', maxWidth: 640, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Request Details</span>
        </div>
        <div style={{ padding: 24 }}>

          {/* Employee Name */}
          <div style={{ marginBottom: 16 }}>
            <Label>Employee Name</Label>
            <input value={currentUser?.full_name || ''} disabled style={inputStyle(true)} />
          </div>

          {/* Date + Time + Shift — 3 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 16 }}>
            <div>
              <Label required>Scheduled Date</Label>
              <input type="date" min={today} value={form.scheduled_date}
                onChange={e => field('scheduled_date', e.target.value)}
                style={inputStyle(false)} />
              <FieldError msg={errors.scheduled_date} />
            </div>
            <div>
              <Label required>Departure Time</Label>
              <input type="time" value={form.departure_time}
                onChange={e => field('departure_time', e.target.value)}
                style={inputStyle(false)} />
              <FieldError msg={errors.departure_time} />
            </div>
            <div>
              <Label required>Shift</Label>
              <select value={form.shift} onChange={e => field('shift', e.target.value)} style={inputStyle(false)}>
                {SHIFTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Destination */}
          <div style={{ marginBottom: 16 }}>
            <Label required>Destination</Label>
            <select value={form.destination} onChange={e => field('destination', e.target.value)} style={inputStyle(false)}>
              {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Custom destination — only shown when Others is selected */}
          {form.destination === 'Others' && (
            <div style={{ marginBottom: 16 }}>
              <Label required>Specify Destination</Label>
              <input
                value={form.destination_custom}
                onChange={e => field('destination_custom', e.target.value)}
                placeholder="e.g. Outlets, Robinsons..."
                style={inputStyle(false)}
                autoFocus
              />
              <FieldError msg={errors.destination_custom} />
            </div>
          )}

          {/* Purpose */}
          <div style={{ marginBottom: 16 }}>
            <Label required>Purpose</Label>
            <textarea value={form.purpose} onChange={e => field('purpose', e.target.value)}
              placeholder="Describe the purpose of this official business..."
              rows={3} style={{ ...inputStyle(false), resize: 'vertical' }} />
            <FieldError msg={errors.purpose} />
          </div>

          {/* Supervisor */}
          <div style={{ marginBottom: 24 }}>
            <Label required>Senior Supervisor</Label>
            <select value={form.supervisor_id} onChange={e => field('supervisor_id', e.target.value)} style={inputStyle(false)}>
              <option value="">— Select Supervisor —</option>
              {supervisors.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
            <FieldError msg={errors.supervisor_id} />
            {supervisors.length === 0 && (
              <div style={{ color: '#D97706', fontSize: 12, marginTop: 4 }}>No supervisors available. Contact your admin.</div>
            )}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleReview}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', border: 'none', borderRadius: 6, background: '#1E56A0', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              <EyeIcon /> Review & Submit
            </button>
          </div>

        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <ConfirmModal
          data={confirmData}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
          submitting={submitting}
          submitError={submitError}
        />
      )}
    </div>
  )
}