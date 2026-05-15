import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  DollarSign,
  Edit3,
  PackagePlus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import {
  createManagedComic,
  deleteManagedComic,
  getManagedComics,
  updateManagedComic,
} from '../services/managementComicsService'
import { uploadComicImage } from '../services/uploadsService'
import {
  getAdminOrderStats,
  getAdminOrders,
  updateAdminOrderStatus,
} from '../services/adminOrdersService'
import stanLeeImg from '../assets/stan-lee.png'
import { generateDescription } from '../services/descriptionService'

const tabs = [
  { id: 'overview', label: 'Resumen', icon: BarChart3 },
  { id: 'comics', label: 'Comics', icon: BookOpen },
  { id: 'sales', label: 'Ventas', icon: ShoppingBag },
]

const emptyForm = {
  title: '',
  author: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
  category: '',
  language: 'es',
  publisher: '',
  pages: '',
  edition: '',
  issueNumber: '',
}

const orderStatusOptions = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PAID', label: 'Pagada' },
  { value: 'SHIPPED', label: 'Enviada' },
  { value: 'DELIVERED', label: 'Entregada' },
  { value: 'CANCELLED', label: 'Cancelada' },
]

const orderStatusLabels = Object.fromEntries(orderStatusOptions.map((status) => [status.value, status.label]))

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function buildFormFromComic(comic) {
  return {
    title: comic.title ?? '',
    author: comic.author ?? '',
    description: comic.description ?? '',
    price: comic.price ?? '',
    stock: comic.stock ?? '',
    imageUrl: comic.imageUrl ?? '',
    category: comic.category ?? '',
    language: comic.language ?? 'es',
    publisher: comic.publisher ?? '',
    pages: comic.pages ?? '',
    edition: comic.edition ?? '',
    issueNumber: comic.issueNumber ?? '',
  }
}

function validateComicForm(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'El titulo es obligatorio'
  if (!form.author.trim()) errors.author = 'El autor es obligatorio'
  if (!form.price || Number(form.price) <= 0) errors.price = 'El precio debe ser mayor a 0'
  if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
    errors.stock = 'El stock debe ser un entero mayor o igual a 0'
  }
  if (form.pages !== '' && (!Number.isInteger(Number(form.pages)) || Number(form.pages) < 0)) {
    errors.pages = 'Las paginas deben ser un entero mayor o igual a 0'
  }
  return errors
}

function toPayload(form) {
  return {
    ...form,
    title: form.title.trim(),
    author: form.author.trim(),
    description: form.description.trim() || null,
    price: Number(form.price),
    stock: Number(form.stock),
    imageUrl: form.imageUrl.trim() || null,
    category: form.category.trim() || null,
    language: form.language.trim() || null,
    publisher: form.publisher.trim() || null,
    pages: form.pages === '' ? null : Number(form.pages),
    edition: form.edition.trim() || null,
    issueNumber: form.issueNumber.trim() || null,
  }
}

function AdminStat({ icon: Icon, label, value, tone = 'bg-surface-container-lowest' }) {
  return (
    <div className={`border-2 border-on-surface ${tone} p-4 comic-shadow-sm`}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="font-label text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        <Icon size={18} className="shrink-0 text-on-surface" />
      </div>
      <p className="font-headline text-4xl font-black uppercase leading-none">{value}</p>
    </div>
  )
}

function Field({ label, name, value, onChange, error, type = 'text', textarea = false, required = false }) {
  return (
    <label className="grid gap-1">
      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
        {label}{required ? ' *' : ''}
      </span>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          className={`input-comic min-h-24 px-3 py-2 normal-case ${error ? 'border-error' : ''}`}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`input-comic px-3 py-2 normal-case ${error ? 'border-error' : ''}`}
        />
      )}
      {error && <span className="text-[10px] font-black uppercase text-error">{error}</span>}
    </label>
  )
}

