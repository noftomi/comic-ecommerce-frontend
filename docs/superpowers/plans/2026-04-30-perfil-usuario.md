# Perfil de Usuario — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar la página `/perfil` con sidebar de navegación, bento grid de bienvenida, estados vacíos para Mi Colección y Mis Pedidos, y modal de edición de perfil con backdrop blur.

**Architecture:** Feature folder `src/pages/Profile/` con 4 componentes (index, sidebar, dashboard, modal). Backend con nuevo endpoint `PATCH /api/users/me` y campos `phone`/`avatarUrl` en el modelo User de Prisma.

**Tech Stack:** React 19, React Router v7, Tailwind CSS v4, Prisma, Express, PostgreSQL, lucide-react

---

## Mapa de archivos

| Acción | Archivo |
|---|---|
| Crear | `comic-ecommerce-backend/src/controllers/usersController.js` |
| Crear | `comic-ecommerce-backend/src/routes/users.js` |
| Modificar | `comic-ecommerce-backend/prisma/schema.prisma` |
| Modificar | `comic-ecommerce-backend/src/controllers/authController.js` |
| Modificar | `comic-ecommerce-backend/src/app.js` |
| Crear | `comic-ecommerce-frontend/src/components/auth/ProtectedRoute.jsx` |
| Crear | `comic-ecommerce-frontend/src/pages/Profile/index.jsx` |
| Crear | `comic-ecommerce-frontend/src/pages/Profile/ProfileSidebar.jsx` |
| Crear | `comic-ecommerce-frontend/src/pages/Profile/ProfileDashboard.jsx` |
| Crear | `comic-ecommerce-frontend/src/pages/Profile/EditProfileModal.jsx` |
| Modificar | `comic-ecommerce-frontend/src/services/authService.js` |
| Modificar | `comic-ecommerce-frontend/src/App.jsx` |
| Modificar | `comic-ecommerce-frontend/src/components/layout/Header.jsx` |
| Modificar | `comic-ecommerce-frontend/src/index.css` |

---

## Task 1: Backend — Agregar phone y avatarUrl al schema

**Files:**
- Modify: `comic-ecommerce-backend/prisma/schema.prisma`
- Modify: `comic-ecommerce-backend/src/controllers/authController.js`

- [ ] **Step 1: Agregar campos al modelo User**

Abrir `comic-ecommerce-backend/prisma/schema.prisma`. El modelo `User` actual termina en `favorites Comic[] @relation("Favorites")`. Agregar los dos campos opcionales después de `role`:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(CLIENT)
  phone     String?
  avatarUrl String?
  createdAt DateTime @default(now())
  cart      CartItem[]
  orders    Order[]
  reviews   Review[]
  favorites Comic[]  @relation("Favorites")
}
```

- [ ] **Step 2: Correr la migración**

```bash
cd comic-ecommerce-backend
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npx prisma migrate dev --name add-phone-avatar
```

Salida esperada:
```
✔  Generated Prisma Client
The following migration(s) have been applied:
  migrations/..._add-phone-avatar/migration.sql
```

- [ ] **Step 3: Actualizar authController.me para devolver phone y avatarUrl**

En `comic-ecommerce-backend/src/controllers/authController.js`, en la función `me`, cambiar el objeto `select`:

```js
const user = await getPrisma().user.findUnique({
  where: { id: req.session.userId },
  select: { id: true, email: true, name: true, role: true, phone: true, avatarUrl: true }
});
```

- [ ] **Step 4: Crear rama y hacer commit**

```bash
cd comic-ecommerce-backend
git checkout -b feature/perfil-usuario
git add prisma/schema.prisma src/controllers/authController.js
git commit -m "feat: add phone and avatarUrl to User model"
```

---

## Task 2: Backend — Endpoint PATCH /api/users/me

**Files:**
- Create: `comic-ecommerce-backend/src/controllers/usersController.js`
- Create: `comic-ecommerce-backend/src/routes/users.js`
- Modify: `comic-ecommerce-backend/src/app.js`

- [ ] **Step 1: Crear usersController.js**

Crear `comic-ecommerce-backend/src/controllers/usersController.js`:

```js
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

