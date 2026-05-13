import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../services/authService'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }

    setLoading(true)
    try {
      await resetPassword(token, password)
      navigate('/?reset=ok')
    } catch (err) {
      setError(err.response?.data?.error || 'Token inválido o expirado')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center py-20 px-6 bg-surface">
        <p className="font-headline font-black text-xl uppercase text-primary">Enlace inválido.</p>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center py-20 px-6"
      style={{
        background: 'radial-gradient(#1e1c0e 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundColor: '#FFF9E8',
      }}
    >
      <div
        className="w-full max-w-md bg-surface border-4 border-on-surface relative overflow-hidden"
        style={{ boxShadow: '8px 8px 0px 0px #1e1c0e' }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
        <div className="p-8 md:p-12">
          <header className="mb-8">
            <h1 className="font-headline font-black text-4xl uppercase tracking-tighter text-on-surface mb-2 italic">
              Nueva <span className="text-primary">contraseña</span>
            </h1>
            <p className="font-body text-sm font-bold text-on-surface-variant uppercase tracking-wide">
              Elegí una contraseña nueva para tu cuenta.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="font-body font-bold uppercase tracking-widest text-xs">
                Nueva contraseña
              </label>
              <input
                type="password"
                className="input-comic p-4 w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-body font-bold uppercase tracking-widest text-xs">
                Confirmar contraseña
              </label>
              <input
                type="password"
                className="input-comic p-4 w-full"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="font-body text-primary text-xs font-bold uppercase tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary border-4 border-on-surface py-4 font-headline font-black text-xl uppercase tracking-tighter disabled:opacity-60 comic-push-sm"
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>

            <p className="text-center">
              <Link
                to="/"
                className="font-headline font-black text-primary uppercase underline decoration-2 underline-offset-4 hover:text-on-surface transition-colors text-xs"
              >
                Volver al inicio
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
