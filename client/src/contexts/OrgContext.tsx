import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization } from '@devnfw/shared';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { SessionManager } from '../services/sessionManager';

interface OrgContextType {
    currentOrg: Organization | null;
    organizations: Organization[];
    setOrganization: (id: string) => void;
    loadOrganizations: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

/**
 * Organization Provider
 * 
 * Manages multi-tenancy state on the client.
 * Depends on AuthContext to know when to fetch organization data.
 */
const MOCK_ORGS: Organization[] = [
    {
        id: 'org-1',
        name: 'Devonno Cloud Inc',
        slug: 'devonno-cloud',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'org-2',
        name: 'Acme Corp Prototype',
        slug: 'acme-proto',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export function OrgProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadOrganizations();
        } else {
            setOrganizations([]);
            setCurrentOrg(null);
        }
    }, [isAuthenticated]);

    const loadOrganizations = async () => {
        setLoading(true);
        try {
            // Tentar carregar da API via serviço centralizado
            const response = await api.get('/organizations');
            if (response.success && response.data) {
                setOrganizations(response.data);
                
                const savedOrgId = SessionManager.getOrgId();
                const current = response.data.find((o: Organization) => o.id === savedOrgId) || response.data[0];
                
                if (current) {
                    setCurrentOrg(current);
                    SessionManager.setOrgId(current.id);
                }
            } else {
                // Fallback para mock se falhar ou estiver em dev
                setOrganizations(MOCK_ORGS);
                const savedOrgId = SessionManager.getOrgId();
                const lastOrg = MOCK_ORGS.find(o => o.id === savedOrgId) || MOCK_ORGS[0];
                setCurrentOrg(lastOrg);
                if (lastOrg) SessionManager.setOrgId(lastOrg.id);
            }
        } catch (err) {
            console.error('Erro ao carregar organizações:', err);
            setOrganizations(MOCK_ORGS);
            const savedOrgId = SessionManager.getOrgId();
            const lastOrg = MOCK_ORGS.find(o => o.id === savedOrgId) || MOCK_ORGS[0];
            setCurrentOrg(lastOrg);
            if (lastOrg) SessionManager.setOrgId(lastOrg.id);
        } finally {
            setLoading(false);
        }
    };

    const setOrganization = (id: string) => {
        const org = organizations.find(o => o.id === id);
        if (org) {
            setCurrentOrg(org);
            SessionManager.setOrgId(id);
        }
    };

    return (
        <OrgContext.Provider value={{ 
            currentOrg, 
            organizations, 
            setOrganization, 
            loadOrganizations,
            loading,
            error 
        }}>
            {children}
        </OrgContext.Provider>
    );
}

export const useOrg = () => {
    const context = useContext(OrgContext);
    if (!context) throw new Error('useOrg must be used within OrgProvider');
    return context;
};
