import { useState } from 'react'

// Pantalla de login con credenciales hardcodeadas (admin / 1234)
export function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Pequeño delay para feedback visual
    await new Promise(r => setTimeout(r, 400))

    const ok = onLogin(username, password)
    if (!ok) {
      setError('Usuario o contraseña incorrectos')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Resplandor decorativo de fondo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 229, 160, 0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="w-full max-w-sm relative">
        {/* Branding */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-rim mb-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-positive)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h1
            className="text-4xl font-bold text-ink"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            App Pagos
          </h1>
          <p className="text-dim text-sm mt-2 tracking-widest uppercase text-xs">
            Control financiero personal
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dim mb-2 uppercase tracking-wider">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              className="w-full rounded-xl px-4 py-3.5 text-ink text-sm outline-none transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-rim)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-positive)'}
              onBlur={e  => e.target.style.borderColor = 'var(--color-rim)'}
              placeholder="admin"
              autoComplete="username"
              autoCapitalize="none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dim mb-2 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              className="w-full rounded-xl px-4 py-3.5 text-ink text-sm outline-none transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-rim)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-positive)'}
              onBlur={e  => e.target.style.borderColor = 'var(--color-rim)'}
              placeholder="••••"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <p className="text-sm text-center fade-in" style={{ color: 'var(--color-negative)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 font-semibold text-sm mt-2 transition-opacity"
            style={{
              backgroundColor: 'var(--color-positive)',
              color: '#09090f',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'var(--font-display)',
            }}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
