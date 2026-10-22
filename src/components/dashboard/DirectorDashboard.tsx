import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVouchers } from '../../context/VoucherContext';
import { Voucher } from '../../types';
import { SearchAndFilterBar } from '../vouchers/SearchAndFilterBar';
import { VoucherTable } from '../vouchers/VoucherTable';
import { VoucherDetailsModal } from '../vouchers/VoucherDetailsModal';
import { DirectorApprovalModal } from '../vouchers/DirectorApprovalModal';
import {
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  FileCheck2,
} from 'lucide-react';

export const DirectorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { allVouchers, vouchers } = useVouchers();

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [directorTarget, setDirectorTarget] = useState<{ voucher: Voucher; action: 'approve' | 'reject' } | null>(null);
  const [activeView, setActiveView] = useState<'pending' | 'all'>('pending');

  // Compute Director metrics
  const pendingVouchers = allVouchers.filter(v => v.status === 'Pending Approval');
  const pendingCount = pendingVouchers.length;
  const totalPendingAmount = pendingVouchers.reduce((sum, v) => sum + v.amount, 0);

  // Today's stats
  const todayStr = new Date().toISOString().split('T')[0];
  const approvedToday = allVouchers.filter(v => {
    if (v.status !== 'Approved' || !v.approvalDate) return false;
    return v.approvalDate.startsWith(todayStr);
  }).length;

  const rejectedToday = allVouchers.filter(v => {
    if (v.status !== 'Rejected' || !v.updatedAt) return false;
    return v.updatedAt.startsWith(todayStr);
  }).length;

  const displayedVouchers = activeView === 'pending'
    ? vouchers.filter(v => v.status === 'Pending Approval')
    : vouchers;

  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Director Approval Portal
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Logged in as <strong className="text-neutral-700 dark:text-neutral-300">{currentUser?.name}</strong> · Executive Authority
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-200/80 dark:bg-neutral-800 rounded-lg">
          <button
            onClick={() => setActiveView('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeView === 'pending'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Pending Approvals ({pendingCount})
          </button>
          <button
            onClick={() => setActiveView('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeView === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            All Organization Vouchers ({allVouchers.length})
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Pending Approval Count */}
        <div
          onClick={() => setActiveView('pending')}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xs hover:border-amber-400 dark:hover:border-amber-500 transition-colors cursor-pointer"
        >
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide block">
            Pending Approvals
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-3xl font-mono font-bold text-amber-700 dark:text-amber-400 tabular-nums">
              {pendingCount}
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Requires your signature</p>
        </div>

        {/* Total Pending Amount */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide block">
            Total Pending Claim Value
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums truncate">
              ${totalPendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <DollarSign className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Awaiting financial sign-off</p>
        </div>

        {/* Approved Today */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide block">
            Approved Today
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-3xl font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {approvedToday}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Forwarded to Accounts</p>
        </div>

        {/* Rejected Today */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide block">
            Rejected Today
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-3xl font-mono font-bold text-rose-700 dark:text-rose-400 tabular-nums">
              {rejectedToday}
            </span>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Remarks logged in audit</p>
        </div>
      </div>

      {/* Quick Triage Priority Action Queue if Pending View */}
      {activeView === 'pending' && pendingVouchers.length > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-amber-800 dark:text-amber-400" />
              <h2 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                Direct Approval Queue ({pendingVouchers.length} awaiting authorization)
              </h2>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400">Click row to review full invoice before approving</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingVouchers.slice(0, 4).map((pv) => (
              <div
                key={pv.id}
                onClick={() => setSelectedVoucher(pv)}
                className="bg-white dark:bg-neutral-900 border border-amber-200/80 dark:border-amber-900/50 rounded-lg p-3 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{pv.voucherNumber}</span>
                    <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                    <span className="text-neutral-600 dark:text-neutral-400 truncate">{pv.employeeName}</span>
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate mt-0.5">{pv.expenseTitle}</div>
                  <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    {pv.department} · {pv.expenseDate}
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-2">
                  <span className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100 tabular-nums">
                    ${pv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setDirectorTarget({ voucher: pv, action: 'reject' })}
                      className="px-2 py-1 text-[11px] font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded border border-rose-200 dark:border-rose-900/60 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectorTarget({ voucher: pv, action: 'approve' })}
                      className="px-2.5 py-1 text-[11px] font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-2xs"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <SearchAndFilterBar />

      {/* Main Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {activeView === 'pending' ? 'Pending Approval Requests' : 'All Organization Expense Vouchers'}
          </h2>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            {displayedVouchers.length} voucher{displayedVouchers.length === 1 ? '' : 's'}
          </span>
        </div>

        <VoucherTable
          vouchers={displayedVouchers}
          onSelectVoucher={(v) => setSelectedVoucher(v)}
        />
      </div>

      {/* Details Modal */}
      {selectedVoucher && (
        <VoucherDetailsModal
          voucher={selectedVoucher}
          isOpen={Boolean(selectedVoucher)}
          onClose={() => setSelectedVoucher(null)}
        />
      )}

      {/* Director Quick Action Modal */}
      {directorTarget && (
        <DirectorApprovalModal
          voucher={directorTarget.voucher}
          actionType={directorTarget.action}
          isOpen={Boolean(directorTarget)}
          onClose={() => setDirectorTarget(null)}
          onSuccess={() => setDirectorTarget(null)}
        />
      )}
    </div>
  );
};
