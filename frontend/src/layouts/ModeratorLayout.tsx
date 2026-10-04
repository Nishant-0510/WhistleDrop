import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  LayoutDashboard,
  FileText,
  LogOut,
  Sun,
  Moon,
  ExternalLink,
  Lock,
  UserCheck
} from 'lucide-react';

export const ModeratorLayout: React.FC = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/moderator/login" replace state={{ from: location }} />;
  }

  const navItems = [
    { label: 'Overview & Metrics', path: '/moderator/dashboard', icon: LayoutDashboard },
    { label: 'Manage Reports', path: '/moderator/reports', icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path || (path === '/moderator/reports' && location.pathname.startsWith('/moderator/reports/'));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link to="/moderator/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block leading-tight">
                WHISTLEDROP
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                Moderator Console
              </span>
            </div>
          </Link>
        </div>

        {/* User Info Capsule */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-semibold text-xs">
            <UserCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {username || 'Moderator'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ROLE_MODERATOR
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 flex-grow">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Portal</span>
            </Link>
            <a
              href="/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>API Documentation</span>
            </a>
          </div>
        </nav>

        {/* Bottom actions: Theme Toggle & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </span>
            <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              {theme}
            </span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 px-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Moderator Interface
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Stateless Session (JWT)
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
