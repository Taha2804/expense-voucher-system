import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Lock, Mail, Shield, User, X, Check, Key, LogIn, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithEmail, demoProfiles, switchDemoUser, currentUser } = useAuth();

  const [mode, setMode] = useState<'quick' | 'custom'>('quick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      await loginWithEmail(email.trim(), name.trim() || undefined, role);
      setSuccessMessage('Logged in successfully! JWT Bearer token issued.');
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemo = async (profileId: string) => {
    setIsSubmitting(true);
    await switchDemoUser(profileId);
    setSuccessMessage('Switched user and issued signed JWT session token!');
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full overflow-hidden text-xs transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                User Authentication & Session
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Role-Based Access Control & JWT Token Authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 mr-4 ${
              mode === 'quick'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Test Accounts (1-Click)
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              mode === 'custom'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Email & Password Login
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'quick' ? (
            <div className="space-y-2">
              <p className="text-neutral-600 dark:text-neutral-400 text-[11px] mb-3">
                Select a user to switch roles and generate a fresh JWT bearer token with assigned RBAC claims:
              </p>

              {demoProfiles.map((p) => {
                const isSelected = currentUser?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectDemo(p.id)}
                    className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800/60 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">{p.name}</div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        <span className="font-medium uppercase text-neutral-700 dark:text-neutral-300">{p.role}</span> · {p.department}
                      </div>
                      <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{p.email}</div>
                    </div>
                    {isSelected ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomLogin} className="space-y-3.5">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@abccompany.com"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Full Name <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  Role Assignment
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                >
                  <option value="employee">Employee (Submissions & Drafts)</option>
                  <option value="director">Director (Review & Approvals)</option>
                  <option value="accounts">Accounts Team (Reimbursement Settlement)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In & Issue JWT Token'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-950/50 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-[11px] text-neutral-500 dark:text-neutral-400">
          <span>Active Token: 24h validity</span>
          <button
            onClick={onClose}
            className="hover:underline text-neutral-700 dark:text-neutral-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
