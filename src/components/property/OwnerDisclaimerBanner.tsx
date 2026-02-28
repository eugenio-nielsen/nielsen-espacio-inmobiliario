import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function OwnerDisclaimerBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-4 md:p-6 shadow-md">
      <div className="flex items-start space-x-3 md:space-x-4">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-amber-900">
              Propiedades Publicadas por Dueños
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden flex items-center text-amber-700 hover:text-amber-900 transition-colors ml-2"
              aria-label={isExpanded ? "Ver menos" : "Ver más"}
            >
              <span className="text-sm font-medium mr-1">
                {isExpanded ? "Ver menos" : "Ver más"}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className={`text-amber-800 leading-relaxed text-sm md:text-base mt-2 md:block ${isExpanded ? 'block' : 'hidden'}`}>
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
