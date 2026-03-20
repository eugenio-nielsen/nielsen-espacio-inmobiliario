import { useState } from 'react';
import { Share2, MessageCircle, Copy, Facebook, Twitter, Check, X } from 'lucide-react';

interface ShareButtonsProps {
  propertyTitle: string;
  propertyUrl: string;
  propertyPrice: string;
}

export default function ShareButtons({ propertyTitle, propertyUrl, propertyPrice }: ShareButtonsProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `${propertyTitle} - ${propertyPrice}`;

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#1EBE57]',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${propertyUrl}`)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#166FE5]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-[#1DA1F2] hover:bg-[#1A94DA]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(propertyUrl)}`,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = propertyUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="p-3 rounded-full bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-white transition-all shadow-lg"
      >
        <Share2 className="h-5 w-5" />
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-xl shadow-elegant-lg p-4 w-64 animate-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-content">Compartir propiedad</span>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-content-muted" />
              </button>
            </div>

            <div className="space-y-2">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${option.color}`}
                  onClick={() => setShowPanel(false)}
                >
                  <option.icon className="h-4 w-4" />
                  <span>{option.name}</span>
                </a>
              ))}

              <button
                onClick={copyLink}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-content text-sm font-medium transition-all"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600">Enlace copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar enlace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
