import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Clock, ArrowRight } from 'lucide-react';
import Layout from '../../components/layout/Layout';

type ToolType = 'roi' | 'price_sqm' | 'costs' | 'scenario';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType>('roi');

  return (
    <Layout>
      <div className="bg-gradient-to-b from-brand-500 to-brand-600 text-white pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Calculator className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Herramientas Inmobiliarias
          </h1>
          <p className="text-brand-100 text-lg">
            Calculadoras y simuladores para tomar mejores decisiones
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <ToolTab
            icon={TrendingUp}
            title="Rentabilidad"
            active={activeTool === 'roi'}
            onClick={() => setActiveTool('roi')}
          />
          <ToolTab
            icon={DollarSign}
            title="Precio/m²"
            active={activeTool === 'price_sqm'}
            onClick={() => setActiveTool('price_sqm')}
          />
          <ToolTab
            icon={Calculator}
            title="Costos"
            active={activeTool === 'costs'}
            onClick={() => setActiveTool('costs')}
          />
          <ToolTab
            icon={Clock}
            title="Escenarios"
            active={activeTool === 'scenario'}
            onClick={() => setActiveTool('scenario')}
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {activeTool === 'roi' && <ROICalculator />}
          {activeTool === 'price_sqm' && <PricePerSqmCalculator />}
          {activeTool === 'costs' && <CostsCalculator />}
          {activeTool === 'scenario' && <ScenarioSimulator />}
        </div>
      </div>
    </Layout>
  );
}

function ToolTab({ icon: Icon, title, active, onClick }: {
  icon: typeof Calculator;
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 p-4 rounded-xl transition-all ${
        active
          ? 'bg-brand-500 text-white shadow-lg'
          : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{title}</span>
    </button>
  );
}

function ROICalculator() {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [expenses, setExpenses] = useState('');
  const [result, setResult] = useState<{ grossROI: number; netROI: number } | null>(null);

  const calculate = () => {
    const price = parseFloat(purchasePrice);
    const rent = parseFloat(monthlyRent);
    const exp = parseFloat(expenses) || 0;

    if (price > 0 && rent > 0) {
      const annualRent = rent * 12;
      const annualNet = annualRent - (exp * 12);
      const grossROI = (annualRent / price) * 100;
      const netROI = (annualNet / price) * 100;
      setResult({ grossROI, netROI });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Calculadora de Rentabilidad</h2>
      <p className="text-gray-600 mb-6">
        Calcula el retorno de tu inversión inmobiliaria
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de compra (USD)
            </label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="150000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alquiler mensual (USD)
            </label>
            <input
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              placeholder="800"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gastos mensuales (USD)
            </label>
            <input
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={calculate}
            className="w-full bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Calcular</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Resultados</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Rentabilidad bruta anual</p>
                <p className="text-2xl font-bold text-brand-500">{result.grossROI.toFixed(2)}%</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Rentabilidad neta anual</p>
                <p className="text-2xl font-bold text-brand-500">{result.netROI.toFixed(2)}%</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Recupero de inversión</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(100 / result.netROI).toFixed(1)} años
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PricePerSqmCalculator() {
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const p = parseFloat(price);
    const a = parseFloat(area);
    if (p > 0 && a > 0) {
      setResult(p / a);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Calculadora de Precio por m²</h2>
      <p className="text-gray-600 mb-6">
        Compara propiedades usando el precio por metro cuadrado
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio total (USD)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Superficie (m²)
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="80"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={calculate}
            className="w-full bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
          >
            Calcular
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Precio por m²</p>
              <p className="text-4xl font-bold text-brand-500">
                USD {result.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-gray-500 mt-2">por metro cuadrado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CostsCalculator() {
  const [price, setPrice] = useState('');
  const [isSelling, setIsSelling] = useState(false);
  const [result, setResult] = useState<{
    commission: number;
    transfer: number;
    notary: number;
    total: number;
  } | null>(null);

  const calculate = () => {
    const p = parseFloat(price);
    if (p > 0) {
      const commission = p * 0.03;
      const transfer = isSelling ? 0 : p * 0.015;
      const notary = p * 0.01;
      const total = commission + transfer + notary;
      setResult({ commission, transfer, notary, total });
    }
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Calculadora de Costos</h2>
      <p className="text-gray-600 mb-6">
        Estima los costos asociados a una operación de compra/venta
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setIsSelling(false)}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                !isSelling ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Comprador
            </button>
            <button
              onClick={() => setIsSelling(true)}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                isSelling ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Vendedor
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de la propiedad (USD)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={calculate}
            className="w-full bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
          >
            Calcular costos
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Desglose de costos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Comisión inmobiliaria (3%)</span>
                <span className="font-medium">{formatPrice(result.commission)}</span>
              </div>
              {!isSelling && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Impuesto de transferencia (1.5%)</span>
                  <span className="font-medium">{formatPrice(result.transfer)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gastos de escribanía (1%)</span>
                <span className="font-medium">{formatPrice(result.notary)}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-gray-900">Total estimado</span>
                <span className="font-bold text-brand-500">{formatPrice(result.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScenarioSimulator() {
  const [currentPrice, setCurrentPrice] = useState('');
  const [monthlyIncrease, setMonthlyIncrease] = useState('0.5');
  const [months, setMonths] = useState('6');
  const [result, setResult] = useState<{ futurePrice: number; difference: number } | null>(null);

  const calculate = () => {
    const price = parseFloat(currentPrice);
    const increase = parseFloat(monthlyIncrease) / 100;
    const m = parseInt(months);

    if (price > 0) {
      const futurePrice = price * Math.pow(1 + increase, m);
      const difference = futurePrice - price;
      setResult({ futurePrice, difference });
    }
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Simulador de Escenarios</h2>
      <p className="text-gray-600 mb-6">
        Proyecta el valor futuro de una propiedad
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio actual (USD)
            </label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="150000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aumento mensual estimado (%)
            </label>
            <input
              type="number"
              value={monthlyIncrease}
              onChange={(e) => setMonthlyIncrease(e.target.value)}
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proyección (meses)
            </label>
            <select
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
              <option value="24">24 meses</option>
            </select>
          </div>
          <button
            onClick={calculate}
            className="w-full bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
          >
            Proyectar
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Proyección a {months} meses</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Precio proyectado</p>
                <p className="text-2xl font-bold text-brand-500">{formatPrice(result.futurePrice)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Diferencia</p>
                <p className="text-2xl font-bold text-green-600">+{formatPrice(result.difference)}</p>
              </div>
              <p className="text-sm text-gray-500">
                * Esta es una proyección estimada basada en el porcentaje de aumento indicado. Los valores reales pueden variar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
