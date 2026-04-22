import { ShoppingCart, Trash2, X } from 'lucide-react'
import useCartStore from '../../store/cartStore'

function formatPrice(value) {
  return `$${value.toFixed(2)}`
}

export default function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen)
  const items = useCartStore((state) => state.items)
  const closeCart = useCartStore((state) => state.closeCart)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const updateQty = useCartStore((state) => state.updateQty)
  const total = useCartStore((state) => state.total())

  return (
    <>
      <button
        type="button"
        onClick={closeCart}
        aria-label="Cerrar carrito"
        className={`fixed inset-0 z-50 bg-on-surface/60 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[60] flex h-full w-full max-w-sm flex-col border-l-4 border-on-surface bg-surface-container-lowest transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b-2 border-on-surface p-6">
          <div className="flex items-center gap-3">
            <div className="border-2 border-on-surface bg-secondary-container p-2">
              <ShoppingCart size={18} />
            </div>
            <h2 className="font-headline text-3xl font-black uppercase">MI CARRITO</h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="border-2 border-on-surface bg-primary p-1 text-on-primary transition-colors duration-75 hover:bg-primary-container"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-grow space-y-4 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="border-2 border-on-surface bg-surface-container p-4 text-center font-body text-sm font-bold uppercase">
              Tu carrito está vacío.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 border-2 border-on-surface bg-white p-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-24 w-16 shrink-0 border-2 border-on-surface object-cover"
                />

                <div className="flex-grow">
                  <h3 className="font-headline text-sm font-black uppercase leading-none">{item.title}</h3>
                  <p className="mt-1 font-body text-[10px] font-bold uppercase opacity-60">
                    Editorial: {item.publisher}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="font-headline font-black text-primary">{formatPrice(item.price)}</span>
                    <div className="inline-flex items-center border border-on-surface">
                      <button
                        type="button"
                        className="px-2 py-0.5 text-xs font-bold hover:bg-surface-dim"
                        onClick={() => updateQty(item.id, -1)}
                        aria-label="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold">{item.qty}</span>
                      <button
                        type="button"
                        className="px-2 py-0.5 text-xs font-bold hover:bg-surface-dim"
                        onClick={() => updateQty(item.id, 1)}
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2 self-start border border-transparent p-1 text-error transition-colors duration-75 hover:border-error hover:bg-error hover:text-on-error"
                  aria-label="Eliminar producto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4 border-t-2 border-on-surface p-6">
          <div className="flex items-center justify-between font-headline text-2xl font-black uppercase">
            <span>Total:</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button type="button" className="btn-primary w-full py-4 text-xl">
            PROCEDER AL PAGO
          </button>
          <button
            type="button"
            onClick={closeCart}
            className="block w-full text-center text-sm font-bold uppercase underline transition-colors duration-75 hover:text-primary"
          >
            Seguir comprando
          </button>
        </div>
      </aside>
    </>
  )
}
