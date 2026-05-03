import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization } from '@devnfw/shared';
import api from '../services/api';
import { useAuth } from './AuthContext';

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
        
        // DEMONSTRATION MODE: Injecting mock organizations bypassing backend
        setOrganizations(MOCK_ORGS);
        
        const savedOrgId = localStorage.getItem('devnapp:org_id');
        const lastOrg = MOCK_ORGS.find(o => o.id === savedOrgId);
        
        if (lastOrg) {
            setCurrentOrg(lastOrg);
        } else {
            setCurrentOrg(MOCK_ORGS[0]);
        }
        
        setLoading(false);
    };

    const setOrganization = (id: string) => {
        const org = organizations.find(o => o.id === id);
        if (org) {
            setCurrentOrg(org);
            localStorage.setItem('devnapp:org_id', id);
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