let prisma;
function getPrisma() {
  if (!prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

const updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;

    const user = await getPrisma().user.update({
      where: { id: req.session.userId },
      data,
      select: { id: true, email: true, name: true, role: true, phone: true, avatarUrl: true },
    });
    res.json(user);
  } catch (error) {
    console.error('updateMe error:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

module.exports = { updateMe };
```

- [ ] **Step 2: Crear routes/users.js**

Crear `comic-ecommerce-backend/src/routes/users.js`:

```js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');
const { updateMe } = require('../controllers/usersController');

router.patch('/me', requireAuth, updateMe);

module.exports = router;
```

- [ ] **Step 3: Registrar la ruta en app.js**

En `comic-ecommerce-backend/src/app.js`, agregar la línea `app.use('/api/users', ...)` justo después de `/api/auth`. El archivo completo queda:

```js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => res.json({ message: 'Comic eCommerce API running' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
```

- [ ] **Step 4: Verificar que el middleware funciona**

Con el backend corriendo (`npm run dev`), ejecutar:

```bash
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

Respuesta esperada: `{"error":"No autenticado"}` — confirma que `requireAuth` está activo.

- [ ] **Step 5: Commit**

```bash
cd comic-ecommerce-backend
git add src/controllers/usersController.js src/routes/users.js src/app.js
git commit -m "feat: add PATCH /api/users/me endpoint"
```

---

## Task 3: Frontend — updateProfile en authService + ProtectedRoute

**Files:**
- Modify: `comic-ecommerce-frontend/src/services/authService.js`
- Create: `comic-ecommerce-frontend/src/components/auth/ProtectedRoute.jsx`

- [ ] **Step 1: Agregar updateProfile a authService.js**

Reemplazar el contenido completo de `comic-ecommerce-frontend/src/services/authService.js`:

```js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const register = (data) => api.post('/api/auth/register', data).then(r => r.data)
export const login = (data) => api.post('/api/auth/login', data).then(r => r.data)
export const logout = () => api.post('/api/auth/logout').then(r => r.data)
export const getMe = () => api.get('/api/auth/me').then(r => r.data)
export const updateProfile = (data) => api.patch('/api/users/me', data).then(r => r.data)
```

- [ ] **Step 2: Crear ProtectedRoute.jsx**

Crear `comic-ecommerce-frontend/src/components/auth/ProtectedRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <span className="font-headline font-black uppercase tracking-widest text-on-surface-variant animate-pulse">
        Cargando...
      </span>
    </div>
  )

  if (!user) return <Navigate to="/" replace />
  return children
}
```

- [ ] **Step 3: Crear rama frontend y hacer commit**

```bash
cd comic-ecommerce-frontend
git checkout -b feature/perfil-usuario
git add src/services/authService.js src/components/auth/ProtectedRoute.jsx
git commit -m "feat: add updateProfile service and ProtectedRoute"
```

---

## Task 4: Frontend — ProfileSidebar

**Files:**
- Create: `comic-ecommerce-frontend/src/pages/Profile/ProfileSidebar.jsx`
- Modify: `comic-ecommerce-frontend/src/index.css`

- [ ] **Step 1: Agregar animación slideIn en index.css**

En `comic-ecommerce-frontend/src/index.css`, dentro del bloque `@keyframes`, agregar después de `fadeIn`:

```css
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```

- [ ] **Step 2: Crear ProfileSidebar.jsx**

Crear `comic-ecommerce-frontend/src/pages/Profile/ProfileSidebar.jsx`:

```jsx
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
```

- [ ] **Step 3: Commit**

```bash
cd comic-ecommerce-frontend
git add src/pages/Profile/ProfileSidebar.jsx src/index.css
git commit -m "feat: add ProfileSidebar with desktop layout and mobile drawer"
```

---

## Task 5: Frontend — EditProfileModal

**Files:**
- Create: `comic-ecommerce-frontend/src/pages/Profile/EditProfileModal.jsx`

- [ ] **Step 1: Crear EditProfileModal.jsx**

Crear `comic-ecommerce-frontend/src/pages/Profile/EditProfileModal.jsx`:

```jsx
import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../services/authService'

export default function EditProfileModal({ onClose }) {
  const { user, setUser } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const updated = await updateProfile(formData)
      setUser(updated)
      onClose()
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest border-4 border-on-surface comic-shadow w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline font-black uppercase text-xl">Editar Perfil</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-secondary-container transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-comic px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+54 11 0000 0000"
              className="input-comic px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">
              Email (no editable)
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="input-comic px-3 py-2 opacity-60 cursor-not-allowed"
            />
          </div>

          {error && (
            <p className="text-error font-bold text-sm border-2 border-error px-3 py-2 bg-surface-container">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-3 px-4"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 py-3 px-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd comic-ecommerce-frontend
git add src/pages/Profile/EditProfileModal.jsx
git commit -m "feat: add EditProfileModal with backdrop blur"
```

---

## Task 6: Frontend — ProfileDashboard

**Files:**
- Create: `comic-ecommerce-frontend/src/pages/Profile/ProfileDashboard.jsx`

- [ ] **Step 1: Crear ProfileDashboard.jsx**

Crear `comic-ecommerce-frontend/src/pages/Profile/ProfileDashboard.jsx`:

```jsx
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
```

- [ ] **Step 2: Commit**

```bash
cd comic-ecommerce-frontend
git add src/pages/Profile/ProfileDashboard.jsx
git commit -m "feat: add ProfileDashboard with empty states"
```

---

## Task 7: Frontend — Profile/index.jsx

**Files:**
- Create: `comic-ecommerce-frontend/src/pages/Profile/index.jsx`

- [ ] **Step 1: Crear Profile/index.jsx**

Crear `comic-ecommerce-frontend/src/pages/Profile/index.jsx`:

```jsx
import { useState } from 'react'
import ProfileSidebar from './ProfileSidebar'
import ProfileDashboard from './ProfileDashboard'
import EditProfileModal from './EditProfileModal'

export default function Profile() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  return (
    <div className="flex flex-1">
      <ProfileSidebar
        isDrawerOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEditProfile={() => setIsEditModalOpen(true)}
      />
      <ProfileDashboard onOpenSidebar={() => setIsDrawerOpen(true)} />
      {isEditModalOpen && (
        <EditProfileModal onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd comic-ecommerce-frontend
git add src/pages/Profile/index.jsx
git commit -m "feat: add Profile page orchestrator"
```

---

## Task 8: Frontend — Routing y Header

**Files:**
- Modify: `comic-ecommerce-frontend/src/App.jsx`
- Modify: `comic-ecommerce-frontend/src/components/layout/Header.jsx`

- [ ] **Step 1: Actualizar App.jsx con la ruta /perfil**

Reemplazar el contenido completo de `comic-ecommerce-frontend/src/App.jsx`:

```jsx
import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import CartDrawer from './components/ui/CartDrawer'
import LoginModal from './components/ui/LoginModal'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import ProtectedRoute from './components/auth/ProtectedRoute'
import useCartStore from './store/cartStore'

function AppShell() {
  const location = useLocation()
  const isCartOpen = useCartStore((state) => state.isOpen)
  const isLoginOpen = useCartStore((state) => state.isLoginOpen)

  useEffect(() => {
    document.body.style.overflow = isCartOpen || isLoginOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen, isLoginOpen])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />
      <LoginModal />
      <div key={location.pathname} className="flex-1 flex flex-col animate-[fadeIn_0.15s_ease]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
```

Nota: se agregó `flex flex-col` al div wrapper de Routes para que el Profile page pueda ocupar el espacio completo con su layout de sidebar.

- [ ] **Step 2: Actualizar Header.jsx — reemplazar el bloque del usuario**

En `comic-ecommerce-frontend/src/components/layout/Header.jsx`, localizar el bloque que empieza con `{user ? (` (líneas 79-102) y reemplazarlo por:

```jsx
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
```

El import de `NavLink` ya existe en la línea 2 del Header.

- [ ] **Step 3: Verificar funcionamiento completo**

Iniciar backend y frontend:

```bash
# Terminal 1 — backend
cd comic-ecommerce-backend
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev

# Terminal 2 — frontend
cd comic-ecommerce-frontend
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

Verificar estos flujos en `http://localhost:5173`:

1. Ir a `/perfil` sin estar logueado → redirige a `/`
2. Hacer login → el nombre del usuario en el Header es clickeable y lleva a `/perfil`
3. `/perfil` muestra el sidebar a la izquierda (desktop) con avatar de iniciales, nombre, badge y navegación
4. El bento grid de bienvenida muestra el nombre del usuario y "0 CÓMICS TOTALES"
5. "Mi Colección" y "Mis Pedidos" muestran el estado vacío con ícono y texto
6. En mobile (< 1024px): botón hamburguesa visible, sidebar oculto
7. Click en hamburguesa → drawer se desliza desde la izquierda con overlay borroso
8. Click fuera del drawer → se cierra
9. Click en "EDITAR PERFIL" → modal con backdrop blur
10. Cambiar nombre y/o teléfono → guardar → nombre actualizado en sidebar
11. El botón "VENDER CÓMICS" y los ítems futuros del sidebar están deshabilitados

- [ ] **Step 4: Commit final**

```bash
cd comic-ecommerce-frontend
git add src/App.jsx src/components/layout/Header.jsx
git commit -m "feat: wire /perfil route and update Header with Mi Perfil link"
```
