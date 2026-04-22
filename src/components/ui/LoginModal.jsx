import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import useCartStore from '../../store/cartStore'
import { useAuth } from '../../context/AuthContext'
import { login } from '../../services/authService'

export default function LoginModal() {
  const navigate = useNavigate()
  const isLoginOpen = useCartStore((state) => state.isLoginOpen)
  const closeLogin = useCartStore((state) => state.closeLogin)
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login({ email, password })
      setUser(user)
      closeLogin()
      setEmail('')
      setPassword('')
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = () => {
    closeLogin()
    navigate('/register')
  }

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-on-surface/60 transition-opacity duration-200 ${
        isLoginOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={closeLogin}
      aria-hidden={!isLoginOpen}
    >
      <div
        className={`mx-4 w-full max-w-md border-4 border-on-surface bg-surface-container-lowest p-8 comic-shadow transition-all duration-200 ${
          isLoginOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-headline text-4xl font-black uppercase">Acceder</h2>
          <button
            type="button"
            onClick={closeLogin}
            className="border-2 border-on-surface p-1 transition-colors duration-75 hover:bg-surface-dim"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className="mb-2 block font-label text-xs font-bold uppercase">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="INGRESA TU EMAIL"
              className="input-comic w-full px-4 py-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-2 block font-label text-xs font-bold uppercase">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="INGRESA TU CONTRASEÑA"
              className="input-comic w-full px-4 py-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="font-label text-xs font-bold uppercase text-error">{error}</p>
          )}

          <button type="submit" className="btn-primary mt-2 w-full py-4 text-xl" disabled={loading}>
            {loading ? 'CARGANDO...' : 'ENTRAR'}
          </button>

          <div className="flex items-center gap-4">
            <div className="h-0.5 flex-1 bg-on-surface" />
            <span className="font-headline text-sm font-black uppercase">O</span>
            <div className="h-0.5 flex-1 bg-on-surface" />
          </div>

          <p className="text-center text-sm font-bold">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={handleRegister}
              className="underline transition-colors duration-75 hover:text-primary"
            >
              REGÍSTRATE
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
