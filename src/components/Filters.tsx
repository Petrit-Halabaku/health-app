import React from 'react';
import { MultiSelect } from './MultiSelect';
import type { CDCDataPoint } from '../types/cdc';
import { getAllCauses } from '../services/cdcApi';

interface FiltersProps {
  data: CDCDataPoint[];
  selectedCauses: string[];
  onCausesChange: (causes: string[]) => void;
}

export const Filters: React.FC<FiltersProps> = ({ selectedCauses, onCausesChange }) => {
  const causes = React.useMemo(() => getAllCauses(), []);

  return (
    <div className="rounded-card border border-ink-line bg-paper-raised p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-xl">
          <MultiSelect
            label="Filter by cause of death"
            options={causes}
            value={selectedCauses}
            onChange={onCausesChange}
            placeholder="All causes — select to compare specific ones…"
          />
        </div>
        <div className="flex shrink-0 items-center gap-3 lg:pb-1">
          <span className="nums font-display text-3xl font-medium leading-none text-ink">
            {selectedCauses.length || causes.length}
          </span>
          <span className="font-mono text-xs leading-tight text-ink-faint">
            causes
            <br />
            {selectedCauses.length ? 'selected' : 'available'}
          </span>
        </div>
      </div>
    </div>
  );
};
