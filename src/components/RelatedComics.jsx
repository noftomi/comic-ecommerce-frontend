import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getRelated } from '../services/recommendationsService'

export default function RelatedComics({ comicId }) {
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getRelated(comicId)
      .then((data) => { if (mounted) setComics(data.slice(0, 10)) })
      .catch(() => { if (mounted) setComics([]) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [comicId])

  if (!loading && comics.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mt-20 border-t-4 border-on-surface pt-12"
    >
      <div className="max-w-[1500px] mx-auto px-4 md:px-6">
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
          : comics.map((comic, i) => (
              <motion.button
                key={comic.id}
                type="button"
                onClick={() => navigate(`/product/${comic.id}`)}
                aria-label={comic.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: i * 0.05 }}
                className="comic-shadow-sm w-40 shrink-0 border-2 border-on-surface bg-white text-left transition-transform duration-200 hover:-translate-y-1"
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
              </motion.button>
            ))}
      </div>
      </div>
    </motion.section>
  )
}
