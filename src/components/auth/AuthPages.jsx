import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabase'
import { isValidCpmcId, isValidPin } from '../../utils/helpers'
import PinInput from './layout/shared/modals/PinInput'

/* ─── fixed dimensions ───────────────────────────────────────── */
const CARD_WIDTH = 860
const CARD_HEIGHT = 520

/* ─── styles ─────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f4f8',
    padding: 16,
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  card: {
    display: 'flex',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 25px 60px rgba(0,0,0,0.12)',
    width: '100%',
    maxWidth: CARD_WIDTH,
    height: CARD_HEIGHT,
    background: '#FFFFFF',
  },
  /* Left branding pane – 45% */
  left: {
    flex: '0 0 45%',
    background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 40%, #2c5282 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 'clamp(28px, 4vw, 44px)',
    position: 'relative',
    overflow: 'hidden',
    color: '#FFFFFF',
  },
  leftTitle: {
    fontSize: 'clamp(22px, 2.6vw, 30px)',
    fontWeight: 800,
    marginBottom: 12,
    lineHeight: 1.25,
    color: '#FFFFFF',
  },
  leftSubtitle: {
    fontSize: 'clamp(12px, 1.3vw, 14px)',
    lineHeight: 1.6,
    opacity: 0.85,
    color: '#FFFFFF',
  },
  /* Right form pane – 55%, scrollable */
  right: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 'clamp(24px, 4vw, 44px)',
    overflowY: 'auto',
  },
  heading: {
    fontSize: 'clamp(22px, 2.4vw, 28px)',
    fontWeight: 800,
    color: '#1A202C',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 22,
  },
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#718096',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '10px 16px',
    border: '1px solid #E2E8F0',
    borderRadius: 50,
    fontSize: 13.5,
    fontFamily: 'inherit',
    outline: 'none',
    background: '#F9FAFB',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  btn: {
    width: '100%',
    padding: '11px',
    marginTop: 6,
    border: 'none',
    borderRadius: 50,
    background: '#3182ce',
    color: 'white',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.2s, transform 0.1s',
  },
  link: {
    color: '#3182ce',
    cursor: 'pointer',
    fontWeight: 600,
    textDecoration: 'none',
  },
  footer: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 13,
    color: '#718096',
  },
}

/* ─── Decorative elements for the left pane ──────────────────── */
function Decorations() {
  return (
    <>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)' }} />
      <div style={{ position: 'absolute', top: 36, left: '30%', fontSize: 22, opacity: 0.35, color: '#fff' }}>＋</div>
      <div style={{ position: 'absolute', top: 28, right: 32, display: 'grid', gridTemplateColumns: 'repeat(4, 6px)', gap: 6 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 60, left: 24, width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)' }} />
      <svg style={{ position: 'absolute', bottom: 0, right: 0 }} width="220" height="140" viewBox="0 0 220 140" fill="none">
        <path d="M0 140 C30 100, 80 130, 110 90 S170 60, 220 80 L220 140Z" fill="rgba(255,255,255,0.05)" />
        <path d="M0 140 C40 110, 90 140, 130 100 S190 70, 220 90" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" />
      </svg>
      <div style={{ position: 'absolute', bottom: 80, left: '50%', fontSize: 18, opacity: 0.3, color: '#fff' }}>＋</div>
    </>
  )
}

