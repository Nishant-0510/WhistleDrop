import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/api';
import { ReportCategory } from '../types';
import {
  ShieldAlert,
  UserX,
  Landmark,
  Terminal,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const SubmitReportPage: React.FC = () => {
  const navigate = useNavigate();

  // Multi-step form state (1: Category, 2: Description, 3: Evidence & Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories: {
    key: ReportCategory;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      key: 'SECURITY',
      title: 'Security Vulnerability',
      description: 'System leaks, authorization flaws, exposed keys, or data exposure vulnerabilities.',
      icon: ShieldAlert,
    },
    {
      key: 'CORRUPTION',
      title: 'Corruption & Malpractice',
      description: 'Financial misappropriation, conflict of interest, bribery, or procedural violations.',
      icon: Landmark,
    },
    {
      key: 'HARASSMENT',
      title: 'Harassment & Misconduct',
      description: 'Workplace/campus hostility, discrimination, unethical behavior, or intimidation.',
      icon: UserX,
    },
    {
      key: 'TECHNICAL',
      title: 'Technical Incident',
      description: 'Critical system outage, malicious configuration, or data integrity anomalies.',
      icon: Terminal,
    },
    {
      key: 'OTHER',
      title: 'Other Concern',
      description: 'Any significant institutional or ethical concern not categorized above.',
      icon: HelpCircle,
    },
  ];

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!category) {
        setErrorMessage('Please select a category to continue.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (description.trim().length < 10) {
        setErrorMessage('Please provide at least 10 characters explaining your concern.');
        return;
      }
      if (description.trim().length > 5000) {
        setErrorMessage('Description cannot exceed 5000 characters.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setErrorMessage('Please select a category.');
      setCurrentStep(1);
      return;
    }
    if (description.trim().length < 10) {
      setErrorMessage('Please provide a descriptive report of at least 10 characters.');
      setCurrentStep(2);
      return;
    }

    if (evidenceUrl.trim()) {
      try {
        const url = new URL(evidenceUrl.trim());
        if (!['http:', 'https:'].includes(url.protocol)) {
          setErrorMessage('Evidence URL must start with http:// or https://');
          return;
        }
      } catch {
        setErrorMessage('Please enter a valid URL (e.g. https://example.com/proof) or leave blank.');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitReport({
        category,
        description: description.trim(),
        evidenceUrl: evidenceUrl.trim() || null,
      });

      // Navigate to dedicated success screen with case code and details
      navigate('/submit/success', {
        state: { report: result },
        replace: true,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Submit a Confidential Concern
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          No account required. No identity data is collected. You will receive a unique case code upon submission.
        </p>
      </div>

      {/* Progress Stepper Bar */}
      <div className="mb-8 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between relative">
          {[
            { step: 1, label: 'Category' },
            { step: 2, label: 'Description' },
            { step: 3, label: 'Review & Submit' },
          ].map((item, idx) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div key={item.step} className="flex items-center gap-2 z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:inline ${
                    isCurrent
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
                {idx < 2 && (
                  <div className="hidden sm:block w-12 lg:w-24 h-0.5 bg-slate-200 dark:bg-slate-800 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start gap-3 text-sm animate-fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div>
            <span className="font-semibold">Validation Notice: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Step Contents */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* STEP 1: CATEGORY SELECTION */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 1 — Select Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Choose the classification that best describes the nature of your report.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {categories.map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setCategory(item.key);
                      setErrorMessage(null);
                    }}
                    className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: DESCRIPTION */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 2 — Describe the Concern
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Explain the details, incident timeline, and factual context clearly.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="report-description" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Concern Details (Mandatory)
              </label>
              <textarea
                id="report-description"
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide specific factual details regarding what occurred, where, and any relevant circumstances..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-slate-400"
              />
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Minimum 10 characters</span>
                <span className={description.length > 5000 ? 'text-rose-500 font-bold' : ''}>
                  {description.length} / 5000 characters
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Helpful tips:</span>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Include dates, systems, departments, or reference codes if available.</li>
                <li>Avoid submitting your own identifying information if you desire absolute anonymity.</li>
              </ul>
            </div>
          </div>
        )}

        {/* STEP 3: OPTIONAL EVIDENCE & PRIVACY CONFIRMATION */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 3 — Optional Evidence & Privacy Confirmation
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                You may optionally provide a supporting URL (e.g. cloud storage or documentation link).
              </p>
            </div>

            {/* Optional URL Input */}
            <div className="space-y-2">
              <label htmlFor="report-evidence" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Supporting Evidence URL (Optional)
              </label>
              <input
                id="report-evidence"
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://gist.github.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ensure any external document linked does not contain personal tracking markers if you wish to remain anonymous.
              </p>
            </div>

            {/* Summary Review Card */}
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Submission Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Selected Category:</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{category}</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Description Length:</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{description.length} characters</div>
                </div>
              </div>
            </div>

            {/* Mandatory Privacy Notice from requirement 3 & 17 */}
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-850 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Privacy Notice & Non-Identification Guarantee</span>
              </div>
              <p className="leading-relaxed">
                WhistleDrop does NOT request or store your name, email, phone number, physical address, or IP address. Reporter identity is not part of the application’s data model.
              </p>
              <p className="font-medium text-emerald-800 dark:text-emerald-300">
                Upon submission, a cryptographically secure tracking case code will be generated. You must save that code to view status updates.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/20 active:scale-[0.98] transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-600/20 active:scale-[0.98] transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Confidential Report...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Anonymous Report</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
