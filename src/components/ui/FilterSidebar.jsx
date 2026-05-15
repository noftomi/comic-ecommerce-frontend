import { useEffect, useState } from 'react'

const publishers = ['Marvel', 'DC', 'Image', 'Dark Horse']

const sortOptions = [
  { id: 'featured',   label: 'Destacados' },
  { id: 'bestseller', label: 'Más Vendidos' },
  { id: 'newest',     label: 'Más Reciente' },
  { id: 'oldest',     label: 'Más Antiguo' },
  { id: 'low',        label: 'Menor Precio' },
  { id: 'high',       label: 'Mayor Precio' },
]

function DualRangeSlider({ min, max, valueMin, valueMax, onChange }) {
  if (max <= min) return null

  // Texto local para que el usuario pueda escribir libremente sin que se resetee
  const [inputMin, setInputMin] = useState(String(valueMin))
  const [inputMax, setInputMax] = useState(String(valueMax))

  // Sincronizar inputs cuando el slider mueve los valores
  useEffect(() => { setInputMin(String(valueMin)) }, [valueMin])
  useEffect(() => { setInputMax(String(valueMax)) }, [valueMax])

  const pctMin = ((valueMin - min) / (max - min)) * 100
  const pctMax = ((valueMax - min) / (max - min)) * 100

  const handleSliderMin = (e) => {
    const val = Math.min(Number(e.target.value), valueMax - 1)
    onChange(val, valueMax)
  }

  const handleSliderMax = (e) => {
    const val = Math.max(Number(e.target.value), valueMin + 1)
    onChange(valueMin, val)
  }

  const commitMin = () => {
    const val = Number(inputMin)
    if (!isNaN(val)) {
      const clamped = Math.min(Math.max(Math.round(val), min), valueMax - 1)
      onChange(clamped, valueMax)
      setInputMin(String(clamped))
    } else {
      setInputMin(String(valueMin))
    }
  }

  const commitMax = () => {
    const val = Number(inputMax)
    if (!isNaN(val)) {
      const clamped = Math.max(Math.min(Math.round(val), max), valueMin + 1)
      onChange(valueMin, clamped)
      setInputMax(String(clamped))
    } else {
      setInputMax(String(valueMax))
    }
  }

  return (
    <div className="px-1">

      <div className="relative h-6">
        {/* Track base */}
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 border border-on-surface bg-surface-dim" />

        {/* Rango activo */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 bg-on-surface"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />

        {/* Thumb min */}
        <div
          className="comic-shadow-sm pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 border-2 border-on-surface bg-white"
          style={{ left: `${pctMin}%` }}
        />

        {/* Thumb max */}
        <div
          className="comic-shadow-sm pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 border-2 border-on-surface bg-primary"
          style={{ left: `${pctMax}%` }}
        />

        {/* Input min — invisible, captura eventos */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={valueMin}
          onChange={handleSliderMin}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ zIndex: pctMin >= pctMax - 5 ? 5 : 3 }}
        />

        {/* Input max — invisible, captura eventos */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={valueMax}
          onChange={handleSliderMax}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ zIndex: pctMin >= pctMax - 5 ? 3 : 4 }}
        />
      </div>

      {/* Inputs de texto para escribir min/max */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex flex-1 items-center border-2 border-on-surface bg-white">
          <span className="border-r-2 border-on-surface px-1.5 font-body text-xs font-black">$</span>
          <input
            type="number"
            min={min}
            max={max}
            value={inputMin}
            onChange={(e) => setInputMin(e.target.value)}
            onBlur={commitMin}
            onKeyDown={(e) => e.key === 'Enter' && commitMin()}
            className="w-full bg-transparent px-1.5 py-1 font-body text-xs font-bold focus:outline-none"
            placeholder="Mín"
          />
        </div>

        <span className="font-body text-xs font-black opacity-40">—</span>

        <div className="flex flex-1 items-center border-2 border-on-surface bg-white">
          <span className="border-r-2 border-on-surface px-1.5 font-body text-xs font-black">$</span>
          <input
            type="number"
            min={min}
            max={max}
            value={inputMax}
            onChange={(e) => setInputMax(e.target.value)}
            onBlur={commitMax}
            onKeyDown={(e) => e.key === 'Enter' && commitMax()}
            className="w-full bg-transparent px-1.5 py-1 font-body text-xs font-bold focus:outline-none"
            placeholder="Máx"
          />
        </div>
      </div>
    </div>
  )
}

export default function FilterSidebar({
  selectedPublishers,
  sortOrder,
  priceMin,
  priceMax,
  minPrice,
  maxPrice,
  onPublisherToggle,
  onSortChange,
  onPriceChange,
  onClearFilters,
}) {
  return (
    <aside className="md:w-1/4 md:self-start md:sticky md:top-20">
      <h2 className="mb-5 inline-block border-b-4 border-primary font-headline text-3xl uppercase">
        COMPRAR POR:
      </h2>

      <div className="comic-shadow-sm space-y-6 border-2 border-on-surface bg-surface-container p-4 font-bold italic">

        {/* Editoriales */}
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

        {/* Rango de precio */}
        <div>
          <h3 className="mb-3 font-headline text-base not-italic uppercase">Precio</h3>
          <DualRangeSlider
            min={minPrice}
            max={maxPrice}
            valueMin={priceMin}
            valueMax={priceMax}
            onChange={onPriceChange}
          />
        </div>

        {/* Ordenar */}
        <div>
          <h3 className="mb-2 font-headline text-base not-italic uppercase">Ordenar por</h3>
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

        <button
          type="button"
          onClick={onClearFilters}
          className="btn-primary mt-2 w-full py-1.5 text-sm"
        >
          LIMPIAR FILTROS
        </button>
      </div>
    </aside>
  )
}
