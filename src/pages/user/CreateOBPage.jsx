import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { useRequests } from '../../hooks/useRequests'
import { useUsers } from '../../hooks/useUsers'
import { todayISO, formatDate } from '../../utils/helpers'
import { SHIFTS } from '../../types'

const PICKUP_LOCATIONS = ['F1', 'F2', 'F3', 'Others']
const DESTINATIONS = ['F1', 'F2', 'F3', 'Others']

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
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
)

const Label = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}{required && <span style={{ color: '#E53E3E' }}> *</span>}
  </label>
)

const inputStyle = (disabled) => ({
  width: '100%', padding: '10px 12px',
  border: '1px solid #E2E8F0', borderRadius: 6,
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
  background: disabled ? '#F7FAFC' : 'white',
  color: disabled ? '#718096' : '#1A202C',
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
  minHeight: 42,
})

const FieldError = ({ msg }) => msg
  ? <div style={{ color: '#E53E3E', fontSize: 12, marginTop: 4 }}>{msg}</div>
  : null

const ConfirmModal = ({ data, onClose, onConfirm, submitting, submitError }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000,
      padding: 20,
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: 'white',
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
        width: '100%',
        maxWidth: 480,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Confirm Submission</span>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#718096', display: 'flex', alignItems: 'center' }}>
          <XIcon />
        </button>
      </div>

      <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
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

      <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
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

const MobilePreview = ({ previewRows, filledCount, totalCount, pct }) => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1A202C' }}>Form Preview</span>
          <div style={{ flex: 1, height: 5, background: '#EDF2F7', borderRadius: 99, overflow: 'hidden', maxWidth: 120 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#38A169' : '#1E56A0', borderRadius: 99, transition: 'width 0.3s ease' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? '#38A169' : '#1E56A0', whiteSpace: 'nowrap' }}>{pct}%</span>
        </div>
        <div style={{ marginLeft: 8, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#718096' }}>
          <ChevronDown />
        </div>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid #E2E8F0', padding: '4px 0 8px' }}>
          {previewRows.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 16px', borderBottom: '1px solid #F7FAFC' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.05em', width: 80, flexShrink: 0, paddingTop: 1 }}>{label}</div>
              <div style={{ fontSize: 13, color: value ? '#1A202C' : '#CBD5E0', fontStyle: value ? 'normal' : 'italic', wordBreak: 'break-word', flex: 1 }}>
                {value || 'Not filled yet'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CreateOBPage() {
  const { currentUser }   = useAuth()
  const { createRequest } = useRequests()
  const { supervisors }   = useUsers()
  const today             = todayISO()

  const [form, setForm] = useState({
    scheduled_date:         '',
    departure_time:         '',
    pickup_location:        '',
    pickup_location_custom: '',
    destination:            'F1',
    destination_custom:     '',
    purpose:                '',
    supervisor_id:          '',
    shift:                  'Day Shift',
  })
  const [errors,      setErrors]      = useState({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [submitError, setSubmitError] = useState('')

  const field = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.scheduled_date)             e.scheduled_date = 'Date is required.'
    else if (form.scheduled_date < today) e.scheduled_date = 'Date cannot be in the past.'
    if (!form.departure_time)             e.departure_time = 'Departure time is required.'
    if (!form.pickup_location)            e.pickup_location = 'Pickup location is required.'
    if (form.pickup_location === 'Others' && !form.pickup_location_custom.trim())
                                          e.pickup_location_custom = 'Please specify the pickup location.'
    if (!form.purpose.trim())             e.purpose = 'Purpose is required.'
    if (!form.supervisor_id)              e.supervisor_id = 'Select an approver.'
    if (form.destination === 'Others' && !form.destination_custom.trim())
                                          e.destination_custom = 'Please specify the destination.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleReview  = () => { if (validate()) setShowConfirm(true) }

  const handleConfirm = async () => {
    setSubmitting(true); setSubmitError('')
    try {
      await createRequest({
        employee_id:            currentUser.id,
        employee_name:          currentUser.full_name,
        scheduled_date:         form.scheduled_date,
        departure_time:         form.departure_time || null,
        pickup_location:        form.pickup_location,
        pickup_location_custom: form.pickup_location === 'Others' ? form.pickup_location_custom : null,
        destination:            form.destination === 'Others'
                                  ? `Others - ${form.destination_custom}`
                                  : form.destination,
        destination_custom:     form.destination === 'Others' ? form.destination_custom : null,
        purpose:                form.purpose,
        supervisor_id:          form.supervisor_id,
        shift:                  form.shift,
      })
      setSubmitted(true)
      setShowConfirm(false)
      setForm({ scheduled_date: '', departure_time: '', pickup_location: '', pickup_location_custom: '', destination: 'F1', destination_custom: '', purpose: '', supervisor_id: '', shift: 'Day Shift' })
    } catch (e) {
      setSubmitError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const supervisor       = supervisors.find(s => s.id === form.supervisor_id)
  const pickupLabel      = form.pickup_location === 'Others'
    ? (form.pickup_location_custom?.trim() || '(not specified)')
    : form.pickup_location
  const destinationLabel = form.destination === 'Others'
    ? `Others - ${form.destination_custom || '(not specified)'}`
    : form.destination

  const formatTime = (t) => {
    if (!t) return '—'
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour  = h % 12 || 12
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
  }

  const confirmData = [
    ['Employee',        currentUser?.full_name],
    ['Date',            formatDate(form.scheduled_date)],
    ['Departure',       formatTime(form.departure_time)],
    ['Pickup Location', pickupLabel],
    ['Destination',     destinationLabel],
    ['Purpose',         form.purpose],
    ['Approver',      supervisor?.full_name],
    ['Shift',           form.shift],
  ]

  const previewRows = [
    { label: 'Employee',        value: currentUser?.full_name },
    { label: 'Date',            value: form.scheduled_date ? formatDate(form.scheduled_date) : null },
    { label: 'Departure',       value: form.departure_time  ? formatTime(form.departure_time) : null },
    { label: 'Shift',           value: form.shift },
    { label: 'Pickup Location', value: pickupLabel && pickupLabel !== '(not specified)' ? pickupLabel : null },
    { label: 'Destination',     value: destinationLabel !== 'Others - (not specified)' ? destinationLabel : null },
    { label: 'Purpose',         value: form.purpose.trim() || null },
    { label: 'Supervisor',      value: supervisor?.full_name || null },
  ]

  const filledCount = previewRows.filter(r => r.value).length
  const totalCount  = previewRows.length
  const pct         = Math.round((filledCount / totalCount) * 100)

  const FormCard = (
    <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0' }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Request Details</span>
      </div>
      <div style={{ padding: '20px 16px' }}>

        {/* Employee Name */}
        <div style={{ marginBottom: 16 }}>
          <Label>Employee Name</Label>
          <input value={currentUser?.full_name || ''} disabled style={inputStyle(true)} />
        </div>

        {/* Date + Time + Shift */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
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
            <div style={{ position: 'relative' }}>
              <select value={form.shift} onChange={e => field('shift', e.target.value)} style={{ ...inputStyle(false), paddingRight: 32 }}>
                {SHIFTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#718096' }}>
                <ChevronDown />
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div style={{ marginBottom: 16 }}>
          <Label required>Pickup Location</Label>
          <div style={{ position: 'relative' }}>
            <select value={form.pickup_location} onChange={e => field('pickup_location', e.target.value)} style={{ ...inputStyle(false), paddingRight: 32 }}>
              <option value="">Select Pickup Location</option>
              {PICKUP_LOCATIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#718096' }}>
              <ChevronDown />
            </div>
          </div>
          <FieldError msg={errors.pickup_location} />
        </div>

        {/* Custom pickup */}
        {form.pickup_location === 'Others' && (
          <div style={{ marginBottom: 16 }}>
            <Label required>Specify Pickup Location</Label>
            <input
              value={form.pickup_location_custom}
              onChange={e => field('pickup_location_custom', e.target.value)}
              placeholder="Enter pickup location"
              style={inputStyle(false)}
              autoFocus
            />
            <FieldError msg={errors.pickup_location_custom} />
          </div>
        )}

        {/* Destination */}
        <div style={{ marginBottom: 16 }}>
          <Label required>Destination</Label>
          <div style={{ position: 'relative' }}>
            <select value={form.destination} onChange={e => field('destination', e.target.value)} style={{ ...inputStyle(false), paddingRight: 32 }}>
              {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#718096' }}>
              <ChevronDown />
            </div>
          </div>
        </div>

        {/* Custom destination */}
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
            placeholder="Describe the purpose of this official business and note if necessary..."
            rows={4} style={{ ...inputStyle(false), resize: 'vertical', lineHeight: 1.5 }} />
          <FieldError msg={errors.purpose} />
        </div>

        {/* Supervisor */}
        <div style={{ marginBottom: 24 }}>
          <Label required>Approver</Label>
          <div style={{ position: 'relative' }}>
            <select value={form.supervisor_id} onChange={e => field('supervisor_id', e.target.value)} style={{ ...inputStyle(false), paddingRight: 32 }}>
              <option value="">— Select Approver —</option>
              {supervisors.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#718096' }}>
              <ChevronDown />
            </div>
          </div>
          <FieldError msg={errors.supervisor_id} />
          {supervisors.length === 0 && (
            <div style={{ color: '#D97706', fontSize: 12, marginTop: 4 }}>No supervisors available. Contact your admin.</div>
          )}
        </div>

        {/* Submit button */}
        <button onClick={handleReview}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            width: '100%', padding: '12px 22px',
            border: 'none', borderRadius: 6, background: '#1E56A0', color: 'white',
            fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            // ── FIX: ensure button is never hidden behind browser chrome on mobile ──
            marginBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
          <EyeIcon /> Review & Submit
        </button>

      </div>
    </div>
  )

  const DesktopSidebar = (
    <div style={{ flex: '0 0 calc(40% - 20px)', minWidth: 0, position: 'sticky', top: 0 }}>
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 14 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Completion</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? '#38A169' : '#1E56A0' }}>{pct}%</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ height: 6, background: '#EDF2F7', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#38A169' : '#1E56A0', borderRadius: 99, transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontSize: 12, color: '#718096', marginTop: 8 }}>
            {filledCount} of {totalCount} fields filled
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Preview</span>
        </div>
        <div style={{ padding: '6px 0' }}>
          {previewRows.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 20px', borderBottom: '1px solid #F7FAFC' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.05em', width: 90, flexShrink: 0, paddingTop: 1 }}>{label}</div>
              <div style={{ fontSize: 13, color: value ? '#1A202C' : '#CBD5E0', fontStyle: value ? 'normal' : 'italic', wordBreak: 'break-word', flex: 1 }}>
                {value || 'Not filled yet'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        .ob-layout {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .ob-form-col {
          flex: 0 0 60%;
          min-width: 0;
        }
        .ob-sidebar {
          flex: 0 0 calc(40% - 20px);
          min-width: 0;
          position: sticky;
          top: 0;
        }
        .ob-mobile-preview { display: none; }

        @media (max-width: 767px) {
          .ob-layout {
            display: block;
          }
          .ob-form-col {
            flex: none;
            width: 100%;
          }
          .ob-sidebar {
            display: none;
          }
          .ob-mobile-preview {
            display: block;
          }
        }
      `}</style>

      {/* ── FIX: added paddingBottom with safe-area fallback so button clears browser chrome ── */}
      <div style={{
        padding: '0 4px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}>

        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A202C', margin: 0 }}>Create OB Request</h1>
          <p style={{ fontSize: 13, color: '#718096', marginTop: 4, marginBottom: 0 }}>Fill out the form below to submit an official business request.</p>
        </div>

        {submitted && (
          <div style={{ padding: '12px 16px', borderRadius: 6, background: '#F0FFF4', color: '#38A169', border: '1px solid #9AE6B4', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <CheckIcon /> Request submitted! Your supervisor has been notified.
          </div>
        )}

        <div className="ob-mobile-preview">
          <MobilePreview
            previewRows={previewRows}
            filledCount={filledCount}
            totalCount={totalCount}
            pct={pct}
          />
        </div>

        <div className="ob-layout">
          <div className="ob-form-col">
            {FormCard}
          </div>
          <div className="ob-sidebar">
            {DesktopSidebar}
          </div>
        </div>

      </div>

      {showConfirm && (
        <ConfirmModal
          data={confirmData}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
          submitting={submitting}
          submitError={submitError}
        />
      )}
    </>
  )
}