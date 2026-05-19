import { useState } from 'react';
import type { FilterState } from '@/components/features/shared/filter/BoxFilterModal';

const initialFilters: FilterState = {
  power: [],
  connection: [],
  health: [],
  grubLockStatus: [],
  restaurantAssigned: false,
  vehicleAssigned: false,
  ioniserOn: false,
  dualZoneOn: false,
  zone1Min: -20,
  zone1Max: 30,
  zone2Min: -20,
  zone2Max: 30,
};

export const useGrubPacsFilters = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const updateFilter = (filterType: keyof FilterState, value: FilterState[keyof FilterState]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return {
    filters,
    setFilters,
    resetFilters,
    updateFilter
  };
};

