import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserPlus, Trash2, Search, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { Organization, User, ApiResponse } from '@devnfw/shared';

interface OrgMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  org: Organization | null;
}

const OrgMembersModal: React.FC<OrgMembersModalProps> = ({ isOpen, onClose, org }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingLoading, setAddingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && org) {
      loadMembers();
    }
  }, [isOpen, org]);

  const loadMembers = async () => {
    if (!org) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<User[]>>(`/api/organizations/${org.id}/members`);
      if (response.data.success) {
        setMembers(response.data.data || []);
      } else {
        setError(response.data.error || 'Erro ao carregar membros');
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org || !newMemberEmail) return;
    setAddingLoading(true);
    setError(null);
    try {
      const response = await api.post(`/api/organizations/${org.id}/members`, { email: newMemberEmail });
      if (response.data.success) {
        setMembers(prev => [...prev, response.data.data]);
        setNewMemberEmail('');
      } else {
        setError(response.data.error || 'Erro ao adicionar membro');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao adicionar membro');
    } finally {
      setAddingLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!org) return;
    if (!window.confirm('Deseja remover este usuário da unidade?')) return;
    
    try {
      await api.delete(`/api/organizations/${org.id}/members/${userId}`);
      setMembers(prev => prev.filter(m => m.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Erro ao remover membro');
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
            className="relative w-full max-w-2xl glass rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tighter">
                    Membros: <span className="text-secondary">{org?.name}</span>
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Gestão de Colaboradores</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                title="Fechar"
                aria-label="Fechar"
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-foreground/40 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* List & Content */}
            <div className="p-10 space-y-8">
              {/* Add Member Form */}
              <form onSubmit={handleAddMember} className="space-y-4">
                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Associar Novo Membro (E-mail)</label>
                <div className="flex gap-4">
                  <div className="relative group flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-secondary transition-colors" size={16} />
                    <input
                      type="email"
                      required
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="CONVITE@DEVNFW.IO"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-xs font-bold tracking-widest text-white focus:outline-none focus:border-secondary/40 focus:ring-4 focus:ring-secondary/5 transition-all outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addingLoading || !newMemberEmail}
                    className="px-8 bg-secondary text-secondary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_4px_15px_rgba(6,182,212,0.3)] flex items-center gap-3 disabled:opacity-30"
                  >
                    {addingLoading ? (
                      <div className="w-5 h-5 border-2 border-secondary-foreground/20 border-t-secondary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Vincular
                      </>
                    )}
                  </button>
                </div>
              </form>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                  {error}
                </div>
              )}

              {/* Members List */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {loading ? (
                   <div className="flex flex-col items-center gap-4 py-10 opacity-40">
                      <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary animate-pulse">Consultando</span>
                   </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                     <UserPlus size={48} />
                     <p className="text-[10px] font-black uppercase tracking-widest">Nenhum membro vinculado</p>
                  </div>
                ) : (
                  members.map((member) => (
                    <div 
                      key={member.id} 
                      className="glass p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden flex items-center justify-center bg-white/5 text-secondary font-black text-sm uppercase">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : member.name?.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                             {member.name}
                             {member.role === 'owner' && <UserCheck size={12} className="text-emerald-400" />}
                          </p>
                          <p className="text-[9px] font-medium text-foreground/40">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-foreground/40 uppercase border border-white/5">
                            {member.role}
                         </span>
                         <button 
                           onClick={() => handleRemoveMember(member.id)}
                           className="p-3 glass rounded-xl text-foreground/20 hover:text-destructive hover:border-destructive/20 transition-all opacity-0 group-hover:opacity-100"
                           title="Remover Membro"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-6 border-t border-white/5 bg-white/[0.01] text-center">
               <p className="text-[9px] font-medium text-foreground/30 uppercase tracking-[0.2em]">Total de {members.length} colaboradores habilitados</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrgMembersModal;
