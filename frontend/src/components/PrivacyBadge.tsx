import React from 'react';
import { ShieldCheck, Lock, KeyRound } from 'lucide-react';

interface PrivacyBadgeProps {
  variant?: 'anonymous' | 'no-account' | 'key-based';
  className?: string;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ variant = 'anonymous', className = '' }) => {
  const config = {
    anonymous: {
      icon: ShieldCheck,
      text: 'Anonymous by design',
      tooltip: 'No identifying metadata, names, emails, or phone numbers are stored.',
    },
    'no-account': {
      icon: Lock,
      text: 'No account required',
      tooltip: 'You never register, log in, or leave a personal digital footprint.',
    },
    'key-based': {
      icon: KeyRound,
      text: 'Your case code is your tracking key',
      tooltip: 'Your cryptographically generated case code is the sole tracking mechanism.',
    },
  }[variant];

  const IconComponent = config.icon;

  return (
    <div
      title={config.tooltip}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100/90 text-slate-700 border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80 ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
      <span>{config.text}</span>
    </div>
  );
};
