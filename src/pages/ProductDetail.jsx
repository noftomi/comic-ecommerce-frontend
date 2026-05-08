import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { products } from '../data/products'
import useCartStore from '../store/cartStore'
import { useAuth } from '../context/AuthContext'
import { addFavorite, removeFavorite, getFavorites } from '../services/favoritesService'
import { getReviews, createReview, deleteReview } from '../services/reviewsService'
import { Heart, Share2, Trash2 } from 'lucide-react'

function formatPrice(value) {
  return `$${value.toFixed(2)}`
}

function Star({ filled, onClick, size = 'h-6 w-6' }) {
  return (
    <svg
      className={`${size} cursor-pointer ${filled ? 'fill-secondary-container' : 'fill-surface-dim'}`}
      viewBox="0 0 20 20"
      aria-hidden="true"
      onClick={onClick}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).toUpperCase()
}

export default function ProductDetail() {
  const { id } = useParams()
  const [qty, setQty] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const product = useMemo(() => products.find((item) => item.id === Number(id)), [id])
  const addToCart = useCartStore((state) => state.addToCart)
  const openCart = useCartStore((state) => state.openCart)
  const openLogin = useCartStore((state) => state.openLogin)
  const { user } = useAuth()

  const averageRating = reviews.length > 0
    ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0

  useEffect(() => {
    if (user && product) {
      getFavorites().then((favs) => {
        setIsFavorite(favs.some((f) => f.id === product.id))
      })
    }
  }, [user, product])

  useEffect(() => {
    if (product) {
      getReviews(product.id).then(setReviews).catch(() => setReviews([]))
    }
  }, [product])

  const addWithQuantity = () => {
    for (let index = 0; index < qty; index += 1) {
      addToCart(product)
    }
    openCart()
  }

  const handleFavorite = async () => {
    if (!user) { openLogin(); return }
    if (isFavorite) {
      await removeFavorite(product.id)
      setIsFavorite(false)
    } else {
      await addFavorite(product.id)
      setIsFavorite(true)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) { openLogin(); return }
    if (rating === 0) { setReviewError('Seleccioná una puntuación'); return }
    setSubmitting(true)
    setReviewError('')
    try {
      const newReview = await createReview(product.id, { rating, comment })
      setReviews((prev) => [newReview, ...prev])
      setRating(0)
      setComment('')
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Error al enviar la reseña')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    await deleteReview(reviewId)
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
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
    <main className="container mx-auto px-4 py-12">
      {/* Producto */}
      <div className="flex flex-col items-start gap-12 lg:flex-row">
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
                <Star key={index} filled={index < averageRating} />
              ))}
            </div>
            <span className="font-label text-xs font-bold uppercase underline tracking-tight">
              {reviews.length} Reseñas
            </span>
            <button type="button" onClick={handleFavorite} aria-label="Añadir a favoritos" className="p-0.5 transition-transform duration-100 active:scale-125">
              <Heart size={20} className={isFavorite ? 'fill-primary text-primary' : 'text-on-surface'} />
            </button>
            <button type="button" onClick={handleShare} aria-label="Compartir" className="p-0.5 transition-transform duration-100 active:scale-125">
              <Share2 size={20} className="text-on-surface" />
            </button>
            {copied && <span className="text-[10px] font-bold uppercase text-primary">¡URL copiada!</span>}
          </div>

          <p className="max-w-lg font-body text-xs font-bold uppercase italic leading-relaxed opacity-80">
            {product.description} Una entrega esencial para coleccionistas que buscan narrativa intensa, arte de alto impacto y edición premium dentro del universo de {product.publisher}.
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="border-2 border-on-surface px-3 py-1 font-label text-[10px] font-bold uppercase">{product.publisher}</span>
            <span className="border-2 border-on-surface px-3 py-1 font-label text-[10px] font-bold uppercase">Páginas: {product.pages}</span>
            <span className="border-2 border-on-surface px-3 py-1 font-label text-[10px] font-bold uppercase">{product.edition}</span>
          </div>

          <hr className="border-t-2 border-on-surface" />

          <div>
            <p className="font-headline text-xl font-black uppercase">Cantidad</p>
            <div className="comic-shadow-sm mt-4 inline-flex items-center border-2 border-on-surface bg-white">
              <button type="button" onClick={() => setQty((c) => Math.max(1, c - 1))} className="border-r-2 border-on-surface px-4 py-2 text-xl font-bold transition-colors duration-75 hover:bg-surface-dim">-</button>
              <span className="px-8 py-2 text-lg font-bold">{qty}</span>
              <button type="button" onClick={() => setQty((c) => c + 1)} className="border-l-2 border-on-surface px-4 py-2 text-xl font-bold transition-colors duration-75 hover:bg-surface-dim">+</button>
            </div>
          </div>

          <div className="pt-4 font-headline text-5xl font-black">{formatPrice(product.price)}</div>

          <div className="flex flex-col gap-4">
            <button type="button" onClick={addWithQuantity} className="btn-primary w-full py-4 text-3xl md:w-[400px]">AÑADIR AL CARRITO</button>
            <button type="button" onClick={addWithQuantity} className="btn-secondary w-full py-4 text-3xl md:w-[400px]">COMPRAR AHORA</button>
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <section className="mt-20 border-t-4 border-on-surface pt-12">
        <h2 className="mb-12 inline-block border-b-8 border-on-surface pb-4 font-headline text-4xl font-black uppercase tracking-tighter md:text-5xl">
          RESEÑAS DE LA COMUNIDAD
        </h2>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {reviews.length === 0 ? (
              <p className="font-body text-sm font-bold uppercase opacity-60">Todavía no hay reseñas. ¡Sé el primero!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-on-surface/10 pb-10">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="font-headline text-sm font-black uppercase">{review.user.name}</p>
                      <p className="text-[10px] font-bold uppercase opacity-50">{formatDate(review.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} filled={index < review.rating} />
                        ))}
                      </div>
                      {user?.id === review.user.id && (
                        <button type="button" onClick={() => handleDeleteReview(review.id)} className="text-error hover:opacity-70">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm leading-relaxed">{review.comment}</p>}
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="comic-shadow border-4 border-on-surface bg-white p-6">
              <h3 className="mb-6 font-headline text-xl font-black uppercase tracking-tight">ESCRIBE TU RESEÑA</h3>
              <form className="space-y-4" onSubmit={handleSubmitReview}>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest">Puntuación</label>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        filled={i < (hoverRating || rating)}
                        onClick={() => setRating(i + 1)}
                        size="h-7 w-7"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest">Comentario</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[120px] w-full border-2 border-on-surface p-3 text-sm focus:border-on-surface focus:ring-0"
                    placeholder="¿Qué te pareció este cómic?"
                  />
                </div>
                {reviewError && <p className="text-[10px] font-bold uppercase text-error">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3 text-sm uppercase tracking-widest disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'ENVIAR RESEÑA'}
                </button>
                {!user && (
                  <p className="text-center text-[10px] font-bold uppercase opacity-60">
                    <button type="button" onClick={openLogin} className="underline">Iniciá sesión</button> para escribir una reseña
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
