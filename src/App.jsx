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
