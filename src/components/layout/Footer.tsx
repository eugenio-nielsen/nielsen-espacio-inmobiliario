import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight, Instagram, Facebook, Linkedin, MessageCircle, Award, Shield, TrendingUp, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6 group">
              <img
                src="/espacio_inmobiliario.svg"
                alt="Espacio Inmobiliario"
                className="h-20 w-auto brightness-0 invert group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-white/80 text-base leading-relaxed mb-6 max-w-md">
              La plataforma inmobiliaria que revoluciona la forma de comprar y vender propiedades.
              <span className="block mt-2 font-semibold text-accent-400">Sin comisiones. Con transparencia total.</span>
            </p>

            <div className="mb-8">
              <h5 className="text-sm font-semibold text-white mb-4">Por que elegirnos</h5>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-white/70 text-sm">
                  <Shield className="h-4 w-4 text-accent-400 flex-shrink-0" />
                  <span>Transacciones seguras y transparentes</span>
                </li>
                <li className="flex items-center space-x-2 text-white/70 text-sm">
                  <Award className="h-4 w-4 text-accent-400 flex-shrink-0" />
                  <span>Informes de valor profesionales</span>
                </li>
                <li className="flex items-center space-x-2 text-white/70 text-sm">
                  <TrendingUp className="h-4 w-4 text-accent-400 flex-shrink-0" />
                  <span>Herramientas de analisis avanzadas</span>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-white mb-4">Seguinos en redes</h5>
              <div className="flex items-center space-x-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-accent-500 rounded-full flex items-center justify-center transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-white" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-accent-500 rounded-full flex items-center justify-center transition-all duration-300 group"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-white" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-accent-500 rounded-full flex items-center justify-center transition-all duration-300 group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 text-white" />
                </a>
                <a
                  href="https://wa.me/5491164519421"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-green-500 rounded-full flex items-center justify-center transition-all duration-300 group"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5 text-white" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-accent-400 mb-6">
              Navegacion
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/propiedades">Propiedades</FooterLink>
              <FooterLink to="/informe-valor">Informe de Valor</FooterLink>
              <FooterLink to="/herramientas">Herramientas</FooterLink>
              <FooterLink to="/guias">Guias y Recursos</FooterLink>
              <FooterLink to="/publicar">Publicar Propiedad</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-accent-400 mb-6">
              Recursos
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/guias?cat=comprar">Guia del Comprador</FooterLink>
              <FooterLink to="/guias?cat=vender">Guia del Vendedor</FooterLink>
              <FooterLink to="/guias?cat=inversion">Invertir en Propiedades</FooterLink>
              <FooterLink to="/guias?cat=mercado">Analisis de Mercado</FooterLink>
              <FooterLink to="/guias?cat=legal">Aspectos Legales</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-accent-400 mb-6">
              Contacto
            </h4>
            <ul className="space-y-4 mb-8">
              <li>
                <a
                  href="mailto:eugenio@espacioinmobiliario.com.ar"
                  className="flex items-start space-x-3 text-white/70 hover:text-white transition-colors group"
                >
                  <Mail className="h-4 w-4 text-accent-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm break-all">eugenio@espacioinmobiliario.com.ar</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+5491164519421"
                  className="flex items-center space-x-3 text-white/70 hover:text-white transition-colors group"
                >
                  <Phone className="h-4 w-4 text-accent-400 flex-shrink-0" />
                  <span className="text-sm">+54 911 6451 9421</span>
                </a>
              </li>
              <li className="flex items-start space-x-3 text-white/70">
                <MapPin className="h-4 w-4 text-accent-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Buenos Aires, Argentina</span>
              </li>
            </ul>

            <div>
              <h5 className="text-sm font-semibold text-white mb-3">Newsletter</h5>
              <p className="text-white/60 text-xs mb-3">Recibe las mejores oportunidades</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-md text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
                <button
                  className="px-4 bg-accent-500 hover:bg-accent-600 text-white rounded-r-md transition-colors flex items-center justify-center"
                  aria-label="Suscribirse"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/50 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Espacio Inmobiliario. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-6">
              <Link to="/privacidad" className="text-white/50 hover:text-white text-sm transition-colors">
                Privacidad
              </Link>
              <Link to="/terminos" className="text-white/50 hover:text-white text-sm transition-colors">
                Terminos y Condiciones
              </Link>
              <Link to="/cookies" className="text-white/50 hover:text-white text-sm transition-colors">
                Cookies
              </Link>
            </div>
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
