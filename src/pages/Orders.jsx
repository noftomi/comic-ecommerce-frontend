import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import useCartStore from '../store/cartStore'
import { getOrders } from '../services/ordersService'
import PaymentFailedCard from '../components/ui/PaymentFailedCard'
import PaymentSuccessCard from '../components/ui/PaymentSuccessCard'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '', withCredentials: true })

const statusLabels = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function Orders() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')
  const paymentId = searchParams.get('payment_id')
  const preferenceId = searchParams.get('preference_id') || searchParams.get('preference-id')
  const [verifying, setVerifying] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [failureDetail, setFailureDetail] = useState(null)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
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

  useEffect(() => {
    if (status) return
    setOrdersLoading(true)
    setOrdersError('')
    getOrders()
      .then(setOrders)
      .catch((error) => {
        setOrders([])
        setOrdersError(error.response?.data?.error || 'No se pudieron cargar tus ordenes')
      })
      .finally(() => setOrdersLoading(false))
  }, [status])

  if (!status) {
    return (
      <main className="min-h-screen bg-surface-container-low px-4 py-10 md:px-8">
        <section className="mx-auto grid w-full max-w-5xl gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="border-4 border-on-surface bg-surface-container-lowest p-6 comic-shadow md:p-8"
          >
            <span className="mb-3 inline-block border-2 border-on-surface bg-secondary-container px-3 py-1 font-label text-[10px] font-black uppercase tracking-widest">
              Mi cuenta
            </span>
            <h1 className="font-headline text-5xl font-black uppercase leading-none md:text-7xl">
              Mis ordenes
            </h1>
          </motion.div>

          {ordersError && (
            <p className="border-2 border-error bg-surface-container-lowest px-4 py-3 text-xs font-black uppercase text-error comic-shadow-sm">
              {ordersError}
            </p>
          )}

          <div className="border-2 border-on-surface bg-surface-container-lowest comic-shadow-sm">
            {ordersLoading ? (
              <p className="px-4 py-12 text-center font-headline text-2xl font-black uppercase">
                Cargando ordenes...
              </p>
            ) : orders.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="font-headline text-3xl font-black uppercase">Aun no tenes compras realizadas</p>
                <Link to="/catalog" className="mt-6 inline-flex btn-primary px-5 py-3 text-xs">
                  Ver catalogo
                </Link>
              </div>
            ) : (
              <div className="divide-y-2 divide-on-surface">
                {orders.map((order, i) => (
                  <motion.article
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 + i * 0.07 }}
                    className="grid gap-4 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-headline text-2xl font-black uppercase">
                          Orden #{String(order.id).padStart(5, '0')}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase text-on-surface-variant">
                          {formatDate(order.createdAt)} / {order.items.length} item{order.items.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="border-2 border-on-surface bg-secondary-container px-3 py-2 text-[10px] font-black uppercase">
                          {statusLabels[order.status] || order.status}
                        </span>
                        <p className="font-headline text-2xl font-black">{formatPrice(order.total)}</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 border-2 border-on-surface bg-surface-container p-3">
                          <img
                            src={item.comic?.imageUrl || 'https://placehold.co/120x180/F4EEDA/1E1C10?text=COMIC'}
                            alt={item.comic?.title || 'Comic'}
                            className="h-16 w-11 border-2 border-on-surface object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-headline text-sm font-black uppercase">{item.comic?.title || 'Comic eliminado'}</p>
                            <p className="text-[10px] font-bold uppercase text-on-surface-variant">
                              Cantidad {item.quantity} / {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    )
  }

  if (!['success', 'failure', 'pending'].includes(status)) {
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
