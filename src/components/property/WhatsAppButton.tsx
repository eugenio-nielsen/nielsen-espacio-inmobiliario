import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  propertyTitle: string;
  propertyAddress: string;
  variant?: 'floating' | 'inline';
}

const WHATSAPP_NUMBER = '5491164519421';

export default function WhatsAppButton({ propertyTitle, propertyAddress, variant = 'floating' }: WhatsAppButtonProps) {
  const message = encodeURIComponent(
    `Hola! Me interesa la propiedad "${propertyTitle}" ubicada en ${propertyAddress}. ¿Podemos coordinar?`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  if (variant === 'inline') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#25D366] text-white py-3.5 rounded-lg font-semibold hover:bg-[#1EBE57] transition-all hover:shadow-lg flex items-center justify-center space-x-2"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Contactar por WhatsApp</span>
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#1EBE57] hover:scale-110 transition-all duration-300 group lg:hidden"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 text-sm font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Escribinos por WhatsApp
      </span>
    </a>
  );
}
