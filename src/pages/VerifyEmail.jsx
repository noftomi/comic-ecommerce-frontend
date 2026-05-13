import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { verifyEmail, resendVerification } from '../services/authService'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const calledRef = useRef(false)

  // Estados para el formulario de reenvío
  const [resendEmail, setResendEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [resentOk, setResentOk] = useState(false)
  const [resendError, setResendError] = useState('')

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    const token = searchParams.get('token')
    if (!token) { setStatus('error'); return }

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [])

  async function handleResend(e) {
    e.preventDefault()
    setResendError('')
    setSending(true)
    try {
      await resendVerification(resendEmail)
      setResendSent(true)
    } catch {
      setResendError('Ocurrió un error. Intentá de nuevo.')
    } finally {
      setSending(false)
    }
  }

  async function handleReenviarOtraVez() {
    if (resentOk) return
    setSending(true)
    try {
      await resendVerification(resendEmail)
      setResentOk(true)
    } catch {}
    finally { setSending(false) }
  }

  /* ——— VERIFICACIÓN EXITOSA ——— */
  if (status === 'success') {
    return (
      <main
        className="flex-grow flex items-center justify-center relative overflow-hidden px-4 py-12"
        style={{ backgroundColor: '#FFF9E8' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#1e1c0e 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.07,
          }}
        />

        <div className="relative z-10 w-full max-w-2xl">
          <div
            className="bg-surface border-4 border-on-surface p-8 md:p-16 text-center relative overflow-hidden"
            style={{ boxShadow: '12px 12px 0px 0px #1e1c0e' }}
          >
            {/* Halftone corner accent */}
            <div
              className="absolute top-0 right-0 w-24 h-24 opacity-20 rotate-45 translate-x-12 -translate-y-12 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#FCD400 20%, transparent 20%)',
                backgroundSize: '6px 6px',
              }}
            />

            {/* Icon composition */}
            <div className="relative mb-10 inline-block">
              <span className="material-symbols-outlined absolute -top-4 -left-8 text-secondary text-3xl -rotate-12">star</span>
              <span className="material-symbols-outlined absolute -bottom-2 -right-8 text-primary text-2xl rotate-12">check_circle</span>
              <span className="material-symbols-outlined absolute top-4 -right-12 text-on-surface opacity-30 text-4xl rotate-45">mail</span>

              <div
                className="bg-secondary-container border-4 border-on-surface p-6"
                style={{ boxShadow: '8px 8px 0px 0px #1e1c0e' }}
              >
                <span
                  className="material-symbols-outlined text-8xl text-primary leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mark_email_read
                </span>
              </div>
            </div>

            {/* Texto */}
            <div className="space-y-6 mb-12">
              <h1 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl text-on-surface tracking-tighter uppercase leading-none">
                ¡TU EMAIL FUE <span className="text-primary">VERIFICADO!</span>
              </h1>
              <div className="h-1.5 w-24 bg-primary mx-auto" />
              <p className="font-body text-xl text-on-surface font-semibold max-w-lg mx-auto leading-relaxed">
                Tu cuenta está activa y lista para usar. ¡Bienvenido a la revolución de los cómics!
              </p>
            </div>

            {/* CTA */}
            <div className="flex justify-center">
              <Link
                to="/catalog"
                className="group inline-flex items-center justify-center bg-primary text-on-primary border-4 border-on-surface px-10 py-5 font-headline font-black text-xl md:text-2xl uppercase tracking-tighter comic-push"
              >
                EMPEZAR A EXPLORAR
                <span className="material-symbols-outlined ml-3 group-hover:translate-x-2 transition-transform">
                  rocket_launch
                </span>
              </Link>
            </div>
          </div>

          {/* Paneles secundarios */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-surface-container-high border-2 border-on-surface p-4 flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl shrink-0">auto_stories</span>
              <span className="font-body font-bold uppercase tracking-widest text-xs">Acceso a los mejores títulos del mercado</span>
            </div>
            <div className="flex-1 bg-surface-container-high border-2 border-on-surface p-4 flex items-center gap-4">
              <span className="material-symbols-outlined text-secondary text-3xl shrink-0">group</span>
              <span className="font-body font-bold uppercase tracking-widest text-xs">Únete a la mayor comunidad de Sellers</span>
            </div>
          </div>
        </div>
      </main>
    )
  }

  /* ——— ERROR DE VERIFICACIÓN ——— */
  if (status === 'error') {
    /* Sub-estado: email enviado */
    if (resendSent) {
      return (
        <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden bg-surface">
          <div
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{ backgroundImage: 'radial-gradient(#1e1c0e 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
          <section className="max-w-md w-full relative z-10">
            <div
              className="bg-surface border-4 border-on-surface p-8 md:p-12 flex flex-col items-center text-center"
              style={{ boxShadow: '6px 6px 0px 0px #1E1C0E' }}
            >
              <div className="mb-8 w-24 h-24 bg-secondary-container border-4 border-on-surface flex items-center justify-center rotate-3">
                <MailCheck size={48} className="text-primary" />
              </div>

              <h1 className="font-headline font-black text-3xl md:text-4xl text-on-surface uppercase tracking-tighter leading-none mb-6">
                ¡REVISÁ TU BANDEJA DE ENTRADA!
              </h1>
              <p className="text-lg font-body font-medium leading-relaxed mb-8 text-on-surface-variant">
                Te reenviamos el enlace de verificación. Hacé clic en el botón del correo para activar tu cuenta.
              </p>

              <div className="w-full bg-secondary-container border-4 border-on-surface p-4 mb-10 -rotate-1">
                <p className="font-headline font-black text-xl tracking-tight text-on-secondary-container break-all">
                  {resendEmail}
                </p>
              </div>

              <button
                onClick={handleReenviarOtraVez}
                disabled={sending || resentOk}
                className="w-full bg-surface border-4 border-on-surface py-4 px-8 font-headline font-black text-xl uppercase tracking-widest hover:bg-surface-container-high transition-colors mb-8 disabled:opacity-60 comic-push-sm"
              >
                {resentOk ? '¡EMAIL REENVIADO!' : sending ? 'ENVIANDO...' : 'REENVIAR EMAIL'}
              </button>

              <p className="font-body font-bold uppercase tracking-widest text-xs text-on-surface-variant">
                ¿Te equivocaste de email?{' '}
                <button
                  onClick={() => { setResendSent(false); setResentOk(false); setResendError('') }}
                  className="text-primary hover:underline decoration-2 underline-offset-4 transition-colors"
                >
                  Volvé atrás y corregilo
                </button>
              </p>
            </div>

            <div className="absolute -bottom-4 -right-4 w-32 h-12 bg-primary border-4 border-on-surface -z-10 rotate-6" />
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-secondary border-4 border-on-surface -z-10 -rotate-12" />
          </section>
        </main>
      )
    }

    /* Sub-estado: formulario */
    return (
      <main className="flex-grow flex items-center justify-center p-6 bg-surface-container-low">
        <div className="max-w-xl w-full relative">

          <div className="absolute -top-6 -left-6 text-primary opacity-20 -rotate-12 pointer-events-none select-none">
            <span className="material-symbols-outlined text-6xl">unsubscribe</span>
          </div>
          <div className="absolute -bottom-8 -right-4 text-on-surface opacity-10 rotate-12 pointer-events-none select-none">
            <span className="material-symbols-outlined text-8xl">close</span>
          </div>

          <div
            className="bg-surface-container-lowest border-4 border-on-surface p-10 md:p-16 text-center relative overflow-hidden"
            style={{ boxShadow: '8px 8px 0px 0px #1e1c0e' }}
          >
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#1e1c0e 1px, transparent 1px)', backgroundSize: '8px 8px' }}
            />

            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 bg-secondary-container border-2 border-on-surface flex items-center justify-center relative z-10">
                <span className="material-symbols-outlined text-7xl text-on-surface">mail</span>
                <div className="absolute -top-4 -right-4 bg-primary border-2 border-on-surface w-12 h-12 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>close</span>
                </div>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -left-10 text-primary text-4xl opacity-40 -rotate-45 select-none">drafts</span>
              <span className="material-symbols-outlined absolute top-0 -right-14 text-on-surface text-3xl opacity-30 rotate-12 select-none">warning</span>
            </div>

            <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter text-on-surface leading-none mb-6">
              No pudimos verificar tu email
            </h1>
            <div className="space-y-3 mb-10">
              <p className="font-body text-lg text-on-surface font-medium leading-relaxed">
                Parece que el enlace expiró o ya no es válido. Ingresá tu email y te mandamos uno nuevo.
              </p>
              <p className="font-body text-sm uppercase tracking-widest text-on-surface-variant font-bold">
                Los links de verificación tienen una validez limitada.
              </p>
            </div>

            <form onSubmit={handleResend} className="flex flex-col gap-4 mb-8">
              <input
                type="email"
                className="input-comic p-4 w-full text-center"
                placeholder="tu@email.com"
                value={resendEmail}
                onChange={(e) => { setResendEmail(e.target.value); setResendError('') }}
                required
              />
              {resendError && (
                <p className="font-body text-primary text-xs font-bold uppercase tracking-wide">{resendError}</p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full px-8 py-4 bg-primary text-on-primary font-headline font-black uppercase tracking-widest border-2 border-on-surface disabled:opacity-60 comic-push-sm"
              >
                {sending ? 'Enviando...' : 'Reenviar email de verificación'}
              </button>
            </form>

            <Link
              to="/"
              className="group inline-flex items-center gap-2 font-headline font-bold uppercase tracking-widest text-sm text-on-surface hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  /* ——— LOADING ——— */
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
        className="w-full max-w-lg bg-surface border-4 border-on-surface relative overflow-hidden text-center"
        style={{ boxShadow: '8px 8px 0px 0px #1e1c0e' }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
        <div className="p-8 md:p-12">
          <div className="w-14 h-14 border-4 border-surface-container-highest border-t-primary rounded-full animate-spin mx-auto mb-6" />
          <p className="font-headline font-black text-xl uppercase">Verificando...</p>
        </div>
      </div>
    </main>
  )
}
