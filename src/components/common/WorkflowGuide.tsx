import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVouchers } from '../../context/VoucherContext';
import { UserRole } from '../../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  Database,
  Shield,
  Edit3,
} from 'lucide-react';

interface WorkflowGuideProps {
  onOpenSupabaseModal: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export const WorkflowGuide: React.FC<WorkflowGuideProps> = ({
  onOpenSupabaseModal,
  onSwitchRole,
}) => {
  const { currentUser } = useAuth();
  const { isSupabaseLive } = useVouchers();

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Hero Intro */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xs transition-colors">
        <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
          ABC Company · Internship Assignment System Guide
        </span>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Expense Voucher Management System
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm mt-2 leading-relaxed max-w-3xl">
          A full-stack digitized replacement for manual paper expense reimbursement. Supports 3 role workflows (Employee, Director, Accounts), digital and image-uploaded signatures, real-time database updates, and printable official receipts.
        </p>

        {/* Quick Role Test Launcher */}
        <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Quick Test as:</span>
          <button
            onClick={() => onSwitchRole('employee')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              currentUser?.role === 'employee'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
            }`}
          >
            Employee (Rahul Sharma)
          </button>
          <button
            onClick={() => onSwitchRole('director')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              currentUser?.role === 'director'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
            }`}
          >
            Director (Sarah Jenkins)
          </button>
          <button
            onClick={() => onSwitchRole('accounts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              currentUser?.role === 'accounts'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
            }`}
          >
            Accounts Team (Michael Chang)
          </button>
          <button
            onClick={onOpenSupabaseModal}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase SQL & Setup</span>
          </button>
        </div>
      </div>

      {/* Visual Workflow Steps */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6 transition-colors">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">4-Stage Voucher Lifecycle</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Every expense request follows this strict state transition pipeline:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stage 1: Draft */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 space-y-2">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-bold text-xs uppercase tracking-wider">
              <Edit3 className="w-4 h-4 text-neutral-500" />
              <span>1. Draft</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Employee prepares expense details. Can freely edit, update amounts, attach receipts, or delete.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-1">
              Editable · Deletable
            </div>
          </div>

          {/* Stage 2: Submitted / Pending Approval */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>2. Submitted</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Employee signs and submits voucher. Locked against employee edits. Enters Director review queue.
            </p>
            <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 pt-1">
              Read-Only · Pending Approval
            </div>
          </div>

          {/* Stage 3: Director Decision */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              <span>3. Review</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Director reviews receipt. Either approves with Director Signature, or rejects with required reason.
            </p>
            <div className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 pt-1">
              Approve OR Reject
            </div>
          </div>

          {/* Stage 4: Accounts Reimbursement */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>4. Settlement</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Approved vouchers are monitored by Accounts for disbursement. Accounts prints official voucher & logs payment.
            </p>
            <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 pt-1">
              Printable · Reimbursable
            </div>
          </div>
        </div>
      </div>

      {/* Role Comparison Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Role Permissions & Governance Matrix</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Enforced both in React interface and PostgreSQL Row-Level Security policies</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-6">Capability / Action</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Director</th>
                <th className="py-3 px-4">Accounts Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
              <tr>
                <td className="py-3 px-6 font-medium">Create New Voucher</td>
                <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">✔ Yes</td>
                <td className="py-3 px-4 text-neutral-400">✖ No</td>
                <td className="py-3 px-4 text-neutral-400">✖ No</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-medium">Edit / Delete Drafts</td>
                <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">✔ Yes (Own drafts only)</td>
                <td className="py-3 px-4 text-neutral-400">✖ No</td>
                <td className="py-3 px-4 text-neutral-400">✖ No</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-medium">Modify Submitted / Approved Vouchers</td>
                <td className="py-3 px-4 text-neutral-400">✖ Read-only locked</td>
                <td className="py-3 px-4 text-neutral-400">✖ Read-only locked</td>
                <td className="py-3 px-4 text-neutral-400">✖ Read-only locked</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-medium">Voucher Visibility Scope</td>
                <td className="py-3 px-4">Own vouchers only</td>
                <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">All organization vouchers</td>
                <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">All organization vouchers</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-medium">Approve / Reject Vouchers</td>
                <td className="py-3 px-4 text-neutral-400">✖ No</td>
                <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">✔ Yes (With signature / reason)</td>
                <td className="py-3 px-4 text-neutral-400">✖ No</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-medium">Print Official Expense Voucher</td>
                <td className="py-3 px-4">✔ Yes (Own vouchers)</td>
                <td className="py-3 px-4">✔ Yes</td>
                <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">✔ Yes</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-medium">Settle Reimbursement Payout</td>
                <td className="py-3 px-4 text-neutral-400">✖ No</td>
                <td className="py-3 px-4 text-neutral-400">✖ No</td>
                <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">✔ Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
