import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Voucher, VoucherFilter, VoucherStatus } from '../types';
import { INITIAL_VOUCHERS } from '../lib/initialData';
import { useAuth } from './AuthContext';
import { getSupabaseClient, getStoredSupabaseConfig } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface VoucherContextType {
  vouchers: Voucher[];
  allVouchers: Voucher[]; // Unfiltered, scoped by role permissions
  filter: VoucherFilter;
  setFilter: React.Dispatch<React.SetStateAction<VoucherFilter>>;
  resetFilter: () => void;
  createVoucher: (data: Omit<Voucher, 'id' | 'voucherNumber' | 'status' | 'createdAt' | 'updatedAt'>, isDraft: boolean) => Promise<Voucher>;
  updateDraftVoucher: (id: string, updates: Partial<Voucher>, submitNow?: boolean) => Promise<Voucher>;
  deleteDraftVoucher: (id: string) => Promise<boolean>;
  approveVoucher: (id: string, directorSignature: string) => Promise<Voucher>;
  rejectVoucher: (id: string, rejectionReason: string) => Promise<Voucher>;
  markReimbursed: (id: string, paymentReference?: string) => Promise<Voucher>;
  resetToSampleData: () => void;
  isSupabaseLive: boolean;
  lastLiveEvent: string | null;
}

const VoucherContext = createContext<VoucherContextType | undefined>(undefined);

const STORAGE_VOUCHERS_KEY = 'abccompany_expense_vouchers_v1';
const REALTIME_CHANNEL_NAME = 'abc_voucher_sync_broadcast';

const defaultFilter: VoucherFilter = {
  searchQuery: '',
  department: '',
  category: '',
  status: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date-desc',
};

