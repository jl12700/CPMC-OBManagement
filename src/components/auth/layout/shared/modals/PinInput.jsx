export default function PinInput({ value = '', onChange, label, id = 'pin' }) {
  const digits = value.split('').concat(['', '', '', '']).slice(0, 4)

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '')
    const arr = value.split('').concat(['', '', '', '']).slice(0, 4)
    if (val) {
      arr[i] = val.slice(-1)
      const next = document.getElementById(`${id}-${i + 1}`)
      if (next) next.focus()
    } else {
      arr[i] = ''
      const prev = document.getElementById(`${id}-${i - 1}`)
      if (prev) prev.focus()
    }
    onChange(arr.join('').slice(0, 4))
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i]) {
      const prev = document.getElementById(`${id}-${i - 1}`)
      if (prev) prev.focus()
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {digits.map((d, i) => (
          <input
            key={i}
            id={`${id}-${i}`}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            style={{
              width: 52, height: 56,
              border: '1.5px solid #E2E8F0',
              borderRadius: 6,
              fontSize: 22, fontWeight: 700,
              fontFamily: 'DM Mono, monospace',
              textAlign: 'center',
              outline: 'none',
              transition: 'all 0.15s',
              WebkitTextSecurity: 'disc',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#1E56A0'; e.target.style.boxShadow = '0 0 0 3px #EBF4FF' }}
            onBlur={(e)  => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
          />
        ))}
      </div>
    </div>
  )
}
