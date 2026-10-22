import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VoucherProvider, useVouchers } from './context/VoucherContext';
import { Header } from './components/layout/Header';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { DirectorDashboard } from './components/dashboard/DirectorDashboard';
import { AccountsDashboard } from './components/dashboard/AccountsDashboard';
import { WorkflowGuide } from './components/common/WorkflowGuide';
import { SupabaseModal } from './components/common/SupabaseModal';
import { DocumentationModal } from './components/common/DocumentationModal';
import { JwtInspectorModal } from './components/common/JwtInspectorModal';
import { LoginModal } from './components/auth/LoginModal';
import { Radio, X } from 'lucide-react';

function AppContent() {
  const { currentUser, switchDemoUser } = useAuth();
  const { isSupabaseLive, lastLiveEvent } = useVouchers();

  const [activeNavTab, setActiveNavTab] = useState<'dashboard' | 'guide'>('dashboard');
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [readmeModalOpen, setReadmeModalOpen] = useState(false);
  const [jwtModalOpen, setJwtModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showEventToast, setShowEventToast] = useState(true);

  // Automatically scroll viewport to top whenever active account or nav tab switches
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentUser?.id, activeNavTab]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-neutral-50/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-300">
      {/* Top Bar Header */}
      <Header
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
        onOpenReadmeModal={() => setReadmeModalOpen(true)}
        onOpenJwtModal={() => setJwtModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
      />

      {/* Real-time Broadcast Notice Strip if active event */}
      {lastLiveEvent && showEventToast && (
        <div className="bg-neutral-900 dark:bg-neutral-850 text-white px-4 py-2 text-xs flex items-center justify-between transition-all border-b border-neutral-800">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-neutral-200">
                Live Data Synchronized: {lastLiveEvent}
              </span>
            </div>
            <button
              onClick={() => setShowEventToast(false)}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeNavTab === 'guide' ? (
          <WorkflowGuide
            onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
            onSwitchRole={(role) => {
              switchDemoUser(role);
              setActiveNavTab('dashboard');
            }}
          />
        ) : (
          <div key={currentUser?.id || 'guest'} className="w-full">
            {currentUser?.role === 'employee' && <EmployeeDashboard />}
            {currentUser?.role === 'director' && <DirectorDashboard />}
            {currentUser?.role === 'accounts' && <AccountsDashboard />}
          </div>
        )}
      </main>

      {/* Humanized Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-6 text-xs text-neutral-500 dark:text-neutral-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">ABC Company</span>
            <span>·</span>
            <span>Expense Voucher Management System</span>
            <span>·</span>
            <span>Prachay Securities Evaluation</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-500">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Authentication & Sessions
            </button>
            <button
              onClick={() => setSupabaseModalOpen(true)}
              className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              PostgreSQL Tables & Schema
            </button>
            <button
              onClick={() => setReadmeModalOpen(true)}
              className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Assignment Specification
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

      <DocumentationModal
        isOpen={readmeModalOpen}
        onClose={() => setReadmeModalOpen(false)}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
      />

      <JwtInspectorModal
        isOpen={jwtModalOpen}
        onClose={() => setJwtModalOpen(false)}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VoucherProvider>
          <AppContent />
        </VoucherProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
