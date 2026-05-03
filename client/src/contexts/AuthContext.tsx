import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ApiResponse } from '@devnfw/shared';
import api from '../services/api';

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
const MOCK_USER: User = {
    id: 'demo-user-123',
    name: 'Demonstração',
    email: 'demo@devnfw.io',
    role: 'owner',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Initialized with mock data for demonstration
    const [user, setUser] = useState<User | null>(MOCK_USER);
    const [token, setToken] = useState<string | null>('demo-token-123');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            // DEMO MODE: bypassing token validation via API
            if (token && token !== 'demo-token-123') {
                try {
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        setUser(response.data.data);
                    }
                } catch (error) {
                    console.error('[Auth] Failed to load user', error);
                    logout();
                }
            }
            setLoading(false);
        }
        loadUser();
    }, [token]);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const { user, token } = response.data.data;
                setToken(token);
                setUser(user);
                localStorage.setItem('devnapp:token', token);
            }
            return response.data;
        } catch (error: any) {
            return error.response?.data || { success: false, error: 'Erro na conexão' };
        }
    };

    const register = async (data: any) => {
        try {
            const response = await api.post('/auth/register', data);
            if (response.data.success) {
                 const { user, token } = response.data.data;
                 setToken(token);
                 setUser(user);
                 localStorage.setItem('devnapp:token', token);
            }
            return response.data;
        } catch (error: any) {
            return error.response?.data || { success: false, error: 'Erro na conexão' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('devnapp:token');
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
