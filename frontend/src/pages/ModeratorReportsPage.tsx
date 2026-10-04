import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchModeratorReports } from '../services/api';
import { PageResponse, ReportCategory, ReportStatus, ReportSummary } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';

export const ModeratorReportsPage: React.FC = () => {
  const [reportsPage, setReportsPage] = useState<PageResponse<ReportSummary> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ReportCategory | ''>('');
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const loadReports = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchModeratorReports({
        category: category || undefined,
        status: status || undefined,
        search: search.trim() || undefined,
        page,
        size: pageSize,
        sortBy,
        sortDir,
      });
      setReportsPage(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch reports.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [category, status, page, sortBy, sortDir]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadReports();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setPage(0);
    setSortBy('createdAt');
    setSortDir('desc');
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

  const hasActiveFilters = !!search.trim() || !!category || !!status;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Report Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter by category/status, inspect details, and update report lifecycle.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReports}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="moderator-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search case code (e.g. WD-K7M4P9X2) or keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-700 transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filter dropdowns and sort options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Category Dropdown */}
            <select
              id="filter-category-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ReportCategory | '');
                setPage(0);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-medium focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Categories</option>
              <option value="SECURITY">Security</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="CORRUPTION">Corruption</option>
              <option value="TECHNICAL">Technical</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Status Dropdown */}
            <select
              id="filter-status-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ReportStatus | '');
                setPage(0);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-medium focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Sort by:</span>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd as 'asc' | 'desc');
                setPage(0);
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-medium focus:border-brand-500"
            >
              <option value="createdAt-desc">Newest Created</option>
              <option value="createdAt-asc">Oldest Created</option>
              <option value="updatedAt-desc">Recently Updated</option>
              <option value="status-asc">Status</option>
            </select>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Reports Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <LoadingSkeleton rows={5} />
          </div>
        ) : reportsPage && reportsPage.content.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4 sm:px-6">Case Code</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4">Last Updated</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {reportsPage.content.map((item) => (
                    <tr
                      key={item.caseCode}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900 dark:text-white">
                        <Link
                          to={`/moderator/reports/${item.caseCode}`}
                          className="hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {item.caseCode}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <CategoryBadge category={item.category} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                        {formatDate(item.updatedAt)}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          to={`/moderator/reports/${item.caseCode}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:hover:bg-brand-900/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing <span className="font-semibold text-slate-900 dark:text-white">{reportsPage.content.length}</span> of{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{reportsPage.totalElements}</span> reports
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="font-semibold px-2">
                  Page {page + 1} of {Math.max(1, reportsPage.totalPages)}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={reportsPage.isLast || page + 1 >= reportsPage.totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching reports found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'No reports have been submitted yet.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
