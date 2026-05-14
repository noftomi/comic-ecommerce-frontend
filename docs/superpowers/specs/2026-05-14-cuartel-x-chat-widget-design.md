# Cuartel X — Chat Widget Design

**Date:** 2026-05-14  
**Feature:** AI Chat Widget con Xavier y Stan Lee  
**Sprint:** Sprint 3

---

## Resumen

Widget flotante de chat llamado "Cuartel X" que cubre dos de las tres features de IA del proyecto:

1. **Xavier** — Asistente al cliente (consultas a Gemini via `/api/chat`)
2. **Stan Lee** — Recomendaciones personalizadas (heat map via `/api/recommendations`)

La feature 3 (descripciones IA con Stan Lee en Admin) ya está completa.

---

## Componentes

### `ChatWidget.jsx` — `src/components/ui/ChatWidget.jsx`

Componente principal. Se monta en `App.jsx` a nivel global, visible en todas las páginas solo para usuarios autenticados.

---

## Estados del widget

### Estado cerrado

- Botón circular fijo `bottom-right`, avatar de Xavier
- Viñeta de diálogo cómica flotando arriba con el texto **"¿Necesitas ayuda?"**
- Clases: `comic-shadow`, `border-2 border-on-surface`, `rounded-full`

### Estado abierto

Panel de chat que se despliega sobre el botón:

- **Header:** "CUARTEL X" en `font-headline font-black uppercase` + avatar Xavier pequeño + botón cerrar
- **Área de mensajes:** scroll interno, mensajes del usuario a la derecha, mensajes del asistente a la izquierda con avatar
- **Input:** campo de texto + botón enviar al fondo

---

## Actores y avatares

| Actor | Avatar | Rol |
|---|---|---|
| Xavier | `assets/xavier.png` | Asistente general, maneja Q&A de la tienda |
| Stan Lee | `assets/stan-lee.png` | Experto en recomendaciones, aparece cuando el usuario pide sugerencias |

---

## Flujo de mensajes

### Flujo normal (Xavier)

1. Usuario escribe un mensaje
2. Frontend llama a `chatService.sendMessage(messages)` → `POST /api/chat`
3. Backend responde con texto → se muestra en burbuja de Xavier
4. Si backend devuelve `{"intent":"RECOMMEND"}` → activar flujo Stan Lee

### Flujo de recomendaciones (Stan Lee)

**Paso 1 — Transición**
- Xavier muestra: *"¡Okey! Llamaré a un experto"* + emoji 📞
- Animación breve de teléfono (CSS transition)
- Stan Lee toma el control con su avatar

**Paso 2 — Pregunta de modo** *(opciones guiadas)*
Stan Lee: *"¡Hola, verdadero creyente! ¿Cómo querés que te recomiende?"*
- `[ Seguir mis favoritos ]` → `mode = 'normal'`
- `[ Descubrir algo nuevo ]` → `mode = 'explore'`

**Paso 3 — Formulario** *(aparece como tarjeta en el chat)*
Stan Lee: *"¡Perfecto! Llenate este formulario, verdadero creyente:"*

```
Pregunta 1: "¿Qué géneros te atrapan?" (multi-select)
  [ Superhéroes ] [ Manga ] [ Terror ] [ Sci-Fi ] [ Fantasía ] [ Western ] [ Noir ]

Pregunta 2: "¿De qué editorial sos fanático?" (multi-select)
  [ Marvel ] [ DC ] [ Image ] [ Dark Horse ] [ Otra ]

Pregunta 3: "¿Cuánto querés invertir?" (single-select)
  [ Menos de $10 ] [ $10 - $30 ] [ Más de $30 ] [ Sin límite ]

Botón: [ ¡ENCUÉNTRAME CÓMICS! ]
```

**Paso 4 — Resultados**
- Frontend llama a `GET /api/recommendations?mode=X&categories=A,B&publishers=C,D`
- Resultados filtrados por precio en frontend si aplica
- Stan Lee muestra cards horizontales (scroll horizontal):
  - Imagen de portada + título + precio + botón "Ver"
  - Máximo 6 cards

---

## Cambio de backend requerido

### `recommendRouter.js`
Aceptar query params `categories` y `publishers`:
```
GET /api/recommendations?mode=explore&categories=Superhéroes,Manga&publishers=Marvel,DC
```

### `recommender.js`
Sumar boosts al heat map antes de scorear:
- Por cada `category` seleccionada: `heatMap[category] += 3.0`
- Por cada `publisher` seleccionada: `heatMap[publisher] += 2.0`

---

## Estructura de mensajes en estado local

```js
// Tipos de mensaje
{ role: 'user', text: 'string' }
{ role: 'xavier', text: 'string' }
{ role: 'stanlee', text: 'string' }
{ role: 'stanlee-options', options: ['A', 'B'], onSelect: fn }
{ role: 'stanlee-form' }
{ role: 'stanlee-results', comics: [] }
```

El historial se guarda en estado local (`useState`). No persiste entre sesiones ni recargas.

Para la llamada a `chatService.sendMessage`, solo se envían los mensajes de tipo `user` y `xavier` en formato `{ role, parts: [{ text }] }` (formato Gemini).

---

## Arquitectura de componentes

```
ChatWidget.jsx
  ├── ChatBubbleButton     — botón flotante cerrado con viñeta
  ├── ChatPanel            — panel abierto
  │   ├── ChatHeader
  │   ├── ChatMessageList
  │   │   ├── UserMessage
  │   │   ├── XavierMessage
  │   │   ├── StanLeeMessage
  │   │   ├── StanLeeOptions   — chips de respuesta guiada
  │   │   ├── StanLeeForm      — formulario de recomendaciones
  │   │   └── StanLeeResults   — cards horizontales
  │   └── ChatInput
```

Todo en un único archivo `ChatWidget.jsx` con subcomponentes internos (no exportados).

---

## Integración en App.jsx

```jsx
// Solo renderizar si el usuario está autenticado
{user && <ChatWidget />}
```

El widget no se muestra para usuarios no autenticados (no se renderiza, no hay prompt de login). El backend ya protege las rutas con `requireAuth`.

---

## Aclaraciones

- La opción **"Otra"** en editoriales no genera boost en el heat map; solo sirve para que el usuario que no encuentra su editorial pueda igualmente completar el formulario.
- El formulario no tiene validación obligatoria: el usuario puede enviar sin seleccionar géneros o editorial (los boosts simplemente serán 0 para esos ejes).
- Las opciones guiadas (chips) se deshabilitan una vez seleccionadas y quedan registradas como mensaje de texto del usuario en el historial visible.

---

## Design system

- Fuentes: `font-headline` para títulos/botones, `font-body` para texto de chat
- Colores: CSS vars (`bg-surface`, `text-on-surface`, `bg-primary-container`, etc.)
- Sin `rounded-*` excepto `rounded-full` para avatares
- Botones: `.btn-primary`, `.btn-secondary` o patrón manual
- Box shadow: `.comic-shadow` / `.comic-shadow-sm`
- Sin `border-radius` en el panel (esquinas rectas, estilo cómic)

---

## Pendiente (fuera de scope)

- Emails con N8N — sprint posterior
- Persistencia del historial de chat
- Recomendaciones en sección dedicada de Home page
