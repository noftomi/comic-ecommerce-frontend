const shopLinks = ['Novedades', 'Marvel', 'DC', 'Ofertas']
const legalLinks = ['Privacidad', 'Términos', 'Cookies', 'Devoluciones']
const contactLinks = ['Soporte', 'Comunidad', 'Newsletter', 'Distribución']

function LinkColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-body font-bold uppercase text-xs tracking-widest text-secondary-container mb-3">
        {title}
      </h4>
      <ul className="m-0 list-none space-y-2 p-0">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="font-body font-bold uppercase text-xs hover:text-secondary-container transition-colors">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-on-surface text-background py-12 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="font-headline font-black text-2xl uppercase italic text-secondary-container">
            Comics Corp
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest">The Graphic Narrative</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <LinkColumn title="Tienda" links={shopLinks} />
          <LinkColumn title="Legal" links={legalLinks} />
          <LinkColumn title="Contacto" links={contactLinks} />
        </div>

        <div className="text-[10px] font-bold uppercase tracking-widest text-secondary-container md:text-right">
          ©2026 Comics Corp. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
