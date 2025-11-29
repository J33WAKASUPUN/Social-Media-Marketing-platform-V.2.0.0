import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization } from '@/types';
import { organizationApi } from '@/services/organizationApi';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/api';
import { useAuth } from './AuthContext';

// Extended Organization type with role
interface OrganizationWithRole extends Organization {
  role?: 'owner' | 'manager' | 'editor' | 'viewer';
  permissions?: string[];
}

interface OrganizationContextType {
  organizations: OrganizationWithRole[];
  currentOrganization: OrganizationWithRole | null;
  setCurrentOrganization: (org: OrganizationWithRole | null) => void;
  loading: boolean;
  refreshOrganizations: () => Promise<void>;
  createOrganization: (data: { name: string; description?: string; logo?: string }) => Promise<Organization | null>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [currentOrganization, setCurrentOrganizationState] = useState<OrganizationWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchOrganizations = async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setOrganizations([]);
      setCurrentOrganizationState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await organizationApi.getAll();
      const orgs = (response.data || []) as OrganizationWithRole[];
      setOrganizations(orgs);

      // Store roles for each organization in localStorage for usePermissions hook
      orgs.forEach((org) => {
        if (org.role) {
          localStorage.setItem(`org_${org._id}_role`, org.role);
        }
      });

      // Set current organization from localStorage or first available
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      if (savedOrgId) {
        const savedOrg = orgs.find((o) => o._id === savedOrgId);
        if (savedOrg) {
          setCurrentOrganizationState(savedOrg);
        } else if (orgs.length > 0) {
          setCurrentOrganizationState(orgs[0]);
          localStorage.setItem('currentOrganizationId', orgs[0]._id);
        }
      } else if (orgs.length > 0) {
        setCurrentOrganizationState(orgs[0]);
        localStorage.setItem('currentOrganizationId', orgs[0]._id);
      }
    } catch (error: any) {
      // Don't show error for 401 (unauthorized) - user might not be logged in yet
      if (error.response?.status !== 401) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: handleApiError(error),
        });
      }
      setOrganizations([]);
      setCurrentOrganizationState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth to finish loading before fetching organizations
    if (!authLoading) {
      fetchOrganizations();
    }
  }, [isAuthenticated, authLoading]);

  const setCurrentOrganization = (org: OrganizationWithRole | null) => {
    setCurrentOrganizationState(org);
    if (org) {
      localStorage.setItem('currentOrganizationId', org._id);
      // Also update the role in localStorage
      if (org.role) {
        localStorage.setItem(`org_${org._id}_role`, org.role);
      }
    } else {
      localStorage.removeItem('currentOrganizationId');
    }
  };

  const createOrganization = async (data: { name: string; description?: string; logo?: string }) => {
    try {
      const response = await organizationApi.create(data);
      await fetchOrganizations();
      toast({
        title: 'Success',
        description: 'Organization created successfully',
      });
      return response.data;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: handleApiError(error),
      });
      return null;
    }
  };

  const updateOrganization = async (id: string, data: Partial<Organization>) => {
    try {
      await organizationApi.update(id, data);
      await fetchOrganizations();
      toast({
        title: 'Success',
        description: 'Organization updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: handleApiError(error),
      });
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      await organizationApi.delete(id);
      // Clear role from localStorage
      localStorage.removeItem(`org_${id}_role`);
      await fetchOrganizations();
      toast({
        title: 'Success',
        description: 'Organization deleted successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: handleApiError(error),
      });
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        setCurrentOrganization,
        loading,
        refreshOrganizations: fetchOrganizations,
        createOrganization,
        updateOrganization,
        deleteOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};