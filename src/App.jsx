import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import CartDrawer from './components/ui/CartDrawer'
import LoginModal from './components/ui/LoginModal'
import FavoritesDrawer from './components/ui/FavoritesDrawer'
import ChatWidget from './components/ui/ChatWidget'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Register from './pages/Register'
import VerifyEmailSent from './pages/VerifyEmailSent'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderWaiting from './pages/OrderWaiting'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import ProfileFavorites from './pages/Profile/Favorites'
import useCartStore from './store/cartStore'
import useFavoritesStore from './store/favoritesStore'
import { useAuth } from './context/AuthContext'
import { pageTransition } from './utils/motionVariants'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppShell() {
  const location = useLocation()
  const { user } = useAuth()
  const isCartOpen = useCartStore((state) => state.isOpen)
  const isLoginOpen = useCartStore((state) => state.isLoginOpen)
  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites)
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites)
  const fetchCart = useCartStore((state) => state.fetchCart)
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    document.body.style.overflow = isCartOpen || isLoginOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen, isLoginOpen])

  useEffect(() => {
    if (user) fetchFavorites()
    else clearFavorites()
  }, [user])

  useEffect(() => {
    if (user) fetchCart()
    else clearCart()
  }, [user])

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <CartDrawer />
      <FavoritesDrawer />
      {user && <ChatWidget />}
      <LoginModal />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 flex flex-col"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Nivel A — cualquier usuario logueado */}
            <Route element={<ProtectedRoute allowedRoles={["CLIENT", "SELLER", "ADMIN"]} />}>
              <Route path="/perfil" element={<Profile />}>
                <Route path="favoritos" element={<ProfileFavorites />} />
              </Route>
              <Route path="/cart" element={<div>Carrito</div>} />
              <Route path="/favorites" element={<div>Favoritos</div>} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/waiting" element={<OrderWaiting />} />
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
        </motion.div>
      </AnimatePresence>

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