export const VoucherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [rawVouchers, setRawVouchers] = useState<Voucher[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VOUCHERS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed reading vouchers from storage:', e);
    }
    return INITIAL_VOUCHERS;
  });

  const [filter, setFilter] = useState<VoucherFilter>(defaultFilter);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [lastLiveEvent, setLastLiveEvent] = useState<string | null>(null);

  // Strict User Account Isolation:
  // Reset all search and filter queries whenever the active user account changes
  // so no search queries, filters, or states bleed between accounts.
  useEffect(() => {
    setFilter(defaultFilter);
  }, [currentUser?.id]);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VOUCHERS_KEY, JSON.stringify(rawVouchers));
    } catch (e) {
      console.error('Failed writing vouchers to storage:', e);
    }
  }, [rawVouchers]);

  // Broadcast channel for multi-tab realtime simulation
  useEffect(() => {
    let broadcast: BroadcastChannel | null = null;
    try {
      broadcast = new BroadcastChannel(REALTIME_CHANNEL_NAME);
      broadcast.onmessage = (event) => {
        if (event.data?.type === 'SYNC_VOUCHERS' && Array.isArray(event.data.payload)) {
          setRawVouchers(event.data.payload);
          setLastLiveEvent(`Live update received: ${event.data.action || 'Data updated'} (${new Date().toLocaleTimeString()})`);
        }
      };
    } catch (err) {
      // BroadcastChannel might not be supported in older sandbox environments
    }

    return () => {
      broadcast?.close();
    };
  }, []);

  const notifyChange = useCallback((action: string, updatedList: Voucher[]) => {
    setLastLiveEvent(`${action} at ${new Date().toLocaleTimeString()}`);
    try {
      const bc = new BroadcastChannel(REALTIME_CHANNEL_NAME);
      bc.postMessage({ type: 'SYNC_VOUCHERS', action, payload: updatedList });
      bc.close();
    } catch (err) {
      // ignore
    }
  }, []);

  // Real Supabase PostgreSQL realtime subscription if credentials exist
  useEffect(() => {
    const supabase = getSupabaseClient();
    const config = getStoredSupabaseConfig();
    if (!supabase || !config.url) {
      setIsSupabaseLive(false);
      return;
    }

    setIsSupabaseLive(true);

    const mapDbRow = (row: any): Voucher => ({
      id: row.id || row.voucher_number,
      voucherNumber: row.voucher_number || row.voucherNumber,
      voucherDate: row.voucher_date || row.voucherDate,
      expenseDate: row.expense_date || row.expenseDate,
      department: row.department,
      expenseTitle: row.expense_title || row.expenseTitle,
      expenseCategory: row.expense_category || row.expenseCategory,
      expenseDescription: row.expense_description || row.expenseDescription,
      amount: Number(row.amount),
      employeeId: row.employee_id || row.employeeId,
      employeeName: row.employee_name || row.employeeName,
      employeeCode: row.employee_code || row.employeeCode,
      employeeSignature: row.employee_signature || row.employeeSignature,
      receiptUrl: row.receipt_url || row.receiptUrl,
      receiptName: row.receipt_name || row.receiptName,
      status: row.status,
      directorSignature: row.director_signature || row.directorSignature,
      approvalDate: row.approval_date || row.approvalDate,
      rejectionReason: row.rejection_reason || row.rejectionReason,
      isReimbursed: Boolean(row.is_reimbursed || row.isReimbursed),
      reimbursedDate: row.reimbursed_date || row.reimbursedDate,
      paymentReference: row.payment_reference || row.paymentReference,
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt,
    });

    // Initial fetch from Supabase
    supabase.from('vouchers').select('*').then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        setRawVouchers(data.map(mapDbRow));
      }
    });

    // Real-time channel listener
    const channel = supabase
      .channel('vouchers_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vouchers' },
        (payload: any) => {
          setLastLiveEvent(`Supabase Realtime: ${payload.eventType} event on vouchers`);
          supabase.from('vouchers').select('*').then(({ data }) => {
            if (data && data.length > 0) {
              setRawVouchers(data.map(mapDbRow));
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper to generate next unique voucher number
  const generateVoucherNumber = useCallback((existing: Voucher[]): string => {
    const currentYear = new Date().getFullYear();
    const prefix = `VCH-${currentYear}-`;
    const numbers = existing
      .map(v => {
        const match = v.voucherNumber.match(/VCH-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextSeq = (numbers.length > 0 ? Math.max(...numbers) : 1000) + 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }, []);

  // Filter vouchers according to user role permissions:
  // - Employees can ONLY see their own vouchers
  // - Director and Accounts can see ALL vouchers
  const roleScopedVouchers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'employee') {
      return rawVouchers.filter(v => v.employeeId === currentUser.id);
    }
    return rawVouchers;
  }, [rawVouchers, currentUser]);

  // Apply search & filtering & sorting
  const filteredVouchers = useMemo(() => {
    return roleScopedVouchers
      .filter((v) => {
        // Search query: match voucher number, title, employee name, or description
        if (filter.searchQuery.trim()) {
          const q = filter.searchQuery.toLowerCase();
          const matchNumber = v.voucherNumber.toLowerCase().includes(q);
          const matchTitle = v.expenseTitle.toLowerCase().includes(q);
          const matchEmp = v.employeeName.toLowerCase().includes(q);
          const matchDesc = v.expenseDescription.toLowerCase().includes(q);
          if (!matchNumber && !matchTitle && !matchEmp && !matchDesc) return false;
        }

        // Department filter
        if (filter.department && v.department !== filter.department) {
          return false;
        }

        // Category filter
        if (filter.category && v.expenseCategory !== filter.category) {
          return false;
        }

        // Status filter
        if (filter.status && v.status !== filter.status) {
          return false;
        }

        // Date range
        if (filter.startDate && v.expenseDate < filter.startDate) {
          return false;
        }
        if (filter.endDate && v.expenseDate > filter.endDate) {
          return false;
        }

        // Amount range
        if (filter.minAmount && v.amount < parseFloat(filter.minAmount)) {
          return false;
        }
        if (filter.maxAmount && v.amount > parseFloat(filter.maxAmount)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filter.sortBy) {
          case 'date-desc':
            return new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime();
          case 'date-asc':
            return new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime();
          case 'amount-desc':
            return b.amount - a.amount;
          case 'amount-asc':
            return a.amount - b.amount;
          case 'voucher-desc':
            return b.voucherNumber.localeCompare(a.voucherNumber);
          default:
            return 0;
        }
      });
  }, [roleScopedVouchers, filter]);

  const resetFilter = () => {
    setFilter(defaultFilter);
  };

  // Create voucher
  const createVoucher = async (
    data: Omit<Voucher, 'id' | 'voucherNumber' | 'status' | 'createdAt' | 'updatedAt'>,
    isDraft: boolean
  ): Promise<Voucher> => {
    if (!currentUser) throw new Error('You must be logged in to create a voucher');
    if (currentUser.role !== 'employee') throw new Error('Only employees can create vouchers');

    // Validations
    if (!data.department.trim()) throw new Error('Department is mandatory');
    if (!data.expenseTitle.trim()) throw new Error('Expense Title is mandatory');
    if (!data.expenseDate) throw new Error('Expense Date is mandatory');
    if (data.amount <= 0) throw new Error('Amount must be greater than zero');
    if (!isDraft && !data.employeeSignature) {
      throw new Error('Employee Signature is mandatory before submission');
    }

    const newVoucherNumber = generateVoucherNumber(rawVouchers);
    const nowIso = new Date().toISOString();

    const newVoucher: Voucher = {
      ...data,
      id: `vch-${Date.now()}`,
      voucherNumber: newVoucherNumber,
      status: isDraft ? 'Draft' : 'Pending Approval',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updated = [newVoucher, ...rawVouchers];
    setRawVouchers(updated);
    notifyChange(`Created voucher ${newVoucherNumber} (${newVoucher.status})`, updated);

    // If Supabase is connected, write to Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('vouchers').insert({
          voucher_number: newVoucher.voucherNumber,
          voucher_date: newVoucher.voucherDate,
          expense_date: newVoucher.expenseDate,
          department: newVoucher.department,
          expense_title: newVoucher.expenseTitle,
          expense_category: newVoucher.expenseCategory,
          expense_description: newVoucher.expenseDescription,
          amount: newVoucher.amount,
          employee_id: currentUser.id,
          employee_name: newVoucher.employeeName,
          employee_code: newVoucher.employeeCode,
          employee_signature: newVoucher.employeeSignature,
          receipt_name: newVoucher.receiptName,
          receipt_url: newVoucher.receiptUrl,
          status: newVoucher.status,
        });
      } catch (err) {
        console.warn('Supabase remote insert fallback to local:', err);
      }
    }

    if (!isDraft) {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    }

    return newVoucher;
  };

  // Update draft voucher
  const updateDraftVoucher = async (
    id: string,
    updates: Partial<Voucher>,
    submitNow: boolean = false
  ): Promise<Voucher> => {
    const existing = rawVouchers.find(v => v.id === id);
    if (!existing) throw new Error('Voucher not found');

    if (existing.status !== 'Draft') {
      throw new Error('Only Draft vouchers can be edited');
    }

    if (currentUser?.role === 'employee' && existing.employeeId !== currentUser.id) {
      throw new Error('You can only edit your own vouchers');
    }

    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const nextStatus: VoucherStatus = submitNow ? 'Pending Approval' : 'Draft';
    if (submitNow) {
      const sig = updates.employeeSignature || existing.employeeSignature;
      if (!sig) {
        throw new Error('Employee signature is mandatory before submitting for approval');
      }
    }

    const updatedVoucher: Voucher = {
      ...existing,
      ...updates,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = rawVouchers.map(v => v.id === id ? updatedVoucher : v);
    setRawVouchers(updatedList);
    notifyChange(
      submitNow ? `Submitted voucher ${existing.voucherNumber} for approval` : `Updated draft ${existing.voucherNumber}`,
      updatedList
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('vouchers').update({
          expense_title: updatedVoucher.expenseTitle,
          expense_category: updatedVoucher.expenseCategory,
          expense_description: updatedVoucher.expenseDescription,
          amount: updatedVoucher.amount,
          department: updatedVoucher.department,
          status: updatedVoucher.status,
          employee_signature: updatedVoucher.employeeSignature,
          updated_at: updatedVoucher.updatedAt,
        }).eq('voucher_number', existing.voucherNumber);
      } catch (err) {
        console.warn('Supabase updateDraft error:', err);
      }
    }

    if (submitNow) {
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.75 } });
    }

    return updatedVoucher;
  };

  // Delete draft voucher
  const deleteDraftVoucher = async (id: string): Promise<boolean> => {
    const existing = rawVouchers.find(v => v.id === id);
    if (!existing) return false;

    if (existing.status !== 'Draft') {
      throw new Error('Only vouchers in Draft status can be deleted');
    }

    if (currentUser?.role === 'employee' && existing.employeeId !== currentUser.id) {
      throw new Error('You can only delete your own draft vouchers');
    }

    const updatedList = rawVouchers.filter(v => v.id !== id);
    setRawVouchers(updatedList);
    notifyChange(`Deleted draft voucher ${existing.voucherNumber}`, updatedList);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('vouchers').delete().eq('voucher_number', existing.voucherNumber);
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }
    }

    return true;
  };

  // Approve voucher (Director only)
  const approveVoucher = async (id: string, directorSignature: string): Promise<Voucher> => {
    if (!currentUser || currentUser.role !== 'director') {
      throw new Error('Only the Director can approve vouchers');
    }

    if (!directorSignature.trim()) {
      throw new Error('Director Signature is mandatory before approval');
    }

    const existing = rawVouchers.find(v => v.id === id);
    if (!existing) throw new Error('Voucher not found');

    if (existing.status !== 'Pending Approval') {
      throw new Error(`Cannot approve a voucher with status: ${existing.status}`);
    }

    const approvedVoucher: Voucher = {
      ...existing,
      status: 'Approved',
      directorSignature,
      approvalDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = rawVouchers.map(v => v.id === id ? approvedVoucher : v);
    setRawVouchers(updatedList);
    notifyChange(`Approved voucher ${existing.voucherNumber}`, updatedList);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('vouchers').update({
          status: 'Approved',
          director_signature: directorSignature,
          approval_date: approvedVoucher.approvalDate,
          updated_at: approvedVoucher.updatedAt,
        }).eq('voucher_number', existing.voucherNumber);
      } catch (err) {
        console.warn('Supabase approve error:', err);
      }
    }

    // Celebration confetti
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#059669', '#10b981', '#34d399', '#f59e0b']
    });

    return approvedVoucher;
  };

  // Reject voucher (Director only)
  const rejectVoucher = async (id: string, rejectionReason: string): Promise<Voucher> => {
    if (!currentUser || currentUser.role !== 'director') {
      throw new Error('Only the Director can reject vouchers');
    }

    if (!rejectionReason.trim()) {
      throw new Error('Rejection Reason is mandatory if a voucher is rejected');
    }

    const existing = rawVouchers.find(v => v.id === id);
    if (!existing) throw new Error('Voucher not found');

    if (existing.status !== 'Pending Approval') {
      throw new Error(`Cannot reject a voucher with status: ${existing.status}`);
    }

    const rejectedVoucher: Voucher = {
      ...existing,
      status: 'Rejected',
      rejectionReason: rejectionReason.trim(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = rawVouchers.map(v => v.id === id ? rejectedVoucher : v);
    setRawVouchers(updatedList);
    notifyChange(`Rejected voucher ${existing.voucherNumber}`, updatedList);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('vouchers').update({
          status: 'Rejected',
          rejection_reason: rejectionReason.trim(),
          updated_at: rejectedVoucher.updatedAt,
        }).eq('voucher_number', existing.voucherNumber);
      } catch (err) {
        console.warn('Supabase reject error:', err);
      }
    }

    return rejectedVoucher;
  };

  // Mark Reimbursed (Accounts Team only)
  const markReimbursed = async (id: string, paymentReference?: string): Promise<Voucher> => {
    if (!currentUser || currentUser.role !== 'accounts') {
      throw new Error('Only Accounts Team can update reimbursement status');
    }

    const existing = rawVouchers.find(v => v.id === id);
    if (!existing) throw new Error('Voucher not found');

    if (existing.status !== 'Approved') {
      throw new Error('Only Approved vouchers can be processed for reimbursement');
    }

    const updatedVoucher: Voucher = {
      ...existing,
      isReimbursed: true,
      reimbursedDate: new Date().toISOString(),
      paymentReference: paymentReference || `REF-CHQ-${Date.now().toString().slice(-6)}`,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = rawVouchers.map(v => v.id === id ? updatedVoucher : v);
    setRawVouchers(updatedList);
    notifyChange(`Settled reimbursement for ${existing.voucherNumber}`, updatedList);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('vouchers').update({
          is_reimbursed: true,
          reimbursed_date: updatedVoucher.reimbursedDate,
          payment_reference: updatedVoucher.paymentReference,
          updated_at: updatedVoucher.updatedAt,
        }).eq('voucher_number', existing.voucherNumber);
      } catch (err) {
        console.warn('Supabase mark reimbursed error:', err);
      }
    }

    return updatedVoucher;
  };

  const resetToSampleData = () => {
    setRawVouchers(INITIAL_VOUCHERS);
    notifyChange('Reset data to initial sample demo set', INITIAL_VOUCHERS);
  };

  return (
    <VoucherContext.Provider
      value={{
        vouchers: filteredVouchers,
        allVouchers: roleScopedVouchers,
        filter,
        setFilter,
        resetFilter,
        createVoucher,
        updateDraftVoucher,
        deleteDraftVoucher,
        approveVoucher,
        rejectVoucher,
        markReimbursed,
        resetToSampleData,
        isSupabaseLive,
        lastLiveEvent,
      }}
    >
      {children}
    </VoucherContext.Provider>
  );
};

export const useVouchers = () => {
  const context = useContext(VoucherContext);
  if (!context) {
    throw new Error('useVouchers must be used within a VoucherProvider');
  }
  return context;
};
