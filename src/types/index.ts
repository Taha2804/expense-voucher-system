export type UserRole = 'employee' | 'director' | 'accounts';

export type VoucherStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  department: string;
  avatarUrl?: string;
  savedSignature?: string; // base64 or storage url
}

export interface Voucher {
  id: string;
  voucherNumber: string; // e.g., VCH-2026-0001
  voucherDate: string; // YYYY-MM-DD
  expenseDate: string; // YYYY-MM-DD
  department: string;
  expenseTitle: string;
  expenseCategory: string;
  expenseDescription: string;
  amount: number;
  
  // Employee info
  employeeId: string;
  employeeName: string;
  employeeCode?: string; // ABC-EMP-xxx
  employeeSignature: string; // base64 or URL
  receiptUrl?: string; // optional receipt attachment
  receiptName?: string;
  
  // Workflow & Approval info
  status: VoucherStatus;
  directorSignature?: string;
  approvalDate?: string;
  rejectionReason?: string;
  
  // Accounts reimbursement tracking (bonus extension)
  isReimbursed?: boolean;
  reimbursedDate?: string;
  paymentReference?: string;
  
  // Audit info
  createdAt: string;
  updatedAt: string;
}

export interface VoucherFilter {
  searchQuery: string;
  department: string;
  category: string;
  status: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'voucher-desc';
}

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
}
