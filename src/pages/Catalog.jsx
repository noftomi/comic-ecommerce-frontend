import { useMemo, useState } from 'react'
import { products } from '../data/products'
import FilterSidebar from '../components/ui/FilterSidebar'
import ProductCard from '../components/ui/ProductCard'

const defaultPublishers = {
  Marvel: true,
  DC: true,
  Image: true,
}

export default function Catalog() {
  const [selectedPublishers, setSelectedPublishers] = useState(defaultPublishers)
  const [sortOrder, setSortOrder] = useState('featured')

  const filteredProducts = useMemo(() => {
    const hasAnySelected = Object.values(selectedPublishers).some(Boolean)
    const byPublisher = products.filter(
      (p) => !hasAnySelected || selectedPublishers[p.publisher]
    )
    if (sortOrder === 'low') return [...byPublisher].sort((a, b) => a.price - b.price)
    if (sortOrder === 'high') return [...byPublisher].sort((a, b) => b.price - a.price)
    return [...byPublisher].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
  }, [selectedPublishers, sortOrder])

  const handlePublisherToggle = (publisher) => {
    setSelectedPublishers((prev) => ({ ...prev, [publisher]: !prev[publisher] }))
  }

  const handleClearFilters = () => {
    setSelectedPublishers({ Marvel: false, DC: false, Image: false })
    setSortOrder('featured')
  }

  return (
    <main className="container mx-auto flex flex-col gap-12 px-4 py-16 md:flex-row">
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
    </main>
  )
}
