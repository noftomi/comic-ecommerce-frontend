function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}

export default function PaginationControls({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  const pages = getPageRange(page, totalPages)

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t-2 border-on-surface pt-8">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="btn-secondary px-5 py-2 text-sm disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← ANTERIOR
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-2 font-headline text-sm font-black">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={
              p === page
                ? 'btn-primary px-4 py-2 text-sm'
                : 'border-2 border-on-surface px-4 py-2 font-headline text-sm font-black uppercase transition-colors duration-75 hover:bg-surface-container'
            }
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="btn-secondary px-5 py-2 text-sm disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed"
      >
        SIGUIENTE →
      </button>
    </div>
  )
}
