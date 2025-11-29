import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Brand } from '@/types';
import { brandApi } from '@/services/brandApi';
import { useOrganization } from './OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/api';

interface BrandContextType {
  brands: Brand[];
  currentBrand: Brand | null;
  setCurrentBrand: (brand: Brand | null) => void;
  loading: boolean;
  refreshBrands: () => Promise<void>;
  createBrand: (data: { name: string; description?: string; logo?: string; website?: string }) => Promise<Brand | null>;
  updateBrand: (id: string, data: Partial<Brand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentBrand, setCurrentBrandState] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();

  const fetchBrands = async () => {
    if (!currentOrganization) {
      setBrands([]);
      setCurrentBrandState(null);
      return;
    }

    try {
      setLoading(true);
      const response = await brandApi.getAll(currentOrganization._id);
      
      // Filter valid brands
      const validBrands = (response.data || []).filter(
        (brand: Brand) => brand && brand._id
      );
      
      setBrands(validBrands);

      // Set current brand from localStorage or first available
      const savedBrandId = localStorage.getItem('currentBrandId');
      if (savedBrandId) {
        const savedBrand = validBrands.find((b: Brand) => b._id === savedBrandId);
        if (savedBrand) {
          setCurrentBrandState(savedBrand);
        } else if (validBrands.length > 0) {
          setCurrentBrandState(validBrands[0]);
        }
      } else if (validBrands.length > 0) {
        setCurrentBrandState(validBrands[0]);
      }
    } catch (error: any) {
      // Don't show error if user just doesn't have access yet
      if (error.response?.status !== 403) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load brands',
        });
      }
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [currentOrganization]);

  const setCurrentBrand = (brand: Brand | null) => {
    setCurrentBrandState(brand);
    if (brand) {
      localStorage.setItem('currentBrandId', brand._id);
    } else {
      localStorage.removeItem('currentBrandId');
    }
  };

  const createBrand = async (data: { name: string; description?: string; logo?: string; website?: string }) => {
    if (!currentOrganization) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an organization first',
      });
      return null;
    }

    try {
      const response = await brandApi.create(currentOrganization._id, data);
      await fetchBrands();
      toast({
        title: 'Success',
        description: 'Brand created successfully',
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

  const updateBrand = async (id: string, data: Partial<Brand>) => {
    try {
      await brandApi.update(id, data);
      await fetchBrands();
      toast({
        title: 'Success',
        description: 'Brand updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: handleApiError(error),
      });
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      await brandApi.delete(id);
      await fetchBrands();
      toast({
        title: 'Success',
        description: 'Brand deleted successfully',
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
    <BrandContext.Provider
      value={{
        brands,
        currentBrand,
        setCurrentBrand,
        loading,
        refreshBrands: fetchBrands,
        createBrand,
        updateBrand,
        deleteBrand,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};