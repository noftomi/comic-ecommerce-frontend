import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { getAll } from '../services/comicsService'
import ProductCard from '../components/ui/ProductCard'
import { fromLeft, fromRight } from '../utils/motionVariants'

const heroSlideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

function CategoryRow({ title, items, onShowMore }) {
  const displayed = useMemo(() => items.slice(0, 8), [items])

  if (displayed.length === 0) return null

  return (
    <section className="border-b-2 border-on-surface last:border-b-0">
      <div className="container mx-auto px-4 py-10">
        <h2 className="mb-6 inline-block border-b-4 border-on-surface pb-2 font-headline text-3xl font-black uppercase tracking-tight">
          {title}
        </h2>

        <div className="flex gap-4">
          {displayed.map((product) => (
            <div key={product.id} className="min-w-0 flex-1">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onShowMore}
            className="comic-shadow-sm border-2 border-on-surface bg-secondary-container px-6 py-2 font-headline text-sm font-black uppercase transition-colors duration-150 hover:bg-surface-dim"
          >
            MOSTRAR MÁS →
          </button>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const navigate = useNavigate()

  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroDirection, setHeroDirection] = useState(1)
  const [autoPlayKey, setAutoPlayKey] = useState(0)

  useEffect(() => {
    getAll()
      .then(setComics)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const newestComics = useMemo(
    () => [...comics].sort((a, b) => b.id - a.id).slice(0, 5),
    [comics]
  )

  // Auto-play: avanza cada 8s y vuelve al inicio al llegar al último
  useEffect(() => {
    if (newestComics.length <= 1) return
    const interval = setInterval(() => {
      setHeroDirection(1)
      setHeroIndex((prev) => (prev + 1) % newestComics.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [newestComics.length, autoPlayKey])

  const goToHeroSlide = (target) => {
    if (target === heroIndex) return
    setHeroDirection(target > heroIndex ? 1 : -1)
    setHeroIndex(target)
    setAutoPlayKey((k) => k + 1)
  }

  // Categorías — sin real data de ventas/rating usamos proxies razonables
  const bestSellers = useMemo(() => comics, [comics])
  const featured = useMemo(() => [...comics].sort((a, b) => b.price - a.price), [comics])
  const marvelComics = useMemo(() => comics.filter((c) => c.publisher === 'Marvel'), [comics])
  const dcComics = useMemo(() => comics.filter((c) => c.publisher === 'DC'), [comics])

  return (
    <main className="w-full">
      {/* Hero */}
      <section className="flex min-h-[698px] flex-col border-b-2 border-on-surface md:flex-row">
        <motion.div
          {...fromLeft}
          className="flex flex-col justify-center p-5 md:w-1/2 md:p-10"
        >
          <h1 className="font-headline text-[82px] leading-none uppercase md:text-[123px]">
            <span>La Mejor</span>
            <br />
            <span
              className="text-white drop-shadow-[2px_2px_0_#1E1C10]"
              style={{ WebkitTextStroke: '2px #1E1C10' }}
            >
              Tienda de
            </span>
            <br />
            <span className="comic-shadow-sm inline-block border-2 border-on-surface bg-secondary-container px-4 py-2">
              Comics
            </span>
          </h1>

          <p className="mt-8 max-w-sm font-body text-sm font-bold uppercase leading-relaxed tracking-wide">
            Sumérgete en el multiverso con ediciones exclusivas, clásicos memorables y novedades impactantes de
            Marvel, DC e Image Comics.
          </p>

          <div className="mt-10">
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="btn-primary px-8 py-3 text-xl"
            >
              COMPRAR AHORA
            </button>
          </div>
        </motion.div>

        {/* Carrusel hero */}
        <motion.div
          {...fromRight}
          className="relative flex flex-col items-center justify-between bg-[#0C1E23] md:w-1/2"
        >
          <div className="relative h-[582px] w-full overflow-hidden">
            <AnimatePresence mode="wait" custom={heroDirection}>
              {newestComics.length > 0 ? (
                <motion.div
                  key={heroIndex}
                  custom={heroDirection}
                  variants={heroSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center p-5"
                >
                  <div className="relative">
                    <div
                      className="absolute -inset-10 z-0 rounded-full blur-3xl opacity-40"
                      style={{ background: 'radial-gradient(ellipse at center, #FFD700 0%, transparent 70%)' }}
                    />
                    <div className="absolute -right-7 -top-7 z-20 animate-pulse drop-shadow-lg">
                      <svg width="93" height="93" viewBox="0 0 100 100">
                        <polygon
                          points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
                          fill="#FFD700"
                          stroke="#1E1C10"
                          strokeWidth="2"
                        />
                        <text x="50" y="56" textAnchor="middle" fill="#1E1C10" fontSize="18" fontWeight="900">
                          NEW
                        </text>
                      </svg>
                    </div>
                    <div
                      className="relative z-10 h-[524px] w-[349px] rotate-[-3deg] overflow-hidden border-[10px] border-white"
                      style={{ boxShadow: '7px 7px 0px #1E1C10, 0 0 47px rgba(255,215,0,0.25)' }}
                    >
                      <img
                        src={newestComics[heroIndex]?.imageUrl}
                        alt={newestComics[heroIndex]?.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-[524px] w-[349px] animate-pulse border-2 border-white/20 bg-white/10" />
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-center gap-3 py-3">
            {newestComics[heroIndex]?.title && (
              <p className="line-clamp-1 max-w-[220px] px-4 text-center font-headline text-xs font-black uppercase text-white opacity-70">
                {newestComics[heroIndex].title}
              </p>
            )}
            {newestComics.length > 1 && (
              <div className="flex gap-2.5">
                {newestComics.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToHeroSlide(i)}
                    aria-label={`Ir al cómic ${i + 1}`}
                    className={`h-2.5 w-2.5 rounded-full border border-white transition-all duration-300 ${
                      i === heroIndex
                        ? 'scale-125 bg-white opacity-100'
                        : 'bg-transparent opacity-30 hover:opacity-60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Categorías destacadas — sección full-width para que los bordes abarquen todo */}
      <div className="w-full border-t-2 border-on-surface">
        {loading ? (
          <div className="container mx-auto px-4 py-12">
            <div className="comic-shadow-sm border-2 border-on-surface bg-surface-container p-8 text-center font-headline text-xl font-black uppercase">
              Cargando cómics...
            </div>
          </div>
        ) : error ? (
          <div className="container mx-auto px-4 py-12">
            <div className="comic-shadow-sm border-2 border-on-surface bg-surface-container p-8 text-center font-headline text-xl font-black uppercase">
              Error al cargar los cómics. Intentá de nuevo más tarde.
            </div>
          </div>
        ) : (
          <>
            <CategoryRow title="MAS VENDIDOS"        items={bestSellers}  onShowMore={() => navigate('/catalog?sort=bestseller')} />
            <CategoryRow title="PRODUCTOS DESTACADOS" items={featured}     onShowMore={() => navigate('/catalog?sort=featured')} />
            <CategoryRow title="MARVEL"               items={marvelComics} onShowMore={() => navigate('/catalog?publisher=Marvel')} />
            <CategoryRow title="DC COMICS"            items={dcComics}     onShowMore={() => navigate('/catalog?publisher=DC')} />
          </>
        )}
      </div>
    </main>
  )
}
