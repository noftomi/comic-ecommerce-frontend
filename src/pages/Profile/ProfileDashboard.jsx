import { useEffect, useState } from 'react'
import { Menu, BookOpen, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getOrders } from '../../services/ordersService'

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function OrderRow({ order }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-4 border-on-surface bg-surface-container-lowest comic-shadow">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary-container transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <span className="font-headline font-black uppercase text-xs text-on-surface-variant">
            #{order.id}
          </span>
          <span className="font-body text-sm text-on-surface-variant">
            {formatDate(order.createdAt)}
          </span>
          <span className="font-headline font-black text-sm">
            {order.items.reduce((s, i) => s + i.quantity, 0)} ítem{order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-headline font-black text-primary">{formatPrice(order.total)}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <div className="border-t-4 border-on-surface divide-y-2 divide-on-surface/20">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3">
              {item.comic.imageUrl && (
                <img
                  src={item.comic.imageUrl}
                  alt={item.comic.title}
                  className="h-14 w-10 object-cover border-2 border-on-surface shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-headline font-black uppercase text-sm leading-tight truncate">
                  {item.comic.title}
                </p>
                {item.comic.author && (
                  <p className="font-body text-xs text-on-surface-variant">{item.comic.author}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-body text-xs text-on-surface-variant">x{item.quantity}</p>
                <p className="font-headline font-black text-sm">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProfileDashboard({ onOpenSidebar }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalComics = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)

  const collection = Object.values(
    orders.flatMap((o) => o.items).reduce((acc, item) => {
      if (!acc[item.comicId]) acc[item.comicId] = { ...item.comic, totalQty: 0 }
      acc[item.comicId].totalQty += item.quantity
      return acc
    }, {})
  )

  return (
    <main className="flex-1 p-6 lg:p-8 min-w-0">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="lg:hidden mb-6 p-2 border-2 border-on-surface hover:bg-secondary-container transition-colors"
        aria-label="Abrir menú de perfil"
      >
        <Menu size={20} />
      </button>

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Bento bienvenida */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border-4 border-on-surface p-8 comic-shadow flex flex-col justify-center">
            <h1 className="font-headline font-black uppercase text-3xl lg:text-4xl xl:text-5xl mb-4 leading-tight">
              BIENVENIDO,{' '}
              <span className="text-primary">{user?.name?.toUpperCase()}</span>
            </h1>
            <p className="font-body text-on-surface-variant text-base lg:text-lg max-w-xl">
              Tu perfil está listo. Explorá el catálogo y empezá tu colección.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4 bg-secondary-container border-4 border-on-surface p-8 comic-shadow flex flex-col items-center justify-center text-center">
            <div className="text-6xl font-black text-on-surface">{loading ? '—' : totalComics}</div>
            <div className="font-headline font-black uppercase tracking-widest text-on-surface text-sm mt-1">
              CÓMICS TOTALES
            </div>
          </div>
        </div>

        {/* Mi Colección */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b-4 border-on-surface pb-2">
            <h2 className="font-headline font-black uppercase text-2xl">Mi Colección</h2>
          </div>

          {loading ? (
            <p className="font-headline font-black uppercase text-on-surface-variant text-sm animate-pulse">
              Cargando...
            </p>
          ) : collection.length === 0 ? (
            <div className="bg-surface-container-lowest border-4 border-on-surface p-12 comic-shadow flex flex-col items-center justify-center text-center gap-4">
              <BookOpen size={48} className="text-on-surface-variant" strokeWidth={1.5} />
              <p className="font-headline font-black uppercase text-on-surface-variant text-sm">
                Todavía no tenés cómics en tu colección
              </p>
              <p className="font-body text-on-surface-variant text-sm">
                ¡Explorá el catálogo y empezá a coleccionar!
              </p>
              <Link to="/catalog" className="btn-primary px-6 py-2 mt-2 inline-block">
                Ir al Catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {collection.map((comic) => (
                <Link
                  key={comic.id}
                  to={`/product/${comic.id}`}
                  className="group border-4 border-on-surface bg-surface-container-lowest comic-shadow hover:-translate-y-1 transition-transform overflow-hidden"
                >
                  <div className="aspect-[2/3] bg-secondary-container overflow-hidden">
                    {comic.imageUrl ? (
                      <img
                        src={comic.imageUrl}
                        alt={comic.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={32} className="text-on-surface-variant" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="font-headline font-black uppercase text-xs leading-tight line-clamp-2">
                      {comic.title}
                    </p>
                    {comic.totalQty > 1 && (
                      <p className="font-body text-xs text-on-surface-variant mt-1">x{comic.totalQty}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Mis Pedidos */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b-4 border-on-surface pb-2">
            <h2 className="font-headline font-black uppercase text-2xl">Mis Pedidos</h2>
          </div>

          {loading ? (
            <p className="font-headline font-black uppercase text-on-surface-variant text-sm animate-pulse">
              Cargando...
            </p>
          ) : orders.length === 0 ? (
            <div className="bg-surface-container-lowest border-4 border-on-surface p-12 comic-shadow flex flex-col items-center justify-center text-center gap-4">
              <ShoppingBag size={48} className="text-on-surface-variant" strokeWidth={1.5} />
              <p className="font-headline font-black uppercase text-on-surface-variant text-sm">
                Todavía no realizaste ningún pedido
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
