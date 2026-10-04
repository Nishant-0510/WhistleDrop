import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Search,
  PlusCircle,
  FileCheck2,
  KeyRound,
  EyeOff,
  ArrowRight,
  Sparkles,
  History
} from 'lucide-react';
import { PrivacyBadge } from '../components/PrivacyBadge';

export const LandingPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Submit',
      subtitle: 'Describe the concern.',
      description: 'Choose a category, explain the issue in detail, and optionally provide supporting evidence links. No personal details are ever collected.',
      icon: PlusCircle,
    },
    {
      num: '02',
      title: 'Receive',
      subtitle: 'Get a secure case code.',
      description: 'Our backend generates an unpredictable, cryptographically random tracking key (e.g. WD-K7M4P9X2) stored with database-level uniqueness.',
      icon: KeyRound,
    },
    {
      num: '03',
      title: 'Track',
      subtitle: 'Check the progress of your report.',
      description: 'Enter your case code anytime on our public portal to inspect the real-time review status without revealing who you are.',
      icon: Search,
    },
    {
      num: '04',
      title: 'Updates',
      subtitle: 'View status updates without revealing your identity.',
      description: 'Read timestamped feedback, questions, and resolution notices from authorized moderators directly on your timeline.',
      icon: History,
    },
  ];

  const pillars = [
    {
      icon: EyeOff,
      title: 'No Reporter Account',
      description: 'No email, phone, name, or profile registration. Your identity is fundamentally absent from our data schema.',
    },
    {
      icon: KeyRound,
      title: 'Secure Case Code',
      description: 'Cryptographically generated case codes ensure high entropy, unguessable tracking keys, and full collision protection.',
    },
    {
      icon: FileCheck2,
      title: 'Verified Triage Workflow',
      description: 'Moderators review reports through protected interfaces with strict status transition controls and audit trails.',
    },
  ];

  return (
    <div className="space-y-24 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 dark:bg-brand-950/60 dark:border-brand-800 dark:text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Confidential Reporting Platform</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            <span className="block">WHISTLEDROP</span>
            <span className="block text-2xl sm:text-4xl font-bold text-slate-600 dark:text-slate-300 mt-2">
              "Your voice. Your privacy."
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            A confidential reporting platform that lets you raise concerns without creating an account or revealing your identity.
          </p>
        </div>

        {/* Primary and Secondary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Report a Concern</span>
          </Link>
          <Link
            to="/track"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 dark:text-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-700 shadow-sm active:scale-[0.98] transition-all"
          >
            <Search className="w-5 h-5 text-slate-500" />
            <span>Track a Report</span>
          </Link>
        </div>

        {/* Privacy statement banner */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>No account required. No reporter profile. Just your case code.</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <PrivacyBadge variant="anonymous" />
          <PrivacyBadge variant="no-account" />
          <PrivacyBadge variant="key-based" />
        </div>
      </section>

      {/* How it works section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Transparent Workflow
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How It Works
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            From initial submission to resolution, complete privacy is maintained at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-slate-300 dark:text-slate-700 group-hover:text-brand-500 transition-colors">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-2">
                    {step.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security & Architectural Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Architectural Privacy Principles</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Anonymity by architecture, not just policy.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              WhistleDrop was engineered with deliberate data minimization. The application backend does not store reporter profiles, email addresses, or session trackers. Case codes are 64-bit entropy identifiers that guarantee unguessability.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {pillars.map((pillar, i) => {
                const PillarIcon = pillar.icon;
                return (
                  <div key={i} className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-slate-700/60">
                    <PillarIcon className="w-5 h-5 text-brand-400 mb-2" />
                    <h3 className="font-bold text-sm text-white mb-1">{pillar.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{pillar.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Ready to report CTA banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 rounded-2xl p-8 space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Have a concern to raise confidentially?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Submissions take less than 2 minutes. You will receive an encrypted case code to monitor actions taken.
          </p>
          <div className="pt-2">
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all"
            >
              <span>Begin Anonymous Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
