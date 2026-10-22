import React, { useState } from 'react';
import { X, Copy, Check, Database, Radio, ShieldCheck, AlertCircle } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../../lib/supabase-schema-sql';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, testSupabaseConnection } from '../../lib/supabase';
import { useVouchers } from '../../context/VoucherContext';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const { isSupabaseLive, lastLiveEvent } = useVouchers();
  const [activeTab, setActiveTab] = useState<'sql' | 'connect'>('sql');
  const [copied, setCopied] = useState(false);
  
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    if (!url.trim() || !anonKey.trim()) {
      saveStoredSupabaseConfig('', '');
      setTestResult({ success: true, message: 'Supabase credentials cleared. Using synchronized local engine.' });
      setIsTesting(false);
      setTimeout(() => window.location.reload(), 800);
      return;
    }

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTestResult(res);
    setIsTesting(false);

    if (res.success) {
      saveStoredSupabaseConfig(url.trim(), anonKey.trim());
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-800 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Supabase Integration & Database Schema</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Live PostgreSQL synchronization, Row-Level Security & schema queries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live sync banner */}
        <div className="px-6 py-2.5 bg-neutral-50 dark:bg-neutral-950/50 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${isSupabaseLive ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-amber-600 dark:text-amber-400'}`} />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {isSupabaseLive ? 'Connected to live Supabase backend' : 'Using real-time multi-tab synchronized state'}
            </span>
          </div>
          {lastLiveEvent && (
            <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px] truncate max-w-xs">{lastLiveEvent}</span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            SQL Table & Schema Queries
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'connect'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            Connect Your Supabase Project
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'sql' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">PostgreSQL Schema & Security Rules</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Includes tables (<code className="text-neutral-700 dark:text-neutral-300 font-mono">vouchers</code>, <code className="text-neutral-700 dark:text-neutral-300 font-mono">profiles</code>, <code className="text-neutral-700 dark:text-neutral-300 font-mono">voucher_audit_logs</code>), auto-number trigger (<code className="text-neutral-700 dark:text-neutral-300 font-mono">VCH-2026-XXXX</code>), and RLS policies for each role.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 rounded-lg transition-colors border border-neutral-300 dark:border-neutral-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                      <span>Copy Full SQL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Steps note */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">How to run in Supabase:</p>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Open your Supabase project dashboard and click on <strong>SQL Editor</strong> in the left sidebar.</li>
                  <li>Click <strong>New query</strong>, paste this SQL script, and click <strong>Run</strong>.</li>
                  <li>Navigate to <strong>Project Settings → API</strong> to copy your Project URL & Anon Key into the next tab.</li>
                </ol>
              </div>

              {/* SQL Code View */}
              <div className="relative rounded-lg bg-neutral-950 p-4 text-neutral-100 font-mono text-xs overflow-x-auto max-h-80 border border-neutral-800">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveAndTest} className="space-y-4 max-w-xl">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Configure Live Supabase Credentials</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Connect directly to your Supabase project for persistent cloud storage and real-time WebSocket replication.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                  />
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Found in Supabase Dashboard → Settings → API → Project URL</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="text"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                  />
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Found in Supabase Dashboard → Settings → API → Project API Keys (anon public)</p>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-4 py-2 text-xs font-medium text-white dark:text-neutral-900 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {isTesting ? 'Testing & Connecting...' : 'Test Connection & Save'}
                </button>
                {url && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrl('');
                      setAnonKey('');
                      saveStoredSupabaseConfig('', '');
                      window.location.reload();
                    }}
                    className="px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    Disconnect & Reset to Local State
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
