import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getById } from '../services/comicsService'
import useCartStore from '../store/cartStore'
import { useAuth } from '../context/AuthContext'
import { addFavorite, removeFavorite, getFavorites } from '../services/favoritesService'
import { getReviews, createReview, deleteReview } from '../services/reviewsService'
import { Heart, Share2, Trash2 } from 'lucide-react'
import RelatedComics from '../components/RelatedComics'
import { fromLeft, fromRight } from '../utils/motionVariants'

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

function Star({ filled, onClick, onMouseEnter, onMouseLeave, size = 'h-6 w-6' }) {
  return (
    <svg
      className={`${size} ${onClick ? 'cursor-pointer' : ''} ${filled ? 'fill-secondary-container' : 'fill-surface-dim'}`}
      viewBox="0 0 20 20"
      aria-hidden="true"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
  'bg-primary text-on-primary',
  'bg-secondary-container text-on-surface',
  'bg-tertiary-container text-on-surface',
  'bg-error-container text-on-surface',
]

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [descExpanded, setDescExpanded] = useState(false)

  const addToCart = useCartStore((state) => state.addToCart)
  const openCart = useCartStore((state) => state.openCart)
  const openLogin = useCartStore((state) => state.openLogin)
  const { user } = useAuth()

  const averageRating = reviews.length > 0
    ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0

  useEffect(() => {
    setLoading(true)
    getById(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

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
    addToCart(product, qty)
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
    await deleteReview(product.id, reviewId)
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="comic-shadow-sm border-2 border-on-surface bg-surface-container p-8 text-center font-headline text-3xl font-black uppercase">
          Cargando...
        </div>
      </main>
    )
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
    <main className="overflow-x-hidden">
      {/* Producto — dos columnas, imagen con misma relación 2:3 que catálogo */}
      <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-start lg:gap-10">
        <motion.div {...fromLeft} className="w-full lg:w-2/5 flex flex-col">
          <div className="relative aspect-[2/3] border-2 border-on-surface bg-white comic-shadow">
            <div className="absolute inset-4">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </motion.div>

        <motion.div {...fromRight} className="flex flex-col gap-4 lg:w-3/5">
          <h1 className="font-headline text-4xl font-black uppercase leading-none text-on-surface lg:text-5xl">
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
            <button type="button" onClick={handleFavorite} aria-label="Añadir a favoritos" className="p-0.5 transition-transform duration-150 active:scale-125">
              <Heart size={20} className={isFavorite ? 'fill-primary text-primary' : 'text-on-surface'} />
            </button>
            <button type="button" onClick={handleShare} aria-label="Compartir" className="p-0.5 transition-transform duration-150 active:scale-125">
              <Share2 size={20} className="text-on-surface" />
            </button>
            {copied && <span className="text-[10px] font-bold uppercase text-primary">¡URL copiada!</span>}
          </div>

          <div>
            <p className={`font-body text-xs font-bold uppercase italic leading-relaxed opacity-80 ${descExpanded ? '' : 'line-clamp-3'}`}>
              {product.description} Una entrega esencial para coleccionistas que buscan narrativa intensa, arte de alto impacto y edición premium dentro del universo de {product.publisher}.
            </p>
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-1 font-body text-[10px] font-black uppercase underline underline-offset-2 text-primary"
            >
              {descExpanded ? 'Leer menos' : 'Leer más'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="border-2 border-on-surface px-2 py-0.5 font-label text-[10px] font-bold uppercase">{product.publisher}</span>
            {product.pages && (
              <span className="border-2 border-on-surface px-2 py-0.5 font-label text-[10px] font-bold uppercase">Páginas: {product.pages}</span>
            )}
            {product.edition && (
              <span className="border-2 border-on-surface px-2 py-0.5 font-label text-[10px] font-bold uppercase">{product.edition}</span>
            )}
          </div>

          {/* Grupo de acción — empujado al fondo de la columna */}
          <div className="mt-auto space-y-3 border-t-2 border-on-surface pt-4">
            <div>
              <p className="font-headline text-sm font-black uppercase">Cantidad</p>
              <div className="comic-shadow-sm mt-2 inline-flex items-center border-2 border-on-surface bg-white">
                <button type="button" onClick={() => setQty((c) => Math.max(1, c - 1))} className="border-r-2 border-on-surface px-4 py-2 text-xl font-bold transition-colors duration-150 hover:bg-surface-dim">-</button>
                <span className="px-8 py-2 text-lg font-bold">{qty}</span>
                <button type="button" onClick={() => setQty((c) => c + 1)} className="border-l-2 border-on-surface px-4 py-2 text-xl font-bold transition-colors duration-150 hover:bg-surface-dim">+</button>
              </div>
            </div>

            <div className="font-headline text-3xl font-black">{formatPrice(product.price)}</div>

            <button type="button" onClick={addWithQuantity} className="btn-primary w-full py-3 text-xl">AÑADIR AL CARRITO</button>
            <button type="button" onClick={addWithQuantity} className="btn-secondary w-full py-3 text-xl">COMPRAR AHORA</button>
          </div>
        </motion.div>
      </div>
      </div>

      {/* Recomendaciones — primero, ancho completo */}
      <RelatedComics comicId={Number(id)} />

      {/* Reseñas — ancho completo */}
      <motion.section
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mt-20 border-t-4 border-on-surface pt-12"
      >
        <div className="max-w-[1500px] mx-auto px-4 md:px-6">
        <h2 className="mb-12 w-fit border-b-8 border-on-surface pb-4 font-headline text-4xl font-black uppercase tracking-tighter md:text-5xl">
          RESEÑAS DE LA COMUNIDAD
        </h2>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            {reviews.length === 0 ? (
              <p className="font-body text-sm font-bold uppercase opacity-60">Todavía no hay reseñas. ¡Sé el primero!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="flex items-start gap-5">
                  {/* Avatar con iniciales */}
                  <div
                    className={`shrink-0 w-14 h-14 rounded-full border-2 border-on-surface comic-shadow-sm flex items-center justify-center font-headline font-black text-base ${
                      AVATAR_COLORS[(review.user.id || 0) % AVATAR_COLORS.length]
                    }`}
                  >
                    {getInitials(review.user.name)}
                  </div>

                  {/* Viñeta de diálogo */}
                  <div className="flex-1 min-w-0">
                    <div className="rounded-[16px] border-2 border-on-surface bg-white comic-shadow-sm p-6">
                      {/* Nombre + fecha + borrar */}
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                        <p className="font-headline text-lg font-black uppercase leading-none">
                          {review.user.name}
                        </p>
                        <div className="flex shrink-0 items-center gap-3">
                          <p className="text-[9px] font-medium uppercase opacity-40">
                            {formatDate(review.createdAt)}
                          </p>
                          {user?.id === review.user.id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-error hover:opacity-70"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Estrellas */}
                      <div className="mb-4 flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} filled={i < review.rating} size="h-6 w-6" />
                        ))}
                      </div>

                      {/* Comentario */}
                      {review.comment && (
                        <p className="font-body text-xl font-medium leading-relaxed text-on-surface">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
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
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
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
        </div>
      </motion.section>
    </main>
  )
}
