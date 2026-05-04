import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/users/forgot-password', { email });
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tighter">
                    Recuperar <span className="text-accent">Senha</span>
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/100">Redefinição de Acesso</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                title="Fechar"
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-foreground/100 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <CheckCircle size={14} />
                  Email de recuperação enviado! Verifique sua caixa de entrada.
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="resetEmail" className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Email Cadastrado</label>
                  <input
                    id="resetEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold tracking-tight text-white focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none"
                    placeholder="seu@email.com"
                    disabled={success}
                  />
                </div>

                <p className="text-[10px] font-bold text-foreground/100 uppercase tracking-wider text-center">
                  Enviaremos um link de recuperação para este email
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-5 glass text-[10px] font-black uppercase tracking-widest text-white rounded-2xl hover:bg-white/10 transition-all"
                >
                  {success ? 'Fechar' : 'Cancelar'}
                </button>
                {!success && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-5 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,0,255,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        Enviar Link
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PasswordResetModal;
