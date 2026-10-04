import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchModeratorReportDetail, updateReportStatus, ApiError } from '../services/api';
import { Report, ReportStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { StatusTimeline } from '../components/StatusTimeline';
import { CopyButton } from '../components/CopyButton';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Edit3,
  AlertCircle,
  CheckCircle2,
  FileText,
  Send
} from 'lucide-react';

export const ModeratorReportDetailPage: React.FC = () => {
  const { caseCode } = useParams<{ caseCode: string }>();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status update modal dialog state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ReportStatus>('UNDER_REVIEW');
  const [statusMessage, setStatusMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadReport = async () => {
    if (!caseCode) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchModeratorReportDetail(caseCode);
      setReport(data);
      // Pre-select appropriate next status
      if (data.status === 'SUBMITTED') {
        setTargetStatus('UNDER_REVIEW');
        setStatusMessage('Your report is currently being reviewed by the triage team.');
      } else if (data.status === 'UNDER_REVIEW') {
        setTargetStatus('RESOLVED');
        setStatusMessage('The reported concern has been addressed and remediation is complete.');
      } else {
        setTargetStatus('UNDER_REVIEW');
        setStatusMessage('Re-opening case for additional investigation.');
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        setErrorMessage(`Report with case code "${caseCode}" was not found.`);
      } else {
        setErrorMessage(err.message || 'Failed to load report details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [caseCode]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseCode || !report) return;

    if (!statusMessage.trim() || statusMessage.trim().length < 3) {
      setModalError('Please enter an explanatory status message of at least 3 characters.');
      return;
    }

    setIsUpdating(true);
    setModalError(null);

    try {
      const updated = await updateReportStatus(caseCode, {
        status: targetStatus,
        message: statusMessage.trim(),
      });
      setReport(updated);
      setIsUpdateModalOpen(false);
      setSuccessToast(`Report status updated to ${targetStatus.replace('_', ' ')} successfully.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setModalError(err.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
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

  const getQuickMessageSuggestion = (statusChoice: ReportStatus) => {
    switch (statusChoice) {
      case 'UNDER_REVIEW':
        return 'Your report has been assigned to the appropriate department for formal investigation.';
      case 'RESOLVED':
        return 'The reported issue has been verified and fully resolved in accordance with our security protocols.';
      case 'DISMISSED':
        return 'After initial evaluation, this report has been closed due to insufficient evidence or duplicate submission.';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/moderator/reports"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5 text-sm animate-fade-in shadow-xs"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start gap-3.5 text-sm"
        >
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
          <LoadingSkeleton rows={4} />
        </div>
      )}

      {report && !isLoading && (
        <div className="space-y-6">
          {/* Main Detail Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Report Reference
                </span>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-wide text-slate-900 dark:text-white">
                    {report.caseCode}
                  </h1>
                  <CopyButton textToCopy={report.caseCode} label="Copy" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={report.status} size="lg" />
                <button
                  type="button"
                  onClick={() => {
                    setModalError(null);
                    setIsUpdateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Update Status</span>
                </button>
              </div>
            </div>

            {/* Metadata Info Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Category</span>
                <CategoryBadge category={report.category} />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Initial Submission
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  {formatDate(report.createdAt)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Last Modified
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  {formatDate(report.updatedAt)}
                </span>
              </div>
            </div>

            {/* Full Concern Narrative */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Submitted Concern Content
              </span>
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800/80 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                {report.description}
              </div>
            </div>

            {/* Evidence URL */}
            {report.evidenceUrl && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800/80 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Attached Evidence URL:
                </span>
                <a
                  href={report.evidenceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-600 dark:text-brand-400 hover:underline break-all"
                >
                  <span>{report.evidenceUrl}</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Timeline & Moderator Action History */}
          <StatusTimeline
            currentStatus={report.status}
            history={report.statusHistory}
            createdAt={report.createdAt}
          />
        </div>
      )}

      {/* Update Status Modal Dialog */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update Status — ${report?.caseCode}`}
        maxWidth="lg"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          {modalError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs sm:text-sm"
            >
              {modalError}
            </div>
          )}

          {/* Current vs Target status selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Target Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['UNDER_REVIEW', 'RESOLVED', 'DISMISSED'] as ReportStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setTargetStatus(st);
                    setStatusMessage(getQuickMessageSuggestion(st));
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                    targetStatus === st
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Status Message Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="moderator-status-message"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Public Status Message
              </label>
              <span className="text-[11px] text-slate-400">
                Visible to the anonymous reporter
              </span>
            </div>
            <textarea
              id="moderator-status-message"
              rows={4}
              required
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="Explain the update, remediation action, or review decision..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Status Transition Rules:</span>
            <p>• SUBMITTED can transition to UNDER_REVIEW or DISMISSED.</p>
            <p>• UNDER_REVIEW can transition to RESOLVED or DISMISSED.</p>
            <p>• RESOLVED/DISMISSED can be reopened to UNDER_REVIEW if needed.</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-sm transition-all"
            >
              {isUpdating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Status Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
