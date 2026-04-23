import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/cartStore'

function formatPrice(value) {
  return `$${value.toFixed(2)}`
}

function badgeClasses(variant) {
  if (variant === 'primary') {
    return 'bg-primary text-on-primary'
  }

  if (variant === 'secondary') {
    return 'bg-secondary-container text-on-surface'
  }

  return 'bg-on-surface text-background'
}

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const addToCart = useCartStore((state) => state.addToCart)
  const openCart = useCartStore((state) => state.openCart)

  const handleAddToCart = (event) => {
    event.stopPropagation()
    addToCart(product)
    openCart()
  }

  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-primary opacity-0 transition-opacity duration-75 group-hover:opacity-100" />
      <article className="product-card relative z-10 h-full" onClick={() => navigate(`/product/${product.id}`)}>
        <div className="aspect-[2/3] overflow-hidden gutter-line bg-surface-dim">
          <img
            src={product.image}
            alt={product.title}
            className="h-80 w-full object-cover transition-transform duration-150 group-hover:scale-105"
          />
        </div>

        <div className="flex-grow p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className={`badge ${badgeClasses(product.badgeVariant)}`}>{product.badge}</span>
            <span className="font-headline text-xl font-black text-primary shrink-0">
              {formatPrice(product.price)}
            </span>
          </div>
          <h3 className="font-headline text-2xl font-black leading-none uppercase">{product.title}</h3>
          <p className="font-body text-[10px] font-bold uppercase opacity-60">Editorial: {product.publisher}</p>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full bg-on-surface py-3 font-headline text-lg font-black uppercase text-background transition-colors duration-75 hover:bg-primary"
        >
          AÑADIR AL CARRITO
        </button>
      </article>
    </div>
  )
}
