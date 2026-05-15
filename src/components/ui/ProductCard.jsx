import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import useCartStore from '../../store/cartStore'
import useFavoritesStore from '../../store/favoritesStore'
import { useAuth } from '../../context/AuthContext'

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const addToCart = useCartStore((state) => state.addToCart)
  const openCart = useCartStore((state) => state.openCart)
  const openLogin = useCartStore((state) => state.openLogin)
  const { user } = useAuth()
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id))
  const addFavoriteItem = useFavoritesStore((state) => state.addFavoriteItem)
  const removeFavoriteItem = useFavoritesStore((state) => state.removeFavoriteItem)

  // Sin seller o seller con rol ADMIN → Comics Corp; seller SELLER → Terceros
  const isAdminComic = !product.seller || product.seller.role === 'ADMIN'

  const handleAddToCart = (event) => {
    event.stopPropagation()
    addToCart(product)
    openCart()
  }

  const handleFavorite = async (event) => {
    event.stopPropagation()
    if (!user) { openLogin(); return }
    if (isFavorite) {
      await removeFavoriteItem(product.id)
    } else {
      await addFavoriteItem(product.id)
    }
  }

  return (
    <div className="group relative h-full">
      <div className="absolute -inset-1 bg-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
      <article
        className="product-card relative z-10 h-full"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {/* Imagen — cubre todo el área hasta el contenido blanco */}
        <div className="aspect-[2/3] relative overflow-hidden gutter-line bg-surface-dim">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />

          {/* Flag vendedor — arriba a la derecha */}
          <div
            className={`absolute right-0 top-0 z-10 border-b-2 border-l-2 border-on-surface px-2.5 py-1.5 font-headline text-xs font-black uppercase leading-none ${
              isAdminComic ? 'bg-primary text-on-primary' : 'bg-on-surface text-background'
            }`}
          >
            {isAdminComic ? 'Comics Corp' : 'Terceros'}
          </div>

          {/* Botón favorito — arriba a la izquierda */}
          <button
            type="button"
            onClick={handleFavorite}
            className="absolute left-2 top-2 z-10 rounded-full border-2 border-on-surface bg-surface p-1.5 transition-colors duration-150"
            aria-label="Añadir a favoritos"
          >
            <Heart
              size={16}
              className={isFavorite ? 'fill-primary text-primary' : 'text-on-surface'}
            />
          </button>
        </div>

        {/* Detalle del cómic */}
        <div className="flex-grow p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="badge bg-primary text-on-primary">
              {product.edition || product.publisher}
            </span>
            <span className="font-headline text-base font-black text-primary shrink-0">
              {formatPrice(product.price)}
            </span>
          </div>
          <h3 className="line-clamp-2 font-headline text-lg font-black uppercase leading-tight">
            {product.title}
          </h3>
          <p className="mt-1 line-clamp-1 font-body text-[10px] font-bold uppercase opacity-60">
            Editorial: {product.publisher}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="btn-primary w-full py-2 text-sm"
        >
          AÑADIR AL CARRITO
        </button>
      </article>
    </div>
  )
}
