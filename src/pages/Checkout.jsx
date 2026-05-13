import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Truck } from 'lucide-react'
import useCartStore from '../store/cartStore'
import { createOrder } from '../services/ordersService'

const HALFTONE = {
  backgroundImage: 'radial-gradient(#1e1c0e 10%, transparent 11%)',
  backgroundSize: '8px 8px',
}

function formatPrice(v) {
  return `$${Number(v).toFixed(2)}`
}

export default function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const updateQty = useCartStore((s) => s.updateQty)
  const removeFromCart = useCartStore((s) => s.removeFromCart)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const itemCount = items.reduce((s, i) => s + i.qty, 0)

  async function handlePagar() {
    setError('')
    setLoading(true)
    try {
      const { preferenceId, initPoint, orderId } = await createOrder()
      localStorage.setItem('mp_pending', JSON.stringify({ preferenceId, initPoint, orderId }))
      window.open(initPoint, '_blank')
      navigate('/orders/waiting')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar el pago. Intentá de nuevo.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main
        className="min-h-screen flex items-center justify-center py-20 px-6"
        style={{
          background: 'radial-gradient(#1e1c0e 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundColor: '#FFF9EA',
        }}
      >
        <div className="text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="font-headline font-black text-3xl uppercase tracking-tighter text-on-surface mb-4">
            Tu carrito está <span className="text-primary">vacío</span>
          </h1>
          <Link
            to="/catalog"
            className="font-headline font-black text-sm uppercase underline decoration-2 underline-offset-4 text-primary hover:text-on-surface transition-colors"
          >
            Ir al catálogo
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-surface min-h-screen px-6 py-12">
      <div className="max-w-[1440px] mx-auto">

        <h1 className="font-headline font-black text-5xl md:text-6xl tracking-tighter uppercase mb-12 flex items-center gap-4 text-on-surface">
          TU CARRITO{' '}
          <span
            className="bg-primary-container text-on-primary px-3 py-1 text-2xl border-2 border-on-surface"
            style={{ boxShadow: '6px 6px 0px 0px #1E1C0E' }}
          >
            {String(itemCount).padStart(2, '0')}
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Lista de productos */}
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-low border-2 border-on-surface p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden"
                style={{ boxShadow: '6px 6px 0px 0px #1E1C0E' }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ ...HALFTONE, opacity: 0.05 }} />

                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-28 h-44 object-cover border-2 border-on-surface flex-shrink-0"
                />

                <div className="flex-grow space-y-2 relative z-10">
                  <h2 className="font-headline font-black text-xl md:text-2xl uppercase tracking-tight text-on-surface">
                    {item.title}
                  </h2>
                  {item.publisher && (
                    <p className="text-on-surface-variant font-body font-bold text-sm uppercase tracking-widest">
                      {item.publisher}
                    </p>
                  )}
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center border-2 border-on-surface bg-surface-container-lowest">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="px-3 py-1 font-black text-xl hover:bg-surface-container-highest transition-colors"
                        aria-label="Reducir cantidad"
                      >
                        −
                      </button>
                      <span className="px-4 py-1 font-black border-x-2 border-on-surface min-w-[3rem] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="px-3 py-1 font-black text-xl hover:bg-surface-container-highest transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-primary font-body font-bold uppercase tracking-widest text-xs underline underline-offset-4 hover:text-error transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col justify-start items-end md:h-44">
                  <span className="font-headline font-black text-2xl md:text-3xl text-on-surface">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar de resumen */}
          <aside className="lg:col-span-4 sticky top-24">
            <div
              className="bg-surface-container-high border-2 border-on-surface p-8 space-y-8 relative overflow-hidden"
              style={{ boxShadow: '6px 6px 0px 0px #1E1C0E' }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ ...HALFTONE, opacity: 0.06 }} />

              <h3 className="font-headline font-black text-4xl uppercase tracking-tight relative z-10 text-on-surface">
                RESUMEN
              </h3>

              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant uppercase tracking-widest text-xs font-body font-bold">
                    SUBTOTAL
                  </span>
                  <span className="font-headline font-black text-lg">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant uppercase tracking-widest text-xs font-body font-bold">
                    ENVÍO
                  </span>
                  <span className="font-headline font-black text-lg text-secondary">GRATIS</span>
                </div>
                <div className="h-0.5 bg-on-surface" />
                <div className="flex justify-between items-baseline">
                  <span className="font-headline font-black text-2xl uppercase">TOTAL</span>
                  <span className="font-headline font-black text-5xl text-primary leading-none">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                {error && (
                  <p className="text-error text-xs font-bold uppercase tracking-wide">{error}</p>
                )}
                <button
                  onClick={handlePagar}
                  disabled={loading}
                  className="w-full bg-primary-container text-on-primary font-headline font-black text-2xl py-5 border-2 border-on-surface uppercase tracking-widest disabled:opacity-60 comic-push"
                >
                  {loading ? 'PROCESANDO...' : 'PROCEDER AL PAGO'}
                </button>
                <p className="text-[10px] text-center font-body font-bold text-on-surface-variant px-4 leading-tight uppercase tracking-wide">
                  Al continuar, aceptás nuestros términos de servicio y política de privacidad.
                </p>
              </div>

              {/* Callout envío */}
              <div className="bg-secondary-container border-2 border-on-surface p-4 flex gap-4 items-center relative z-10">
                <Truck size={28} className="shrink-0 text-on-surface" />
                <div>
                  <p className="font-headline font-black text-sm uppercase leading-none">¡ENVÍO GRATIS!</p>
                  <p className="text-xs font-body font-bold leading-tight mt-1 text-on-secondary-container">
                    Todos tus pedidos incluyen envío gratuito.
                  </p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
