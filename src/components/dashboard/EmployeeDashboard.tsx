import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVouchers } from '../../context/VoucherContext';
import { Voucher } from '../../types';
import { SearchAndFilterBar } from '../vouchers/SearchAndFilterBar';
import { VoucherTable } from '../vouchers/VoucherTable';
import { VoucherFormModal } from '../vouchers/VoucherFormModal';
import { VoucherDetailsModal } from '../vouchers/VoucherDetailsModal';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  TrendingUp,
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { allVouchers, vouchers, setFilter } = useVouchers();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [voucherToEdit, setVoucherToEdit] = useState<Voucher | null>(null);

  // Compute Employee Dashboard Metrics (only own vouchers)
  const totalVouchers = allVouchers.length;
  const draftCount = allVouchers.filter(v => v.status === 'Draft').length;
  const pendingCount = allVouchers.filter(v => v.status === 'Pending Approval').length;
  const approvedCount = allVouchers.filter(v => v.status === 'Approved').length;
  const rejectedCount = allVouchers.filter(v => v.status === 'Rejected').length;
  const totalClaimed = allVouchers.reduce((acc, v) => acc + v.amount, 0);

  const handleQuickStatusFilter = (status: string) => {
    setFilter(prev => ({
      ...prev,
      status: prev.status === status ? '' : status,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Create Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Department: <strong className="text-neutral-700 dark:text-neutral-300">{currentUser?.department}</strong> · Employee ID:{' '}
            <strong className="text-neutral-700 dark:text-neutral-300 font-mono">{currentUser?.employeeId || 'N/A'}</strong>
          </p>
        </div>

        <button
          onClick={() => {
            setVoucherToEdit(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white dark:text-neutral-900 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 rounded-lg transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Expense Voucher</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Vouchers */}
        <div
          onClick={() => handleQuickStatusFilter('')}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors cursor-pointer"
        >
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide block">Total Vouchers</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">{totalVouchers}</span>
            <FileText className="w-4 h-4 text-neutral-400" />
          </div>
        </div>

        {/* Draft Vouchers */}
        <div
          onClick={() => handleQuickStatusFilter('Draft')}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors cursor-pointer"
        >
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide block">Drafts</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-neutral-700 dark:text-neutral-300 tabular-nums">{draftCount}</span>
            <FileEdit className="w-4 h-4 text-neutral-400" />
          </div>
        </div>

        {/* Pending Approval */}
        <div
          onClick={() => handleQuickStatusFilter('Pending Approval')}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs hover:border-amber-400 dark:hover:border-amber-500 transition-colors cursor-pointer"
        >
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide block">Pending Approval</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-amber-700 dark:text-amber-400 tabular-nums">{pendingCount}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        {/* Approved Vouchers */}
        <div
          onClick={() => handleQuickStatusFilter('Approved')}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors cursor-pointer"
        >
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide block">Approved</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{approvedCount}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Rejected Vouchers */}
        <div
          onClick={() => handleQuickStatusFilter('Rejected')}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs hover:border-rose-400 dark:hover:border-rose-500 transition-colors cursor-pointer"
        >
          <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide block">Rejected</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-rose-700 dark:text-rose-400 tabular-nums">{rejectedCount}</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
        </div>

        {/* Total Amount Claimed */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide block">Total Claimed</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums truncate">
              ${totalClaimed.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilterBar />

      {/* Vouchers Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">My Expense Reimbursement Vouchers</h2>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {vouchers.length} item{vouchers.length === 1 ? '' : 's'} displayed
          </span>
        </div>

        <VoucherTable
          vouchers={vouchers}
          onSelectVoucher={(v) => setSelectedVoucher(v)}
          onEditDraft={(v) => {
            setVoucherToEdit(v);
            setIsCreateOpen(true);
          }}
        />
      </div>

      {/* Creation / Edit Modal */}
      {isCreateOpen && (
        <VoucherFormModal
          voucherToEdit={voucherToEdit}
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setVoucherToEdit(null);
          }}
          onSuccess={(v) => {
            setSelectedVoucher(v);
          }}
        />
      )}

      {/* Details Modal */}
      {selectedVoucher && (
        <VoucherDetailsModal
          voucher={selectedVoucher}
          isOpen={Boolean(selectedVoucher)}
          onClose={() => setSelectedVoucher(null)}
          onEditDraft={(v) => {
            setSelectedVoucher(null);
            setVoucherToEdit(v);
            setIsCreateOpen(true);
          }}
        />
      )}
    </div>
  );
};
