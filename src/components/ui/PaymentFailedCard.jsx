import { X, ShieldAlert, CreditCard, LockOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPaymentError } from '../../utils/paymentErrors'

export default function PaymentFailedCard({ statusDetail }) {
  return (
    <main className="flex-grow flex items-center justify-center p-6 md:p-12 bg-surface min-h-screen">
      <div
        className="relative max-w-2xl w-full bg-surface-container-lowest border-4 border-on-surface p-8 md:p-12 flex flex-col items-center text-center"
        style={{ boxShadow: '8px 8px 0px 0px #1E1C0E' }}
      >

        {/* Composición de ícono */}
        <div className="relative mb-8 h-32 w-32 flex items-center justify-center">
          {/* Íconos decorativos de fondo */}
          <ShieldAlert
            size={36}
            className="absolute -top-2 -left-8 text-on-surface-variant opacity-30"
            strokeWidth={1.5}
          />
          <CreditCard
            size={44}
            className="absolute -bottom-4 -right-10 text-on-surface-variant opacity-20"
            strokeWidth={1.5}
          />
          <LockOpen
            size={28}
            className="absolute top-10 -right-12 text-on-surface-variant opacity-30"
            strokeWidth={1.5}
          />

          {/* Ícono principal */}
          <div
            className="bg-primary text-on-primary w-24 h-24 border-4 border-on-surface flex items-center justify-center rotate-3"
            style={{ boxShadow: '4px 4px 0px 0px #1E1C0E' }}
          >
            <X size={56} strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter text-on-surface mb-6 leading-none">
          Hubo un problema con tu pago
        </h1>

        <p className="font-body font-bold text-lg text-on-surface-variant mb-4 max-w-lg">
          Lo sentimos, no pudimos procesar tu pago. No te preocupes, tu pedido sigue guardado.
        </p>

        {/* Callout con motivo del error */}
        <div className="bg-secondary-container p-6 border-2 border-on-surface mb-10 w-full relative">
          <div className="absolute -top-4 left-6 bg-on-surface text-surface px-3 py-1 text-xs font-body font-bold uppercase tracking-widest">
            Aviso del Sistema
          </div>
          <p className="font-body font-semibold text-on-secondary-container">
            {statusDetail
              ? getPaymentError(statusDetail)
              : 'Posibles causas: fondos insuficientes, tarjeta rechazada o un problema temporal con Mercado Pago.'}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center">
          <Link
            to="/checkout"
            className="w-full sm:w-auto bg-primary text-on-primary font-headline font-black px-10 py-4 border-4 border-on-surface uppercase tracking-widest text-lg transition-all text-center
              shadow-[4px_4px_0px_0px_rgba(30,28,14,1)]
              hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(30,28,14,1)]
              active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            REINTENTAR PAGO
          </Link>
          <Link
            to="/checkout"
            className="font-body font-black uppercase tracking-widest text-on-surface hover:text-primary underline decoration-4 underline-offset-8 transition-colors"
          >
            Volver al carrito
          </Link>
        </div>

        {/* Soporte */}
        <div className="mt-12 pt-8 border-t-2 border-surface-variant w-full">
          <p className="font-body text-xs uppercase tracking-tighter text-on-surface-variant font-bold">
            ¿El problema persiste?{' '}
            <a href="#" className="text-primary hover:underline underline-offset-2">
              Contactanos
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}
