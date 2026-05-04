import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ApiResponse } from '@devnfw/shared';
import { api } from '../services/api';
import { SessionManager } from '../services/sessionManager';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, pass: string) => Promise<ApiResponse<{user: User, token: string}>>;
    register: (data: any) => Promise<ApiResponse<{user: User, token: string}>>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider
 * 
 * Manages the global authentication state, tokens, and 
 * user profile information.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => SessionManager.getUser() as any);
    const [token, setToken] = useState<string | null>(() => SessionManager.getToken());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Escutar mudanças de sessão (outras abas ou logout)
        const unsubscribe = SessionManager.onSessionChange((session) => {
            if (session) {
                setToken(session.access_token);
                setUser(session.user as any);
            } else {
                setToken(null);
                setUser(null);
            }
        });

        // Verificar sessão inicial
        const session = SessionManager.getSharedSession();
        if (session) {
            setToken(session.access_token);
            setUser(session.user as any);
        }
        
        setLoading(false);

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.success && response.data) {
                const { user, token, refresh_token } = response.data;
                SessionManager.saveSession(user, token, refresh_token);
                setToken(token);
                setUser(user);
            }
            return response;
        } catch (error: any) {
            return { success: false, error: error.message || 'Erro na conexão' };
        }
    };

    const register = async (data: any) => {
        try {
            const response = await api.post('/auth/register', data);
            if (response.success && response.data) {
                 const { user, token, refresh_token } = response.data;
                 SessionManager.saveSession(user, token, refresh_token);
                 setToken(token);
                 setUser(user);
            }
            return response;
        } catch (error: any) {
            return { success: false, error: error.message || 'Erro na conexão' };
        }
    };

    const logout = () => {
        SessionManager.clearSession();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            login, 
            register, 
            logout, 
            isAuthenticated: !!token, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
