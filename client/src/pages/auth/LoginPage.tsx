import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TechFrame from '../../components/ui/TechFrame';
import Button from '../../components/ui/Button';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans relative overflow-hidden tech-grid">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[400px] z-10 animate-in fade-in zoom-in duration-500">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-secondary/10 border-2 border-secondary flex items-center justify-center mb-4 rotate-45">
            <div className="-rotate-45">
              <div className="w-6 h-6 border-2 border-secondary/40 flex items-center justify-center">
                <div className="w-2 h-2 bg-secondary animate-pulse" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">
            DEVN<span className="text-secondary">APP</span>
          </h1>
          <div className="h-[2px] w-12 bg-border-strong mt-2" />
        </div>

        <TechFrame id="login-frame">
          <div className="p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tight text-white uppercase leading-none">
                AUTHENTICATE<span className="text-secondary">_SESSION</span>
              </h2>
              <p className="text-[9px] font-black tracking-[0.4em] text-white/20 uppercase">Protocol: Secure_Handshake_v2</p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border-l-4 border-destructive text-destructive text-[10px] font-black uppercase tracking-wider animate-in slide-in-from-left-2">
                CRITICAL_AUTH_FAILURE: {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 group">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[9px] font-black tracking-[0.2em] uppercase text-white/40 group-focus-within:text-secondary transition-colors">USER_IDENTITY</label>
                  <span className="text-[8px] font-mono text-white/10">[Required]</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full px-4 py-3 bg-background/50 border border-border-strong text-white placeholder:text-white/10 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all text-xs font-bold tracking-wider"
                  />
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[9px] font-black tracking-[0.2em] uppercase text-white/40 group-focus-within:text-secondary transition-colors">ACCESS_KEY</label>
                  <span className="text-[8px] font-mono text-white/10">[Encrypted]</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 bg-background/50 border border-border-strong text-white placeholder:text-white/10 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all text-xs font-bold"
                  />
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-secondary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full group overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? 'ESTABLISHING...' : 'ESTABLISH_SESSION'}
                    {!isSubmitting && <div className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                </Button>
              </div>
            </form>

            <div className="pt-6 border-t border-border-strong/50 flex justify-center">
              <button
                onClick={() => navigate('/')}
                className="text-white/20 hover:text-secondary text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2"
              >
                <span className="text-lg leading-none">«</span> RETURN_TO_ECOSYSTEM
              </button>
            </div>
          </div>
        </TechFrame>

        <div className="mt-8 flex justify-between px-2">
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1 h-1 bg-white/10" />
            ))}
          </div>
          <p className="text-[8px] font-mono text-white/10 tracking-widest">SECURE_AUTH_LAYER_V2.0.4</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
