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
