import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import useCartStore from '../../store/cartStore'
import useFavoritesStore from '../../store/favoritesStore'

export default function ProfileFavorites() {
  const items = useFavoritesStore((state) => state.favorites)
  const loading = useFavoritesStore((state) => state.fetching)
  const removeFavoriteItem = useFavoritesStore((state) => state.removeFavoriteItem)
  const addToCart = useCartStore((state) => state.addToCart)
  const openCart = useCartStore((state) => state.openCart)

  const handleRemove = async (comicId) => {
    await removeFavoriteItem(comicId)
  }

  const handleAddToCart = (item) => {
    addToCart({ id: item.id, title: item.title, price: Number(item.price), imageUrl: item.imageUrl })
    openCart()
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <main className="flex-1 p-6 lg:p-8 min-w-0">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12 border-b-8 border-on-surface pb-6">
          <h1 className="font-headline font-black uppercase text-5xl lg:text-7xl tracking-tighter leading-none italic">
            MIS FAVORITOS
          </h1>
          <p className="mt-4 font-label font-bold uppercase tracking-widest text-primary">
            CANTIDAD DE ARTÍCULOS: {items.length}
          </p>
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="border-4 border-on-surface p-12 flex flex-col items-center justify-center gap-4 text-center bg-surface-container-lowest comic-shadow">
            <Heart size={48} className="text-on-surface-variant" strokeWidth={1.5} />
            <p className="font-headline font-black uppercase text-on-surface-variant text-sm">
              No tenés cómics en favoritos
            </p>
            <Link to="/catalog" className="btn-primary px-6 py-2 mt-2 inline-block">
              Ir al Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col group">
                <div className="relative overflow-hidden border-4 border-on-surface comic-shadow transition-all group-hover:-translate-y-1">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="bg-surface p-1 border-2 border-on-surface hover:bg-primary hover:text-on-primary transition-colors"
                    >
                      <Heart size={18} className="fill-primary text-primary" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="font-headline font-black uppercase text-lg leading-tight tracking-tighter">
                    {item.title}
                  </h3>
                  <p className="font-label font-bold uppercase text-[10px] tracking-widest text-on-surface-variant">
                    {item.author}
                  </p>
                  <p className="font-headline font-black italic text-xl text-primary mt-2">
                    ${Number(item.price).toFixed(2)}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-on-surface text-surface py-2 font-headline font-black uppercase text-xs tracking-tighter hover:bg-primary transition-colors"
                  >
                    AÑADIR AL CARRITO
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}