import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRelated } from '../services/recommendationsService'

export default function RelatedComics({ comicId }) {
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getRelated(comicId)
      .then(setComics)
      .catch(() => setComics([]))
      .finally(() => setLoading(false))
  }, [comicId])

  if (!loading && comics.length === 0) return null

  return (
    <section className="mt-20 border-t-4 border-on-surface pt-12">
      <h2 className="mb-8 inline-block border-b-8 border-on-surface pb-4 font-headline text-4xl font-black uppercase tracking-tighter md:text-5xl">
        TAMBIÉN TE PUEDE GUSTAR
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-64 w-40 shrink-0 animate-pulse border-2 border-on-surface bg-surface-dim"
              />
            ))
          : comics.slice(0, 10).map((comic) => (
              <button
                key={comic.id}
                type="button"
                onClick={() => navigate(`/product/${comic.id}`)}
                className="comic-shadow-sm w-40 shrink-0 border-2 border-on-surface bg-white text-left transition-transform hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden border-b-2 border-on-surface">
                  {comic.imageUrl ? (
                    <img
                      src={comic.imageUrl}
                      alt={comic.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-surface-dim" />
                  )}
                </div>
                <div className="p-2">
                  <p className="line-clamp-2 font-headline text-xs font-black uppercase leading-tight">
                    {comic.title}
                  </p>
                  <p className="mt-1 line-clamp-1 font-body text-[10px] font-bold uppercase opacity-60">
                    {comic.author}
                  </p>
                </div>
              </button>
            ))}
      </div>
    </section>
  )
}
