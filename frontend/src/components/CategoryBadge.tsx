import React from 'react';
import { ReportCategory } from '../types';
import { ShieldAlert, UserX, Landmark, Terminal, HelpCircle } from 'lucide-react';

interface CategoryBadgeProps {
  category: ReportCategory;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const config = {
    SECURITY: {
      label: 'Security',
      icon: ShieldAlert,
      classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60',
    },
    HARASSMENT: {
      label: 'Harassment',
      icon: UserX,
      classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/60',
    },
    CORRUPTION: {
      label: 'Corruption',
      icon: Landmark,
      classes: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-900/60',
    },
    TECHNICAL: {
      label: 'Technical',
      icon: Terminal,
      classes: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-900/60',
    },
    OTHER: {
      label: 'Other Concern',
      icon: HelpCircle,
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
  }[category] || {
    label: category,
    icon: HelpCircle,
    classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const IconComponent = config.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs sm:text-sm px-2.5 py-1 gap-1.5';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span className={`inline-flex items-center rounded-md font-medium border ${config.classes} ${sizeClasses}`}>
      <IconComponent className={iconSize} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
