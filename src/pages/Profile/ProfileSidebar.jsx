import { NavLink } from 'react-router-dom'
import { X, LayoutDashboard, BookOpen, ShoppingBag, Bell, Pencil } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function Avatar({ name, avatarUrl }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
  }
  const initials = (name || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <span className="font-headline font-black text-3xl text-on-primary select-none">
      {initials}
    </span>
  )
}

const futureNavItems = [
  { icon: BookOpen, label: 'Mi Colección' },
  { icon: ShoppingBag, label: 'Mis Pedidos' },
  { icon: Bell, label: 'Notificaciones' },
]

export default function ProfileSidebar({ isDrawerOpen, onClose, onEditProfile }) {
  const { user } = useAuth()
  const roleBadge = user?.role === 'ADMIN' ? 'ADMINISTRADOR' : 'COLECCIONISTA'

  const content = (
    <div className="flex flex-col h-full">
      {/* Cabecera con avatar */}
      <div className="p-6 border-b-4 border-on-surface bg-surface-container-lowest flex flex-col items-center">
        <button
          type="button"
          onClick={onClose}
          className="self-end lg:hidden mb-2 p-1 hover:bg-secondary-container transition-colors"
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>

        <div className="w-28 h-28 border-4 border-on-surface comic-shadow-red bg-primary flex items-center justify-center relative mb-4">
          <Avatar name={user?.name ?? ''} avatarUrl={user?.avatarUrl} />
          <button
            type="button"
            onClick={onEditProfile}
            className="absolute -bottom-2 -right-2 bg-secondary-container border-4 border-on-surface p-1 hover:scale-110 transition-transform"
            aria-label="Editar foto"
          >
            <Pencil size={12} />
          </button>
        </div>

        <h2 className="font-headline font-black uppercase text-center text-lg leading-tight">
          {user?.name}
        </h2>
        <p className="font-label font-bold text-primary tracking-widest text-xs mt-1 uppercase">
          {roleBadge}
        </p>

        <div className="mt-4 w-full space-y-2 text-center border-t-2 border-on-surface pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-on-surface-variant">Email</span>
            <span className="font-body font-bold text-sm lowercase break-all">{user?.email}</span>
          </div>
          {user?.phone && (
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-on-surface-variant">Teléfono</span>
              <span className="font-body font-bold text-sm">{user.phone}</span>
            </div>
          )}
          <div className="pt-2">
            <button
              type="button"
              onClick={onEditProfile}
              className="font-label font-bold text-primary underline uppercase tracking-widest text-[10px] hover:text-on-surface transition-colors"
            >
              EDITAR PERFIL
            </button>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col">
        <NavLink
          to="/perfil"
          end
          onClick={onClose}
          className={({ isActive }) =>
            isActive
              ? 'flex items-center gap-4 bg-primary-container text-on-primary border-l-8 border-on-surface py-4 px-6 font-headline font-black uppercase tracking-widest text-sm'
              : 'flex items-center gap-4 text-on-surface py-4 px-6 border-b-2 border-on-surface font-headline font-black uppercase tracking-widest text-sm hover:bg-secondary-container hover:translate-x-1 transition-all'
          }
        >
          <LayoutDashboard size={20} />
          Panel
        </NavLink>

        {futureNavItems.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-4 text-on-surface-variant py-4 px-6 border-b-2 border-on-surface font-headline font-black uppercase tracking-widest text-sm opacity-50 cursor-not-allowed"
            title="Próximamente"
          >
            <Icon size={20} />
            {label}
          </div>
        ))}
      </nav>

      {/* Botón Vender Cómics */}
      <div className="mt-auto p-6">
        <button
          type="button"
          disabled
          className="w-full bg-surface-container text-on-surface-variant border-4 border-on-surface py-3 px-4 font-headline font-black uppercase tracking-tighter opacity-50 cursor-not-allowed"
          title="Disponible en Sprint 4"
        >
          VENDER CÓMICS
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-72 self-start sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto bg-surface-container-low border-r-4 border-on-surface">
        {content}
      </aside>

      {/* Drawer mobile */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex flex-col w-72 h-full bg-surface-container-low border-r-4 border-on-surface overflow-y-auto animate-[slideIn_0.2s_ease]">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
