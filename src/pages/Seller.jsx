import { useEffect, useState } from 'react'
import { BookOpen, Edit3, PackagePlus, ShoppingBag, Trash2, Upload, X } from 'lucide-react'
import {
  getManagedComics,
  createManagedComic,
  updateManagedComic,
  deleteManagedComic,
} from '../services/managementComicsService'
import { uploadComicImage } from '../services/uploadsService'
import { getSellerOrders } from '../services/sellerOrdersService'

const tabs = [
  { id: 'comics', label: 'Mis Publicaciones', icon: BookOpen },
  { id: 'sales', label: 'Mis Ventas', icon: ShoppingBag },
]

const emptyForm = {
  title: '', author: '', description: '', price: '', stock: '',
  imageUrl: '', category: '', language: 'es', publisher: '',
  pages: '', edition: '', issueNumber: '',
}

const ORDER_STATUS_LABELS = {
  PENDING: 'Pendiente', PAID: 'Pagada', SHIPPED: 'Enviada',
  DELIVERED: 'Entregada', CANCELLED: 'Cancelada',
}

const FORM_FIELDS = [
  { key: 'title', label: 'Título *', type: 'text' },
  { key: 'author', label: 'Autor *', type: 'text' },
  { key: 'price', label: 'Precio *', type: 'number' },
  { key: 'stock', label: 'Stock *', type: 'number' },
  { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'category', label: 'Categoría', type: 'text' },
  { key: 'publisher', label: 'Editorial', type: 'text' },
  { key: 'edition', label: 'Edición', type: 'text' },
  { key: 'pages', label: 'Páginas', type: 'number' },
  { key: 'issueNumber', label: 'Número de issue', type: 'text' },
]

