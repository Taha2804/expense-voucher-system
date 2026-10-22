import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVouchers } from '../../context/VoucherContext';
import { UserRole } from '../../types';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  Database,
  Radio,
  UserCheck,
  ChevronDown,
  BookOpen,
  LogIn,
  RotateCcw,
  Menu,
  X,
} from 'lucide-react';

interface HeaderProps {
  onOpenSupabaseModal: () => void;
  onOpenReadmeModal: () => void;
  onOpenJwtModal: () => void;
  onOpenLoginModal: () => void;
  activeNavTab: 'dashboard' | 'guide';
  setActiveNavTab: (tab: 'dashboard' | 'guide') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSupabaseModal,
  onOpenReadmeModal,
  onOpenJwtModal,
  onOpenLoginModal,
  activeNavTab,
  setActiveNavTab,
}) => {
  const { currentUser, switchDemoUser, demoProfiles, isTokenValid } = useAuth();
  const { isSupabaseLive, resetToSampleData } = useVouchers();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'employee': return 'Employee';
      case 'director': return 'Director (Admin)';
      case 'accounts': return 'Accounts Team';
      default: return 'Guest';
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleTheme = (role?: UserRole) => {
    switch (role) {
      case 'director':
        return {
          avatarBg: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300 dark:ring-purple-800',
          badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
          dotBg: 'bg-purple-600 dark:bg-purple-400',
          short: 'Director',
        };
      case 'accounts':
        return {
          avatarBg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-800',
          badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
          dotBg: 'bg-emerald-600 dark:bg-emerald-400',
          short: 'Accounts',
        };
      case 'employee':
      default:
        return {
          avatarBg: 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-800',
          badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
          dotBg: 'bg-blue-600 dark:bg-blue-400',
          short: 'Employee',
        };
    }
  };

  const roleTheme = getRoleTheme(currentUser?.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 w-full">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-mono font-bold flex items-center justify-center text-sm shadow-xs">
            EV
          </div>
          <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
            ABC Company <span className="font-normal text-neutral-400 dark:text-neutral-500 hidden sm:inline">· Vouchers</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop: xl and above) */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          <button
            onClick={() => setActiveNavTab('dashboard')}
            className={`whitespace-nowrap transition-colors pb-0.5 cursor-pointer ${
              activeNavTab === 'dashboard'
                ? 'text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100'
                : 'hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Voucher Workspace
          </button>
          
          <button
            onClick={onOpenJwtModal}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full ${isTokenValid ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span>JWT Auth & Token</span>
          </button>

          <button
            onClick={onOpenSupabaseModal}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-neutral-400" />
            <span>Supabase & SQL</span>
          </button>

          <button
            onClick={onOpenReadmeModal}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
            <span>Docs & Rules</span>
          </button>
        </nav>

        {/* Zone 3: Controls & Top Right User Account Section */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Mobile Navigation Toggle (visible on screens < xl) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="xl:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors shadow-2xs cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Animated Dark/Light Theme Switcher Button */}
          <ThemeToggle />

          {/* Live Sync Status indicator (desktop only) */}
          <button
            onClick={onOpenSupabaseModal}
            title={isSupabaseLive ? "Supabase Live WebSocket active" : "Local real-time synchronized storage active"}
            className="hidden 2xl:inline-flex items-center gap-1.5 h-9 px-2.5 text-[11px] font-medium rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 cursor-pointer"
          >
            <Radio className={`w-3 h-3 ${isSupabaseLive ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
            <span>{isSupabaseLive ? 'Supabase Live' : 'Real-time Sync'}</span>
          </button>

          {/* Quick Role Switcher & User Account Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              aria-label="User account and role switcher"
              className="group relative flex items-center gap-2 h-9 px-2.5 sm:px-3 bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-900 dark:hover:bg-neutral-800 rounded-xl text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all border border-neutral-200 dark:border-neutral-800 shadow-2xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-neutral-400"
            >
              {/* Initials Avatar */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-transform group-hover:scale-105 ${roleTheme.avatarBg}`}>
                {getUserInitials(currentUser?.name)}
              </div>

              {/* User Identity Info */}
              <div className="text-left hidden sm:flex flex-col justify-center min-w-0 max-w-[120px] md:max-w-[145px]">
                <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 leading-tight truncate">
                  {currentUser?.name || 'Guest'}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-none truncate">
                  {currentUser ? getRoleLabel(currentUser.role) : 'Select Account'}
                </span>
              </div>

              {/* Compact role badge for smaller screens */}
              <span className="sm:hidden font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                {roleTheme.short}
              </span>

              {/* Animated Chevron */}
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-transform duration-200 ${
                  roleMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu with Backdrop */}
            {roleMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-2xs"
                  onClick={() => setRoleMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-2 z-50 text-xs animate-in fade-in-50 zoom-in-95 duration-100"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                      Switch Test Account / Role
                    </span>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Test RBAC permissions between Employee, Director, and Accounts
                    </p>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {demoProfiles.map((p) => {
                      const isCurrent = currentUser?.id === p.id;
                      const profileTheme = getRoleTheme(p.role);
                      return (
                        <button
                          key={p.id}
                          onClick={() => switchDemoUser(p.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isCurrent ? 'bg-white/20 text-current' : profileTheme.avatarBg
                            }`}>
                              {getUserInitials(p.name)}
                            </div>
                            <div>
                              <div className="font-semibold">{p.name}</div>
                              <div className={`text-[10px] ${isCurrent ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                {getRoleLabel(p.role)} · {p.department}
                              </div>
                            </div>
                          </div>
                          {isCurrent && <UserCheck className="w-4 h-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-1 space-y-1">
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onOpenLoginModal();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-md text-[11px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Custom Login / Sign Up</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Reset all vouchers to initial demo dataset?')) {
                          resetToSampleData();
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-md text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Vouchers to Default Demo</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Collapsible Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/98 dark:bg-neutral-950/98 backdrop-blur-md px-4 py-3 space-y-2 text-xs transition-all">
          <div className="flex flex-col gap-1 font-medium">
            <button
              onClick={() => {
                setActiveNavTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                activeNavTab === 'dashboard'
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <span>Voucher Workspace</span>
            </button>

            <button
              onClick={() => {
                onOpenJwtModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isTokenValid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>JWT Auth & Token Inspector</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">HS256</span>
            </button>

            <button
              onClick={() => {
                onOpenSupabaseModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-neutral-400" />
                <span>Supabase & SQL Tables</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">PostgreSQL</span>
            </button>

            <button
              onClick={() => {
                onOpenReadmeModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                <span>Documentation & Assignment Rules</span>
              </div>
            </button>

            {/* Sync status in mobile drawer */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between px-3 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Radio className={`w-3 h-3 ${isSupabaseLive ? 'text-emerald-500 animate-pulse' : 'text-neutral-400'}`} />
                <span>{isSupabaseLive ? 'Supabase Live Connected' : 'Real-time Synchronized'}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
