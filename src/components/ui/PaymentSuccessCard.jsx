import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'

export default function PaymentSuccessCard({ orderData }) {
  return (
    <main className="flex-grow relative py-12 px-4 md:px-8 overflow-hidden bg-surface">

      {/* Decoraciones de fondo */}
      <div className="absolute top-10 left-10 text-secondary-container rotate-12 opacity-50 select-none pointer-events-none">
        <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      </div>
      <div className="absolute bottom-20 right-10 text-primary opacity-20 -rotate-45 select-none pointer-events-none">
        <span className="material-symbols-outlined text-9xl" style={{ fontVariationSettings: "'FILL' 1" }}>explosion</span>
      </div>
      <div className="absolute top-1/2 -right-10 text-secondary opacity-30 select-none pointer-events-none">
        <span className="material-symbols-outlined" style={{ fontSize: '120px', fontVariationSettings: "'FILL' 1" }}>payments</span>
      </div>

      <section className="relative z-10 flex flex-col items-center text-center max-w-7xl mx-auto">

        {/* Ícono de éxito */}
        <div className="relative mb-8">
          <div
            className="w-32 h-32 md:w-40 md:h-40 bg-secondary-container border-4 border-on-surface flex items-center justify-center rotate-3 overflow-hidden"
            style={{ boxShadow: '8px 8px 0px 0px #1E1C0E' }}
          >
            <span
              className="material-symbols-outlined text-primary text-6xl md:text-8xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >check_circle</span>
          </div>
          <span
            className="material-symbols-outlined absolute -top-4 -right-8 text-secondary-container text-4xl rotate-12 select-none"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >monetization_on</span>
          <span
            className="material-symbols-outlined absolute -bottom-6 -left-6 text-primary text-4xl -rotate-12 select-none"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >auto_awesome</span>
        </div>

        <h1 className="font-headline font-black text-4xl md:text-6xl uppercase tracking-tighter text-on-surface mb-4 leading-none">
          ¡TU PAGO FUE EXITOSO!
        </h1>
        <p className="font-body font-bold text-lg md:text-2xl text-on-surface-variant max-w-2xl mb-12">
          ¡Felicidades! Tu compra fue registrada correctamente. Prepárate para la acción.
        </p>

        <div className={`grid ${orderData ? 'md:grid-cols-2' : 'grid-cols-1 max-w-md'} gap-12 w-full max-w-5xl items-start`}>

          {/* Resumen del pedido */}
          {orderData && (
            <div
              className="bg-surface-container-low border-4 border-on-surface p-8 text-left relative overflow-hidden"
              style={{ boxShadow: '8px 8px 0px 0px #1E1C0E' }}
            >
              <div className="absolute top-0 right-0 px-3 py-1 bg-on-surface text-surface font-body text-xs uppercase tracking-widest font-black">
                ORDEN CONFIRMADA
              </div>

              <h2 className="font-headline font-black text-2xl uppercase mb-6 flex items-center gap-3 mt-4">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                Resumen del Pedido
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between border-b-2 border-on-surface/20 pb-3">
                  <span className="font-body uppercase font-bold text-on-surface-variant text-xs tracking-widest">ID DE ORDEN</span>
                  <span className="font-headline font-black text-on-surface">
                    #CC-{String(orderData.id).padStart(5, '0')}
                  </span>
                </div>

                <div className="space-y-3">
                  {orderData.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-body font-black uppercase text-sm">{item.comic?.title}</p>
                        {item.quantity > 1 && (
                          <p className="font-body text-xs text-on-surface-variant">× {item.quantity}</p>
                        )}
                      </div>
                      <span className="font-body font-bold shrink-0">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t-4 border-on-surface">
                  <span className="font-headline font-black text-xl uppercase">TOTAL PAGADO</span>
                  <span className="font-headline font-black text-3xl text-primary">
                    ${Number(orderData.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <a
                href={`/api/orders/${orderData.id}/receipt`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-body font-black text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors group"
              >
                <Download size={16} />
                Descargar comprobante
              </a>
            </div>
          )}

          {/* Callout + acciones */}
          <div className="flex flex-col gap-8 text-left">
            <div
              className="bg-secondary-container border-4 border-on-surface p-6 relative overflow-hidden"
              style={{ boxShadow: '4px 4px 0px 0px #1E1C0E' }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(#1e1c0e 10%, transparent 11%)', backgroundSize: '8px 8px' }}
              />
              <p className="font-body font-bold text-on-secondary-container flex items-center gap-3 relative z-10">
                <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                Te enviamos un email de confirmación con todos los detalles de tu compra. Revisá tu bandeja de entrada para rastrear tu envío.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/catalog"
                className="bg-primary text-on-primary font-headline font-black text-lg py-4 border-4 border-on-surface uppercase tracking-tighter text-center comic-push"
              >
                SEGUIR COMPRANDO
              </Link>
              <Link
                to="/perfil"
                className="bg-surface text-on-surface font-headline font-black text-lg py-4 border-4 border-on-surface uppercase tracking-tighter text-center hover:bg-surface-container-highest transition-colors comic-push"
              >
                VER MI PEDIDO
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