function buildFormFromComic(comic) {
  return {
    title: comic.title ?? '', author: comic.author ?? '',
    description: comic.description ?? '', price: comic.price ?? '',
    stock: comic.stock ?? '', imageUrl: comic.imageUrl ?? '',
    category: comic.category ?? '', language: comic.language ?? 'es',
    publisher: comic.publisher ?? '', pages: comic.pages ?? '',
    edition: comic.edition ?? '', issueNumber: comic.issueNumber ?? '',
  }
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function Seller() {
  const [activeTab, setActiveTab] = useState('comics')
  const [comics, setComics] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingComics, setLoadingComics] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingComic, setEditingComic] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    getManagedComics()
      .then(setComics)
      .finally(() => setLoadingComics(false))
  }, [])

  useEffect(() => {
    if (activeTab === 'sales' && orders.length === 0) {
      setLoadingOrders(true)
      getSellerOrders()
        .then(setOrders)
        .finally(() => setLoadingOrders(false))
    }
  }, [activeTab])

  const openCreate = () => {
    setEditingComic(null)
    setForm(emptyForm)
    setFormErrors({})
    setShowForm(true)
  }

  const openEdit = (comic) => {
    setEditingComic(comic)
    setForm(buildFormFromComic(comic))
    setFormErrors({})
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingComic(null)
    setFormErrors({})
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const { url } = await uploadComicImage(file)
      setForm((f) => ({ ...f, imageUrl: url }))
    } catch {
      setFormErrors((f) => ({ ...f, imageUrl: 'Error al subir imagen' }))
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormErrors({})
    try {
      const payload = {
        ...form,
        price: form.price || undefined,
        stock: form.stock !== '' ? form.stock : undefined,
        pages: form.pages !== '' ? form.pages : undefined,
      }
      if (editingComic) {
        const updated = await updateManagedComic(editingComic.id, payload)
        setComics((cs) => cs.map((c) => (c.id === updated.id ? updated : c)))
      } else {
        const created = await createManagedComic(payload)
        setComics((cs) => [created, ...cs])
      }
      closeForm()
    } catch (err) {
      const errors = err.response?.data?.errors ?? {}
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
      } else {
        setFormErrors({ general: err.response?.data?.error ?? 'Error al guardar' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (comic) => {
    try {
      await deleteManagedComic(comic.id)
      setComics((cs) => cs.filter((c) => c.id !== comic.id))
    } catch {
      // no-op: mantener el cómic en la lista si falla
    } finally {
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-headline text-4xl font-black uppercase mb-6">Mi Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b-4 border-on-surface">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-headline font-black uppercase text-sm border-2 border-on-surface -mb-[4px] transition-colors ${
              activeTab === tab.id
                ? 'bg-on-surface text-background'
                : 'bg-surface hover:bg-surface-dim'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Mis Publicaciones */}
      {activeTab === 'comics' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline text-xl font-black uppercase">Mis Cómics</h2>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 font-headline font-black uppercase text-sm border-2 border-on-surface comic-shadow-sm hover:opacity-90"
            >
              <PackagePlus size={16} /> Nuevo cómic
            </button>
          </div>

          {loadingComics ? (
            <p className="font-body opacity-60">Cargando...</p>
          ) : comics.length === 0 ? (
            <p className="font-body opacity-60">Todavía no publicaste ningún cómic.</p>
          ) : (
            <div className="overflow-x-auto border-2 border-on-surface">
              <table className="w-full text-sm">
                <thead className="bg-on-surface text-background">
                  <tr>
                    {['Imagen', 'Título', 'Autor', 'Precio', 'Stock', 'Acciones'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-headline font-black uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comics.map((comic, i) => (
                    <tr key={comic.id} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-dim'}>
                      <td className="px-3 py-2">
                        {comic.imageUrl
                          ? <img src={comic.imageUrl} alt={comic.title} className="h-12 w-8 object-cover border border-on-surface" />
                          : <div className="h-12 w-8 bg-surface-dim border border-on-surface" />
                        }
                      </td>
                      <td className="px-3 py-2 font-headline font-black">{comic.title}</td>
                      <td className="px-3 py-2">{comic.author}</td>
                      <td className="px-3 py-2">{formatPrice(comic.price)}</td>
                      <td className="px-3 py-2">{comic.stock}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(comic)}
                            className="p-1 border border-on-surface hover:bg-primary hover:text-on-primary"
                            title="Editar"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(comic)}
                            className="p-1 border border-on-surface hover:bg-red-500 hover:text-white"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Mis Ventas */}
      {activeTab === 'sales' && (
        <div>
          <h2 className="font-headline text-xl font-black uppercase mb-4">Mis Ventas</h2>
          {loadingOrders ? (
            <p className="font-body opacity-60">Cargando...</p>
          ) : orders.length === 0 ? (
            <p className="font-body opacity-60">Todavía no recibiste ninguna venta.</p>
          ) : (
            <div className="overflow-x-auto border-2 border-on-surface">
              <table className="w-full text-sm">
                <thead className="bg-on-surface text-background">
                  <tr>
                    {['Fecha', 'Comprador', 'Cómics vendidos', 'Subtotal', 'Estado'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-headline font-black uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={order.id} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-dim'}>
                      <td className="px-3 py-2">{formatDate(order.createdAt)}</td>
                      <td className="px-3 py-2">{order.buyerName}</td>
                      <td className="px-3 py-2">
                        <ul className="space-y-0.5">
                          {order.items.map((item) => (
                            <li key={item.comicId}>
                              {item.comicTitle} × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-3 py-2 font-black">{formatPrice(order.subtotal)}</td>
                      <td className="px-3 py-2">
                        <span className="border border-on-surface px-2 py-0.5 text-xs font-headline font-black uppercase">
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal formulario crear/editar */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl bg-surface border-4 border-on-surface overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b-2 border-on-surface bg-on-surface text-background">
              <h2 className="font-headline font-black uppercase">
                {editingComic ? 'Editar cómic' : 'Nuevo cómic'}
              </h2>
              <button onClick={closeForm}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {formErrors.general && (
                <p className="text-red-600 font-body text-sm">{formErrors.general}</p>
              )}
              {FORM_FIELDS.map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block font-headline font-black uppercase text-xs mb-1">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      rows={3}
                      className="w-full border-2 border-on-surface px-2 py-1 font-body bg-surface resize-none"
                    />
                  ) : (
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full border-2 border-on-surface px-2 py-1 font-body bg-surface"
                    />
                  )}
                  {formErrors[key] && (
                    <p className="text-red-600 text-xs mt-0.5">{formErrors[key]}</p>
                  )}
                </div>
              ))}

              {/* Upload imagen */}
              <div>
                <label className="block font-headline font-black uppercase text-xs mb-1">Imagen</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="URL o subir archivo"
                    className="flex-1 border-2 border-on-surface px-2 py-1 font-body bg-surface"
                  />
                  <label className="flex items-center gap-1 cursor-pointer border-2 border-on-surface px-2 py-1 hover:bg-surface-dim">
                    <Upload size={14} />
                    <span className="font-headline font-black uppercase text-xs">
                      {uploadingImage ? '...' : 'Subir'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" className="mt-2 h-20 object-cover border border-on-surface" />
                )}
                {formErrors.imageUrl && (
                  <p className="text-red-600 text-xs mt-0.5">{formErrors.imageUrl}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-on-primary py-2 font-headline font-black uppercase border-2 border-on-surface disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingComic ? 'Guardar cambios' : 'Crear cómic'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 border-2 border-on-surface font-headline font-black uppercase hover:bg-surface-dim"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface border-4 border-on-surface p-6 max-w-sm w-full">
            <h3 className="font-headline font-black uppercase mb-2">¿Eliminar cómic?</h3>
            <p className="font-body mb-4">
              "{deleteConfirm.title}" será marcado como inactivo y dejará de aparecer en el catálogo.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-on-surface text-background py-2 font-headline font-black uppercase border-2 border-on-surface"
              >
                Eliminar
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border-2 border-on-surface py-2 font-headline font-black uppercase hover:bg-surface-dim"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
