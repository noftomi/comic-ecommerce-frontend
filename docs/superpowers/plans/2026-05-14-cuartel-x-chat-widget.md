# Cuartel X — Chat Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el widget "Cuartel X" — chat flotante con Xavier (asistente al cliente vía Gemini) y Stan Lee (recomendaciones personalizadas vía heat map).

**Architecture:** Un único `ChatWidget.jsx` montado en `AppShell` de `App.jsx` (visible en todas las páginas para usuarios autenticados). El backend recibe boosts opcionales de categoría/editorial vía query params que se suman al heat map antes de scorear. El flujo de recomendaciones vive dentro del mismo panel de chat, con Stan Lee tomando el control cuando el backend devuelve `{"intent":"RECOMMEND"}`.

**Tech Stack:** React 19, Tailwind CSS v4, Zustand-free (estado local), Axios via servicios existentes, Gemini 1.5 Flash (backend), Node/Express (backend).

---

## Archivos involucrados

| Acción | Archivo |
|--------|---------|
| Modificar | `comic-ecommerce-backend/src/routes/recommendRouter.js` |
| Modificar | `comic-ecommerce-backend/src/services/recommender.js` |
| Modificar | `comic-ecommerce-frontend/src/services/recommendationsService.js` |
| Crear | `comic-ecommerce-frontend/src/components/ui/ChatWidget.jsx` |
| Modificar | `comic-ecommerce-frontend/src/App.jsx` |

---

## Task 1: Backend — boosts en el heat map

**Files:**
- Modify: `comic-ecommerce-backend/src/routes/recommendRouter.js`
- Modify: `comic-ecommerce-backend/src/services/recommender.js`

- [ ] **Step 1: Actualizar `recommendRouter.js`**

Reemplazar el contenido completo del archivo:

```js
const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/requireAuth')
const { getRecommendations } = require('../services/recommender')

router.get('/', requireAuth, async (req, res) => {
  const userId = req.session.userId
  const mode = req.query.mode === 'explore' ? 'explore' : 'normal'
  const categories = req.query.categories
    ? req.query.categories.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const publishers = req.query.publishers
    ? req.query.publishers.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  try {
    const result = await getRecommendations(userId, mode, { categories, publishers })
    res.json(result)
  } catch (err) {
    console.error('recommendations error:', err)
    res.status(500).json({ error: 'Error al obtener recomendaciones' })
  }
})

module.exports = router
```

- [ ] **Step 2: Actualizar `recommender.js` — firma y boosts**

Cambiar solo la primera línea de `getRecommendations` y agregar los boosts después de `buildHeatMap`:

```js
// Antes:
async function getRecommendations(userId, mode = 'normal') {
  const prisma = getPrisma()
  const { heatMap, excludedIds } = await buildHeatMap(userId)

// Después:
async function getRecommendations(userId, mode = 'normal', boosts = {}) {
  const prisma = getPrisma()
  const { heatMap, excludedIds } = await buildHeatMap(userId)

  const { categories = [], publishers = [] } = boosts
  for (const cat of categories) heatMap[cat] = (heatMap[cat] || 0) + 3.0
  for (const pub of publishers) heatMap[pub] = (heatMap[pub] || 0) + 2.0
```

El resto de `recommender.js` queda exactamente igual.

- [ ] **Step 3: Verificar manualmente**

Con el backend corriendo (`npm run dev` en `comic-ecommerce-backend`), hacer login primero y luego:

```
GET http://localhost:3000/api/recommendations?categories=Marvel,Superhéroes&publishers=DC
```

Debe responder `200` con `{ recommendations: [...], mode: 'normal' }`. Los cómics de Marvel/Superhéroes/DC deben aparecer mejor rankeados que sin los params.

- [ ] **Step 4: Commit backend**

```bash
cd comic-ecommerce-backend
git add src/routes/recommendRouter.js src/services/recommender.js
git commit -m "feat(recommendations): accept category and publisher boosts via query params"
```

---

## Task 2: Frontend — actualizar `recommendationsService.js`

**Files:**
- Modify: `comic-ecommerce-frontend/src/services/recommendationsService.js`

- [ ] **Step 1: Reemplazar el contenido del servicio**

