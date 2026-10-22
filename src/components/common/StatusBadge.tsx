import React from 'react';
import { VoucherStatus } from '../../types';
import { CheckCircle2, Clock, FileEdit, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: VoucherStatus;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  switch (status) {
    case 'Draft':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600">
          {showIcon && <FileEdit className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
          <span>Draft</span>
        </span>
      );
    case 'Pending Approval':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          <span>Pending Approval</span>
        </span>
      );
    case 'Approved':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          <span>Approved</span>
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
          <span>Rejected</span>
        </span>
      );
    default:
      return <span className="text-xs text-neutral-500">{status}</span>;
  }
};
