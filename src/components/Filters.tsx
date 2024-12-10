import React from 'react';
import { MultiSelect } from './MultiSelect';
import type { CDCDataPoint } from '../types/cdc';
import { getAllCauses } from '../services/cdcApi';

interface FiltersProps {
  data: CDCDataPoint[];
  selectedCauses: string[];
  onCausesChange: (causes: string[]) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  data,
  selectedCauses,
  onCausesChange,
}) => {
  const causes = React.useMemo(() => getAllCauses(), []);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="w-full">
        <MultiSelect
          label="Causes of Death"
          options={causes}
          value={selectedCauses}
          onChange={onCausesChange}
          placeholder="Select causes..."
        />
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>
          {selectedCauses.length ? `Selected causes: ${selectedCauses.length}` : 'All causes'}
        </p>
      </div>
    </div>
  );
};