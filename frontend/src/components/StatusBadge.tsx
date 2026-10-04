import React from 'react';
import { ReportStatus } from '../types';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const config = {
    SUBMITTED: {
      label: 'Submitted',
      icon: Clock,
      classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
      dotColor: 'bg-blue-500',
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      icon: AlertCircle,
      classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
      dotColor: 'bg-amber-500 animate-pulse',
    },
    RESOLVED: {
      label: 'Resolved',
      icon: CheckCircle2,
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
      dotColor: 'bg-emerald-500',
    },
    DISMISSED: {
      label: 'Dismissed',
      icon: XCircle,
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
      dotColor: 'bg-slate-400',
    },
  }[status] || {
    label: status,
    icon: Clock,
    classes: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
    dotColor: 'bg-gray-400',
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm sm:text-base px-3 py-1.5 gap-2 font-medium',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border transition-colors ${config.classes} ${sizeClasses}`}
      role="status"
    >
      {showIcon && <IconComponent className={iconSizes} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
};