```js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const getRecommendations = (mode = 'normal', categories = [], publishers = []) => {
  const params = new URLSearchParams()
  if (mode === 'explore') params.set('mode', 'explore')
  if (categories.length) params.set('categories', categories.join(','))
  if (publishers.length) params.set('publishers', publishers.join(','))
  const qs = params.toString()
  return api.get(`/api/recommendations${qs ? `?${qs}` : ''}`).then((r) => r.data)
}

export const getRelated = (comicId) =>
  api.get(`/api/comics/${comicId}/related`).then((r) => r.data)
```

- [ ] **Step 2: Verificar que `RelatedComics.jsx` sigue funcionando**

`RelatedComics.jsx` usa `getRelated(comicId)`, cuya firma no cambió. Confirmar que no hay errores de importación.

- [ ] **Step 3: Commit**

```bash
cd comic-ecommerce-frontend
git add src/services/recommendationsService.js
git commit -m "feat(recommendations-service): add categories and publishers params"
```

---

## Task 3: ChatWidget — bubble cerrado con viñeta Xavier

**Files:**
- Create: `comic-ecommerce-frontend/src/components/ui/ChatWidget.jsx`
- Modify: `comic-ecommerce-frontend/src/App.jsx`

- [ ] **Step 1: Crear `ChatWidget.jsx` — solo el bubble cerrado**

```jsx
import { useState } from 'react'
import xavierImg from '../../assets/xavier.png'
import stanLeeImg from '../../assets/stan-lee.png'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {!open && (
        <div className="relative">
          {/* Viñeta de diálogo */}
          <div className="absolute bottom-full right-0 mb-3 border-2 border-on-surface bg-white px-3 py-2 comic-shadow-sm whitespace-nowrap">
            <span className="font-headline text-xs font-black uppercase tracking-widest">
              ¿NECESITAS AYUDA?
            </span>
            {/* Tail de la viñeta */}
            <span className="absolute -bottom-[9px] right-5 h-0 w-0 border-x-[8px] border-t-[9px] border-x-transparent border-t-on-surface" />
            <span className="absolute -bottom-[6px] right-5 h-0 w-0 border-x-[8px] border-t-[8px] border-x-transparent border-t-white" />
          </div>

          {/* Botón Xavier */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-16 w-16 overflow-hidden rounded-full border-2 border-on-surface bg-white comic-shadow transition-transform hover:scale-105 active:scale-95"
            aria-label="Abrir Cuartel X"
          >
            <img src={xavierImg} alt="Xavier" className="h-full w-full object-cover" />
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Montar `ChatWidget` en `App.jsx`**

En `App.jsx`, agregar el import y el widget dentro de `AppShell`, justo después de `<FavoritesDrawer />`:

```jsx
// Agregar al bloque de imports:
import ChatWidget from './components/ui/ChatWidget'

// Dentro de AppShell, después de <FavoritesDrawer />:
<FavoritesDrawer />
<ChatWidget />
<LoginModal />
```

- [ ] **Step 3: Verificar visualmente**

Iniciar `npm run dev` en el frontend. Con sesión iniciada debe aparecer el botón circular de Xavier en bottom-right con la viñeta "¿NECESITAS AYUDA?" encima. Confirmar diseño: borde recto, sin border-radius en la viñeta, `comic-shadow-sm`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ChatWidget.jsx src/App.jsx
git commit -m "feat(cuartel-x): add Xavier bubble button with speech bubble"
```

---

## Task 4: ChatWidget — panel abierto con chat de Xavier

**Files:**
- Modify: `comic-ecommerce-frontend/src/components/ui/ChatWidget.jsx`

- [ ] **Step 1: Reemplazar `ChatWidget.jsx` completo con panel y chat Xavier**

```jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendMessage } from '../../services/chatService'
import { getRecommendations } from '../../services/recommendationsService'
import xavierImg from '../../assets/xavier.png'
import stanLeeImg from '../../assets/stan-lee.png'

let _id = 0
const mkId = () => ++_id

const INITIAL_MESSAGES = [
  { id: mkId(), type: 'xavier', text: '¡Hola! Soy el asistente del Cuartel X. ¿En qué te puedo ayudar hoy?' },
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState('xavier') // 'xavier' | 'stanlee-mode' | 'stanlee-form' | 'stanlee-results'
  const [recMode, setRecMode] = useState('normal')
  const endRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  function addMsg(msg) {
    setMessages((prev) => [...prev, { id: mkId(), ...msg }])
  }

  function buildGeminiHistory() {
    return messages
      .filter((m) => m.type === 'user' || m.type === 'xavier')
      .map((m) => ({
        role: m.type === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }))
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading || phase !== 'xavier') return
    setInput('')
    addMsg({ type: 'user', text })
    setLoading(true)
    try {
      const history = [...buildGeminiHistory(), { role: 'user', parts: [{ text }] }]
      const { reply } = await sendMessage(history)
      try {
        const parsed = JSON.parse(reply)
        if (parsed.intent === 'RECOMMEND') {
          addMsg({ type: 'xavier', text: '¡Okey! Llamaré a un experto. 📞' })
          addMsg({ type: 'stanlee-calling' })
          setTimeout(() => {
            addMsg({ type: 'stanlee', text: '¡Hola, verdadero creyente! ¿Cómo querés que te recomiende?' })
            addMsg({ type: 'stanlee-mode-options', consumed: false })
            setPhase('stanlee-mode')
          }, 1500)
          return
        }
      } catch (_) { /* not JSON, regular reply */ }
      addMsg({ type: 'xavier', text: reply })
    } catch {
      addMsg({ type: 'xavier', text: 'Ups, no pude conectarme. Intentá de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  function handleModeSelect(mode) {
    setMessages((prev) =>
      prev.map((m) => m.type === 'stanlee-mode-options' ? { ...m, consumed: true } : m)
    )
    setRecMode(mode)
    addMsg({ type: 'user', text: mode === 'explore' ? 'Descubrir algo nuevo' : 'Seguir mis favoritos' })
    setTimeout(() => {
      addMsg({ type: 'stanlee', text: '¡Perfecto! Llenate este formulario, verdadero creyente:' })
      addMsg({ type: 'stanlee-form', consumed: false })
      setPhase('stanlee-form')
    }, 600)
  }

  async function handleFormSubmit({ categories, publishers, priceFilter }) {
    setMessages((prev) =>
      prev.map((m) => m.type === 'stanlee-form' ? { ...m, consumed: true } : m)
    )
    const summary = [
      categories.length ? `Géneros: ${categories.join(', ')}` : null,
      publishers.length ? `Editoriales: ${publishers.join(', ')}` : null,
      `Presupuesto: ${priceFilter}`,
    ].filter(Boolean).join(' · ')
    addMsg({ type: 'user', text: summary })
    addMsg({ type: 'stanlee', text: '¡Déjame buscar tus cómics! 🔍' })
    setLoading(true)
    try {
      const publishersToSend = publishers.filter((p) => p !== 'Otra')
      const { recommendations } = await getRecommendations(recMode, categories, publishersToSend)
      const filtered = applyPriceFilter(recommendations, priceFilter)
      if (filtered.length === 0) {
        addMsg({ type: 'stanlee', text: 'No encontré cómics con esos filtros. ¡Intentá con otros géneros!' })
      } else {
        addMsg({ type: 'stanlee', text: `¡Encontré ${filtered.length} cómics para vos, verdadero creyente!` })
        addMsg({ type: 'stanlee-results', comics: filtered.slice(0, 6) })
      }
      setPhase('stanlee-results')
    } catch {
      addMsg({ type: 'stanlee', text: 'Ups, no pude cargar las recomendaciones. Intentá de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  function applyPriceFilter(comics, filter) {
    if (filter === 'Menos de $10') return comics.filter((c) => c.price < 10)
    if (filter === '$10 - $30') return comics.filter((c) => c.price >= 10 && c.price <= 30)
    if (filter === 'Más de $30') return comics.filter((c) => c.price > 30)
    return comics
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open ? (
        <ChatPanel
          messages={messages}
          input={input}
          loading={loading}
          phase={phase}
          endRef={endRef}
          onInput={setInput}
          onSend={handleSend}
          onClose={() => setOpen(false)}
          onModeSelect={handleModeSelect}
          onFormSubmit={handleFormSubmit}
          onNavigate={navigate}
        />
      ) : (
        <div className="relative">
          <div className="absolute bottom-full right-0 mb-3 border-2 border-on-surface bg-white px-3 py-2 comic-shadow-sm whitespace-nowrap">
            <span className="font-headline text-xs font-black uppercase tracking-widest">
              ¿NECESITAS AYUDA?
            </span>
            <span className="absolute -bottom-[9px] right-5 h-0 w-0 border-x-[8px] border-t-[9px] border-x-transparent border-t-on-surface" />
            <span className="absolute -bottom-[6px] right-5 h-0 w-0 border-x-[8px] border-t-[8px] border-x-transparent border-t-white" />
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-16 w-16 overflow-hidden rounded-full border-2 border-on-surface bg-white comic-shadow transition-transform hover:scale-105 active:scale-95"
            aria-label="Abrir Cuartel X"
          >
            <img src={xavierImg} alt="Xavier" className="h-full w-full object-cover" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components (no exportados) ───────────────────────────

function ChatPanel({ messages, input, loading, phase, endRef, onInput, onSend, onClose, onModeSelect, onFormSubmit, onNavigate }) {
  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex h-[520px] w-[340px] flex-col border-2 border-on-surface bg-white comic-shadow">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-on-surface bg-primary px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
            <img src={xavierImg} alt="Xavier" className="h-full w-full object-cover" />
          </div>
          <span className="font-headline text-sm font-black uppercase tracking-widest text-white">
            CUARTEL X
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="font-headline text-lg font-black text-white hover:opacity-70"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            msg={msg}
            onModeSelect={onModeSelect}
            onFormSubmit={onFormSubmit}
            onNavigate={onNavigate}
          />
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border-2 border-on-surface">
              <img src={xavierImg} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="border-2 border-on-surface bg-surface-container px-3 py-2">
              <span className="font-body text-sm animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t-2 border-on-surface p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading || phase !== 'xavier'}
          placeholder={phase !== 'xavier' ? 'Respondé las opciones de arriba' : 'Escribí tu consulta...'}
          className="input-comic flex-1 px-3 py-2 text-sm disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={loading || !input.trim() || phase !== 'xavier'}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Agregar `MessageItem` al mismo archivo**

Agregar después de `ChatPanel`:

```jsx
function MessageItem({ msg, onModeSelect, onFormSubmit, onNavigate }) {
  if (msg.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] border-2 border-on-surface bg-primary-container px-3 py-2">
          <p className="font-body text-sm">{msg.text}</p>
        </div>
      </div>
    )
  }

  if (msg.type === 'xavier') {
    return (
      <div className="flex items-start gap-2">
        <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border-2 border-on-surface">
          <img src={xavierImg} alt="Xavier" className="h-full w-full object-cover" />
        </div>
        <div className="max-w-[75%] border-2 border-on-surface bg-surface-container px-3 py-2">
          <p className="font-body text-sm">{msg.text}</p>
        </div>
      </div>
    )
  }

  if (msg.type === 'stanlee' || msg.type === 'stanlee-calling') {
    return (
      <div className="flex items-start gap-2">
        <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border-2 border-on-surface">
          <img src={stanLeeImg} alt="Stan Lee" className="h-full w-full object-cover" />
        </div>
        <div className="max-w-[75%] border-2 border-on-surface bg-secondary-container px-3 py-2">
          {msg.type === 'stanlee-calling' ? (
            <p className="font-body text-sm animate-bounce">📞</p>
          ) : (
            <p className="font-body text-sm">{msg.text}</p>
          )}
        </div>
      </div>
    )
  }

  if (msg.type === 'stanlee-mode-options') {
    if (msg.consumed) return null
    return (
      <div className="flex items-start gap-2">
        <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border-2 border-on-surface">
          <img src={stanLeeImg} alt="Stan Lee" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onModeSelect('normal')}
            className="btn-secondary px-3 py-2 text-xs text-left"
          >
            Seguir mis favoritos
          </button>
          <button
            type="button"
            onClick={() => onModeSelect('explore')}
            className="btn-secondary px-3 py-2 text-xs text-left"
          >
            Descubrir algo nuevo
          </button>
        </div>
      </div>
    )
  }

  if (msg.type === 'stanlee-form') {
    if (msg.consumed) return null
    return <StanLeeForm onSubmit={onFormSubmit} />
  }

  if (msg.type === 'stanlee-results') {
    return <StanLeeResults comics={msg.comics} onNavigate={onNavigate} />
  }

  return null
}
```

- [ ] **Step 3: Agregar stubs de `StanLeeForm` y `StanLeeResults` al final del mismo archivo**

Son implementaciones mínimas que evitan errores de referencia. Se reemplazan en Tasks 5 y 6:

```jsx
// Stub — reemplazado en Task 5
function StanLeeForm({ onSubmit }) {
  return (
    <div className="ml-9 border-2 border-on-surface bg-white p-3 w-[270px]">
      <p className="font-body text-sm text-on-surface-variant">Cargando formulario...</p>
    </div>
  )
}

