import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Report } from '../types';
import { CopyButton } from '../components/CopyButton';
import {
  CheckCircle2,
  ShieldCheck,
  Search,
  AlertTriangle,
  Lock,
  Layers
} from 'lucide-react';
import { CategoryBadge } from '../components/CategoryBadge';
import { StatusBadge } from '../components/StatusBadge';

export const SubmissionSuccessPage: React.FC = () => {
  const location = useLocation();
  const report = (location.state as { report?: Report })?.report;

  if (!report || !report.caseCode) {
    return <Navigate to="/submit" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 text-center">
        {/* Success Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Your report has been submitted.
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your concern was successfully registered into the encrypted triage queue. No personal information or account identity was requested or stored.
          </p>
        </div>

        {/* Case Code Hero Container */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border-2 border-brand-500/30 dark:border-brand-500/20 space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Your Confidential Case Code
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-wider text-slate-900 dark:text-white select-all">
            {report.caseCode}
          </div>
          <div className="flex justify-center">
            <CopyButton textToCopy={report.caseCode} label="Copy Case Code" className="shadow-xs" />
          </div>
        </div>

        {/* Warning Callout: Save Case Code */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-left flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Save this code.</span> It is the only way to track your report. Because no account was created, lost case codes cannot be recovered by administrators.
          </div>
        </div>

        {/* Report Metadata Preview */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800/80 text-left grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Category
            </span>
            <div className="mt-1">
              <CategoryBadge category={report.category} size="sm" />
            </div>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Initial Status
            </span>
            <div className="mt-1">
              <StatusBadge status={report.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Confirmation that no account was needed */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Zero account footprint &bull; End-to-end anonymity preserved</span>
        </div>

        {/* Action CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/track?code=${encodeURIComponent(report.caseCode)}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Track This Report</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors text-sm"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
