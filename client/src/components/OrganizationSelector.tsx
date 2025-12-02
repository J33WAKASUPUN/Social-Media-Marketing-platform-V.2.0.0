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
      <SelectTrigger className="w-[240px] bg-background hover:bg-accent h-auto py-2 focus:ring-0 focus:ring-offset-0">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-md shrink-0">
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 text-left min-w-0">
            {currentOrganization ? (
              <>
                <div className="text-sm font-medium text-foreground truncate">
                  {currentOrganization.name}
                </div>
                {/* {currentOrganization.role && (
                  <div className="text-xs text-muted-foreground capitalize">
                    ({currentOrganization.role})
                  </div>
                )} */}
              </>
            ) : (
              <SelectValue placeholder="Select organization" />
            )}
          </div>
        </div>
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem 
            key={org._id} 
            value={org._id}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-md">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">{org.name}</span>
                {org.role && (
                  <span className="text-xs text-muted-foreground capitalize ml-2">
                    ({org.role})
                  </span>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};