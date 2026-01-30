import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, FileText, Calculator, BookOpen, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const headerBg = isHomePage && !isScrolled
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-md shadow-elegant';

  const textColor = isHomePage && !isScrolled
    ? 'text-white'
    : 'text-content';

  const logoFilter = isHomePage && !isScrolled
    ? 'brightness-0 invert'
    : '';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center group">
            <img
              src="/nielsen_espacio_inmobiliario.svg"
              alt="Nielsen Espacio Inmobiliario"
              className={`h-16 w-auto transition-all duration-300 ${logoFilter}`}
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-10">
            <NavLink to="/propiedades" icon={Home} isLight={isHomePage && !isScrolled}>
              Propiedades
            </NavLink>
            <NavLink to="/informe-valor" icon={FileText} isLight={isHomePage && !isScrolled}>
              Informe de Valor
            </NavLink>
            <NavLink to="/herramientas" icon={Calculator} isLight={isHomePage && !isScrolled}>
              Herramientas
            </NavLink>
            <NavLink to="/guias" icon={BookOpen} isLight={isHomePage && !isScrolled}>
              Guias
            </NavLink>
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 transition-colors duration-300 ${isHomePage && !isScrolled ? 'text-white hover:text-accent-300' : 'text-content hover:text-brand-500'}`}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">{profile?.full_name || 'Mi cuenta'}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className={`p-2 rounded-full transition-all duration-300 ${isHomePage && !isScrolled ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-content-muted hover:text-red-600 hover:bg-red-50'}`}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`font-medium transition-colors duration-300 ${isHomePage && !isScrolled ? 'text-white hover:text-accent-300' : 'text-content hover:text-brand-500'}`}
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  className={`px-6 py-2.5 rounded font-medium transition-all duration-300 ${isHomePage && !isScrolled ? 'bg-white text-brand-700 hover:bg-accent-100' : 'bg-brand-500 text-white hover:bg-brand-600'}`}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          <button
            className={`lg:hidden p-2 rounded transition-colors ${isHomePage && !isScrolled ? 'text-white' : 'text-content'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-100 bg-white rounded-b-2xl shadow-elegant-lg">
            <nav className="flex flex-col space-y-1 px-2">
              <MobileNavLink to="/propiedades" icon={Home} onClick={() => setIsMenuOpen(false)}>
                Propiedades
              </MobileNavLink>
              <MobileNavLink to="/informe-valor" icon={FileText} onClick={() => setIsMenuOpen(false)}>
                Informe de Valor
              </MobileNavLink>
              <MobileNavLink to="/herramientas" icon={Calculator} onClick={() => setIsMenuOpen(false)}>
                Herramientas
              </MobileNavLink>
              <MobileNavLink to="/guias" icon={BookOpen} onClick={() => setIsMenuOpen(false)}>
                Guias
              </MobileNavLink>

              <div className="pt-4 mt-4 border-t border-gray-100">
                {user ? (
                  <>
                    <MobileNavLink to="/dashboard" icon={User} onClick={() => setIsMenuOpen(false)}>
                      Mi cuenta
                    </MobileNavLink>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Cerrar sesion</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 px-4">
                    <Link
                      to="/login"
                      className="block w-full text-center py-3 text-content font-medium hover:text-brand-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Ingresar
                    </Link>
                    <Link
                      to="/registro"
                      className="block w-full text-center bg-brand-500 text-white py-3 rounded font-medium hover:bg-brand-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ to, icon: Icon, children, isLight }: { to: string; icon: typeof Home; children: React.ReactNode; isLight: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 font-medium transition-colors duration-300 ${isLight ? 'text-white/90 hover:text-white' : 'text-content-secondary hover:text-brand-500'}`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
}

function MobileNavLink({ to, icon: Icon, children, onClick }: { to: string; icon: typeof Home; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-content-secondary hover:text-brand-500 hover:bg-brand-50 transition-colors"
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{children}</span>
    </Link>
  );
}
