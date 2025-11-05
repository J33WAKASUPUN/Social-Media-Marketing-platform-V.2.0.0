import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization } from '@/types';
import { organizationApi } from '@/services/organizationApi';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/api';
import { useAuth } from './AuthContext';

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  loading: boolean;
  refreshOrganizations: () => Promise<void>;
  createOrganization: (data: { name: string; description?: string; logo?: string }) => Promise<Organization | null>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
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
      setOrganizations(response.data);

      // Set current organization from localStorage or first available
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      if (savedOrgId) {
        const savedOrg = response.data.find(org => org._id === savedOrgId);
        if (savedOrg) {
          setCurrentOrganizationState(savedOrg);
        } else if (response.data.length > 0) {
          setCurrentOrganizationState(response.data[0]);
        }
      } else if (response.data.length > 0) {
        setCurrentOrganizationState(response.data[0]);
      }
    } catch (error) {
      // Don't show error toast on 401 (handled by interceptor)
      if (!error.response || error.response.status !== 401) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: handleApiError(error),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when auth is done loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchOrganizations();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const setCurrentOrganization = (org: Organization | null) => {
    setCurrentOrganizationState(org);
    if (org) {
      localStorage.setItem('currentOrganizationId', org._id);
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