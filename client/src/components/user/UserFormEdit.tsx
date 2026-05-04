import React, { useEffect, useMemo, useState } from 'react';
import { Key, Save, User as UserIcon, X } from 'lucide-react';
import { ApiResponse, Organization, User as UserType } from '@devnfw/shared';
import api from '../../services/api';
import { useOrg } from '../../contexts/OrgContext';
import Button from '../ui/Button';
import CustomSelect from '../ui/CustomSelect';
import FormEdit from '../ui/FormEdit';

interface UserFormEditProps {
  user?: UserType | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const UserFormEdit: React.FC<UserFormEditProps> = ({ user, onCancel, onSuccess }) => {
  const { currentOrg } = useOrg();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user' | 'owner',
    organization_id: '',
  });

  const title = useMemo(() => {
    return (
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 border border-border-strong bg-panel-bg flex items-center justify-center">
          <UserIcon size={16} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-black tracking-widest text-foreground truncate">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </div>
          <div className="text-[9px] font-black tracking-widest text-foreground/100 truncate">
            ACCESS_ADMINISTRATION
          </div>
        </div>
      </div>
    );
  }, [user]);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await api.get<ApiResponse<Organization[]>>('/organizations');
        if (response.success) {
          setOrganizations(response.data || []);
        }
      } catch {
        setOrganizations([]);
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
      setError(null);
      return;
    }

    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      organization_id: currentOrg?.id || '',
    });
    setError(null);
  }, [user, currentOrg]);

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
    } catch (err: any) {
      setError(err.error || err.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full">
      <FormEdit
        title={title}
        actions={
          <>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              CANCELAR
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              <Save size={14} />
              {user ? 'SALVAR' : 'CRIAR'}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black tracking-widest text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-[9px] font-black text-foreground/100 tracking-widest block">
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-background border border-border-strong px-3 py-2.5 text-[10px] font-bold text-foreground tracking-widest focus:border-primary outline-none"
              placeholder="Ex: João Silva"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-[9px] font-black text-foreground/100 tracking-widest block">
              Email Corporativo
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full bg-background border border-border-strong px-3 py-2.5 text-[10px] font-bold text-foreground tracking-widest focus:border-primary outline-none"
              placeholder="Ex: joao@empresa.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[9px] font-black text-foreground/100 tracking-widest block">
              Senha {user ? '(Opcional)' : '(Obrigatória)'}
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                required={!user}
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full bg-background border border-border-strong px-3 py-2.5 text-[10px] font-bold text-foreground tracking-widest focus:border-primary outline-none pr-10"
                placeholder={user ? '••••••••' : 'Mínimo 6 caracteres'}
              />
              <Key size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="organization_id" className="text-[9px] font-black text-foreground/100 tracking-widest block">
              Organização
            </label>
            <CustomSelect
              options={organizations.map(org => ({ id: org.id, label: org.name }))}
              value={formData.organization_id}
              onChange={(val) => setFormData(prev => ({ ...prev, organization_id: val }))}
              placeholder="Selecione uma organização"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-[9px] font-black text-foreground/100 tracking-widest block">
              Nível de Acesso
            </label>
            <CustomSelect
              options={[
                { id: 'user', label: 'USER' },
                { id: 'admin', label: 'ADMIN' },
                { id: 'owner', label: 'OWNER' }
              ]}
              value={formData.role}
              onChange={(val) => setFormData(prev => ({ ...prev, role: val as any }))}
              searchable={false}
            />
          </div>
        </div>
      </FormEdit>
    </form>
  );
};

export default UserFormEdit;
