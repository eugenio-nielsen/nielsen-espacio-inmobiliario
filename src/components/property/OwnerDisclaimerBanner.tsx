import { AlertCircle } from 'lucide-react';

export default function OwnerDisclaimerBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-md">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Propiedades Publicadas por Dueños
          </h3>
          <p className="text-amber-800 leading-relaxed">
            Cada una de estas propiedades es publicadas por su propios dueños.
            Espacio Inmobiliario no interviene ni es parte del intercambio inmobiliario
            ni ejerce el corretaje. Cada propiedad es publicada, gestionada y atendida
            por sus dueños.
          </p>
        </div>
      </div>
    </div>
  );
}
