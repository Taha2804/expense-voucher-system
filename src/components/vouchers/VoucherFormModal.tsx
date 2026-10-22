import React, { useState, useEffect } from 'react';
import { Voucher } from '../../types';
import { useVouchers } from '../../context/VoucherContext';
import { useAuth } from '../../context/AuthContext';
import { SignaturePad } from '../common/SignaturePad';
import { ReceiptUploader } from '../common/ReceiptUploader';
import { DEPARTMENTS, EXPENSE_CATEGORIES } from '../../lib/initialData';
import { X, AlertCircle, Save, Send } from 'lucide-react';

interface VoucherFormModalProps {
  voucherToEdit?: Voucher | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (voucher: Voucher) => void;
}

export const VoucherFormModal: React.FC<VoucherFormModalProps> = ({
  voucherToEdit,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createVoucher, updateDraftVoucher } = useVouchers();
  const { currentUser } = useAuth();

  const isEditing = Boolean(voucherToEdit);

  // Form Fields
  const [department, setDepartment] = useState(currentUser?.department || DEPARTMENTS[0]);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [voucherDate, setVoucherDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [employeeSignature, setEmployeeSignature] = useState(currentUser?.savedSignature || '');
  const [receiptName, setReceiptName] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (voucherToEdit) {
      setDepartment(voucherToEdit.department);
      setExpenseTitle(voucherToEdit.expenseTitle);
      setExpenseCategory(voucherToEdit.expenseCategory);
      setExpenseDate(voucherToEdit.expenseDate);
      setVoucherDate(voucherToEdit.voucherDate);
      setAmount(voucherToEdit.amount.toString());
      setExpenseDescription(voucherToEdit.expenseDescription);
      setEmployeeSignature(voucherToEdit.employeeSignature);
      setReceiptName(voucherToEdit.receiptName || '');
      setReceiptUrl(voucherToEdit.receiptUrl || '');
    } else {
      setDepartment(currentUser?.department || DEPARTMENTS[0]);
      setExpenseTitle('');
      setExpenseCategory(EXPENSE_CATEGORIES[0]);
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setVoucherDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setExpenseDescription('');
      setEmployeeSignature(currentUser?.savedSignature || '');
      setReceiptName('');
      setReceiptUrl('');
    }
    setError(null);
  }, [voucherToEdit, currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (submitNow: boolean) => {
    setError(null);

    // Business validations
    if (!department.trim()) {
      setError('Department is mandatory.');
      return;
    }
    if (!expenseTitle.trim()) {
      setError('Expense Title is mandatory.');
      return;
    }
    if (!expenseDate) {
      setError('Expense Date is mandatory.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount is mandatory and must be greater than zero.');
      return;
    }

    if (submitNow && !employeeSignature) {
      setError('Employee Signature is mandatory before submitting for approval.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && voucherToEdit) {
        const updated = await updateDraftVoucher(
          voucherToEdit.id,
          {
            department,
            expenseTitle: expenseTitle.trim(),
            expenseCategory,
            expenseDate,
            voucherDate,
            amount: parsedAmount,
            expenseDescription: expenseDescription.trim(),
            employeeSignature,
            receiptName,
            receiptUrl,
          },
          submitNow
        );
        onSuccess(updated);
      } else {
        const created = await createVoucher(
          {
            voucherDate,
            expenseDate,
            department,
            expenseTitle: expenseTitle.trim(),
            expenseCategory,
            expenseDescription: expenseDescription.trim(),
            amount: parsedAmount,
            employeeId: currentUser?.id || 'emp-user',
            employeeName: currentUser?.name || 'Anonymous Employee',
            employeeCode: currentUser?.employeeId,
            employeeSignature,
            receiptName,
            receiptUrl,
          },
          !submitNow
        );
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {isEditing ? `Edit Draft Voucher: ${voucherToEdit?.voucherNumber}` : 'Create New Expense Voucher'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isEditing ? 'Make edits before submitting for Director approval' : 'Draft or directly submit expense for review'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide mb-1">
                Department <span className="text-rose-600">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide mb-1">
                Expense Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide mb-1">
              Expense Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="e.g. Client Dinner with Tech Leadership, Laptop RAM Upgrade"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide mb-1">
                Expense Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide mb-1">
                Voucher Date
              </label>
              <input
                type="date"
                value={voucherDate}
                onChange={(e) => setVoucherDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide mb-1">
                Amount ($) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide mb-1">
              Detailed Description & Business Justification
            </label>
            <textarea
              rows={3}
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              placeholder="Provide context regarding business necessity, client names, project names..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100 leading-relaxed"
            />
          </div>

          {/* Attachment */}
          <ReceiptUploader
            receiptName={receiptName}
            onReceiptChange={(name, url) => {
              setReceiptName(name);
              if (url) setReceiptUrl(url);
            }}
          />

          {/* Section 2: Employee Signature */}
          <div className="pt-2">
            <SignaturePad
              label="Employee Signature"
              initialSignature={employeeSignature}
              onSignatureChange={(sig) => setEmployeeSignature(sig)}
              required
            />
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
              Note: You can save this voucher as a <strong>Draft</strong> without a signature, but a signature is required before <strong>Submitting for Approval</strong>.
            </p>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white dark:text-neutral-900 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 rounded-lg transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Approval</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
