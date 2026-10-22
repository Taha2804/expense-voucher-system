import React from 'react';
import { Voucher } from '../../types';
import { Printer, X } from 'lucide-react';

interface PrintableVoucherProps {
  voucher: Voucher;
  onClose?: () => void;
}

// Convert numbers to words (e.g., 1450.00 -> One Thousand Four Hundred Fifty Dollars and Zero Cents)
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero Dollars';
  
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  function convertHundreds(n: number): string {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  function convertThousands(n: number): string {
    if (n === 0) return '';
    if (n >= 1000000) {
      return convertHundreds(Math.floor(n / 1000000)) + ' Million ' + convertThousands(n % 1000000);
    }
    if (n >= 1000) {
      return convertHundreds(Math.floor(n / 1000)) + ' Thousand ' + convertHundreds(n % 1000);
    }
    return convertHundreds(n);
  }

  const words = convertThousands(integerPart).trim() + ' Dollars';
  const cents = decimalPart > 0 ? ` and ${decimalPart}/100 Cents` : ' and Zero Cents';
  return words + cents;
}

export const PrintableVoucher: React.FC<PrintableVoucherProps> = ({ voucher, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const statusStampColor = {
    'Draft': 'border-neutral-400 text-neutral-500',
    'Pending Approval': 'border-amber-600 text-amber-700',
    'Approved': 'border-emerald-700 text-emerald-800',
    'Rejected': 'border-rose-700 text-rose-800',
  }[voucher.status];

  return (
    <div className="bg-neutral-100 dark:bg-neutral-950 p-4 sm:p-6 rounded-xl flex flex-col items-center">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print w-full max-w-3xl flex items-center justify-between pb-4">
        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Official Document Print Preview</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export to PDF</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              title="Return to standard view"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* The Printable Voucher Paper Sheet */}
      <div
        id="printable-voucher"
        className="w-full max-w-3xl bg-white text-neutral-900 border border-neutral-300 shadow-md p-8 sm:p-10 font-sans relative overflow-hidden"
      >
        {/* Company Header */}
        <div className="border-b-2 border-neutral-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 uppercase">
              ABC Company
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">Corporate Finance & Accounts Division</p>
            <p className="text-[11px] text-neutral-400">Prachay Securities Financial Services Group</p>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Expense Reimbursement Voucher</span>
            <span className="text-lg font-mono font-bold text-neutral-900 mt-1">{voucher.voucherNumber}</span>
            <span className="text-xs text-neutral-500 mt-0.5 font-mono">Date: {voucher.voucherDate}</span>
          </div>
        </div>

        {/* Status Stamp */}
        <div className="absolute right-10 top-36 sm:top-28 pointer-events-none opacity-85 rotate-[-12deg]">
          <div className={`px-4 py-1.5 border-2 rounded-md font-mono font-bold text-xs uppercase tracking-widest ${statusStampColor}`}>
            [ {voucher.status} ]
          </div>
        </div>

        {/* Voucher Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-neutral-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Employee Name</span>
            <span className="font-semibold text-neutral-800 mt-0.5 block">{voucher.employeeName}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Employee ID</span>
            <span className="font-mono text-neutral-700 mt-0.5 block">{voucher.employeeCode || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Department</span>
            <span className="text-neutral-800 mt-0.5 block">{voucher.department}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Expense Date</span>
            <span className="font-mono text-neutral-800 mt-0.5 block">{voucher.expenseDate}</span>
          </div>
        </div>

        {/* Expense Detail Table */}
        <div className="my-6">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-neutral-500 uppercase text-[10px] tracking-wider">
                <th className="py-2 font-bold w-12">#</th>
                <th className="py-2 font-bold">Expense Title & Description</th>
                <th className="py-2 font-bold w-36">Category</th>
                <th className="py-2 font-bold text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-200">
                <td className="py-3 font-mono text-neutral-400">01</td>
                <td className="py-3 pr-4">
                  <div className="font-semibold text-neutral-900">{voucher.expenseTitle}</div>
                  <div className="text-neutral-600 text-[11px] mt-1 whitespace-pre-wrap leading-relaxed">
                    {voucher.expenseDescription}
                  </div>
                  {voucher.receiptName && (
                    <div className="text-[10px] text-neutral-500 mt-1 italic">
                      Supporting Voucher: {voucher.receiptName}
                    </div>
                  )}
                </td>
                <td className="py-3 text-neutral-600 align-top">{voucher.expenseCategory}</td>
                <td className="py-3 text-right font-mono font-semibold text-neutral-900 align-top tabular-nums">
                  ${voucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-b-2 border-neutral-900 font-bold">
                <td colSpan={3} className="py-3 text-right uppercase text-[11px] tracking-wider text-neutral-600">
                  Total Claim Amount:
                </td>
                <td className="py-3 text-right font-mono text-base text-neutral-900 tabular-nums">
                  ${voucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Amount in Words */}
          <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded text-xs">
            <span className="font-semibold text-neutral-500 uppercase text-[10px] tracking-wider mr-2">Amount in Words:</span>
            <span className="font-medium text-neutral-800 italic">{numberToWords(voucher.amount)}</span>
          </div>
        </div>

        {/* Rejection Remarks Notice if Rejected */}
        {voucher.status === 'Rejected' && voucher.rejectionReason && (
          <div className="my-5 p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs">
            <span className="font-bold text-rose-800 block mb-1">Director Rejection Remarks:</span>
            <p className="text-rose-900 leading-relaxed">{voucher.rejectionReason}</p>
          </div>
        )}

        {/* Settlement Notice if Reimbursed */}
        {voucher.isReimbursed && (
          <div className="my-5 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-emerald-800">Accounts Settlement Processed</span>
              <span className="text-emerald-700 ml-2 font-mono text-[11px]">
                Ref: {voucher.paymentReference || 'N/A'}
              </span>
            </div>
            {voucher.reimbursedDate && (
              <span className="text-emerald-600 text-[11px]">
                {new Date(voucher.reimbursedDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Signatures & Approvals Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 mt-6 border-t border-neutral-300 text-xs">
          {/* Employee Signature Block */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Submitted By (Employee)
            </span>
            <div className="h-20 border-b border-neutral-400 flex items-end justify-center pb-1">
              {voucher.employeeSignature ? (
                <img
                  src={voucher.employeeSignature}
                  alt={`${voucher.employeeName} signature`}
                  className="max-h-16 max-w-full object-contain"
                />
              ) : (
                <span className="text-neutral-400 italic text-[11px] mb-2">[No signature recorded]</span>
              )}
            </div>
            <div className="mt-2 text-neutral-700 font-semibold">{voucher.employeeName}</div>
            <div className="text-[11px] text-neutral-400 font-mono">Date: {voucher.voucherDate}</div>
          </div>

          {/* Director Signature Block */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Approved By (Managing Director)
            </span>
            <div className="h-20 border-b border-neutral-400 flex items-end justify-center pb-1">
              {voucher.directorSignature ? (
                <img
                  src={voucher.directorSignature}
                  alt="Director signature"
                  className="max-h-16 max-w-full object-contain"
                />
              ) : voucher.status === 'Approved' ? (
                <span className="text-emerald-700 font-mono text-xs font-bold mb-2">APPROVED ELECTRONICALLY</span>
              ) : (
                <span className="text-neutral-400 italic text-[11px] mb-2">
                  {voucher.status === 'Rejected' ? '[Voucher Rejected]' : '[Pending Review]'}
                </span>
              )}
            </div>
            <div className="mt-2 text-neutral-700 font-semibold">
              {voucher.status === 'Approved' ? 'Sarah Jenkins (Director)' : 'Executive Approval Authority'}
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">
              {voucher.approvalDate
                ? `Approval Date: ${new Date(voucher.approvalDate).toLocaleDateString()}`
                : 'Status: ' + voucher.status}
            </div>
          </div>
        </div>

        {/* Footer Audit Notice */}
        <div className="mt-10 pt-4 border-t border-neutral-200 text-[10px] text-neutral-400 flex items-center justify-between">
          <span>System Record ID: {voucher.id}</span>
          <span>Generated: {new Date().toLocaleString()} · ABC Company Finance Portal</span>
        </div>
      </div>
    </div>
  );
};
