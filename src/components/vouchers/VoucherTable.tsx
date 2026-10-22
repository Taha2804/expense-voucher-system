import React, { useState } from 'react';
import { Voucher } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useVouchers } from '../../context/VoucherContext';
import { DirectorApprovalModal } from './DirectorApprovalModal';
import { Eye, FileEdit, Trash2, Check, X, Printer } from 'lucide-react';

interface VoucherTableProps {
  vouchers: Voucher[];
  onSelectVoucher: (voucher: Voucher) => void;
  onEditDraft?: (voucher: Voucher) => void;
}

export const VoucherTable: React.FC<VoucherTableProps> = ({
  vouchers,
  onSelectVoucher,
  onEditDraft,
}) => {
  const { currentUser } = useAuth();
  const { deleteDraftVoucher } = useVouchers();

  const [directorTarget, setDirectorTarget] = useState<{ voucher: Voucher; action: 'approve' | 'reject' } | null>(null);

  const isDirector = currentUser?.role === 'director';

  if (vouchers.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center shadow-2xs transition-colors">
        <div className="max-w-sm mx-auto space-y-2">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">No expense vouchers found</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {currentUser?.role === 'employee'
              ? 'You have not created any vouchers matching your filter criteria yet.'
              : 'There are no submitted vouchers matching the current filters.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50/70 dark:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Voucher #</th>
              <th className="py-3 px-4">Expense Title</th>
              {currentUser?.role !== 'employee' && (
                <th className="py-3 px-4">Employee</th>
              )}
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {vouchers.map((v) => {
              const isOwner = currentUser?.role === 'employee' && v.employeeId === currentUser.id;
              const canEditDraft = isOwner && v.status === 'Draft';
              const canDirectorReview = isDirector && v.status === 'Pending Approval';

              return (
                <tr
                  key={v.id}
                  onClick={() => onSelectVoucher(v)}
                  className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer group"
                >
                  {/* Voucher Number */}
                  <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                    {v.voucherNumber}
                  </td>

                  {/* Expense Title */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{v.expenseTitle}</div>
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate max-w-xs">{v.expenseDescription}</div>
                  </td>

                  {/* Employee Name (for Director & Accounts) */}
                  {currentUser?.role !== 'employee' && (
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-800 dark:text-neutral-200">{v.employeeName}</div>
                      {v.employeeCode && (
                        <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">{v.employeeCode}</div>
                      )}
                    </td>
                  )}

                  {/* Department */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-neutral-700 dark:text-neutral-300">
                    {v.department}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                    {v.expenseCategory}
                  </td>

                  {/* Expense Date */}
                  <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                    {v.expenseDate}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums whitespace-nowrap">
                    ${v.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={v.status} />
                    {v.isReimbursed && (
                      <span className="block text-[10px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                        · Reimbursed
                      </span>
                    )}
                  </td>

                  {/* Actions column */}
                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Director Quick Review Buttons */}
                      {canDirectorReview && (
                        <>
                          <button
                            type="button"
                            title="Approve Voucher"
                            onClick={() => setDirectorTarget({ voucher: v, action: 'approve' })}
                            className="p-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Reject Voucher"
                            onClick={() => setDirectorTarget({ voucher: v, action: 'reject' })}
                            className="p-1 text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Employee Draft Edit/Delete Buttons */}
                      {canEditDraft && (
                        <>
                          <button
                            type="button"
                            title="Edit Draft"
                            onClick={() => onEditDraft?.(v)}
                            className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete Draft"
                            onClick={async () => {
                              if (confirm(`Delete draft ${v.voucherNumber}?`)) {
                                await deleteDraftVoucher(v.id);
                              }
                            }}
                            className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Quick Print Button */}
                      <button
                        type="button"
                        title="Print / Export to PDF"
                        onClick={() => onSelectVoucher(v)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-xs transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Print</span>
                      </button>

                      {/* General View Button */}
                      <button
                        type="button"
                        onClick={() => onSelectVoucher(v)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
