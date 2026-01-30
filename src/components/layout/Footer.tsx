import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img
                src="/nielsen_espacio_inmobiliario.svg"
                alt="Nielsen Espacio Inmobiliario"
                className="h-18 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              La plataforma inmobiliaria de referencia para inversores y compradores exigentes que buscan propiedades exclusivas.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-accent-400 mb-6">
              Explorar
            </h4>
            <ul className="space-y-4">
              <FooterLink to="/propiedades">Propiedades</FooterLink>
              <FooterLink to="/informe-valor">Informe de Valor</FooterLink>
              <FooterLink to="/herramientas">Herramientas</FooterLink>
              <FooterLink to="/guias">Guias y Recursos</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-accent-400 mb-6">
              Recursos
            </h4>
            <ul className="space-y-4">
              <FooterLink to="/guias?cat=comprar">Guia del Comprador</FooterLink>
              <FooterLink to="/guias?cat=vender">Guia del Vendedor</FooterLink>
              <FooterLink to="/guias?cat=inversion">Inversion Inmobiliaria</FooterLink>
              <FooterLink to="/guias?cat=mercado">Analisis de Mercado</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-accent-400 mb-6">
              Contacto
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:eugenio@espacioinmobiliario.com.ar"
                  className="flex items-center space-x-3 text-white/70 hover:text-white transition-colors group"
                >
                  <Mail className="h-4 w-4 text-accent-400" />
                  <span className="text-sm">eugenio@espacioinmobiliario.com.ar</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+5491164519421"
                  className="flex items-center space-x-3 text-white/70 hover:text-white transition-colors group"
                >
                  <Phone className="h-4 w-4 text-accent-400" />
                  <span className="text-sm">+54 911 6451 9421</span>
                </a>
              </li>
              <li className="flex items-start space-x-3 text-white/70">
                <MapPin className="h-4 w-4 text-accent-400 mt-0.5" />
                <span className="text-sm">Buenos Aires, Argentina</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-white/50 text-sm">
            &copy; {new Date().getFullYear()} Nielsen | Espacio Inmobiliario. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-8">
            <Link to="/privacidad" className="text-white/50 hover:text-white text-sm transition-colors">
              Privacidad
            </Link>
            <Link to="/terminos" className="text-white/50 hover:text-white text-sm transition-colors">
              Terminos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="text-white/70 hover:text-white text-sm transition-colors inline-flex items-center group"
      >
        <span>{children}</span>
        <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
      </Link>
    </li>
  );
}
