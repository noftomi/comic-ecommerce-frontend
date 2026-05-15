import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import useCartStore from '../../store/cartStore'
import useFavoritesStore from '../../store/favoritesStore'
import { Link } from 'react-router-dom'
import { drawerItem } from '../../utils/motionVariants'

export default function FavoritesDrawer() {
  const { user } = useAuth()
  const isOpen = useCartStore((state) => state.isFavoritesOpen)
  const closeFavorites = useCartStore((state) => state.closeFavorites)
  const openLogin = useCartStore((state) => state.openLogin)

  const items = useFavoritesStore((state) => state.favorites)
  const loading = useFavoritesStore((state) => state.fetching)
  const removeFavoriteItem = useFavoritesStore((state) => state.removeFavoriteItem)

  const handleRemove = async (comicId) => {
    await removeFavoriteItem(comicId)
  }

  return (
    <>
      <button
        type="button"
        onClick={closeFavorites}
        aria-label="Cerrar favoritos"
        className={`fixed inset-0 z-50 bg-on-surface/60 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[60] flex h-full w-full max-w-sm flex-col border-l-4 border-on-surface bg-surface-container-lowest transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b-2 border-on-surface p-6">
          <div className="flex items-center gap-3">
            <div className="border-2 border-on-surface bg-primary p-2 text-on-primary">
              <span className="material-symbols-outlined text-lg leading-none">favorite</span>
            </div>
            <h2 className="font-headline text-3xl font-black uppercase">MIS FAVORITOS</h2>
          </div>
          <button
            type="button"
            onClick={closeFavorites}
            className="border-2 border-on-surface bg-primary p-1 text-on-primary transition-colors duration-150 hover:bg-primary-container"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {!user ? (
            <div className="flex flex-col items-center gap-4 border-2 border-on-surface bg-surface-container p-6 text-center">
              <p className="font-body text-sm font-bold uppercase">
                Debés loguearte para ver tus favoritos.
              </p>
              <button
                type="button"
                onClick={() => { closeFavorites(); openLogin() }}
                className="btn-primary px-6 py-2 text-sm"
              >
                Iniciar sesión
              </button>
            </div>
          ) : loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 opacity-40">
              <span className="material-symbols-outlined text-8xl">heart_broken</span>
              <p className="font-headline text-2xl font-black uppercase">No tenés favoritos aún</p>
            </div>
          ) : (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  {...drawerItem}
                  className="flex gap-4 border-2 border-on-surface bg-white p-3 mb-4"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-24 w-16 shrink-0 border-2 border-on-surface object-cover"
                  />
                  <div className="flex-grow">
                    <h3 className="font-headline text-sm font-black uppercase leading-none">{item.title}</h3>
                    <p className="mt-1 font-body text-[10px] font-bold uppercase opacity-60">{item.author}</p>
                    <p className="mt-2 font-headline font-black text-primary">${Number(item.price).toFixed(2)}</p>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="mt-2 text-[10px] font-bold uppercase underline text-error"
                    >
                      Quitar de favoritos
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {user && (
          <div className="border-t-2 border-on-surface p-6 space-y-3">
            <Link
              to="/perfil/favoritos"
              onClick={closeFavorites}
              className="block w-full text-center btn-primary py-2 text-sm"
            >
              VER TODOS MIS FAVORITOS
            </Link>
            <button
              type="button"
              onClick={closeFavorites}
              className="block w-full text-center text-sm font-bold uppercase underline transition-colors duration-150 hover:text-primary"
            >
              Volver a la tienda
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
