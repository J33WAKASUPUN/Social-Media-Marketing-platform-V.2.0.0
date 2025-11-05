import React from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const OrganizationSelector: React.FC = () => {
  const { organizations, currentOrganization, setCurrentOrganization, loading } = useOrganization();

  if (loading) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  if (organizations.length === 0) {
    return null;
  }

  return (
    <Select
      value={currentOrganization?._id || ''}
      onValueChange={(value) => {
        const org = organizations.find(o => o._id === value);
        setCurrentOrganization(org || null);
      }}
    >
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <SelectValue placeholder="Select organization" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org._id} value={org._id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};