// Stub — reemplazado en Task 6
function StanLeeResults({ comics, onNavigate }) {
  return (
    <div className="ml-9">
      <p className="font-body text-sm">{comics.length} cómics encontrados.</p>
    </div>
  )
}
```

- [ ] **Step 4: Verificar chat Xavier**

Con backend y frontend corriendo:
1. Loguearse en la app
2. Hacer click en el botón Xavier → debe abrirse el panel "CUARTEL X"
3. Enviar un mensaje como "¿Cuánto tarda el envío?" → Xavier debe responder con info de la tienda
4. El input debe deshabilitarse mientras carga

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ChatWidget.jsx
git commit -m "feat(cuartel-x): add chat panel with Xavier assistant"
```

---

## Task 5: ChatWidget — formulario guiado de Stan Lee

**Files:**
- Modify: `comic-ecommerce-frontend/src/components/ui/ChatWidget.jsx`

- [ ] **Step 1: Reemplazar el stub `StanLeeForm` con la implementación real**

Encontrar la función stub al final de `ChatWidget.jsx` y reemplazarla completa:

```jsx
const GENRES = ['Superhéroes', 'Manga', 'Terror', 'Sci-Fi', 'Fantasía', 'Western', 'Noir']
const PUBLISHERS = ['Marvel', 'DC', 'Image', 'Dark Horse', 'Otra']
const PRICES = ['Menos de $10', '$10 - $30', 'Más de $30', 'Sin límite']

function StanLeeForm({ onSubmit }) {
  const [genres, setGenres] = useState([])
  const [publishers, setPublishers] = useState([])
  const [price, setPrice] = useState('Sin límite')

  function toggleGenre(g) {
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])
  }

  function togglePublisher(p) {
    setPublishers((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  }

  function handleSubmit() {
    onSubmit({ categories: genres, publishers, priceFilter: price })
  }

  return (
    <div className="ml-9 border-2 border-on-surface bg-white p-3 flex flex-col gap-4 w-[270px]">
      {/* Géneros */}
      <div>
        <p className="font-headline text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">
          ¿Qué géneros te atrapan?
        </p>
        <div className="flex flex-wrap gap-1">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGenre(g)}
              className={`border-2 border-on-surface px-2 py-1 font-headline text-[10px] font-black uppercase transition-colors ${
                genres.includes(g) ? 'bg-primary text-white' : 'bg-white hover:bg-surface-container'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Editoriales */}
      <div>
        <p className="font-headline text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">
          ¿De qué editorial sos fanático?
        </p>
        <div className="flex flex-wrap gap-1">
          {PUBLISHERS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePublisher(p)}
              className={`border-2 border-on-surface px-2 py-1 font-headline text-[10px] font-black uppercase transition-colors ${
                publishers.includes(p) ? 'bg-primary text-white' : 'bg-white hover:bg-surface-container'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Presupuesto */}
      <div>
        <p className="font-headline text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">
          ¿Cuánto querés invertir?
        </p>
        <div className="flex flex-wrap gap-1">
          {PRICES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrice(p)}
              className={`border-2 border-on-surface px-2 py-1 font-headline text-[10px] font-black uppercase transition-colors ${
                price === p ? 'bg-primary text-white' : 'bg-white hover:bg-surface-container'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="btn-primary w-full py-2 text-xs"
      >
        ¡ENCUÉNTRAME CÓMICS!
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verificar flujo Stan Lee**

Con backend y frontend corriendo:
1. Enviar en el chat: "¿Me recomendás un cómic?"
2. Xavier debe responder "¡Okey! Llamaré a un experto. 📞"
3. Debe aparecer el emoji de teléfono animado (bounce)
4. Tras ~1.5s, Stan Lee aparece con "¡Hola, verdadero creyente!" y dos botones
5. Al elegir "Descubrir algo nuevo" → aparece el formulario con chips de géneros/editoriales/precio
6. Los chips deben togglear (seleccionado = bg-primary / blanco)
7. Al hacer submit → Stan Lee dice "¡Déjame buscar tus cómics! 🔍" mientras carga

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ChatWidget.jsx
git commit -m "feat(cuartel-x): add Stan Lee guided form for recommendations"
```

---

## Task 6: ChatWidget — resultados de Stan Lee

**Files:**
- Modify: `comic-ecommerce-frontend/src/components/ui/ChatWidget.jsx`

- [ ] **Step 1: Reemplazar el stub `StanLeeResults` con la implementación real**

Encontrar la función stub al final de `ChatWidget.jsx` y reemplazarla completa:

```jsx
function StanLeeResults({ comics, onNavigate }) {
  if (comics.length === 0) return null

  return (
    <div className="ml-9 w-[270px]">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {comics.map((comic) => (
          <button
            key={comic.id}
            type="button"
            onClick={() => onNavigate(`/product/${comic.id}`)}
            className="shrink-0 w-[90px] border-2 border-on-surface bg-white text-left comic-shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <div className="h-[110px] overflow-hidden border-b-2 border-on-surface">
              {comic.imageUrl ? (
                <img
                  src={comic.imageUrl}
                  alt={comic.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-surface-dim" />
              )}
            </div>
            <div className="p-1.5">
              <p className="line-clamp-2 font-headline text-[9px] font-black uppercase leading-tight">
                {comic.title}
              </p>
              <p className="mt-1 font-body text-[9px] font-bold text-on-surface-variant">
                ${typeof comic.price === 'number' ? comic.price.toFixed(2) : comic.price}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar flujo completo**

Con backend y frontend corriendo, probar el flujo end-to-end:
1. Abrir Cuartel X → escribir "Quiero que me recomiendes algo"
2. Xavier → Stan Lee → elegir modo → completar formulario → submit
3. Stan Lee debe mostrar cards horizontales con imagen, título y precio
4. Hacer click en una card → debe navegar a `/product/:id`
5. Verificar que al seleccionar "Sin límite" como presupuesto aparecen todos los resultados
6. Verificar que "Menos de $10" filtra correctamente

- [ ] **Step 3: Verificar edge cases**

- Enviar el formulario sin seleccionar nada → debe funcionar (0 boosts, filtro "Sin límite")
- Si no hay cómics con el filtro de precio → Stan Lee muestra mensaje de disculpas
- El input del chat debe estar deshabilitado durante toda la fase Stan Lee

- [ ] **Step 4: Commit final del widget**

```bash
git add src/components/ui/ChatWidget.jsx
git commit -m "feat(cuartel-x): add Stan Lee recommendation results cards"
```

---

## Task 7: Cleanup y verificación final

**Files:**
- Review: `comic-ecommerce-frontend/src/App.jsx`

- [ ] **Step 1: Verificar que el widget no aparece para usuarios no autenticados**

En `App.jsx`, confirmar que `<ChatWidget />` está dentro del render de `AppShell` donde `user` del contexto ya resolvió. El `AuthProvider` ya bloquea el render hasta que `loading` sea false, así que el widget no se monta hasta tener el estado auth definitivo.

Si se quiere ser explícito, se puede condicionar:

```jsx
// En AppShell, reemplazar <ChatWidget /> por:
{user && <ChatWidget />}
```

- [ ] **Step 2: Verificar responsividad en mobile**

El panel de `w-[340px]` puede desbordar en pantallas muy pequeñas. Agregar `max-w-[calc(100vw-3rem)]` al panel si es necesario. Revisar en 375px de ancho.

- [ ] **Step 3: Smoke test completo**

Probar los tres flujos principales:
1. **Q&A general** → "¿Cuáles son los métodos de pago?" → Xavier responde
2. **Recomendaciones modo normal** → pedir recomendación → modo "Seguir mis favoritos" → formulario → resultados
3. **Recomendaciones modo explore** → pedir recomendación → modo "Descubrir algo nuevo" → formulario → resultados
4. **Off-topic** → "¿Cómo cocino pasta?" → Xavier responde que solo puede ayudar con cómics

- [ ] **Step 4: Commit final**

```bash
cd comic-ecommerce-frontend
git add src/App.jsx
git commit -m "feat(cuartel-x): wire up ChatWidget for authenticated users only"
```

---

## Resumen de commits esperados

```
feat(recommendations): accept category and publisher boosts via query params   [backend]
feat(recommendations-service): add categories and publishers params            [frontend]
feat(cuartel-x): add Xavier bubble button with speech bubble                   [frontend]
feat(cuartel-x): add chat panel with Xavier assistant                          [frontend]
feat(cuartel-x): add Stan Lee guided form for recommendations                  [frontend]
feat(cuartel-x): add Stan Lee recommendation results cards                     [frontend]
feat(cuartel-x): wire up ChatWidget for authenticated users only               [frontend]
```
