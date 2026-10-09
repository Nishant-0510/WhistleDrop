import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackReport, ApiError } from '../services/api';
import { Report } from '../types';
import { StatusTimeline } from '../components/StatusTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { CopyButton } from '../components/CopyButton';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  Search,
  KeyRound,
  Calendar,
  Clock,
  ExternalLink,
  AlertCircle,
  FileText
} from 'lucide-react';
import { PrivacyBadge } from '../components/PrivacyBadge';

export const TrackReportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [inputCode, setInputCode] = useState(initialCode);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchReport = async (code: string) => {
    if (!code || !code.trim()) {
      setErrorMessage('Please enter a case code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setReport(null);

    try {
      const data = await trackReport(code.trim());
      setReport(data);
      setSearchParams({ code: data.caseCode });
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        setErrorMessage(`No report was found matching case code "${code.trim().toUpperCase()}". Please verify the code and try again.`);
      } else {
        setErrorMessage(err.message || 'Unable to retrieve report. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchReport(initialCode);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport(inputCode);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Track a Report
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Enter your unique case code to check investigation progress and view moderator updates.
        </p>
      </div>

      {/* Case Code Search Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <input
              id="case-code-input"
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. WD-K7M4P9X2"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-sm tracking-wider uppercase focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputCode.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-sm shadow-brand-600/20 active:scale-[0.98] transition-all shrink-0"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Status</span>
              </>
            )}
          </button>
        </form>

        {errorMessage && (
          <div role="alert" className="mt-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start gap-3 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div><span className="font-bold">Tracking Notice: </span>{errorMessage}</div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Format: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">WD-XXXXXXXX</code></span>
          <PrivacyBadge variant="key-based" />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
          <LoadingSkeleton rows={3} />
        </div>
      )}

      {/* Report Data Display */}
      {report && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Case Tracking Reference
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-wide text-slate-900 dark:text-white">
                    {report.caseCode}
                  </span>
                  <CopyButton textToCopy={report.caseCode} label="Copy" />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <StatusBadge status={report.status} size="lg" />
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Category</span>
                <CategoryBadge category={report.category} />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date Submitted
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatDate(report.createdAt)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Last Activity
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatDate(report.updatedAt)}
                </span>
              </div>
            </div>

            {/* Submitted Concern Narrative */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Reported Concern Details
              </span>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800/80 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {report.description}
              </div>
            </div>

            {/* Supporting Evidence URL if present */}
            {report.evidenceUrl && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800/80 text-xs flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Attached Evidence Link:</span>
                <a
                  href={report.evidenceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline max-w-[280px] sm:max-w-md truncate"
                >
                  <span className="truncate">{report.evidenceUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Timeline & Moderator Updates */}
          <StatusTimeline
            currentStatus={report.status}
            history={report.statusHistory}
            createdAt={report.createdAt}
          />
        </div>
      )}
    </div>
  );
};
