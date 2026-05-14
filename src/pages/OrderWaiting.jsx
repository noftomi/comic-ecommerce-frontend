import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CreditCard, ExternalLink } from 'lucide-react'
import axios from 'axios'
import useCartStore from '../store/cartStore'
import { getOrders } from '../services/ordersService'
import PaymentFailedCard from '../components/ui/PaymentFailedCard'
import PaymentSuccessCard from '../components/ui/PaymentSuccessCard'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '', withCredentials: true })

const POLL_INTERVAL = 5000
const MAX_ATTEMPTS = 120

export default function OrderWaiting() {
  const navigate = useNavigate()
  const clearCart = useCartStore((s) => s.clearCart)
  const [status, setStatus] = useState('waiting')
  const [initPoint, setInitPoint] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [rejectionDetail, setRejectionDetail] = useState(null)
  const timeoutRef = useRef(null)
  const timerRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const raw = localStorage.getItem('mp_pending')
    if (!raw) { navigate('/'); return }

    const { initPoint: ip, orderId: oid } = JSON.parse(raw)
    setInitPoint(ip)
    setOrderId(oid)

    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)

    let attempts = 0

    async function poll() {
      if (!mountedRef.current) return
      try {
        attempts++
        if (attempts > MAX_ATTEMPTS) {
          clearInterval(timerRef.current)
          if (mountedRef.current) setStatus('timeout')
          return
        }

        const { data } = await api.get(`/api/orders/verify?order_id=${oid}`)
        if (!mountedRef.current) return

        if (data.verified) {
          localStorage.removeItem('mp_pending')
          clearInterval(timerRef.current)
          await clearCart()
          if (!mountedRef.current) return
          try {
            const orders = await getOrders()
            const found = orders.find((o) => o.id === (data.orderId ?? oid))
            setOrderData(found ?? null)
          } catch {}
          setStatus('success')
        } else if (data.status === 'rejected') {
          clearInterval(timerRef.current)
          setRejectionDetail(data.statusDetail ?? null)
          setStatus('rejected')
        } else {
          timeoutRef.current = setTimeout(poll, POLL_INTERVAL)
        }
      } catch (err) {
        if (!mountedRef.current) return
        if (err.response?.status === 401) { navigate('/'); return }
        timeoutRef.current = setTimeout(poll, POLL_INTERVAL)
      }
    }

    poll()

    return () => {
      mountedRef.current = false
      clearTimeout(timeoutRef.current)
      clearInterval(timerRef.current)
    }
  }, [])

  /* ——— ÉXITO ——— */
  if (status === 'success') {
    return <PaymentSuccessCard orderData={orderData} />
  }

  /* ——— PAGO RECHAZADO ——— */
  if (status === 'rejected') {
    return <PaymentFailedCard statusDetail={rejectionDetail} />
  }

  /* ——— TIMEOUT ——— */
  if (status === 'timeout') {
    return (
      <main className="min-h-screen flex items-center justify-center py-20 px-6 bg-surface">
        <div
          className="w-full max-w-md bg-surface-container-lowest border-2 border-on-surface text-center relative overflow-hidden"
          style={{ boxShadow: '8px 8px 0px 0px #1E1C0E' }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#d97706]" />
          <div className="p-10">
            <div className="text-6xl mb-6">⏳</div>
            <h1 className="font-headline font-black text-4xl uppercase tracking-tighter mb-4 text-on-surface">
              Pago <span className="text-[#d97706]">pendiente</span>
            </h1>
            <p className="font-body font-bold text-on-surface-variant mb-8 leading-tight">
              No pudimos confirmar tu pago aún. Si ya pagaste, revisá tu email en unos minutos.
            </p>
            <Link
              to="/catalog"
              className="block w-full bg-primary text-on-primary border-2 border-on-surface py-3 font-headline font-black text-sm uppercase tracking-tight text-center comic-push-sm"
            >
              Volver al catálogo
            </Link>
          </div>
        </div>
      </main>
    )
  }

  /* ——— ESPERANDO ——— */
  return (
    <main
      className="flex-grow flex items-center justify-center p-6 min-h-screen"
      style={{ backgroundColor: '#f5eed7' }}
    >
      <div
        className="w-full max-w-2xl bg-surface-container-lowest border-2 border-on-surface p-8 md:p-16 text-center relative overflow-hidden"
        style={{ boxShadow: '6px 6px 0px 0px #1E1C0E' }}
      >
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#1e1c0e 1px, transparent 1px)', backgroundSize: '10px 10px' }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Spinner cómic */}
          <div className="mb-10 relative">
            <div className="w-24 h-24 border-8 border-surface-container-highest border-t-primary-container rounded-full animate-comic-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard size={36} className="text-primary" />
            </div>
          </div>

          <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter mb-6 text-on-surface">
            Procesando tu pago...
          </h1>

          <div className="space-y-4 max-w-lg mx-auto mb-12">
            <p className="text-xl font-body font-bold leading-tight text-on-surface">
              Se abrió Mercado Pago en una nueva pestaña para completar el pago. Esta pantalla se actualizará sola cuando el pago se confirme.
            </p>
            <div className="bg-secondary-container border-2 border-on-surface p-4 inline-block -rotate-1">
              <p className="font-body font-bold uppercase tracking-widest text-sm text-on-secondary-container">
                No cerrés esta ventana ni recargues la página
              </p>
            </div>
            <p className="text-xs font-body font-bold text-on-surface-variant uppercase tracking-widest">
              {elapsed < 60
                ? `${elapsed}s transcurridos`
                : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s transcurridos`}
            </p>
          </div>

          {initPoint && (
            <div className="flex flex-col items-center gap-6">
              <a
                href={initPoint}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 border-2 border-on-surface bg-transparent font-headline font-black uppercase tracking-tight text-xl hover:bg-on-surface hover:text-surface transition-colors duration-75 comic-push"
              >
                <ExternalLink size={20} />
                Volver a abrir Mercado Pago
              </a>

              {orderId && (
                <p className="text-xs font-body font-bold uppercase tracking-widest text-on-surface-variant">
                  Pedido: #CC-{String(orderId).padStart(5, '0')}
                </p>
              )}

              <Link
                to="/catalog"
                className="font-body font-bold text-xs uppercase underline decoration-2 underline-offset-4 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancelar y volver al catálogo
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
