import { useEffect, useMemo, useRef, useState } from 'react'
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
  const gridRef = useRef(null)
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedPublishers, setSelectedPublishers] = useState(defaultPublishers)
  const [sortOrder, setSortOrder] = useState('featured')
  const [page, setPage] = useState(1)
  const [filterKey, setFilterKey] = useState(0)

  useEffect(() => {
    getAll()
      .then(setComics)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setPage(1)
  }, [selectedPublishers, sortOrder])

  const filteredProducts = useMemo(() => {
    const hasAnySelected = Object.values(selectedPublishers).some(Boolean)
    const byPublisher = comics.filter(
      (p) => !hasAnySelected || selectedPublishers[p.publisher]
    )
    if (sortOrder === 'low') return [...byPublisher].sort((a, b) => a.price - b.price)
    if (sortOrder === 'high') return [...byPublisher].sort((a, b) => b.price - a.price)
    return byPublisher
  }, [comics, selectedPublishers, sortOrder])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const pageItems = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handlePublisherToggle = (publisher) => {
    setSelectedPublishers((prev) => ({ ...prev, [publisher]: !prev[publisher] }))
    setFilterKey((k) => k + 1)
  }

  const handleSortChange = (sort) => {
    setSortOrder(sort)
    setFilterKey((k) => k + 1)
  }

  const handleClearFilters = () => {
    setSelectedPublishers(defaultPublishers)
    setSortOrder('featured')
    setFilterKey((k) => k + 1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main
      ref={gridRef}
      className="container mx-auto px-4 py-16 scroll-mt-20"
    >
      <div className="flex flex-col gap-12 md:flex-row md:items-start">
        <FilterSidebar
          selectedPublishers={selectedPublishers}
          sortOrder={sortOrder}
          onPublisherToggle={handlePublisherToggle}
          onSortChange={handleSortChange}
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
