import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOrg } from '../../contexts/OrgContext';
import api from '../../services/api';
import { User, ApiResponse } from '@devnfw/shared';
import { UserPlus, ShieldAlert, Edit2, Trash2, Key, Mail } from 'lucide-react';
import { SplitView } from '../../components/ui/SplitView';
import { DataTable, type DataTableAction, type DataTableColumn } from '../../components/ui/DataTable';
import UserFormEdit from '../../components/user/UserFormEdit';
import PasswordChangeModal from '../../components/user/PasswordChangeModal';
import PasswordResetModal from '../../components/user/PasswordResetModal';

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentOrg } = useOrg();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = currentOrg ? `/users?orgId=${currentOrg.id}` : '/users';
      const response = await api.get<ApiResponse<User[]>>(url);
      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError(response.error || 'Erro ao carregar usuários');
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      if (selectedUser?.id === id) {
        setSelectedUser(null);
        setIsEditOpen(false);
      }
    } catch (err: any) {
      alert('Erro ao excluir usuário: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setIsEditOpen(true);
  };

  const handlePasswordChange = (user: User) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordReset = () => {
    setIsResetModalOpen(true);
  };

  const columns = useMemo<DataTableColumn<User>[]>(() => {
    return [
      {
        header: 'Usuário Integrado',
        render: (user) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-background border-2 border-border-strong flex items-center justify-center text-secondary font-black text-[10px] uppercase overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                user.name.substring(0, 2)
              )}
            </div>
            <span className="text-xs font-black text-foreground uppercase tracking-wider">{user.name}</span>
          </div>
        ),
      },
      {
        header: 'Email Corporativo',
        render: (user) => <span className="text-xs font-bold text-foreground/60 uppercase">{user.email}</span>,
      },
      {
        header: 'Nível de Acesso',
        render: (user) => (
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' || user.role === 'owner' ? 'bg-secondary' : 'bg-primary'}`} />
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{user.role}</span>
          </div>
        ),
      },
    ];
  }, []);

  const actions = useMemo<DataTableAction<User>[]>(() => {
    return [
      {
        title: 'Alterar Senha',
        icon: Key,
        onClick: (user) => handlePasswordChange(user),
      },
      {
        title: 'Editar',
        icon: Edit2,
        onClick: (user) => handleEdit(user),
      },
      {
        title: 'Excluir',
        icon: Trash2,
        onClick: (user) => handleDelete(String(user.id)),
      },
    ];
  }, [handleDelete, handleEdit, handlePasswordChange]);

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-strong pb-6 shrink-0">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-foreground">Usuários_<span className="text-secondary">Gerenciamento</span></h2>  
          <p className="text-[10px] font-black tracking-widest text-foreground/100">
            Acesso Administrativo &middot; <span className="text-primary">{currentOrg?.name || 'Global'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePasswordReset}
            className="px-4 py-2 glass border border-border-strong text-[10px] font-black tracking-widest text-foreground/60 hover:text-foreground transition-all flex items-center gap-2"
          >
            <Mail size={14} />
            RECOVER
          </button>
          <button
            onClick={handleNewUser}
            className="px-4 py-2 bg-primary text-primary-foreground border border-black text-[10px] font-black tracking-widest hover:brightness-110 active:translate-y-0.5 transition-all flex items-center gap-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.2)]"
          >
            <UserPlus size={14} />
            Registrar Novo
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 border border-border-strong">
        <SplitView
          showRightPanel={isEditOpen}
          rightPanelWidth="48%"
          leftPanel={
            <div id="splitView-Left-DataTable-List" className="h-full flex flex-col p-1">
              <DataTable<User>
                data={users}
                enableSelection={true}
                columns={columns}
                actions={actions}
                actionsLayout="dropdown"
                isLoading={loading}
                error={error}
                onRefresh={fetchUsers}
                enableGlobalSearch
                globalSearchPlaceholder="Pesquisar..."
                onRowClick={(user) => handleEdit(user)}
                renderEmptyState={() => (
                  <div className="flex flex-col items-center gap-3 opacity-20 py-10">
                    <ShieldAlert size={40} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">NO_USERS_FOUND</span>
                  </div>
                )}
              />
            </div>
          }
          rightPanel={
            <div id="splitView-Right-UserFormEdit" className="h-full overflow-y-auto p-1">
            <UserFormEdit
              user={selectedUser}
              onCancel={() => setIsEditOpen(false)}
              onSuccess={() => {
                fetchUsers();
                setIsEditOpen(false);
              }}
            />
            </div>
          }
        />
      </div>

      {selectedUser && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          userId={selectedUser.id}
          userName={selectedUser.name}
          onSuccess={() => {
            alert('Senha alterada com sucesso!');
          }}
        />
      )}

      <PasswordResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};

export default UserListPage;
