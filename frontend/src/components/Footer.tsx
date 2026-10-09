import React from 'react';
import { Shield, Lock, ExternalLink, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Privacy Commitment */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4 fill-current" />
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                WHISTLEDROP
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              WhistleDrop is built with privacy-first architecture. Reporter identity is not part of the application’s data model. Reports are tracked exclusively through unpredictable cryptographically generated case codes.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                <Lock className="w-3 h-3" /> Zero Reporter Footprint
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/submit" className="text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors">
                  Submit Concern
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors">
                  Track Report Status
                </Link>
              </li>
              <li>
                <Link to="/moderator/login" className="text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors">
                  Moderator Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Technical Docs & Recruitment Specs */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              API & Engineering
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/swagger-ui.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Swagger / OpenAPI</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  GDG on Campus SRM Recruitment Task
                </span>
              </li>
              <li>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Spring Boot 3 + MySQL + React TS
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div>
            &copy; {new Date().getFullYear()} WhistleDrop. Confidential Reporting Platform.
          </div>
          <div>
            "Your voice. Your privacy."
          </div>
        </div>
      </div>
    </footer>
  );
};
