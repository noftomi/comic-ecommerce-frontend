import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { getAll } from '../services/comicsService'
import FilterSidebar from '../components/ui/FilterSidebar'
import ProductCard from '../components/ui/ProductCard'
import PaginationControls from '../components/ui/PaginationControls'
import { gridContainer, gridCard } from '../utils/motionVariants'

const defaultPublishers = {
  Marvel: false,
  DC: false,
  Image: false,
  'Dark Horse': false,
}

const ITEMS_PER_PAGE = 20

export default function Catalog() {
  const [searchParams] = useSearchParams()
  const gridRef = useRef(null)
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Inicializar filtros desde params de URL (?publisher=Marvel, ?sort=bestseller)
  const [selectedPublishers, setSelectedPublishers] = useState(() => {
    const pub = searchParams.get('publisher')
    if (pub && Object.prototype.hasOwnProperty.call(defaultPublishers, pub)) {
      return { ...defaultPublishers, [pub]: true }
    }
    return defaultPublishers
  })
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || 'featured')
  const [page, setPage] = useState(1)
  const [filterKey, setFilterKey] = useState(0)
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(0)

  useEffect(() => {
    getAll()
      .then((data) => {
        setComics(data)
        if (data.length > 0) {
          const prices = data.map((c) => Math.floor(c.price))
          const lo = Math.min(...prices)
          const hi = Math.max(...prices)
          setPriceMin(lo)
          setPriceMax(hi)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Rango absoluto para los límites del slider
  const minPrice = useMemo(() => {
    if (comics.length === 0) return 0
    return Math.floor(Math.min(...comics.map((c) => c.price)))
  }, [comics])

  const maxPrice = useMemo(() => {
    if (comics.length === 0) return 0
    return Math.ceil(Math.max(...comics.map((c) => c.price)))
  }, [comics])

  useEffect(() => {
    setPage(1)
  }, [selectedPublishers, sortOrder, priceMin, priceMax])

  const filteredProducts = useMemo(() => {
    const hasAnySelected = Object.values(selectedPublishers).some(Boolean)
    const base = comics.filter(
      (p) =>
        (!hasAnySelected || selectedPublishers[p.publisher]) &&
        p.price >= priceMin &&
        p.price <= priceMax
    )
    if (sortOrder === 'low')        return [...base].sort((a, b) => a.price - b.price)
    if (sortOrder === 'high')       return [...base].sort((a, b) => b.price - a.price)
    if (sortOrder === 'newest')     return [...base].sort((a, b) => b.id - a.id)
    if (sortOrder === 'oldest')     return [...base].sort((a, b) => a.id - b.id)
    if (sortOrder === 'bestseller') return [...base].sort((a, b) => b.id - a.id)
    return base
  }, [comics, selectedPublishers, sortOrder, priceMin, priceMax])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const pageItems = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handlePublisherToggle = (publisher) => {
    setSelectedPublishers((prev) => ({ ...prev, [publisher]: !prev[publisher] }))
    setFilterKey((k) => k + 1)
    scrollToGrid()
  }

  const handleSortChange = (sort) => {
    setSortOrder(sort)
    setFilterKey((k) => k + 1)
    scrollToGrid()
  }

  const handlePriceChange = (newMin, newMax) => {
    setPriceMin(newMin)
    setPriceMax(newMax)
    setFilterKey((k) => k + 1)
    scrollToGrid()
  }

  const handleClearFilters = () => {
    setSelectedPublishers(defaultPublishers)
    setSortOrder('featured')
    setPriceMin(minPrice)
    setPriceMax(maxPrice)
    setFilterKey((k) => k + 1)
    scrollToGrid()
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main ref={gridRef} className="container mx-auto px-4 py-16 scroll-mt-20">
      <div className="flex flex-col gap-12 md:flex-row md:items-start">
        <FilterSidebar
          selectedPublishers={selectedPublishers}
          sortOrder={sortOrder}
          priceMin={priceMin}
          priceMax={priceMax}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPublisherToggle={handlePublisherToggle}
          onSortChange={handleSortChange}
          onPriceChange={handlePriceChange}
          onClearFilters={handleClearFilters}
        />

        <div className="md:w-3/4">
          {loading ? (
            <div className="comic-shadow-sm border-2 border-on-surface bg-surface-container p-8 text-center font-headline text-xl font-black uppercase">
              Cargando cómics...
            </div>
          ) : error ? (
            <div className="comic-shadow-sm border-2 border-on-surface bg-surface-container p-8 text-center font-headline text-xl font-black uppercase">
              Error al cargar los cómics. Intentá de nuevo más tarde.
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="comic-shadow-sm border-2 border-on-surface bg-surface-container p-8 text-center font-headline text-xl font-black uppercase">
              No hay cómics con esos filtros.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${page}-${filterKey}`}
                className="grid grid-cols-2 gap-5 lg:grid-cols-4"
                variants={gridContainer}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {pageItems.map((product) => (
                  <motion.div key={product.id} variants={gridCard}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {!loading && !error && filteredProducts.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  )
}
