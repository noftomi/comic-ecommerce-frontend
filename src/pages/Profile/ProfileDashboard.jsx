import { Menu, BookOpen, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProfileDashboard({ onOpenSidebar }) {
  const { user } = useAuth()

  return (
    <main className="flex-1 p-6 lg:p-8 min-w-0">
      {/* Botón hamburguesa — solo mobile */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="lg:hidden mb-6 p-2 border-2 border-on-surface hover:bg-secondary-container transition-colors"
        aria-label="Abrir menú de perfil"
      >
        <Menu size={20} />
      </button>

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Bento grid de bienvenida */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border-4 border-on-surface p-8 comic-shadow flex flex-col justify-center">
            <h1 className="font-headline font-black uppercase text-3xl lg:text-4xl xl:text-5xl mb-4 leading-tight">
              BIENVENIDO,{' '}
              <span className="text-primary">{user?.name?.toUpperCase()}</span>
            </h1>
            <p className="font-body text-on-surface-variant text-base lg:text-lg max-w-xl">
              Tu perfil está listo. Explorá el catálogo y empezá tu colección.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4 bg-secondary-container border-4 border-on-surface p-8 comic-shadow flex flex-col items-center justify-center text-center">
            <div className="text-6xl font-black text-on-surface">0</div>
            <div className="font-headline font-black uppercase tracking-widest text-on-surface text-sm mt-1">
              CÓMICS TOTALES
            </div>
          </div>
        </div>

        {/* Mi Colección — estado vacío */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b-4 border-on-surface pb-2">
            <h2 className="font-headline font-black uppercase text-2xl">Mi Colección</h2>
          </div>
          <div className="bg-surface-container-lowest border-4 border-on-surface p-12 comic-shadow flex flex-col items-center justify-center text-center gap-4">
            <BookOpen size={48} className="text-on-surface-variant" strokeWidth={1.5} />
            <p className="font-headline font-black uppercase text-on-surface-variant text-sm">
              Todavía no tenés cómics en tu colección
            </p>
            <p className="font-body text-on-surface-variant text-sm">
              ¡Explorá el catálogo y empezá a coleccionar!
            </p>
            <Link to="/catalog" className="btn-primary px-6 py-2 mt-2 inline-block">
              Ir al Catálogo
            </Link>
          </div>
        </section>

        {/* Mis Pedidos — estado vacío */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b-4 border-on-surface pb-2">
            <h2 className="font-headline font-black uppercase text-2xl">Mis Pedidos</h2>
          </div>
          <div className="bg-surface-container-lowest border-4 border-on-surface p-12 comic-shadow flex flex-col items-center justify-center text-center gap-4">
            <ShoppingBag size={48} className="text-on-surface-variant" strokeWidth={1.5} />
            <p className="font-headline font-black uppercase text-on-surface-variant text-sm">
              Todavía no realizaste ningún pedido
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
