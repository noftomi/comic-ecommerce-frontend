/**
 * ComicsCorp — Design System Tokens
 *
 * FUENTE DE VERDAD para colores, tipografías y sombras del proyecto.
 *
 * Las variables CSS viven en src/index.css (bloque @theme) y son consumidas
 * automáticamente por Tailwind. Usa este archivo cuando necesites los valores
 * en JavaScript: estilos en línea, configuración de librerías de gráficos,
 * generación dinámica de clases, etc.
 *
 * REGLA GENERAL: Prefiere siempre las clases Tailwind sobre inline styles.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  EMPAREJAMIENTOS DE COLOR OBLIGATORIOS
 *  (violar esto rompe el contraste y la accesibilidad)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Fondo (Tailwind class)          → Texto (Tailwind class)
 *  ─────────────────────────────────────────────────────────
 *  bg-primary        (rojo)        → text-on-primary        (blanco)
 *  bg-primary-container (rojo osc) → text-on-primary        (blanco)
 *  bg-secondary-container (amarillo)→ text-on-surface       (oscuro)
 *  bg-on-surface     (negro/oscuro) → text-background       (crema)
 *  bg-background     (crema)       → text-on-surface        (oscuro)
 *  bg-surface-*      (cremas)      → text-on-surface        (oscuro)
 *  bg-error          (rojo error)  → text-on-error          (blanco)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  CLASES DE COMPONENTE PREDEFINIDAS (src/index.css @layer components)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  .btn-primary      → Botón rojo + texto blanco + borde negro + sombra cómica
 *  .btn-secondary    → Botón amarillo + texto oscuro + borde negro + sombra cómica
 *  .input-comic      → Input con borde negro, foco en rojo
 *  .product-card     → Tarjeta de producto con sombra cómica y hover
 *  .comic-shadow     → Sombra 8px cómica (negra)
 *  .comic-shadow-sm  → Sombra 4px cómica (negra)
 *  .comic-shadow-red → Sombra 4px cómica (roja)
 *  .comic-push       → Efecto press 6px (botones grandes)
 *  .comic-push-sm    → Efecto press 4px (botones pequeños)
 *  .nav-link         → Enlace de navegación con estado activo/hover
 *  .badge            → Etiqueta / chip pequeño
 *  .gutter-line      → Línea divisoria negra (borde inferior)
 */

// ─── COLORES ──────────────────────────────────────────────────────────────────

export const colors = {
  // Primary — rojo, identidad de marca, acciones principales
  primary: '#930000',
  primaryContainer: '#C00000',
  onPrimary: '#FFFFFF',              // Texto SOBRE fondo primary → siempre blanco

  // Secondary — dorado/amarillo, acciones secundarias y acentos
  secondary: '#705D00',
  secondaryContainer: '#FCD400',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#6E5C00',

  // Background — crema, fondo general de la app
  background: '#FFF9E8',
  onBackground: '#1E1C10',

  // Surfaces — variaciones de crema para capas y tarjetas
  surface: '#FFF9E8',
  surfaceBright: '#FFF9E8',
  surfaceDim: '#E0DAC6',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#FAF4DF',
  surfaceContainer: '#F4EEDA',
  surfaceContainerHigh: '#EEE8D4',
  surfaceContainerHighest: '#E8E2CF',

  // On-surface — texto e íconos sobre fondos claros
  onSurface: '#1E1C10',            // Color de texto predeterminado (negro oscuro)
  onSurfaceVariant: '#5D3F3B',

  // Outline — bordes y separadores
  outline: '#926F69',
  outlineVariant: '#E7BDB6',

  // Error — acciones destructivas, mensajes de error
  error: '#BA1A1A',
  onError: '#FFFFFF',              // Texto SOBRE fondo error → siempre blanco
}

// ─── TIPOGRAFÍA ───────────────────────────────────────────────────────────────

export const fonts = {
  /**
   * Headline — Space Grotesk
   * Uso: títulos, botones, badges, etiquetas de precio
   * Tailwind class: font-headline
   * Peso recomendado: font-black (900) o font-bold (700)
   * Estilo: uppercase + tracking-widest para botones
   */
  headline: '"Space Grotesk", sans-serif',

  /**
   * Body — Work Sans
   * Uso: párrafos, descripciones, inputs, texto general
   * Tailwind class: font-body
   * Peso recomendado: font-normal (400) o font-medium (500)
   */
  body: '"Work Sans", sans-serif',

  /**
   * Label — Work Sans (mismo que body)
   * Uso: etiquetas de formulario, textos pequeños de UI
   * Tailwind class: font-label
   */
  label: '"Work Sans", sans-serif',
}

// ─── SOMBRAS (estilo cómic) ───────────────────────────────────────────────────

export const shadows = {
  /** Sombra grande para cards y elementos prominentes */
  comic: '8px 8px 0px 0px #1E1C10',
  /** Sombra pequeña para botones y elementos interactivos */
  comicSm: '4px 4px 0px 0px #1E1C10',
  /** Sombra roja para énfasis de marca */
  comicRed: '4px 4px 0px 0px #930000',
  /** Sin sombra (estado pressed/active) */
  comicNone: '0px 0px 0px 0px #1E1C10',
}

// ─── PARES DE COLOR (bg → text) ───────────────────────────────────────────────
// Usa estos pares al crear componentes con estilos dinámicos o inline.

export const colorPairs = {
  /** Botón/fondo primario: rojo con texto blanco */
  primary: {
    bg: colors.primary,
    text: colors.onPrimary,
    tailwind: 'bg-primary text-on-primary',
  },
  /** Botón/fondo secundario: amarillo con texto oscuro */
  secondary: {
    bg: colors.secondaryContainer,
    text: colors.onSurface,
    tailwind: 'bg-secondary-container text-on-surface',
  },
  /** Fondo oscuro/negro con texto crema */
  dark: {
    bg: colors.onSurface,
    text: colors.background,
    tailwind: 'bg-on-surface text-background',
  },
  /** Fondo claro (crema) con texto oscuro — fondo default de la app */
  light: {
    bg: colors.background,
    text: colors.onSurface,
    tailwind: 'bg-background text-on-surface',
  },
  /** Error: rojo con texto blanco */
  error: {
    bg: colors.error,
    text: colors.onError,
    tailwind: 'bg-error text-on-error',
  },
}

// ─── BREAKPOINTS ─────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// ─── EXPORT DEFAULT ──────────────────────────────────────────────────────────

const theme = {
  colors,
  fonts,
  shadows,
  colorPairs,
  breakpoints,
}

export default theme
