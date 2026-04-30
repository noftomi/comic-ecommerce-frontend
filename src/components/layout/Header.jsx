import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, ShoppingCart, User, X, LogOut } from 'lucide-react'
import useCartStore from '../../store/cartStore'
import { useAuth } from '../../context/AuthContext'
import { logout } from '../../services/authService'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalog', label: 'Catálogo' },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const openCart = useCartStore((state) => state.openCart)
  const openLogin = useCartStore((state) => state.openLogin)
  const totalItems = useCartStore((state) => state.totalItems())
  const { user, setUser } = useAuth()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-bright border-b-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(30,28,16,1)]">
      <div className="mx-auto max-w-[1500px] px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
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
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 border-2 border-on-surface bg-surface-container-lowest px-3 py-1.5">
              <Search size={16} className="text-on-surface" />
              <input
                type="text"
                placeholder="BUSCAR HÉROES..."
                className="w-52 border-0 p-0 bg-transparent font-label font-bold uppercase text-sm tracking-wide placeholder:opacity-70 focus:border-transparent focus:ring-0"
              />
            </div>

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
                  className={({ isActive }) =>
                    isActive
                      ? 'nav-link active hidden md:block text-sm'
                      : 'nav-link hidden md:block text-sm'
                  }
                >
                  {user.name || user.email}
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
            <div className="flex items-center gap-2 border-2 border-on-surface bg-surface-container-lowest px-3 py-2">
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
