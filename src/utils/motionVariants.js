// Shared Framer Motion variants — use these across the entire frontend

// ─── ROUTE TRANSITIONS ────────────────────────────────────────────────────────
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
}

// ─── PRODUCT GRID ─────────────────────────────────────────────────────────────
// Parent container — orchestrates stagger between cards
export const gridContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

// Individual card inside the grid
export const gridCard = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// ─── DIRECTIONAL ENTRANCES ────────────────────────────────────────────────────
// Spread these as props: <motion.div {...fromLeft}>
export const fromLeft = {
  initial: { opacity: 0, x: -36 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
}

export const fromRight = {
  initial: { opacity: 0, x: 36 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: 0.12 },
  },
}

// Generic fade + slide up — for sections and headings
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// ─── DRAWER ITEMS ─────────────────────────────────────────────────────────────
// Wrap each list item in AnimatePresence + motion.div with this variant
export const drawerItem = {
  initial: { opacity: 0, x: 16 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}
