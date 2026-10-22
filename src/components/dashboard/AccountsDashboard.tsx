import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVouchers } from '../../context/VoucherContext';
import { Voucher } from '../../types';
import { SearchAndFilterBar } from '../vouchers/SearchAndFilterBar';
import { VoucherTable } from '../vouchers/VoucherTable';
import { VoucherDetailsModal } from '../vouchers/VoucherDetailsModal';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

export const AccountsDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { allVouchers, vouchers } = useVouchers();

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [reimbursementFilter, setReimbursementFilter] = useState<'all' | 'unsettled' | 'settled'>('all');

  // Compute Accounts metrics
  const totalCount = allVouchers.length;
  const pendingCount = allVouchers.filter(v => v.status === 'Pending Approval').length;
  const approvedVouchers = allVouchers.filter(v => v.status === 'Approved');
  const approvedCount = approvedVouchers.length;
  const rejectedCount = allVouchers.filter(v => v.status === 'Rejected').length;
  const totalApprovedAmount = approvedVouchers.reduce((sum, v) => sum + v.amount, 0);

  // Settlement counts
  const unsettledApprovedCount = approvedVouchers.filter(v => !v.isReimbursed).length;
  const settledCount = approvedVouchers.filter(v => v.isReimbursed).length;

  const displayedVouchers = vouchers.filter(v => {
    if (reimbursementFilter === 'unsettled') {
      return v.status === 'Approved' && !v.isReimbursed;
    }
    if (reimbursementFilter === 'settled') {
      return v.status === 'Approved' && v.isReimbursed;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Accounts & Finance Reimbursement Portal
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Finance Specialist: <strong className="text-neutral-700 dark:text-neutral-300">{currentUser?.name}</strong> · Monitoring & Payment Processing
          </p>
        </div>

        {/* Reimbursement quick view pills */}
        <div className="flex items-center gap-1 p-1 bg-neutral-200/80 dark:bg-neutral-800 rounded-lg">
          <button
            onClick={() => setReimbursementFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              reimbursementFilter === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            All Vouchers ({allVouchers.length})
          </button>
          <button
            onClick={() => setReimbursementFilter('unsettled')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              reimbursementFilter === 'unsettled'
                ? 'bg-white dark:bg-neutral-900 text-amber-900 dark:text-amber-400 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Awaiting Payout ({unsettledApprovedCount})
          </button>
          <button
            onClick={() => setReimbursementFilter('settled')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              reimbursementFilter === 'settled'
                ? 'bg-white dark:bg-neutral-900 text-emerald-900 dark:text-emerald-400 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Settled ({settledCount})
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Vouchers */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide block">Total Vouchers</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">{totalCount}</span>
            <FileText className="w-4 h-4 text-neutral-400" />
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide block">Pending Approval</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-amber-700 dark:text-amber-400 tabular-nums">{pendingCount}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        {/* Approved Vouchers */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide block">Approved</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{approvedCount}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Rejected Vouchers */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide block">Rejected</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-rose-700 dark:text-rose-400 tabular-nums">{rejectedCount}</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
        </div>

        {/* Total Approved Expense Amount */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide block">Approved Claim Total</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums truncate">
              ${totalApprovedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Recent Approved Vouchers Strip for Immediate Processing */}
      {reimbursementFilter === 'all' && approvedVouchers.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h2 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                Recent Approved Vouchers (Ready for Reimbursement Payout)
              </h2>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Dual signatures verified</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {approvedVouchers.slice(0, 3).map((av) => (
              <div
                key={av.id}
                onClick={() => setSelectedVoucher(av)}
                className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{av.voucherNumber}</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      ${av.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate mt-1">{av.expenseTitle}</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {av.employeeName} · {av.department}
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-[11px]">
                  {av.isReimbursed ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Reimbursed ({av.paymentReference})</span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400 font-medium">Awaiting Payment Settlement</span>
                  )}
                  <span className="text-neutral-400 dark:text-neutral-500 font-mono">
                    {av.approvalDate ? new Date(av.approvalDate).toLocaleDateString() : 'Approved'}
                  </span>
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
            {reimbursementFilter === 'all'
              ? 'All Organization Vouchers'
              : reimbursementFilter === 'unsettled'
              ? 'Approved Vouchers Pending Payment'
              : 'Settled Reimbursement Records'}
          </h2>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            {displayedVouchers.length} record{displayedVouchers.length === 1 ? '' : 's'}
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
    </div>
  );
};
