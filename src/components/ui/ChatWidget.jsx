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
      addMsg({ type: 'stanlee', text: '¡Hasta la próxima, verdadero creyente! El Profesor Xavier te acompaña desde aquí. 📞' })
      setPhase('xavier')
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
    <div className="flex h-[520px] w-[340px] max-w-[calc(100vw-3rem)] flex-col border-2 border-on-surface bg-white comic-shadow">
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
