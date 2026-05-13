# Spec: Página de Perfil de Usuario

**Fecha:** 2026-04-30
**Sprint:** 1 (ECCLII-124 — US 08: Perfil de usuario)
**Autor:** Tomás Aguirre

---

## Resumen

Implementar la página `/perfil` del usuario autenticado. Incluye sidebar de navegación, bento grid de bienvenida, secciones con estado vacío para Colección y Pedidos, y modal de edición de perfil. Diseño neo-brutalista consistente con el mockup de Agustín.

---

## Arquitectura

### Archivos nuevos

```
src/
  pages/Profile/
    index.jsx              ← página principal, ruta /perfil
    ProfileSidebar.jsx     ← sidebar desktop + drawer mobile
    ProfileDashboard.jsx   ← bento grid + secciones de contenido
    EditProfileModal.jsx   ← modal de edición con backdrop blur
  components/auth/
    ProtectedRoute.jsx     ← wrapper de rutas que requieren auth
```

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/App.jsx` | Agrega ruta `/perfil` con `ProtectedRoute` |
| `src/components/layout/Header.jsx` | Agrega link "Mi Perfil" condicionado a `user`; agrega ícono hamburguesa visible solo en ruta `/perfil` en mobile |
| `comic-ecommerce-backend/prisma/schema.prisma` | Agrega campo `phone String?` al modelo `User` |
| `public/index.html` | Agrega Material Symbols Outlined y fuente Epilogue via Google Fonts |

---

## Routing y protección

```jsx
// src/App.jsx
<Route path="/perfil" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />
```

`ProtectedRoute` lee `useAuth()`. Si `user` es `null` redirige a `/`. Si `loading` es `true` muestra un spinner. Se usará también para proteger `/admin` y rutas futuras del módulo vendedor.

---

## Datos y estado

### Fuente de datos

- `useAuth()` provee `user` con: `id`, `email`, `name`, `role`
- Campo `phone` se agrega al schema de Prisma como `String?` (opcional)
- Campo `avatarUrl` se agrega al schema de Prisma como `String?` — por ahora siempre `null`, preparado para Cloudinary

### Estado por componente

**`Profile/index.jsx`**
- `isEditModalOpen: boolean` — controla apertura del modal

**`ProfileSidebar.jsx`**
- `isDrawerOpen: boolean` — controla el drawer en mobile

**`EditProfileModal.jsx`**
- `formData: { name, phone }` — campos editables
- Al guardar: `PATCH /api/users/me` → actualiza contexto con `setUser`

### Campos editables vs. de solo lectura

| Campo | Editable |
|---|---|
| Nombre | Sí |
| Teléfono | Sí |
| Email | No (solo lectura) |
| Avatar | No por ahora (estructura lista para Cloudinary) |

---

## Componentes

### `ProtectedRoute`
Wrapper minimalista. Lee `useAuth()`, redirige a `/` si no hay sesión, muestra spinner mientras carga.

### `ProfileSidebar`
- **Desktop (≥ lg):** `w-72`, `sticky top-0`, fondo `#F5F5DC`, borde derecho `border-r-4 border-black`
- **Mobile (< lg):** oculto. Se abre via drawer con `translate-x` animado desde la izquierda. Cierre: click en overlay o botón X.
- Contenido: avatar (iniciales si no hay URL), nombre del usuario, badge de rol, datos personales, navegación, botón "Vender Cómics" (disabled por ahora — Sprint 4)
- Badge de rol: muestra "ADMINISTRADOR" si `user.role === 'admin'`, "COLECCIONISTA" en cualquier otro caso
- Avatar: muestra iniciales del nombre en un recuadro si `avatarUrl` es null. Preparado para recibir `<img src={user.avatarUrl}>` cuando Cloudinary esté activo.

### `ProfileDashboard`
- **Bento grid header:** tarjeta de bienvenida (col-span-8) + contador de cómics (col-span-4, valor 0 por ahora)
- **Sección "Mi Colección":** estado vacío — ícono + "Todavía no tenés cómics en tu colección. ¡Explorá el catálogo!"
- **Sección "Mis Pedidos":** estado vacío — ícono + "Todavía no realizaste ningún pedido."
- Ambas secciones mantienen el estilo neo-brutalista (border-4, comic-shadow) para que el diseño se vea completo desde Sprint 1.

### `EditProfileModal`
- Overlay: `backdrop-blur-sm` + `bg-black/40`
- Modal: centrado, `border-4 border-black`, `comic-shadow`, fondo blanco
- Campos: Nombre (texto), Teléfono (texto)
- Botones: "Cancelar" (cierra sin guardar) y "Guardar cambios" (hace el PATCH)
- Manejo de error: si el PATCH falla, muestra mensaje de error dentro del modal

---

## Layout

### Desktop (≥ lg)
```
┌─────────────────────────────────────────────────┐
│                    HEADER                        │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│ SIDEBAR  │         MAIN CONTENT                  │
│  w-72    │         (flex-1)                      │
│  sticky  │                                       │
│          │                                       │
├──────────┴──────────────────────────────────────┤
│                    FOOTER                        │
└─────────────────────────────────────────────────┘
```

### Mobile (< lg)
```
┌──────────────────────────────┐
│   HEADER (+ ícono hamburger) │
├──────────────────────────────┤
│                              │
│        MAIN CONTENT          │
│                              │
└──────────────────────────────┘
       ↕ drawer overlay desde izquierda
```

---

## Backend — endpoint nuevo

`PATCH /api/users/me`
- Auth requerida (middleware `requireAuth`)
- Body: `{ name?, phone? }`
- Respuesta: usuario actualizado
- Se agrega en `src/routes/users.js` y `src/controllers/usersController.js`

---

## Dependencias externas a agregar

| Recurso | Dónde |
|---|---|
| Material Symbols Outlined (Google Fonts) | `index.html` |
| Fuente Epilogue (Google Fonts) | `index.html` (verificar si ya está) |

---

## Fuera de scope (este sprint)

- Subida de foto de perfil (Cloudinary) — Sprint futuro
- Sección "Mi Colección" con datos reales — Sprint 2
- Sección "Mis Pedidos" con datos reales — Sprint 3
- Botón "Vender Cómics" funcional — Sprint 4
- Sección "Notificaciones" funcional — Sprint futuro
