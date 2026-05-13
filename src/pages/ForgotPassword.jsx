import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { forgotPassword } from '../services/authService'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resentOk, setResentOk] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setError('Ocurrió un error. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReenviar() {
    if (resentOk) return
    setResending(true)
    try {
      await forgotPassword(email)
      setResentOk(true)
    } catch {}
    finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-surface">
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'radial-gradient(#1e1c0e 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      {sent ? (
        /* ——— ESTADO: EMAIL ENVIADO ——— */
        <section className="max-w-md w-full relative z-10">
          <div
            className="bg-surface border-4 border-on-surface p-8 md:p-12 flex flex-col items-center text-center"
            style={{ boxShadow: '6px 6px 0px 0px #1E1C0E' }}
          >
            {/* Ícono */}
            <div className="mb-8 w-24 h-24 bg-secondary-container border-4 border-on-surface flex items-center justify-center rotate-3">
              <MailCheck size={48} className="text-primary" />
            </div>

            <h1 className="font-headline font-black text-3xl md:text-4xl text-on-surface uppercase tracking-tighter leading-none mb-6">
              ¡REVISÁ TU BANDEJA DE ENTRADA!
            </h1>

            <p className="text-lg font-body font-medium leading-relaxed mb-8 text-on-surface-variant">
              Te enviamos un enlace seguro para restablecer tu contraseña. Hacé clic en el botón del correo para recuperar el acceso a tu cuenta.
            </p>

            {/* Email del usuario */}
            <div className="w-full bg-secondary-container border-4 border-on-surface p-4 mb-10 -rotate-1">
              <p className="font-headline font-black text-xl tracking-tight text-on-secondary-container break-all">
                {email}
              </p>
            </div>

            {/* Botón reenviar */}
            <button
              onClick={handleReenviar}
              disabled={resending || resentOk}
              className="w-full bg-surface border-4 border-on-surface py-4 px-8 font-headline font-black text-xl uppercase tracking-widest hover:bg-surface-container-high transition-colors mb-8 disabled:opacity-60 comic-push-sm"
            >
              {resentOk ? '¡EMAIL REENVIADO!' : resending ? 'ENVIANDO...' : 'REENVIAR EMAIL'}
            </button>

            <p className="font-body font-bold uppercase tracking-widest text-xs text-on-surface-variant">
              ¿Te equivocaste de email?{' '}
              <button
                onClick={() => { setSent(false); setResentOk(false) }}
                className="text-primary hover:underline decoration-2 underline-offset-4 transition-colors"
              >
                Volvé atrás y corregilo
              </button>
            </p>
          </div>

          {/* Elementos decorativos */}
          <div className="absolute -bottom-4 -right-4 w-32 h-12 bg-primary border-4 border-on-surface -z-10 rotate-6" />
          <div className="absolute -top-4 -left-4 w-20 h-20 bg-secondary border-4 border-on-surface -z-10 -rotate-12" />
        </section>
      ) : (
        /* ——— ESTADO: FORMULARIO ——— */
        <div
          className="max-w-md w-full bg-surface border-4 border-on-surface p-8 md:p-12 relative z-10"
          style={{ boxShadow: '8px 8px 0px 0px #1E1C0E' }}
        >
          <header className="mb-8">
            <h1 className="font-headline font-black text-4xl uppercase tracking-tighter text-on-surface mb-2">
              ¿Olvidaste tu <span className="text-primary">contraseña?</span>
            </h1>
            <p className="text-sm font-body font-bold text-on-surface-variant uppercase tracking-wide">
              Ingresá tu email y te enviamos un enlace para restablecerla.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="font-body font-bold uppercase tracking-widest text-xs">
                Email
              </label>
              <input
                type="email"
                className="input-comic p-4 w-full"
                placeholder="heroe@comics-corp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-error text-xs font-bold uppercase tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary border-4 border-on-surface py-4 font-headline font-black text-xl uppercase tracking-tighter disabled:opacity-60 comic-push-sm"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>

            <p className="text-center">
              <Link
                to="/"
                className="font-headline font-black text-xs uppercase underline decoration-2 underline-offset-4 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                ← Volver al inicio
              </Link>
            </p>
          </form>
        </div>
      )}
    </main>
  )
}
