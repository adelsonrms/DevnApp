import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TechFrame from '../../components/ui/TechFrame';
import NavbarBrand from '../../components/layout/parts/NavbarBrand';
import Footer from '../../components/layout/parts/Footer';

/**
 * LoginPage Component
 * 
 * High-end visual identity for the authentication flow.
 * Standardized with the Tech-Industrial aesthetic.
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Credenciais inválidas. Tente novamente.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao entrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="login-layout" className="flex flex-col h-screen bg-background overflow-hidden font-sans transition-colors">
      {/* Standardized Header (Simplified) */}
      <header id="login-header" className="flex-none z-50 border-b border-border-strong bg-panel-bg h-14 flex items-center">
        <NavbarBrand />
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-background">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
        
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 z-10">
          <TechFrame id="login-frame" className="w-full">
            <div className="p-10 space-y-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-white uppercase leading-none">
                  LOGIN_<span className="text-secondary">SECURE</span>
                </h2>
                <p className="text-white/30 text-[9px] font-black tracking-[0.4em] uppercase">DevnApp_System_Auth_Node</p>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border-2 border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest animate-in fade-in">
                  CRITICAL_ERROR: {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black tracking-[0.3em] uppercase text-white/40 ml-1">USER_IDENTITY</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="EMAIL@DOMAIN.COM"
                    className="w-full px-5 py-4 bg-background border-2 border-border-strong text-white placeholder:text-white/10 focus:outline-none focus:border-secondary transition-all text-xs font-bold uppercase tracking-widest"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black tracking-[0.3em] uppercase text-white/40 ml-1">ACCESS_KEY</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-5 py-4 bg-background border-2 border-border-strong text-white placeholder:text-white/10 focus:outline-none focus:border-secondary transition-all text-xs font-bold"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 bg-secondary text-black font-black uppercase tracking-widest text-[10px] border-2 border-black hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "PROCESSING_HANDSHAKE..." : "ESTABLISH_SESSION"}
                  </button>
                </div>
              </form>

              <div className="pt-8 border-t-2 border-border-strong text-center">
                <button 
                  onClick={() => navigate('/')}
                  className="text-white/20 hover:text-white text-[9px] font-black uppercase tracking-[0.4em] transition-all"
                >
                  &larr; RETURN_TO_ECOSYSTEM
                </button>
              </div>
            </div>
          </TechFrame>
        </div>
      </main>

      {/* Standardized Footer */}
      <footer id="login-footer" className="flex-none z-50 border-t border-border-strong">
        <Footer />
      </footer>
    </div>
  );
};

export default LoginPage;
