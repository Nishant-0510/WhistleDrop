import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
      <div className="space-y-2.5 pt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800/80 rounded-lg w-full"></div>
        ))}
      </div>
    </div>
  );
};
