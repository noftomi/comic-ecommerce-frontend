import { useMemo, useRef, useState } from 'react'
import { products } from '../data/products'
import FilterSidebar from '../components/ui/FilterSidebar'
import ProductCard from '../components/ui/ProductCard'

const heroCover =
  'https://lh3.googleusercontent.com/aida/ADBb0uic7xV0V4bW7jsbZMMBxb1q0voi_ej0404me6EymnHGqGI7asqFzL4f7UTv8e2vZpUM9RJx75anLcptYFASlljd-InY1rRD_yZBNgVvx1MPJ7Z6vWxV3Vt_9IuS8kQMuIq6HZ91U15WRDLFejDCGPmrAt01ukJ_c6vFOjT3bRSXf4tcvjo0MFuYd4l42kBoGW1Dg738kOftqAYl5SIO4u4uk0tjmB6K-SJ9gfuOU6dXR6JQYyfSnKqi1GlgPe9HyRtbqmxbDMTP'

const defaultPublishers = {
  Marvel: true,
  DC: true,
  Image: true
}

export default function Home() {
  const gridRef = useRef(null)
  const [selectedPublishers, setSelectedPublishers] = useState(defaultPublishers)
  const [sortOrder, setSortOrder] = useState('featured')

  const filteredProducts = useMemo(() => {
    const hasAnyPublisherSelected = Object.values(selectedPublishers).some(Boolean)
    const byPublisher = products.filter(
      (product) => !hasAnyPublisherSelected || selectedPublishers[product.publisher]
    )

    if (sortOrder === 'low') {
      return [...byPublisher].sort((a, b) => a.price - b.price)
    }

    if (sortOrder === 'high') {
      return [...byPublisher].sort((a, b) => b.price - a.price)
    }

    return [...byPublisher].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
  }, [selectedPublishers, sortOrder])

  const handlePublisherToggle = (publisher) => {
    setSelectedPublishers((current) => ({
      ...current,
      [publisher]: !current[publisher]
    }))
  }

  const handleClearFilters = () => {
    setSelectedPublishers({
      Marvel: false,
      DC: false,
      Image: false
    })
    setSortOrder('featured')
  }

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="w-full">
      <section className="flex min-h-[600px] flex-col border-b-2 border-on-surface md:flex-row">
        <div className="flex flex-col justify-center p-8 md:w-1/2 md:p-16">
          <h1 className="font-headline text-6xl leading-none uppercase md:text-8xl">
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

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button type="button" onClick={scrollToGrid} className="btn-primary px-8 py-3 text-xl">
              COMPRAR AHORA
            </button>
            <button
              type="button"
              onClick={scrollToGrid}
              className="comic-shadow-sm border-2 border-on-surface bg-white px-8 py-3 font-headline text-xl font-black uppercase transition-transform duration-75 hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              VER COMICS
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center overflow-hidden bg-[#0C1E23] p-8 md:w-1/2">
          <div className="absolute right-10 top-10 z-10 animate-pulse">
            <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-none">
              <polygon
                points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
                fill="#FFFFFF"
                stroke="#1E1C10"
                strokeWidth="2"
              />
              <text
                x="50"
                y="56"
                textAnchor="middle"
                className="font-headline text-[22px] font-black"
                fill="#1E1C10"
              >
                NEW
              </text>
            </svg>
          </div>

          <img
            src={heroCover}
            alt="Comic destacado"
            className="comic-shadow max-h-[500px] rotate-[-2deg] border-4 border-white object-cover"
          />
        </div>
      </section>

      <section ref={gridRef} className="container mx-auto flex flex-col gap-12 px-4 py-16 md:flex-row">
        <FilterSidebar
          selectedPublishers={selectedPublishers}
          sortOrder={sortOrder}
          onPublisherToggle={handlePublisherToggle}
          onSortChange={setSortOrder}
          onClearFilters={handleClearFilters}
        />

        <div className="md:w-3/4">
          {filteredProducts.length === 0 ? (
            <div className="comic-shadow-sm border-2 border-on-surface bg-surface-container p-8 text-center font-headline text-xl font-black uppercase">
              No hay cómics con esos filtros.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
