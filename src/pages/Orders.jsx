import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import useCartStore from '../store/cartStore'
import { getOrders } from '../services/ordersService'
import PaymentFailedCard from '../components/ui/PaymentFailedCard'
import PaymentSuccessCard from '../components/ui/PaymentSuccessCard'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '', withCredentials: true })

export default function Orders() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')
  const paymentId = searchParams.get('payment_id')
  const preferenceId = searchParams.get('preference_id') || searchParams.get('preference-id')
  const [verifying, setVerifying] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [failureDetail, setFailureDetail] = useState(null)
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    if ((status === 'success' || status === 'failure') && (paymentId || preferenceId)) {
      setVerifying(true)
      const param = paymentId ? `payment_id=${paymentId}` : `preference_id=${preferenceId}`
      api.get(`/api/orders/verify?${param}`)
        .then(async ({ data }) => {
          if (status === 'success') {
            await clearCart()
            localStorage.removeItem('mp_pending')
            if (data.orderId) {
              try {
                const orders = await getOrders()
                const found = orders.find((o) => o.id === data.orderId)
                setOrderData(found ?? null)
              } catch {}
            }
          } else if (status === 'failure') {
            setFailureDetail(data.statusDetail ?? null)
          }
        })
        .catch(() => {})
        .finally(() => setVerifying(false))
    }
  }, [status, paymentId, preferenceId])

  if (!status || !['success', 'failure', 'pending'].includes(status)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface">
        <p className="font-headline font-black text-xl uppercase text-primary">Estado desconocido.</p>
      </main>
    )
  }

  /* ——— ÉXITO ——— */
  if (status === 'success') {
    if (verifying) {
      return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-surface">
          <div
            className="max-w-sm w-full bg-surface-container-lowest border-2 border-on-surface p-12 text-center"
            style={{ boxShadow: '8px 8px 0px 0px #1E1C0E' }}
          >
            <div className="w-12 h-12 border-4 border-surface-container-highest border-t-primary rounded-full animate-spin mx-auto mb-6" />
            <p className="font-headline font-black text-sm uppercase tracking-widest text-on-surface-variant">
              Verificando pago...
            </p>
          </div>
        </main>
      )
    }

    return <PaymentSuccessCard orderData={orderData} />
  }

  /* ——— RECHAZADO ——— */
  if (status === 'failure') {
    if (verifying) {
      return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-surface">
          <div
            className="max-w-sm w-full bg-surface-container-lowest border-2 border-on-surface p-12 text-center"
            style={{ boxShadow: '8px 8px 0px 0px #1E1C0E' }}
          >
            <div className="w-12 h-12 border-4 border-surface-container-highest border-t-primary rounded-full animate-spin mx-auto mb-6" />
            <p className="font-headline font-black text-sm uppercase tracking-widest text-on-surface-variant">
              Verificando motivo...
            </p>
          </div>
        </main>
      )
    }
    return <PaymentFailedCard statusDetail={failureDetail} />
  }

  /* ——— PENDIENTE ——— */
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div
        className="w-full max-w-md bg-surface-container-lowest border-2 border-on-surface relative overflow-hidden text-center"
        style={{ boxShadow: '8px 8px 0px 0px #1E1C0E' }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#d97706]" />
        <div className="p-8 md:p-12">
          <div className="text-6xl mb-6">⏳</div>
          <h1 className="font-headline font-black text-4xl uppercase tracking-tighter text-on-surface mb-4">
            Pago <span className="text-[#d97706]">pendiente</span>
          </h1>
          <p className="font-body font-bold text-on-surface-variant mb-8 leading-tight">
            Tu pago está siendo procesado. Te avisaremos por email cuando se confirme.
          </p>
          <Link
            to="/"
            className="font-body font-black text-xs uppercase underline decoration-2 underline-offset-4 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
