import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardStats } from '../services/api';
import { DashboardStats, ReportCategory } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Layers,
  RefreshCw,
  Search
} from 'lucide-react';

export const ModeratorDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

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

  const statCards = [
    {
      title: 'Total Reports',
      count: stats?.totalReports ?? 0,
      icon: FileText,
      color: 'text-slate-900 dark:text-white',
      border: 'border-slate-200 dark:border-slate-800',
      bg: 'bg-white dark:bg-slate-900',
    },
    {
      title: 'Submitted (New)',
      count: stats?.submittedCount ?? 0,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-900/60',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    },
    {
      title: 'Under Review',
      count: stats?.underReviewCount ?? 0,
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-900/60',
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    },
    {
      title: 'Resolved',
      count: stats?.resolvedCount ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-900/60',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    },
    {
      title: 'Dismissed',
      count: stats?.dismissedCount ?? 0,
      icon: XCircle,
      color: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-800',
      bg: 'bg-slate-50 dark:bg-slate-850/40',
    },
  ];

  const categories: ReportCategory[] = ['SECURITY', 'HARASSMENT', 'CORRUPTION', 'TECHNICAL', 'OTHER'];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Moderator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics and triage pipeline directly synchronized with the backend database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadStats}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <Link
            to="/moderator/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span>Manage All Reports</span>
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm">
          {errorMessage}
        </div>
      )}

      {isLoading && !stats ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <>
          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border ${card.border} ${card.bg} shadow-xs space-y-3`}
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <span>{card.title}</span>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className={`text-2xl sm:text-3xl font-black ${card.color}`}>
                    {card.count}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Breakdown Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Category Breakdown
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  {stats?.totalReports || 0} Total
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {categories.map((cat) => {
                  const count = stats?.categoryBreakdown[cat] || 0;
                  const total = stats?.totalReports || 1;
                  const percent = Math.round((count / total) * 100);

                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <CategoryBadge category={cat} size="sm" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Recent Submissions
                </h2>
                <Link
                  to="/moderator/reports"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats?.recentReports && stats.recentReports.length > 0 ? (
                  stats.recentReports.map((item) => (
                    <div
                      key={item.caseCode}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <Link
                            to={`/moderator/reports/${item.caseCode}`}
                            className="font-mono text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
                          >
                            {item.caseCode}
                          </Link>
                          <CategoryBadge category={item.category} size="sm" />
                          <StatusBadge status={item.status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-lg">
                          {item.descriptionSnippet}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <time className="text-xs text-slate-400 font-mono">
                          {formatDate(item.createdAt)}
                        </time>
                        <Link
                          to={`/moderator/reports/${item.caseCode}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No recent reports found in the system.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
