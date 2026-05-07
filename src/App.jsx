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
import useCartStore from './store/cartStore'
import ProtectedRoute from './components/ProtectedRoute'

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

  {/* Nivel A — cualquier usuario logueado */}
  <Route element={<ProtectedRoute allowedRoles={["CLIENT", "SELLER", "ADMIN"]} />}>
    <Route path="/profile" element={<div>Perfil</div>} />
    <Route path="/cart" element={<div>Carrito</div>} />
    <Route path="/favorites" element={<div>Favoritos</div>} />
    <Route path="/checkout" element={<div>Checkout</div>} />
    <Route path="/orders" element={<div>Historial de compras</div>} />
  </Route>

  {/* Nivel B — solo SELLER */}
  <Route element={<ProtectedRoute allowedRoles={["SELLER"]} />}>
    <Route path="/publish" element={<div>Publicar artículo</div>} />
    <Route path="/sales" element={<div>Historial de ventas</div>} />
  </Route>

  {/* Nivel C — solo ADMIN */}
  <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
    <Route path="/admin" element={<Admin />} />
    <Route path="/admin/users" element={<div>Gestión de usuarios</div>} />
  </Route>

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
