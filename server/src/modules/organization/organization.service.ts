import { RepositoryFactory } from '../../database/repository.factory';
import { IRepository, FindManyOptions } from '../../database/repository.interface';
import { Organization, User } from '@devnfw/shared';
import { userService } from '../user/user.service';
import { UserEntity } from '../auth/auth.repository.interface';

export class OrganizationService {
  private repository: IRepository<Organization>;

  constructor() {
    this.repository = RepositoryFactory.get<Organization>('organizations');
  }

  async create(data: Partial<Organization>): Promise<Organization> {
    const slug = this.generateSlug(data.name || '');
    return this.repository.create({
      ...data,
      slug
    });
  }

  async getAll(options?: FindManyOptions): Promise<Organization[]> {
    return this.repository.findMany(options);
  }

  async getById(id: string): Promise<Organization | null> {
    return this.repository.findById(id);
  }

  async getBySlug(slug: string): Promise<Organization | null> {
    const orgs = await this.repository.findMany({ filters: { slug } });
    return orgs.length > 0 ? orgs[0] : null;
  }

  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    if (data.name) {
      (data as any).slug = this.generateSlug(data.name);
    }
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    const members = await this.getMembers(id);
    if (members.length > 0) {
      throw new Error('Não é possível excluir organização com membros');
    }
    return this.repository.delete(id);
  }

  async getMembers(orgId: string): Promise<UserEntity[]> {
    return userService.findByOrganization(orgId);
  }

  async addMember(orgId: string, email: string): Promise<UserEntity> {
    const org = await this.getById(orgId);
    if (!org) {
      throw new Error('Organização não encontrada');
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      throw new Error('Usuário não localizado');
    }

    if (user.organization_id === orgId) {
      throw new Error('Usuário já é membro desta organização');
    }

    if (user.organization_id) {
      throw new Error('Usuário já pertence a outra organização');
    }

    return userService.update(user.id, { organization_id: orgId });
  }

  async removeMember(orgId: string, userId: string): Promise<UserEntity> {
    const user = await userService.findById(userId);
    if (!user || user.organization_id !== orgId) {
      throw new Error('Usuário não pertence a esta organização');
    }

    return userService.update(userId, { organization_id: undefined });
  }

  async countMembers(orgId: string): Promise<number> {
    const members = await this.getMembers(orgId);
    return members.length;
  }

  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    const timestamp = Date.now().toString(36);
    return `${baseSlug}-${timestamp}`;
  }
}

export const organizationService = new OrganizationService();
