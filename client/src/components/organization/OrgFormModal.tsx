import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Save } from 'lucide-react';
import api from '../../services/api';
import { Organization, ApiResponse } from '@devnfw/shared';

interface OrgFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  org?: Organization | null;
  onSuccess: () => void;
}

const OrgFormModal: React.FC<OrgFormModalProps> = ({ isOpen, onClose, org, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (org) {
      setFormData({
        name: org.name || '',
        slug: org.slug || '',
      });
    } else {
      setFormData({ name: '', slug: '' });
    }
  }, [org, isOpen]);

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: org ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 50)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (org) {
        await api.put(`/organizations/${org.id}`, formData);
      } else {
        await api.post('/organizations', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao salvar organização');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl glass rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tighter">
                    {org ? 'Editar' : 'Nova'} <span className="text-primary">Unidade</span>
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/100">Configuração de Negócio</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                title="Fechar"
                aria-label="Fechar"
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-foreground/100 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Field: Name */}
                <div className="space-y-3">
                  <label htmlFor="name" className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Nome da Unidade</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    placeholder="EX: DEVONNO TECNOLOGIA"
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold tracking-tight text-white focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  />
                </div>

                {/* Field: Slug */}
                <div className="space-y-3">
                  <label htmlFor="slug" className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Identificador Unique (SLUG)</label>
                  <div className="relative group">
                    <input
                      id="slug"
                      type="text"
                      required
                      value={formData.slug}
                      placeholder="devonno-tech"
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full bg-white/[0.01] border border-white/5 rounded-2xl py-5 px-6 text-xs font-mono text-secondary focus:outline-none focus:border-secondary/40 transition-all outline-none"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-bold text-foreground/20 uppercase">
                      .devnfw.io
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Footer */}
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
                  className="flex-[2] py-5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={16} />
                      Salvar Unidade
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

export default OrgFormModal;
