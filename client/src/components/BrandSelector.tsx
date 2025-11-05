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
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <SelectValue placeholder="Select brand" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {brands.map((brand) => (
          <SelectItem key={brand._id} value={brand._id}>
            {brand.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};