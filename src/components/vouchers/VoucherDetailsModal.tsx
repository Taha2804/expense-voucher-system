import React, { useState } from 'react';
import { Voucher } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useVouchers } from '../../context/VoucherContext';
import { StatusBadge } from '../common/StatusBadge';
import { PrintableVoucher } from './PrintableVoucher';
import { DirectorApprovalModal } from './DirectorApprovalModal';
import {
  X,
  Printer,
  FileEdit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

interface VoucherDetailsModalProps {
  voucher: Voucher;
  isOpen: boolean;
  onClose: () => void;
  onEditDraft?: (voucher: Voucher) => void;
}

export const VoucherDetailsModal: React.FC<VoucherDetailsModalProps> = ({
  voucher,
  isOpen,
  onClose,
  onEditDraft,
}) => {
  const { currentUser } = useAuth();
  const { deleteDraftVoucher, markReimbursed } = useVouchers();

  const [viewPrintMode, setViewPrintMode] = useState(false);
  const [directorAction, setDirectorAction] = useState<'approve' | 'reject' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [showPaymentInput, setShowPaymentInput] = useState(false);

  if (!isOpen) return null;

  const isEmployeeOwner = currentUser?.role === 'employee' && voucher.employeeId === currentUser.id;
  const isDirector = currentUser?.role === 'director';
  const isAccounts = currentUser?.role === 'accounts';

  const handleDeleteDraft = async () => {
    if (!confirm(`Are you sure you want to permanently delete draft voucher ${voucher.voucherNumber}?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteDraftVoucher(voucher.id);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkReimbursed = async () => {
    try {
      await markReimbursed(voucher.id, paymentRefInput.trim() || undefined);
      setShowPaymentInput(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to update reimbursement');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">{voucher.voucherNumber}</span>
            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
            <StatusBadge status={voucher.status} />
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Print / Export to PDF button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white shadow-xs transition-colors cursor-pointer"
              title="Print official voucher or export to PDF using print styles"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export to PDF</span>
            </button>

            {/* Preview paper voucher toggle */}
            <button
              type="button"
              onClick={() => setViewPrintMode(!viewPrintMode)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                viewPrintMode
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
              }`}
              title={viewPrintMode ? 'Switch to interactive details view' : 'Preview official printable voucher format'}
            >
              <span>{viewPrintMode ? 'Standard View' : 'Preview Paper'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Always provide official printable voucher DOM for @media print */}
          <div className="print-only">
            <PrintableVoucher voucher={voucher} />
          </div>

          {viewPrintMode ? (
            <PrintableVoucher voucher={voucher} onClose={() => setViewPrintMode(false)} />
          ) : (
            <>
              {/* Rejection Notice Banner */}
              {voucher.status === 'Rejected' && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Voucher Rejected by Director</span>
                  </div>
                  <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed pl-6">
                    <strong>Reason:</strong> {voucher.rejectionReason || 'No reason specified'}
                  </p>
                </div>
              )}

              {/* Reimbursement Settled Banner */}
              {voucher.isReimbursed && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Reimbursement Processed by Accounts</span>
                    {voucher.paymentReference && (
                      <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">({voucher.paymentReference})</span>
                    )}
                  </div>
                  {voucher.reimbursedDate && (
                    <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                      {new Date(voucher.reimbursedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {/* Hero Key Amount & Title */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{voucher.expenseTitle}</h1>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    <span>{voucher.department}</span>
                    <span aria-hidden="true">·</span>
                    <span>{voucher.expenseCategory}</span>
                    <span aria-hidden="true">·</span>
                    <span>Expense on {voucher.expenseDate}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">Claim Amount</span>
                  <span className="text-2xl font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                    ${voucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Business Description & Context
                </span>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap bg-neutral-50 dark:bg-neutral-800/60 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  {voucher.expenseDescription || 'No detailed description provided.'}
                </p>
              </div>

              {/* Receipt / Attachment */}
              {voucher.receiptName && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{voucher.receiptName}</span>
                  </div>
                  {voucher.receiptUrl ? (
                    <a
                      href={voucher.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-neutral-900 dark:text-neutral-100 font-semibold hover:underline"
                    >
                      View Receipt File
                    </a>
                  ) : (
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 italic">Attached on submission</span>
                  )}
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 block tracking-wider">Submitted By</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mt-0.5">{voucher.employeeName}</span>
                  {voucher.employeeCode && (
                    <span className="font-mono text-neutral-500 dark:text-neutral-400 text-[11px]">{voucher.employeeCode}</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 block tracking-wider">Voucher Date</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300 block mt-0.5">{voucher.voucherDate}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 block tracking-wider">Approval Date</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300 block mt-0.5">
                    {voucher.approvalDate ? new Date(voucher.approvalDate).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>

              {/* Signatures Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                {/* Employee Signature Card */}
                <div className="p-3.5 bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">Employee Signature</span>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">Date: {voucher.voucherDate}</span>
                  </div>
                  <div className="h-20 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg flex items-center justify-center p-2">
                    {voucher.employeeSignature ? (
                      <img
                        src={voucher.employeeSignature}
                        alt="Employee signature"
                        className="max-h-full max-w-full object-contain filter dark:invert"
                      />
                    ) : (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">Signature missing (Draft status)</span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{voucher.employeeName}</div>
                </div>

                {/* Director Signature Card */}
                <div className="p-3.5 bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">Director Signature</span>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
                      {voucher.approvalDate ? new Date(voucher.approvalDate).toLocaleDateString() : 'Awaiting review'}
                    </span>
                  </div>
                  <div className="h-20 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg flex items-center justify-center p-2">
                    {voucher.directorSignature ? (
                      <img
                        src={voucher.directorSignature}
                        alt="Director signature"
                        className="max-h-full max-w-full object-contain filter dark:invert"
                      />
                    ) : voucher.status === 'Approved' ? (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-mono">AUTHORIZED ELECTRONICALLY</span>
                    ) : (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">
                        {voucher.status === 'Rejected' ? 'Application Rejected' : 'Signature pending approval'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Executive Management Approval</div>
                </div>
              </div>

              {/* Accounts Disbursement Panel */}
              {isAccounts && voucher.status === 'Approved' && !voucher.isReimbursed && (
                <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">Accounts Action: Settle Reimbursement</span>
                      <p className="text-[11px] text-amber-800 dark:text-amber-400">
                        Voucher is director-approved. Once bank transfer or cash voucher is generated, record payment.
                      </p>
                    </div>
                    {!showPaymentInput && (
                      <button
                        onClick={() => setShowPaymentInput(true)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Record Settlement
                      </button>
                    )}
                  </div>

                  {showPaymentInput && (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Payment Reference # (e.g. NEFT-9921, Cheque 401)"
                        value={paymentRefInput}
                        onChange={(e) => setPaymentRefInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-amber-300 dark:border-amber-700 text-neutral-900 dark:text-neutral-100 rounded-lg font-mono"
                      />
                      <button
                        onClick={handleMarkReimbursed}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                      >
                        Confirm Settlement
                      </button>
                      <button
                        onClick={() => setShowPaymentInput(false)}
                        className="px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Employee Draft Controls */}
            {isEmployeeOwner && voucher.status === 'Draft' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditDraft?.(voucher);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
                >
                  <FileEdit className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                  <span>Edit Draft</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDraft}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Draft</span>
                </button>
              </>
            )}

            {/* Read-only notification if employee submitted */}
            {isEmployeeOwner && voucher.status !== 'Draft' && (
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Submitted vouchers are read-only and locked for audit integrity.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Director Approval / Rejection Controls */}
            {isDirector && voucher.status === 'Pending Approval' && (
              <>
                <button
                  type="button"
                  onClick={() => setDirectorAction('reject')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirectorAction('approve')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Review & Approve</span>
                </button>
              </>
            )}

            {/* Print / Export to PDF Footer Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors shadow-xs cursor-pointer"
              title="Print voucher document or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export to PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Director Approval / Rejection Sub-modal */}
      {directorAction && (
        <DirectorApprovalModal
          voucher={voucher}
          actionType={directorAction}
          isOpen={Boolean(directorAction)}
          onClose={() => setDirectorAction(null)}
          onSuccess={() => {
            setDirectorAction(null);
            onClose();
          }}
        />
      )}
    </div>
  );
};
