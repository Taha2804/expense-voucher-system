import React, { useState } from 'react';
import { Voucher } from '../../types';
import { useVouchers } from '../../context/VoucherContext';
import { useAuth } from '../../context/AuthContext';
import { SignaturePad } from '../common/SignaturePad';
import { CheckCircle2, XCircle, X, AlertCircle } from 'lucide-react';

interface DirectorApprovalModalProps {
  voucher: Voucher;
  actionType: 'approve' | 'reject';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DirectorApprovalModal: React.FC<DirectorApprovalModalProps> = ({
  voucher,
  actionType,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { approveVoucher, rejectVoucher } = useVouchers();
  const { currentUser } = useAuth();
  
  const [directorSignature, setDirectorSignature] = useState(currentUser?.savedSignature || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (actionType === 'approve') {
        if (!directorSignature.trim()) {
          throw new Error('Director Signature is mandatory before approval');
        }
        await approveVoucher(voucher.id, directorSignature);
      } else {
        if (!rejectionReason.trim()) {
          throw new Error('Rejection Reason is mandatory if a voucher is rejected');
        }
        await rejectVoucher(voucher.id, rejectionReason.trim());
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            {actionType === 'approve' ? (
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-lg">
                <XCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {actionType === 'approve' ? 'Approve Expense Voucher' : 'Reject Expense Voucher'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">{voucher.voucherNumber} · {voucher.employeeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Summary Strip */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Expense Title:</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[260px]">{voucher.expenseTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Amount to Reimburse:</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                ${voucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Department:</span>
              <span className="text-neutral-700 dark:text-neutral-300">{voucher.department}</span>
            </div>
          </div>

          {actionType === 'approve' ? (
            <div className="space-y-2">
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                As Managing Director, your digital authorization signature will be permanently stamped on this voucher.
              </p>
              <SignaturePad
                label="Director Authorization Signature"
                initialSignature={directorSignature}
                onSignatureChange={(sig) => setDirectorSignature(sig)}
                required
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                Rejection Remarks / Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State specific policy reasons (e.g. Missing tax invoice, exceeds per-diem meals cap, unauthorized non-business expense)..."
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100 leading-relaxed"
              />
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                This explanation will be immediately visible to {voucher.employeeName} on their dashboard.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors shadow-xs ${
                actionType === 'approve'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              {isSubmitting
                ? 'Processing...'
                : actionType === 'approve'
                ? 'Confirm & Authorize Voucher'
                : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
