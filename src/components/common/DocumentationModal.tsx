import React from 'react';
import { X, BookOpen, CheckCircle, ShieldCheck, Database, Layers, Key } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupabaseModal: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  onOpenSupabaseModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">System Architecture & Assignment Docs</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Prachay Securities / ABC Company Internship Specifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {/* Section 1: Overview */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              1. Project Overview & Workflow
            </h3>
            <p>
              The <strong>Expense Voucher Management System</strong> digitizes the expense reimbursement process for ABC Company, transitioning from paper vouchers to a unified role-governed digital lifecycle.
            </p>
            <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-850 rounded-lg border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
              Draft ➔ Submitted (Pending Approval) ➔ Approved ➔ Visible to Accounts (Settled)
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──➔ Rejected (With Mandatory Reason)
            </div>
          </div>

          {/* Section 2: Role Responsibilities */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              2. User Roles & Access Control (RBAC)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="font-bold text-neutral-900 dark:text-neutral-100 block">Employee</span>
                <ul className="list-disc pl-3.5 space-y-0.5 text-neutral-600 dark:text-neutral-400">
                  <li>Create vouchers</li>
                  <li>Save as Draft or Submit</li>
                  <li>Edit/delete Drafts only</li>
                  <li>Upload signature (canvas/image)</li>
                  <li>View only own vouchers</li>
                </ul>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="font-bold text-neutral-900 dark:text-neutral-100 block">Director (Admin)</span>
                <ul className="list-disc pl-3.5 space-y-0.5 text-neutral-600 dark:text-neutral-400">
                  <li>View all organization vouchers</li>
                  <li>Review pending approvals queue</li>
                  <li>Approve with required Director signature</li>
                  <li>Reject with mandatory reason</li>
                  <li>Cannot edit employee fields</li>
                </ul>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="font-bold text-neutral-900 dark:text-neutral-100 block">Accounts Team</span>
                <ul className="list-disc pl-3.5 space-y-0.5 text-neutral-600 dark:text-neutral-400">
                  <li>View all organization vouchers</li>
                  <li>Monitor approved claims</li>
                  <li>Print official voucher paper</li>
                  <li>Record settlement payments</li>
                  <li>Cannot create, edit, or approve</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Supabase Schema & Realtime */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              3. Supabase Database & Realtime Architecture
            </h3>
            <p className="mb-2">
              The application provides full compatibility with PostgreSQL / Supabase, including Row-Level Security (RLS) policies, sequence-based voucher auto-numbering (<code className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">VCH-2026-XXXX</code>), and realtime replication.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenSupabaseModal();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 rounded-lg border border-neutral-300 dark:border-neutral-700 transition-colors"
            >
              <span>View Full Supabase SQL Queries & Connect Project</span>
            </button>
          </div>

          {/* Section 4: Validation & Business Rules */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              4. Validations & Business Rules Enforced
            </h3>
            <div className="space-y-1 text-neutral-600 dark:text-neutral-300">
              <p>✔ <strong>Department, Expense Title, Expense Date:</strong> Mandatory fields.</p>
              <p>✔ <strong>Amount:</strong> Mandatory and strictly greater than zero ($0.01+).</p>
              <p>✔ <strong>Employee Signature:</strong> Required before submitting for approval.</p>
              <p>✔ <strong>Director Signature:</strong> Mandatory upon approval.</p>
              <p>✔ <strong>Rejection Reason:</strong> Mandatory remarks logged whenever a voucher is rejected.</p>
              <p>✔ <strong>Immutability:</strong> Submitted and approved vouchers are read-only to prevent audit tampering.</p>
            </div>
          </div>

          {/* Section 5: Assumptions */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              5. Assumptions Made During Development
            </h3>
            <div className="space-y-1 text-neutral-600 dark:text-neutral-400">
              <p>• Currency defaults to USD ($) with tabular decimal formatting.</p>
              <p>• Digital signatures support both touch/mouse canvas drawing and image uploads (PNG/JPG).</p>
              <p>• Vouchers can optionally attach bill/receipt invoices for complete proof.</p>
              <p>• Role-switcher enables instant evaluation of all 3 roles without manual logout/login cycles.</p>
            </div>
          </div>
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
