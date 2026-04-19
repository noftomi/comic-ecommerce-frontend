import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
