import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Save, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose, userId, userName, onSuccess }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/users/${userId}/change-password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      onSuccess();
      onClose();
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tighter">
                    Alterar <span className="text-secondary">Senha</span>
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/100">{userName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
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

              <div className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="currentPassword" className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Senha Atual</label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold tracking-tight text-white focus:outline-none focus:border-secondary/40 focus:ring-4 focus:ring-secondary/5 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="newPassword" className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Nova Senha</label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold tracking-tight text-white focus:outline-none focus:border-secondary/40 focus:ring-4 focus:ring-secondary/5 transition-all outline-none"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="confirmPassword" className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Confirmar Nova Senha</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold tracking-tight text-white focus:outline-none focus:border-secondary/40 focus:ring-4 focus:ring-secondary/5 transition-all outline-none"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 glass text-[10px] font-black uppercase tracking-widest text-white rounded-2xl hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-5 bg-secondary text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,255,255,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={16} />
                      Alterar Senha
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PasswordChangeModal;
