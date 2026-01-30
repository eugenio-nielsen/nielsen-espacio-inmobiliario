import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-800 relative">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/80 to-brand-800/90" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/nielsen_-_espacio_inmobiliario.png"
              alt="Nielsen"
              className="h-12 w-auto brightness-0 invert"
            />
            <div>
              <span className="text-xl font-semibold text-white">Nielsen</span>
              <span className="block text-xs tracking-widest uppercase text-white/60">
                Espacio Inmobiliario
              </span>
            </div>
          </Link>

          <div className="max-w-md">
            <h2 className="font-serif text-4xl font-semibold text-white mb-6">
              Unite a Nielsen
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Crea tu cuenta y accede a las mejores herramientas para comprar,
              vender o valorar propiedades sin comisiones.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-accent-400" />
                </div>
                <span className="text-white/80">Sin comisiones inmobiliarias</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-accent-400" />
                </div>
                <span className="text-white/80">Informes de valor gratuitos</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-accent-400" />
                </div>
                <span className="text-white/80">Herramientas profesionales</span>
              </li>
            </ul>
          </div>

          <p className="text-white/50 text-sm">
            &copy; {new Date().getFullYear()} Nielsen | Espacio Inmobiliario
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-surface-secondary">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center space-x-3 mb-6">
              <img
                src="/nielsen_-_espacio_inmobiliario.png"
                alt="Nielsen"
                className="h-12 w-auto"
              />
              <div className="text-left">
                <span className="text-lg font-semibold text-content">Nielsen</span>
                <span className="block text-xs tracking-widest uppercase text-content-muted">
                  Espacio Inmobiliario
                </span>
              </div>
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="font-serif text-3xl font-semibold text-content mb-2">
              Crear cuenta
            </h1>
            <p className="text-content-muted">
              Completa tus datos para registrarte
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-elegant p-8 border border-gray-100">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-content mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-content-muted" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-surface-secondary"
                    placeholder="Juan Perez"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-content mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-content-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-surface-secondary"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-content mb-2">
                  Contrasena
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-content-muted" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-surface-secondary"
                    placeholder="Minimo 6 caracteres"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-content mb-2">
                  Confirmar contrasena
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-content-muted" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-surface-secondary"
                    placeholder="Repite tu contrasena"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 text-white py-4 rounded-lg font-semibold hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
              >
                <span>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</span>
                {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </div>

          <p className="text-center text-content-muted mt-8">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand-500 font-semibold hover:text-brand-600 transition-colors">
              Ingresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
