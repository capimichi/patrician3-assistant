import React from 'react';
import { Link } from 'react-router-dom';
import type { Town } from '../types';

interface TownLinkListProps {
  towns: Town[];
  emptyMessage: string;
  variant?: 'grid' | 'list';
}

export const TownLinkList: React.FC<TownLinkListProps> = ({
  towns,
  emptyMessage,
  variant = 'list'
}) => {
  if (towns.length === 0) {
    return <p className="text-xs text-gray-600 italic">{emptyMessage}</p>;
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {towns.map((town) => (
          <Link
            key={town.id}
            to={`/database/towns/${town.id}`}
            className="bg-background px-3 py-2.5 rounded border border-primary/5 hover:border-primary/30 transition-all flex items-center justify-between group"
          >
            <span className="text-sm font-semibold text-neutral-dark group-hover:text-primary transition-colors">
              {town.name}
            </span>
            {town.isRiverTown && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">
                Fluviale
              </span>
            )}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {towns.map((town) => (
        <li key={town.id} className="text-sm font-semibold bg-background px-2.5 py-1.5 rounded border border-primary/5 hover:border-primary/25 transition-all">
          <Link
            to={`/database/towns/${town.id}`}
            className="text-neutral-dark hover:text-primary transition-colors flex items-center justify-between"
          >
            <span>{town.name}</span>
            {town.isRiverTown && (
              <span className="text-3xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">
                Fluviale
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
};