/* ─── Shared auth card wrapper (fixed two-pane) ──────────────── */
function AuthCard({ children, title, subtitle }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Left pane – branding */}
        <div className="auth-left-pane" style={styles.left}>
          <Decorations />
          <h2 style={styles.leftTitle}>CPMC Official Business Request</h2>
          <p style={styles.leftSubtitle}>
            You can sign in to access your existing account.
          </p>
        </div>

        {/* Right pane – form (scrollable when content overflows) */}
        <div className="auth-right-pane" style={styles.right}>
          {title && <h1 style={styles.heading}>{title}</h1>}
          {subtitle && <p style={styles.subheading}>{subtitle}</p>}
          {children}
        </div>
      </div>

      <style>{`
        .auth-right-pane::-webkit-scrollbar { width: 0; height: 0; }
        .auth-right-pane { scrollbar-width: none; -ms-overflow-style: none; }
        @media (max-width: 700px) {
          .auth-left-pane { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function Alert({ type = 'error', children }) {
  const colors = {
    error:   { bg: '#FFF5F5', color: '#E53E3E', border: '#FEB2B2' },
    success: { bg: '#F0FFF4', color: '#38A169', border: '#9AE6B4' },
    info:    { bg: '#EBF4FF', color: '#3182ce', border: '#BEE3F8' },
  }[type]
  return (
    <div style={{ padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 12, background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}>
      {children}
    </div>
  )
}

// ── LOGIN ─────────────────────────────────────────────────────
export function LoginPage({ onRegister, onForgot }) {
  const { login }         = useAuth()
  const [cpmcId, setCpmcId] = useState('')
  const [pin,    setPin]    = useState('')
  const [error,  setError]  = useState('')
  const [loading, setLoading] = useState(false)

const handleLogin = async () => {
  setError('')
  if (!cpmcId) { setError('Enter your CPMC ID.'); return }
  if (pin.length !== 4) { setError('Enter your 4-digit PIN.'); return }
  setLoading(true)
  try {
    await login(cpmcId, pin)
  } catch (e) {
    setError('Invalid CPMC ID or PIN.')
  } finally {
    setLoading(false)
  }
}

  return (
    <AuthCard title="Sign In" subtitle="Sign in to your account">
      {error && <Alert type="error">{error}</Alert>}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>CPMC ID NUMBER</label>
        <input
          value={cpmcId}
          onChange={(e) => setCpmcId(e.target.value.replace(/\D/g, ''))}
          placeholder="ex: 597, 2122"
          style={styles.input}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
      </div>
      <PinInput label="4-Digit PIN" value={pin} onChange={setPin} id="login-pin" />
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
      <div style={styles.footer}>
        <span onClick={onForgot} style={styles.link}>Forgot PIN?</span>
        <br /><br />
        Don't have an account?{' '}
        <span onClick={onRegister} style={styles.link}>Create an Account</span>
      </div>
    </AuthCard>
  )
}

// ── REGISTER ─────────────────────────────────────────────────
export function RegisterPage({ onBack }) {
  const [form, setForm]       = useState({ cpmc_id: '', full_name: '', pin: '', confirm_pin: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const handleRegister = async () => {
    setError('')
    if (!isValidCpmcId(form.cpmc_id))   { setError('CPMC ID must be numeric only.'); return }
    if (!form.full_name.trim())          { setError('Full name is required.'); return }
    if (!isValidPin(form.pin))           { setError('PIN must be exactly 4 digits.'); return }
    if (form.pin !== form.confirm_pin)   { setError('PINs do not match.'); return }
    setLoading(true)
    try {
      await supabase.rpc('register_user', { p_cpmc_id: form.cpmc_id, p_full_name: form.full_name, p_pin: form.pin })
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <AuthCard title="Registered!" subtitle="Your account has been created.">
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>✓</div>
        <p style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>Ask your admin to assign your role before you can access the system.</p>
        <button onClick={onBack} style={styles.btn}>Back to Login</button>
      </div>
    </AuthCard>
  )

  return (
    <AuthCard title="Create Account" subtitle="Register with your CPMC ID">
      {error && <Alert type="error">{error}</Alert>}
      {[{ label: 'CPMC ID', key: 'cpmc_id', placeholder: 'ex. 597, 2122', numeric: true },
        { label: 'Full Name', key: 'full_name', placeholder: 'Juan Dela Cruz' }
      ].map(({ label, key, placeholder, numeric }) => (
        <div key={key} style={styles.fieldGroup}>
          <label style={styles.label}>{label}</label>
          <input
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: numeric ? e.target.value.replace(/\D/g, '') : e.target.value }))}
            placeholder={placeholder}
            style={styles.input}
          />
        </div>
      ))}
      <PinInput label="Set 4-Digit PIN" value={form.pin} onChange={(v) => setForm((f) => ({ ...f, pin: v }))} id="reg-pin" />
      <PinInput label="Confirm PIN" value={form.confirm_pin} onChange={(v) => setForm((f) => ({ ...f, confirm_pin: v }))} id="reg-confirm" />
      <button onClick={handleRegister} disabled={loading}
        style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Registering…' : 'Register'}
      </button>
      <div style={{ ...styles.footer, marginTop: 10 }}>
        Already registered?{' '}
        <span onClick={onBack} style={styles.link}>Sign In</span>
      </div>
    </AuthCard>
  )
}

// ── FORGOT PIN ───────────────────────────────────────────────
export function ForgotPinPage({ onBack }) {
  const [cpmcId, setCpmcId] = useState('')
  const [newPin, setNewPin] = useState('')
  const [step,   setStep]   = useState(1)
  const [error,  setError]  = useState('')
  const [loading, setLoading] = useState(false)

  const handleFind = async () => {
    setError('')
    const { data } = await supabase.from('users').select('id').eq('cpmc_id', cpmcId).maybeSingle()
    if (!data) { setError('CPMC ID not found.'); return }
    setStep(2)
  }

  const handleReset = async () => {
    if (!isValidPin(newPin)) { setError('PIN must be exactly 4 digits.'); return }
    setLoading(true)
    const { data: user } = await supabase.from('users').select('id').eq('cpmc_id', cpmcId).single()
    const { error: rpcErr } = await supabase.rpc('change_pin', { p_user_id: user.id, p_new_pin: newPin })
    if (rpcErr) { setError(rpcErr.message); setLoading(false); return }
    setStep(3); setLoading(false)
  }

  return (
    <AuthCard title="Reset PIN" subtitle="Enter your CPMC ID to reset your PIN">
      {error && <Alert type="error">{error}</Alert>}
      {step === 1 && (
        <>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>CPMC ID</label>
            <input value={cpmcId} onChange={(e) => setCpmcId(e.target.value.replace(/\D/g, ''))}
              style={styles.input} />
          </div>
          <button onClick={handleFind} style={styles.btn}>Continue</button>
        </>
      )}
      {step === 2 && (
        <>
          <Alert type="success">Account found. Set your new PIN.</Alert>
          <PinInput label="New 4-Digit PIN" value={newPin} onChange={setNewPin} id="forgot-pin" />
          <button onClick={handleReset} disabled={loading || newPin.length !== 4}
            style={{ ...styles.btn, opacity: newPin.length !== 4 ? 0.5 : 1 }}>
            {loading ? 'Saving…' : 'Reset PIN'}
          </button>
        </>
      )}
      {step === 3 && (
        <>
          <Alert type="success">PIN reset successfully! You can now log in.</Alert>
          <button onClick={onBack} style={styles.btn}>Back to Login</button>
        </>
      )}
      {step !== 3 && (
        <div style={styles.footer}>
          <span onClick={onBack} style={styles.link}>Back to Login</span>
        </div>
      )}
    </AuthCard>
  )
}
