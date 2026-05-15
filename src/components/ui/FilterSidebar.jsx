const publishers = ['Marvel', 'DC', 'Image', 'Dark Horse']
const sortOptions = [
  { id: 'low', label: 'Menor Precio' },
  { id: 'high', label: 'Mayor Precio' },
  { id: 'featured', label: 'Destacados' }
]

export default function FilterSidebar({
  selectedPublishers,
  sortOrder,
  onPublisherToggle,
  onSortChange,
  onClearFilters
}) {
  return (
    <aside className="md:w-1/4 md:self-start md:sticky md:top-20">
      <h2 className="mb-5 inline-block border-b-4 border-primary font-headline text-3xl uppercase">COMPRAR POR:</h2>

      <div className="comic-shadow-sm space-y-5 border-2 border-on-surface bg-surface-container p-4 font-bold italic">
        <div>
          <h3 className="mb-2 font-headline text-base not-italic uppercase">Editoriales</h3>
          <div className="space-y-2">
            {publishers.map((publisher) => (
              <label
                key={publisher}
                className="flex cursor-pointer items-center gap-2 font-body text-xs font-bold uppercase not-italic"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-none border-2 border-on-surface text-on-surface focus:ring-0"
                  checked={Boolean(selectedPublishers[publisher])}
                  onChange={() => onPublisherToggle(publisher)}
                />
                {publisher} Comics
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-headline text-base not-italic uppercase">Filtro</h3>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 font-body text-xs font-bold uppercase not-italic"
              >
                <input
                  type="radio"
                  name="sort-filter"
                  value={option.id}
                  className="h-4 w-4 border-2 border-on-surface text-on-surface focus:ring-0"
                  checked={sortOrder === option.id}
                  onChange={() => onSortChange(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <button type="button" onClick={onClearFilters} className="btn-primary mt-2 w-full py-1.5 text-sm">
          LIMPIAR FILTRO
        </button>
      </div>
    </aside>
  )
}
