import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Save, Key } from 'lucide-react';
import api from '../../services/api';
import { User as UserType, Organization, ApiResponse } from '@devnfw/shared';
import { useOrg } from '../../contexts/OrgContext';
import CustomSelect from '../ui/CustomSelect';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserType | null;
  onSuccess: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
  const { currentOrg } = useOrg();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user' | 'owner',
    organization_id: '',
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await api.get<ApiResponse<Organization[]>>('/organizations');
        if (response.success) {
          setOrganizations(response.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch organizations', err);
      }
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'user',
        organization_id: user.organization_id || currentOrg?.id || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        organization_id: currentOrg?.id || '',
      });
    }
  }, [user, isOpen, currentOrg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (user) {
        const payload: any = { ...formData };
        if (!payload.password) {
          delete payload.password;
        }
        await api.put(`/users/${user.id}`, payload);
      } else {
        if (!formData.password) {
          setError('Senha é obrigatória para novos usuários');
          setLoading(false);
          return;
        }
        await api.post('/users', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.error || err.message || 'Erro ao salvar usuário');
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
            className="relative w-full max-w-xl glass rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tighter">
                    {user ? 'Editar' : 'Novo'} <span className="text-primary">Usuário</span>
                  </h3>
                  <p className="text-[10px] font-black tracking-[0.2em] text-foreground/100">Gerenciamento de Acesso</p>
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

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black tracking-widest text-center">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="name" className="text-[10px] font-black text-foreground/30 tracking-[0.3em] ml-2">Nome Completo</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold tracking-tight text-white focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="email" className="text-[10px] font-black text-foreground/30 tracking-[0.3em] ml-2">Email Corporativo</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold tracking-tight text-white focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    placeholder="Ex: joao@empresa.com"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="password" className="text-[10px] font-black text-foreground/30 tracking-[0.3em] ml-2">
                    Senha {user ? '(deixe em branco para manter)' : ''}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      required={!user}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold tracking-tight text-white focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      placeholder={user ? '••••••••' : 'Mínimo 6 caracteres'}
                    />
                    <Key size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-foreground/20" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="organization_id" className="text-[10px] font-black text-foreground/30 tracking-[0.3em] ml-2">Organização</label>
                  <CustomSelect
                    options={organizations.map(org => ({ id: org.id, label: org.name }))}
                    value={formData.organization_id}
                    onChange={(val) => setFormData(prev => ({ ...prev, organization_id: val }))}
                    placeholder="Selecione uma organização"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="role" className="text-[10px] font-black text-foreground/30 tracking-[0.3em] ml-2">Nível de Acesso</label>
                  <CustomSelect
                    options={[
                      { id: 'user', label: 'USER' },
                      { id: 'admin', label: 'ADMIN' },
                      { id: 'owner', label: 'OWNER' }
                    ]}
                    value={formData.role}
                    onChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
                    searchable={false}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 rounded-2xl border border-white/5 text-[10px] font-black tracking-widest text-foreground/100 hover:text-white hover:bg-white/[0.02] transition-all"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-5 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black tracking-widest hover:brightness-110 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]"
                >
                  <Save size={14} />
                  {loading ? 'SALVANDO...' : 'CONFIRMAR_DADOS'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserFormModal;
