/**
 * Utilitário para compartilhamento de sessão entre aplicações
 */
export interface UserSession {
  id: string;
  email: string;
  fullName?: string;
  name?: string;
  role?: 'admin' | 'user';
  isApproved?: boolean;
  user_metadata?: unknown; //Metadados para supabase
};

export interface SharedSession {
  access_token: string;
  refresh_token: string;
  user: UserSession;
  timestamp?: number;
  expires_at: number;

}

export class SessionManager {

  private static readonly STORAGE_KEY = 'auth_session';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Salva a sessão atual no localStorage para compartilhamento
   */
  static saveSession(user: UserSession, token: string, refresh_token: string): void {
    const session: SharedSession = {
      access_token: token,
      refresh_token: refresh_token,
      user,
      timestamp: Date.now(),
      expires_at: Date.now() + this.SESSION_DURATION
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

    // Notificar outras abas sobre a mudança de sessão
    this.broadcastSessionChange(session);
  }

  /**
   * Recupera a sessão compartilhada do localStorage
   */
  static getSharedSession(): SharedSession | null {
    try {

      const sessionData = localStorage.getItem(this.STORAGE_KEY);
      if (!sessionData) {
        return null;
      }

      const session: SharedSession = JSON.parse(sessionData);

      // Verificar se a sessão não expirou
      if (Date.now() > session.expires_at * 1000) {
        this.clearSession();
        return null;
      }
      return session;

    } catch (error) {
      console.error('❌ Erro ao recuperar sessão compartilhada:', error);
      return null;
    }
  }

  /**
   * Limpa a sessão compartilhada
   */
  static clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.broadcastSessionChange(null);
  }

  /**
   * Verifica se há uma sessão válida compartilhada
   */
  static hasValidSession(): boolean {
    return this.getSharedSession() !== null;
  }

  /**
   * Converte sessão compartilhada para formato Supabase
   */
  static convertToSupabaseSession(session: SharedSession): SharedSession {
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: {
        id: session.user.id,
        email: session.user.email,
        user_metadata: session.user.user_metadata
      },
      expires_at: Math.floor(session.expires_at / 1000)
    };
  }

  /**
   * Notifica outras abas sobre mudanças na sessão
   */
  private static broadcastSessionChange(session: SharedSession | null): void {
    try {
      // Usar BroadcastChannel se disponível (navegadores modernos)
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel(this.STORAGE_KEY);
        channel.postMessage({
          type: 'SESSION_CHANGE',
          session
        });
        channel.close();
      }

      // Fallback: usar localStorage event (para navegadores mais antigos)
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.STORAGE_KEY,
        newValue: session ? JSON.stringify(session) : null,
        oldValue: localStorage.getItem(this.STORAGE_KEY),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Erro ao notificar mudança de sessão:', error);
    }
  }

  /**
   * Escuta mudanças de sessão de outras abas
   */
  static onSessionChange(callback: (session: SharedSession | null) => void): () => void {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === this.STORAGE_KEY) {
        const session = event.newValue ? JSON.parse(event.newValue) : null;
        callback(session);
      }
    };

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'SESSION_CHANGE') {
        callback(event.data.session);
      }
    };

    // Escutar eventos de storage
    window.addEventListener('storage', handleStorageChange);

    // Escutar BroadcastChannel se disponível
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel(this.STORAGE_KEY);
      broadcastChannel.addEventListener('message', handleBroadcast);
    }

    // Retornar função de cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }

  /**
   * Obtém o token atual da sessão compartilhada
   * Centraliza o acesso ao token em todo o sistema
   */
  static getToken(): string | null {
    const session = this.getSharedSession();
    return session?.access_token || null;
  }

  /**
   * Obtém o refresh token atual da sessão compartilhada
   */
  static getRefreshToken(): string | null {
    const session = this.getSharedSession();
    return session?.refresh_token || null;
  }

  /**
   * Obtém os dados do usuário atual
   */
  static getUser(): UserSession | null {
    const session = this.getSharedSession();
    return session?.user || null;
  }

  /**
   * Obtém o ID da organização atual
   */
  static getOrgId(): string | null {
    return localStorage.getItem('org_id');
  }

  /**
   * Define o ID da organização atual
   */
  static setOrgId(orgId: string): void {
    localStorage.setItem('org_id', orgId);
    // Notificar mudança para atualizar componentes
    window.dispatchEvent(new Event('org_id_changed'));
  }

  /**
   * Remove o ID da organização atual
   */
  static removeOrgId(): void {
    localStorage.removeItem('org_id');
    window.dispatchEvent(new Event('org_id_changed'));
  }

  /**
   * Obtém o ID do contribuinte (taxpayer) atual
   */
  static getTaxpayerId(): string | null {
    return localStorage.getItem('taxpayer_id');
  }

  /**
   * Define o ID do contribuinte atual
   */
  static setTaxpayerId(taxpayerId: string): void {
    localStorage.setItem('taxpayer_id', taxpayerId);
  }

  /**
   * Obtém o ambiente atual (trial/production)
   */
  static getEnvironment(): 'trial' | 'production' {
    return (localStorage.getItem('serpro_environment') as 'trial' | 'production') || 'production';
  }

  /**
   * Define o ambiente atual
   */
  static setEnvironment(env: 'trial' | 'production'): void {
    localStorage.setItem('serpro_environment', env);
  }
}