function ComicFormModal({ comic, onClose, onSaved }) {
  const [form, setForm] = useState(() => (comic ? buildFormFromComic(comic) : emptyForm))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUploadError, setImageUploadError] = useState('')
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const [descError, setDescError] = useState('')
  const isEditing = Boolean(comic)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setServerError('')
  }

  const handleImageFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Selecciona un archivo de imagen')
      return
    }

    setUploadingImage(true)
    setImageUploadError('')
    setServerError('')
    try {
      const uploaded = await uploadComicImage(file)
      setForm((current) => ({ ...current, imageUrl: uploaded.imageUrl }))
    } catch (error) {
      setImageUploadError(error.response?.data?.error || 'No se pudo subir la imagen')
    } finally {
      setUploadingImage(false)
      event.target.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateComicForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    setServerError('')
    try {
      const payload = toPayload(form)
      const saved = isEditing
        ? await updateManagedComic(comic.id, payload)
        : await createManagedComic(payload)
      onSaved(saved)
    } catch (error) {
      setServerError(error.response?.data?.error || 'No se pudo guardar el comic')
      setErrors(error.response?.data?.errors || {})
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateDescription = async () => {
    if (!form.title.trim()) {
      setDescError('Ingresá el título primero para generar la descripción')
      return
    }
    setGeneratingDesc(true)
    setDescError('')
    try {
      const { description } = await generateDescription({
        title: form.title,
        author: form.author || undefined,
        category: form.category || undefined,
        publisher: form.publisher || undefined,
        issueNumber: form.issueNumber || undefined,
        edition: form.edition || undefined,
        language: form.language || undefined,
        pages: form.pages ? Number(form.pages) : undefined,
      })
      setForm((current) => ({ ...current, description }))
    } catch (err) {
      setDescError(err.response?.data?.error || 'Error al generar la descripción')
    } finally {
      setGeneratingDesc(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-on-surface/60" onClick={onClose} aria-label="Cerrar" />
      <section className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto border-4 border-on-surface bg-surface-container-lowest p-5 comic-shadow md:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="mb-2 inline-block border-2 border-on-surface bg-secondary-container px-2 py-1 text-[10px] font-black uppercase tracking-widest">
              {isEditing ? 'Editar' : 'Alta'}
            </span>
            <h2 className="font-headline text-4xl font-black uppercase leading-none">
              {isEditing ? 'Editar comic' : 'Nuevo comic'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="border-2 border-on-surface bg-primary p-1 text-on-primary">
            <X size={22} />
          </button>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Titulo" name="title" value={form.title} onChange={handleChange} error={errors.title} required />
            <Field label="Autor" name="author" value={form.author} onChange={handleChange} error={errors.author} required />
          </div>

          <label className="grid gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Descripcion
            </span>
            <div className="relative">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`input-comic min-h-24 w-full px-3 py-2 normal-case pr-12 ${errors.description ? 'border-error' : ''}`}
              />
              <div className="absolute bottom-2 right-2 flex items-end gap-2">
                {!generatingDesc && (
                  <div className="relative">
                    <div className="border-2 border-on-surface bg-white px-2 py-1.5 text-[10px] font-black leading-tight max-w-[130px]">
                      Este comic lo conozco... ¿Te ayudo con la descripción?
                    </div>
                    <div className="absolute -right-2 bottom-2 h-0 w-0 border-b-[5px] border-l-[8px] border-t-[5px] border-b-transparent border-l-on-surface border-t-transparent" />
                    <div className="absolute -right-[5px] bottom-[9px] h-0 w-0 border-b-[4px] border-l-[6px] border-t-[4px] border-b-transparent border-l-white border-t-transparent" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generatingDesc}
                  title="Generar con Stan Lee"
                  className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-on-surface bg-white transition-transform hover:scale-110 disabled:opacity-50"
                >
                  {generatingDesc ? (
                    <span className="flex h-full w-full items-center justify-center text-xs font-bold animate-spin">
                      ↻
                    </span>
                  ) : (
                    <img src={stanLeeImg} alt="Generar con Stan Lee" className="h-full w-full object-cover" />
                  )}
                </button>
              </div>
            </div>
            {errors.description && (
              <span className="text-[10px] font-black uppercase text-error">{errors.description}</span>
            )}
            {descError && (
              <span className="text-[10px] font-black uppercase text-error">{descError}</span>
            )}
          </label>

          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Precio" name="price" type="number" value={form.price} onChange={handleChange} error={errors.price} required />
            <Field label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} error={errors.stock} required />
            <Field label="Paginas" name="pages" type="number" value={form.pages} onChange={handleChange} error={errors.pages} />
            <Field label="Idioma" name="language" value={form.language} onChange={handleChange} error={errors.language} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Editorial" name="publisher" value={form.publisher} onChange={handleChange} error={errors.publisher} />
            <Field label="Categoria" name="category" value={form.category} onChange={handleChange} error={errors.category} />
            <Field label="Edicion" name="edition" value={form.edition} onChange={handleChange} error={errors.edition} />
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_180px]">
            <div className="grid gap-3">
              <Field label="URL de imagen" name="imageUrl" value={form.imageUrl} onChange={handleChange} error={errors.imageUrl} />
              <div className="flex flex-col gap-3 border-2 border-on-surface bg-surface-container p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Subir imagen desde tu equipo
                  </p>
                  {imageUploadError && (
                    <p className="mt-1 text-[10px] font-black uppercase text-error">{imageUploadError}</p>
                  )}
                </div>
                <label className="btn-secondary flex cursor-pointer items-center justify-center gap-2 px-4 py-2 text-xs">
                  <Upload size={16} />
                  {uploadingImage ? 'Subiendo...' : 'Elegir imagen'}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={handleImageFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
              {form.imageUrl && (
                <div className="flex items-center gap-3 border-2 border-on-surface bg-white p-3">
                  <img
                    src={form.imageUrl}
                    alt="Preview de portada"
                    className="h-24 w-16 border-2 border-on-surface object-cover"
                  />
                  <p className="break-all text-xs font-bold text-on-surface-variant">
                    {form.imageUrl}
                  </p>
                </div>
              )}
            </div>
            <Field label="Numero" name="issueNumber" value={form.issueNumber} onChange={handleChange} error={errors.issueNumber} />
          </div>

          {serverError && (
            <p className="border-2 border-error bg-surface-container px-3 py-2 text-xs font-black uppercase text-error">
              {serverError}
            </p>
          )}

          <div className="flex flex-col gap-3 border-t-2 border-on-surface pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary px-5 py-3 text-xs">
              Cancelar
            </button>
            <button type="submit" disabled={saving || uploadingImage} className="btn-primary px-5 py-3 text-xs disabled:opacity-60">
              {saving ? 'Guardando...' : 'Guardar comic'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview')
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [modalComic, setModalComic] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [orders, setOrders] = useState([])
  const [orderStats, setOrderStats] = useState({ totalSales: 0, ordersCount: 0, topComics: [] })
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const loadComics = async () => {
    setLoading(true)
    setActionError('')
    try {
      const data = await getManagedComics()
      setComics(data)
    } catch (error) {
      setActionError(error.response?.data?.error || 'No se pudo cargar el catalogo')
      setComics([])
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    setOrdersLoading(true)
    setActionError('')
    try {
      const [ordersData, statsData] = await Promise.all([
        getAdminOrders(),
        getAdminOrderStats(),
      ])
      setOrders(ordersData)
      setOrderStats(statsData)
    } catch (error) {
      setActionError(error.response?.data?.error || 'No se pudieron cargar las ordenes')
      setOrders([])
      setOrderStats({ totalSales: 0, ordersCount: 0, topComics: [] })
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    loadComics()
    loadOrders()
  }, [])

  const filteredComics = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return comics
    return comics.filter((comic) =>
      [comic.title, comic.author, comic.publisher, comic.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    )
  }, [comics, query])

  const lowStock = comics.filter((comic) => Number(comic.stock || 0) <= 5).length

  const openCreate = () => {
    setModalComic(null)
    setIsFormOpen(true)
  }

  const openEdit = (comic) => {
    setModalComic(comic)
    setIsFormOpen(true)
  }

  const handleSaved = (savedComic) => {
    setComics((current) => {
      const exists = current.some((comic) => comic.id === savedComic.id)
      if (exists) return current.map((comic) => (comic.id === savedComic.id ? savedComic : comic))
      return [savedComic, ...current]
    })
    setIsFormOpen(false)
    setModalComic(null)
    setActiveTab('comics')
  }

  const handleDelete = async (comic) => {
    const confirmed = window.confirm(`Eliminar "${comic.title}" del catalogo?`)
    if (!confirmed) return
    setActionError('')
    try {
      await deleteManagedComic(comic.id)
      setComics((current) => current.filter((item) => item.id !== comic.id))
    } catch (error) {
      setActionError(error.response?.data?.error || 'No se pudo eliminar el comic')
    }
  }

  const handleOrderStatusChange = async (order, status) => {
    setUpdatingOrderId(order.id)
    setActionError('')
    try {
      const updated = await updateAdminOrderStatus(order.id, status)
      setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      const stats = await getAdminOrderStats()
      setOrderStats(stats)
    } catch (error) {
      setActionError(error.response?.data?.error || 'No se pudo actualizar la orden')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <main className="flex-1 bg-surface-container-low px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8">
        <section className="border-4 border-on-surface bg-surface-container-lowest p-5 comic-shadow md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="mb-3 inline-block border-2 border-on-surface bg-secondary-container px-3 py-1 font-label text-[10px] font-black uppercase tracking-widest">
                Administracion
              </span>
              <h1 className="font-headline text-5xl font-black uppercase leading-none md:text-7xl">
                Panel Admin
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-bold uppercase leading-relaxed text-on-surface-variant">
                Centro operativo para inventario, alta de comics y seguimiento de ventas.
              </p>
            </div>

            <button type="button" onClick={openCreate} className="btn-primary flex items-center justify-center gap-2 px-5 py-3 text-sm">
              <PackagePlus size={18} />
              Nuevo comic
            </button>
          </div>
        </section>

        {actionError && (
          <p className="border-2 border-error bg-surface-container-lowest px-4 py-3 text-xs font-black uppercase text-error comic-shadow-sm">
            {actionError}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit border-2 border-on-surface bg-surface-container-lowest p-3 comic-shadow-sm">
            <nav className="grid gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 border-2 border-on-surface px-3 py-3 text-left font-headline text-sm font-black uppercase transition-colors ${
                      isActive
                        ? 'bg-secondary-container text-on-surface'
                        : 'bg-surface-container-lowest hover:bg-surface-container'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          <section className="min-w-0">
            {activeTab === 'overview' && (
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <AdminStat icon={DollarSign} label="Total ventas" value={formatPrice(orderStats.totalSales)} />
                  <AdminStat icon={ShoppingBag} label="Ordenes" value={orderStats.ordersCount} />
                  <AdminStat icon={BookOpen} label="Comics cargados" value={comics.length} />
                  <AdminStat icon={SlidersHorizontal} label="Stock bajo" value={lowStock} tone="bg-secondary-container" />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.8fr)]">
                  <div className="border-2 border-on-surface bg-surface-container-lowest p-5 comic-shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <h2 className="font-headline text-2xl font-black uppercase">Comics mas vendidos</h2>
                      <BookOpen size={20} />
                    </div>
                    <div className="space-y-3">
                      {orderStats.topComics.length === 0 ? (
                        <p className="border-2 border-on-surface bg-surface-container p-4 text-center font-headline text-xl font-black uppercase">
                          Sin ventas registradas
                        </p>
                      ) : orderStats.topComics.map((comic) => (
                        <div key={comic.comicId} className="flex items-center justify-between gap-4 border-2 border-on-surface bg-surface-container p-3">
                          <div className="min-w-0">
                            <p className="truncate font-headline text-sm font-black uppercase">{comic.title}</p>
                            <p className="text-[10px] font-bold uppercase text-on-surface-variant">
                              {comic.quantitySold} unidades / {formatPrice(comic.revenue)}
                            </p>
                          </div>
                          <span className="shrink-0 border-2 border-on-surface bg-white px-2 py-1 text-xs font-black">
                            #{comic.comicId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-2 border-on-surface bg-surface-container-lowest p-5 comic-shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <h2 className="font-headline text-2xl font-black uppercase">Ventas recientes</h2>
                      <ShoppingBag size={20} />
                    </div>
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="border-2 border-on-surface bg-surface-container p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-headline text-sm font-black uppercase">#{String(order.id).padStart(5, '0')}</p>
                            <span className="bg-primary px-2 py-1 text-[10px] font-black uppercase text-on-primary">
                              {orderStatusLabels[order.status] || order.status}
                            </span>
                          </div>
                          <p className="mt-2 text-xs font-bold uppercase text-on-surface-variant">{order.user?.name || order.user?.email || 'Usuario'}</p>
                          <p className="mt-1 font-headline text-xl font-black">{formatPrice(order.total)}</p>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <p className="border-2 border-on-surface bg-surface-container p-4 text-center font-headline text-xl font-black uppercase">
                          Sin ordenes
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comics' && (
              <div className="border-2 border-on-surface bg-surface-container-lowest comic-shadow-sm">
                <div className="flex flex-col gap-4 border-b-2 border-on-surface p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="font-headline text-3xl font-black uppercase">Gestion de comics</h2>
                    <p className="mt-1 text-xs font-bold uppercase text-on-surface-variant">
                      Alta, edicion y control de inventario.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 border-2 border-on-surface bg-white px-3 py-2">
                    <Search size={16} />
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar comic"
                      className="w-full border-0 bg-transparent p-0 text-sm font-bold uppercase focus:ring-0 lg:w-72"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left">
                    <thead className="bg-surface-container">
                      <tr className="border-b-2 border-on-surface">
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Comic</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Editorial</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Categoria</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Precio</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Stock</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Estado</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-8 text-center font-headline text-xl font-black uppercase">
                            Cargando catalogo...
                          </td>
                        </tr>
                      ) : filteredComics.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-8 text-center font-headline text-xl font-black uppercase">
                            Sin resultados
                          </td>
                        </tr>
                      ) : (
                        filteredComics.map((comic) => (
                          <tr key={comic.id} className="border-b border-on-surface/20">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={comic.imageUrl || 'https://placehold.co/120x180/F4EEDA/1E1C10?text=COMIC'}
                                  alt={comic.title}
                                  className="h-14 w-10 border-2 border-on-surface object-cover"
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-headline text-sm font-black uppercase">{comic.title}</p>
                                  <p className="truncate text-[10px] font-bold uppercase text-on-surface-variant">
                                    {comic.author}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-bold uppercase">{comic.publisher || '-'}</td>
                            <td className="px-4 py-3 text-xs font-bold uppercase">{comic.category || '-'}</td>
                            <td className="px-4 py-3 font-headline text-lg font-black">{formatPrice(comic.price)}</td>
                            <td className="px-4 py-3 text-sm font-black">{comic.stock}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block border-2 border-on-surface px-2 py-1 text-[10px] font-black uppercase ${
                                Number(comic.stock || 0) <= 5 ? 'bg-secondary-container' : 'bg-white'
                              }`}>
                                {Number(comic.stock || 0) <= 5 ? 'Stock bajo' : 'Activo'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEdit(comic)}
                                  className="border-2 border-on-surface bg-secondary-container p-2"
                                  aria-label="Editar comic"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(comic)}
                                  className="border-2 border-on-surface bg-primary p-2 text-on-primary"
                                  aria-label="Eliminar comic"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="border-2 border-on-surface bg-surface-container-lowest p-5 comic-shadow-sm">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="font-headline text-3xl font-black uppercase">Gestion de ordenes</h2>
                    <p className="mt-1 text-xs font-bold uppercase text-on-surface-variant">
                      Supervision de compras y actualizacion de estados.
                    </p>
                  </div>
                  <button type="button" onClick={loadOrders} className="btn-secondary px-4 py-2 text-xs">
                    Actualizar
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left">
                    <thead className="bg-surface-container">
                      <tr className="border-b-2 border-on-surface">
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Orden</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Usuario</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Fecha</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Items</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Total</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersLoading ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-8 text-center font-headline text-xl font-black uppercase">
                            Cargando ordenes...
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-8 text-center font-headline text-xl font-black uppercase">
                            Sin ordenes registradas
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} className="border-b border-on-surface/20">
                            <td className="px-4 py-3 font-headline text-lg font-black uppercase">
                              #{String(order.id).padStart(5, '0')}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-headline text-sm font-black uppercase">{order.user?.name || 'Usuario'}</p>
                              <p className="text-[10px] font-bold uppercase text-on-surface-variant">{order.user?.email}</p>
                            </td>
                            <td className="px-4 py-3 text-xs font-bold uppercase">{formatDate(order.createdAt)}</td>
                            <td className="px-4 py-3 text-xs font-bold uppercase">
                              {order.items.map((item) => `${item.quantity}x ${item.comic?.title || 'Comic'}`).join(', ')}
                            </td>
                            <td className="px-4 py-3 font-headline text-lg font-black">{formatPrice(order.total)}</td>
                            <td className="px-4 py-3">
                              <select
                                value={order.status}
                                disabled={updatingOrderId === order.id}
                                onChange={(event) => handleOrderStatusChange(order, event.target.value)}
                                className="border-2 border-on-surface bg-white px-3 py-2 text-xs font-black uppercase"
                              >
                                {orderStatusOptions.map((status) => (
                                  <option key={status.value} value={status.value}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {isFormOpen && (
        <ComicFormModal
          comic={modalComic}
          onClose={() => setIsFormOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </main>
  )
}
