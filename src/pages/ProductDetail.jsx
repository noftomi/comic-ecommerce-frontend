import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { products } from '../data/products'
import useCartStore from '../store/cartStore'

function formatPrice(value) {
  return `$${value.toFixed(2)}`
}

function Star({ filled }) {
  return (
    <svg
      className={filled ? 'h-6 w-6 fill-secondary-container' : 'h-6 w-6 fill-surface-dim'}
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const [qty, setQty] = useState(1)
  const product = useMemo(() => products.find((item) => item.id === Number(id)), [id])
  const addToCart = useCartStore((state) => state.addToCart)
  const openCart = useCartStore((state) => state.openCart)

  const addWithQuantity = () => {
    for (let index = 0; index < qty; index += 1) {
      addToCart(product)
    }
    openCart()
  }

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="comic-shadow-sm border-2 border-on-surface bg-surface-container p-8 text-center font-headline text-3xl font-black uppercase">
          Producto no encontrado
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto flex flex-col items-start gap-12 px-4 py-12 lg:flex-row">
      <div className="lg:w-1/2">
        <div className="comic-shadow inline-block border-2 border-on-surface bg-white p-4">
          <img src={product.image} alt={product.title} className="h-auto max-w-full border-2 border-on-surface" />
        </div>
      </div>

      <div className="space-y-6 lg:w-1/2">
        <h1 className="font-headline text-7xl font-black uppercase leading-none text-on-surface md:text-8xl">
          {product.title}
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} filled={index < product.rating} />
            ))}
          </div>
          <span className="font-label text-xs font-bold uppercase underline tracking-tight">
            {product.reviews} Reseñas
          </span>
        </div>

        <p className="max-w-lg font-body text-xs font-bold uppercase italic leading-relaxed opacity-80">
          {product.description} Una entrega esencial para coleccionistas que buscan narrativa intensa, arte de alto
          impacto y edición premium dentro del universo de {product.publisher}.
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="border-2 border-on-surface px-3 py-1 font-label text-[10px] font-bold uppercase">
            {product.publisher}
          </span>
          <span className="border-2 border-on-surface px-3 py-1 font-label text-[10px] font-bold uppercase">
            Páginas: {product.pages}
          </span>
          <span className="border-2 border-on-surface px-3 py-1 font-label text-[10px] font-bold uppercase">
            {product.edition}
          </span>
        </div>

        <hr className="border-t-2 border-on-surface" />

        <div>
          <p className="font-headline text-xl font-black uppercase">Cantidad</p>
          <div className="comic-shadow-sm mt-4 inline-flex items-center border-2 border-on-surface bg-white">
            <button
              type="button"
              onClick={() => setQty((current) => Math.max(1, current - 1))}
              className="border-r-2 border-on-surface px-4 py-2 text-xl font-bold transition-colors duration-75 hover:bg-surface-dim"
            >
              -
            </button>
            <span className="px-8 py-2 text-lg font-bold">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((current) => current + 1)}
              className="border-l-2 border-on-surface px-4 py-2 text-xl font-bold transition-colors duration-75 hover:bg-surface-dim"
            >
              +
            </button>
          </div>
        </div>

        <div className="pt-4 font-headline text-5xl font-black">{formatPrice(product.price)}</div>

        <div className="flex flex-col gap-4">
          <button type="button" onClick={addWithQuantity} className="btn-primary w-full py-4 text-3xl md:w-[400px]">
            AÑADIR AL CARRITO
          </button>
          <button type="button" onClick={addWithQuantity} className="btn-secondary w-full py-4 text-3xl md:w-[400px]">
            COMPRAR AHORA
          </button>
        </div>
      </div>
    </main>
  )
}
