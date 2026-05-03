import React, { useState, useEffect } from 'react';
import { useOrg } from '../../contexts/OrgContext';
import api from '../../services/api';
import { User, ApiResponse } from '@devnfw/shared';
import { UserPlus, Search, ShieldAlert, Edit2, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

/**
 * UserListPage Component
 * 
 * Comprehensive management of system users.
 * Supports CRUD operations and organization-level filtering.
 */
const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentOrg } = useOrg();

  // Fetch users on load or when organization changes
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = currentOrg ? `/users?orgId=${currentOrg.id}` : '/users';
        const response = await api.get<ApiResponse<User[]>>(url);
        if (response.data.success) {
          setUsers(response.data.data || []);
        } else {
          setError(response.data.error || 'Erro ao carregar usuários');
        }
      } catch (err: any) {
        setError(err.message || 'Erro de conexão com o servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentOrg]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir usuário: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-strong pb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">USERS_<span className="text-secondary">MANAGEMENT</span></h2>
          <p className="text-[10px] font-black tracking-widest uppercase text-foreground/40">
            ACCESS_ADMINISTRATION &middot; <span className="text-primary">{currentOrg?.name || 'GLOBAL_SCOPE'}</span>
          </p>
        </div>

        <Button size="sm">
          <UserPlus size={14} />
          REGISTER_NEW
        </Button>
      </header>

      {/* Table Section */}
      <Card padded={false} className="overflow-hidden border border-border-strong">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-border-strong flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5">
           <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-foreground transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="SEARCH_BY_NAME_OR_EMAIL..." 
                className="w-full bg-background border border-border-strong py-2.5 pl-10 pr-4 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-secondary transition-all text-foreground"
              />
           </div>
           
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{users.length} RECORDS_FOUND</span>
           </div>
        </div>

        {/* The Actual Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-border-strong/30">
                <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-foreground">INTEGRATED_USER</th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-foreground">CORPORATE_EMAIL</th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-foreground">ACCESS_LEVEL</th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-foreground text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-strong/20">
              {loading ? (
                 <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                       <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-secondary/20 border-t-secondary animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-secondary">SYNCING_DATA</span>
                       </div>
                    </td>
                 </tr>
              ) : users.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                       <div className="flex flex-col items-center gap-3 opacity-20">
                          <ShieldAlert size={40} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground">NO_USERS_FOUND</span>
                       </div>
                    </td>
                 </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-background border-2 border-border-strong flex items-center justify-center text-secondary font-black text-[10px] uppercase overflow-hidden">
                          {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : user.name.substring(0, 2)}
                        </div>
                        <span className="text-xs font-black text-foreground uppercase tracking-wider">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-foreground/60 uppercase">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 ${
                        user.role === 'admin' ? 'bg-secondary text-black border-black' : 'bg-background text-foreground/40 border-border-strong'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                         <button 
                           title="EDIT"
                           className="p-2.5 bg-background border-2 border-border-strong text-foreground/40 hover:text-foreground hover:border-foreground transition-all active:translate-y-0.5"><Edit2 size={12} /></button>
                         <button 
                           title="DELETE"
                           onClick={() => handleDelete(user.id)}
                           className="p-2.5 bg-background border-2 border-border-strong text-foreground/40 hover:text-red-500 hover:border-red-500 transition-all active:translate-y-0.5"
                         ><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {error && (
        <Card variant="accent" className="p-3 text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
           CRITICAL_SYNC_ERROR &middot; {error}
        </Card>
      )}
    </div>
  );
};

export default UserListPage;
