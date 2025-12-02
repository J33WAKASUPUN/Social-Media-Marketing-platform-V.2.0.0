import React from 'react';
import { useBrand } from '@/contexts/BrandContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const BrandSelector: React.FC = () => {
  const { brands, currentBrand, setCurrentBrand, loading } = useBrand();

  if (loading) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <Select
      value={currentBrand?._id || ''}
      onValueChange={(value) => {
        const brand = brands.find(b => b._id === value);
        setCurrentBrand(brand || null);
      }}
    >
      <SelectTrigger className="w-[240px] bg-background hover:bg-accent h-auto py-2 focus:ring-0 focus:ring-offset-0">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-md shrink-0">
            <Tag className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 text-left min-w-0">
            {currentBrand ? (
              <div className="text-sm font-medium text-foreground truncate">
                {currentBrand.name}
              </div>
            ) : (
              <SelectValue placeholder="Select brand" />
            )}
          </div>
        </div>
      </SelectTrigger>
      <SelectContent>
        {brands.map((brand) => (
          <SelectItem 
            key={brand._id} 
            value={brand._id}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-md">
                <Tag className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{brand.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};