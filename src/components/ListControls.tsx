import React from 'react';
import { Search } from 'lucide-react';

export interface ListControlsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  rightActions?: React.ReactNode;
}

export const ListControls: React.FC<ListControlsProps> = ({
  searchValue,
  onSearchChange,
  placeholder = 'Cerca...',
  rightActions
}) => {
  return (
    <div className="bg-white border border-primary/20 rounded-lg shadow-xs p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-primary/60" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-4 py-2 border border-primary/20 rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/40 placeholder-gray-400 text-sm transition-colors text-neutral-dark"
        />
      </div>
      {rightActions && (
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {rightActions}
        </div>
      )}
    </div>
  );
};
