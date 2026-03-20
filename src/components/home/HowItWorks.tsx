import { Upload, MessageSquare, Handshake, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Publica tu Propiedad',
    description: 'Carga las fotos, datos y ubicacion de tu propiedad en minutos. Es completamente gratis y sin compromiso.',
    color: 'from-brand-500 to-brand-600',
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-500',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Recibí Consultas',
    description: 'Los compradores interesados te contactan directamente por WhatsApp, email o agendan una visita desde la plataforma.',
    color: 'from-accent-500 to-accent-600',
    iconBg: 'bg-accent-50',
    iconColor: 'text-accent-600',
  },
  {
    number: '03',
    icon: Handshake,
    title: 'Cerrá la Operacion',
    description: 'Acordá directamente con el comprador, sin comisiones ni intermediarios. Ahorrás entre un 3% y 6% del valor de tu propiedad.',
    color: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-accent-500 text-sm font-semibold tracking-widest uppercase mb-3 block">
            Simple y directo
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-content mb-4">
            ¿Como Funciona?
          </h2>
          <p className="text-content-muted max-w-2xl mx-auto text-lg">
            Vendé tu propiedad en 3 simples pasos, sin comisiones y conectando directamente con compradores reales.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-brand-200 via-accent-200 to-emerald-200" />

          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              <div className="text-center">
                <div className="relative inline-flex mb-8">
                  <div className={`w-20 h-20 ${step.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <step.icon className={`h-9 w-9 ${step.iconColor}`} />
                  </div>
                  <div className={`absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white text-xs font-bold z-20 shadow-lg`}>
                    {step.number}
                  </div>
                </div>

                <h3 className="font-serif text-xl font-semibold text-content mb-3">
                  {step.title}
                </h3>

                <p className="text-content-muted leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-6 mb-2">
                    <ArrowRight className="h-5 w-5 text-content-light rotate-90" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            to="/publicar"
            className="inline-flex items-center space-x-3 bg-brand-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-brand-600 transition-all duration-300 hover:shadow-lg group"
          >
            <span>Publicar mi propiedad gratis</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
