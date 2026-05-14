import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MailOpen, Send, ArrowLeft } from 'lucide-react'
import { resendVerification } from '../services/authService'

export default function VerifyEmailSent() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email
  const [spamHint, setSpamHint] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendError, setResendError] = useState(null)

  const handleResend = async () => {
    setResending(true)
    setResendError(null)
    try {
      await resendVerification(email)
      setSpamHint(true)
    } catch {
      setResendError('No se pudo reenviar el email. Intentá de nuevo.')
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden min-h-screen bg-surface">
      {/* Fondo halftone */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'radial-gradient(#1e1c0e 10%, transparent 11%)',
          backgroundSize: '8px 8px',
        }}
      />

      {/* Panel decorativo (solo desktop) */}
      <div className="hidden lg:block absolute bottom-12 -right-12 w-64 h-80 border-4 border-on-surface bg-surface-container-highest rotate-12 -z-0 opacity-60" />

      <div
        className="max-w-xl w-full bg-surface-container-low border-4 border-on-surface p-8 md:p-12 relative z-10"
        style={{ boxShadow: '6px 6px 0px 0px #1E1C0E' }}
      >
        <div className="flex flex-col items-center text-center space-y-8">

          {/* Ícono compuesto */}
          <div className="relative">
            <div
              className="w-24 h-24 border-4 border-on-surface flex items-center justify-center"
              style={{ background: 'linear-gradient(155deg, #705d00 0%, #fcd400 100%)' }}
            >
              <MailOpen size={48} className="text-on-surface" />
            </div>
            <div
              className="absolute -top-2 -right-2 w-10 h-10 border-4 border-on-surface flex items-center justify-center"
              style={{ background: 'linear-gradient(155deg, #980000 0%, #c50000 100%)' }}
            >
              <Send size={14} className="text-on-primary" />
            </div>
          </div>

          {/* Título */}
          <h1 className="font-headline font-black text-4xl md:text-5xl tracking-tighter uppercase leading-none text-on-surface">
            ¡REVISÁ TU{' '}
            <span className="text-primary underline decoration-4 underline-offset-4">BANDEJA</span>{' '}
            DE ENTRADA!
          </h1>

          {/* Mensaje + email */}
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-lg font-body font-medium leading-relaxed text-on-surface">
              ¡Casi listo! Enviamos un enlace de verificación para activar tu cuenta en la red de coleccionistas más grande del país.
            </p>
            {email && (
              <div className="inline-block bg-secondary-container px-4 py-2 border-2 border-on-surface font-headline font-black text-xl tracking-tight text-on-secondary-container comic-shadow-sm">
                {email}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="w-full pt-4 flex flex-col items-center gap-6">
            {spamHint ? (
              <div className="w-full bg-surface-container-high border-2 border-on-surface p-4 text-center">
                <p className="font-body font-bold text-sm text-on-surface-variant uppercase tracking-wide">
                  Si no lo ves, revisá la carpeta de <span className="text-on-surface font-black">spam</span> o correo no deseado.
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full md:w-auto px-10 py-4 bg-surface border-4 border-on-surface font-headline font-black text-xl uppercase tracking-widest hover:bg-surface-container-high transition-colors comic-push-sm disabled:opacity-50"
                >
                  {resending ? 'Enviando...' : 'Reenviar email'}
                </button>
                {resendError && (
                  <p className="font-body text-sm text-primary font-bold">{resendError}</p>
                )}
              </>
            )}

            <div className="space-y-2 text-center">
              <p className="font-body font-bold uppercase tracking-widest text-xs text-on-surface-variant">
                ¿Te equivocaste de email?
              </p>
              <button
                onClick={() => navigate('/register')}
                className="text-primary font-headline font-black uppercase tracking-tight text-sm hover:underline decoration-2 underline-offset-4 flex items-center gap-1 justify-center transition-colors"
              >
                <ArrowLeft size={16} />
                Volvé atrás y corregilo
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
