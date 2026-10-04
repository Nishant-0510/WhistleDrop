import React from 'react';
import { ReportStatus, StatusUpdate } from '../types';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: ReportStatus;
  history: StatusUpdate[];
  createdAt?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus, history }) => {
  const isDismissed = currentStatus === 'DISMISSED';

  const steps: { key: ReportStatus; label: string; desc: string }[] = isDismissed
    ? [
        { key: 'SUBMITTED', label: 'Submitted', desc: 'Concern received and encrypted' },
        { key: 'DISMISSED', label: 'Dismissed', desc: 'Report closed after assessment' },
      ]
    : [
        { key: 'SUBMITTED', label: 'Submitted', desc: 'Concern received and logged' },
        { key: 'UNDER_REVIEW', label: 'Under Review', desc: 'Active triage & investigation' },
        { key: 'RESOLVED', label: 'Resolved', desc: 'Remediation completed' },
      ];

  const getStepState = (stepKey: ReportStatus) => {
    if (stepKey === currentStatus) return 'current';
    if (isDismissed) {
      return stepKey === 'SUBMITTED' ? 'completed' : 'current';
    }
    const order: ReportStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'RESOLVED'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);
    return stepIndex < currentIndex ? 'completed' : 'upcoming';
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Visual Stepper */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
          Lifecycle Progress
        </h3>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {steps.map((step, index) => {
              const state = getStepState(step.key);

              return (
                <div
                  key={step.key}
                  className={`flex flex-col items-start md:items-center text-left md:text-center p-3 rounded-lg transition-all ${
                    state === 'current'
                      ? 'bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/60'
                      : state === 'completed'
                      ? 'bg-slate-50 dark:bg-slate-850/40 border border-transparent'
                      : 'opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${
                      state === 'current'
                        ? isDismissed
                          ? 'bg-slate-600 text-white ring-4 ring-slate-100 dark:ring-slate-800'
                          : 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950 animate-pulse-subtle'
                        : state === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {state === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : state === 'current' ? (
                      isDismissed ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Chronological History */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Status & Moderator Updates History
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {history.length} {history.length === 1 ? 'event' : 'events'} recorded
          </span>
        </div>

        {history && history.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {history.map((update, idx) => {
              const isLatest = idx === history.length - 1;

              return (
                <div key={update.id || idx} className="relative group">
                  {/* Timeline bullet dot */}
                  <div
                    className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-slate-900 ${
                      isLatest
                        ? 'border-brand-500 bg-brand-500 ring-4 ring-brand-100 dark:ring-brand-950'
                        : 'border-slate-400 dark:border-slate-600'
                    }`}
                  />

                  <div className="bg-slate-50 dark:bg-slate-850/60 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-sm text-slate-900 dark:text-slate-100">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            update.status === 'RESOLVED'
                              ? 'bg-emerald-500'
                              : update.status === 'UNDER_REVIEW'
                              ? 'bg-amber-500'
                              : update.status === 'DISMISSED'
                              ? 'bg-slate-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        {update.status.replace('_', ' ')}
                      </span>
                      <time className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {formatDate(update.createdAt)}
                      </time>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {update.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
            No history entries found.
          </div>
        )}
      </div>
    </div>
  );
};
