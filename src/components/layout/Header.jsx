import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, ShoppingCart, User, X, LogOut, Heart } from 'lucide-react'
import useCartStore from '../../store/cartStore'
import { useAuth } from '../../context/AuthContext'
import { logout } from '../../services/authService'

const baseLinks = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalog', label: 'Catalogo' },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const openCart = useCartStore((state) => state.openCart)
  const openLogin = useCartStore((state) => state.openLogin)
  const totalItems = useCartStore((state) => state.totalItems())
  const { user, setUser } = useAuth()
  const openFavorites = useCartStore((state) => state.openFavorites)
  const links = user?.role === 'ADMIN'
    ? [...baseLinks, { to: '/admin', label: 'Admin' }]
    : baseLinks

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container border-b-[6px] border-on-surface">
      <div className="mx-auto max-w-[1500px] px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          {/* Izquierda: logo + nav */}
          <div className="flex flex-1 items-center gap-8">
            <NavLink to="/" className="shrink-0">
              <div className="bg-primary text-on-primary px-3 py-1 font-headline text-2xl font-black italic uppercase border-2 border-on-surface comic-shadow-sm leading-none">
                Comics Corp
              </div>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => (isActive ? 'nav-link active comic-shadow-sm' : 'nav-link comic-shadow-sm')}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Centro: buscador */}
          <div className="hidden lg:flex justify-center">
            <div className="flex items-center gap-2 border-2 border-on-surface bg-surface-container-lowest px-3 py-1.5 comic-shadow-inset">
              <Search size={16} className="text-on-surface" />
              <input
                type="text"
                placeholder="BUSCAR HÉROES..."
                className="w-72 border-0 p-0 bg-transparent font-label font-bold uppercase text-sm tracking-wide placeholder:opacity-70 focus:border-transparent focus:ring-0"
              />
            </div>
          </div>

          {/* Derecha: iconos */}
          <div className="flex flex-1 items-center justify-end gap-5">
          <button
            type="button"
            onClick={openFavorites}
            className="relative p-0.5 transition-all duration-75 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1"
            aria-label="Abrir favoritos"
          >
            <Heart size={20} className="text-on-surface" />
          </button>

            <button
              type="button"
              onClick={openCart}
              className="relative p-0.5 transition-all duration-75 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1"
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={20} className="text-on-surface" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-on-surface bg-secondary-container text-[9px] font-bold leading-none">
                {totalItems}
              </span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/perfil"
                  aria-label="Ver perfil"
                  className="shrink-0 transition-all duration-75 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-on-surface bg-primary text-on-primary flex items-center justify-center font-headline font-black text-xs comic-shadow-sm">
                    {(user.name || user.email || '?').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()}
                  </div>
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-0.5 transition-all duration-75 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1"
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={20} className="text-on-surface" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="p-0.5 transition-all duration-75 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1"
                aria-label="Abrir login"
              >
                <User size={20} className="text-on-surface" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-0.5 transition-all duration-75 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 md:hidden"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? (
                <X size={20} className="text-on-surface" />
              ) : (
                <Menu size={20} className="text-on-surface" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-200 ${
            mobileMenuOpen ? 'max-h-96 pt-4' : 'max-h-0'
          }`}
        >
          <div className="border-2 border-on-surface bg-surface-container p-3 space-y-2 comic-shadow-sm">
            <div className="flex items-center gap-2 border-2 border-on-surface bg-surface-container-lowest px-3 py-2 comic-shadow-inset">
              <Search size={16} className="text-on-surface" />
              <input
                type="text"
                placeholder="BUSCAR HÉROES..."
                className="w-full border-0 bg-transparent p-0 font-label font-bold uppercase text-sm tracking-wide focus:border-transparent focus:ring-0"
              />
            </div>
            <nav className="grid grid-cols-2 gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    isActive ? 'nav-link active text-center' : 'nav-link text-center'
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
