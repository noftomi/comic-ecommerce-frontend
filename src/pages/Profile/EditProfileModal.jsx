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
