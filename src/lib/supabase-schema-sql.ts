export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- EXPENSE VOUCHER MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA
-- Company: ABC Company / Prachay Securities Private Limited
-- Supports: Role-Based Access Control (RBAC), Row-Level Security (RLS),
-- Realtime Subscriptions, and Auto-generated Voucher Sequences.
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Custom ENUM types
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('employee', 'director', 'accounts');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE voucher_status_type AS ENUM ('Draft', 'Pending Approval', 'Approved', 'Rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Sequence for Human-Readable Voucher Numbers (e.g. VCH-2026-0001)
CREATE SEQUENCE IF NOT EXISTS voucher_number_seq START WITH 1001;

-- 4. User Profiles Table (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role_type NOT NULL DEFAULT 'employee',
  employee_code TEXT,
  department TEXT NOT NULL DEFAULT 'General',
  saved_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Vouchers Table
CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_number TEXT NOT NULL UNIQUE,
  voucher_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expense_date DATE NOT NULL,
  department TEXT NOT NULL,
  expense_title TEXT NOT NULL,
  expense_category TEXT NOT NULL,
  expense_description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  
  -- Employee Submitter Info
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  employee_name TEXT NOT NULL,
  employee_code TEXT,
  employee_signature TEXT NOT NULL, -- Base64 data URL or Supabase Storage public URL
  receipt_url TEXT,
  receipt_name TEXT,
  
  -- Workflow & Status
  status voucher_status_type NOT NULL DEFAULT 'Draft',
  director_signature TEXT, -- Required upon approval
  approval_date TIMESTAMPTZ,
  rejection_reason TEXT, -- Mandatory if rejected
  
  -- Accounts & Settlement Info
  is_reimbursed BOOLEAN NOT NULL DEFAULT FALSE,
  reimbursed_date TIMESTAMPTZ,
  payment_reference TEXT,
  
  -- Audit Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast queries and dashboard analytics
CREATE INDEX IF NOT EXISTS idx_vouchers_employee_id ON public.vouchers(employee_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON public.vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_expense_date ON public.vouchers(expense_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_department ON public.vouchers(department);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_number ON public.vouchers(voucher_number);

-- 6. Trigger to automatically generate Voucher Numbers (e.g. VCH-2026-1001)
CREATE OR REPLACE FUNCTION generate_voucher_number()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT;
  next_val BIGINT;
BEGIN
  IF NEW.voucher_number IS NULL OR NEW.voucher_number = '' THEN
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    next_val := nextval('voucher_number_seq');
    NEW.voucher_number := 'VCH-' || current_year || '-' || LPAD(next_val::TEXT, 4, '0');
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_voucher_number ON public.vouchers;
CREATE TRIGGER trigger_set_voucher_number
BEFORE INSERT OR UPDATE ON public.vouchers
FOR EACH ROW
EXECUTE FUNCTION generate_voucher_number();

-- 7. Audit Trail Log Table
CREATE TABLE IF NOT EXISTS public.voucher_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by_id UUID REFERENCES public.profiles(id),
  performed_by_name TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user's role from profiles
CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS user_role_type AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR get_auth_user_role() IN ('director', 'accounts'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Vouchers Policies:
-- A. Employees can ONLY view their own vouchers; Directors and Accounts can view ALL vouchers.
CREATE POLICY "Vouchers Read Access"
  ON public.vouchers FOR SELECT
  USING (
    employee_id = auth.uid()
    OR get_auth_user_role() IN ('director', 'accounts')
  );

-- B. Employees can insert vouchers for themselves
CREATE POLICY "Employees can insert vouchers"
  ON public.vouchers FOR INSERT
  WITH CHECK (
    auth.uid() = employee_id
    AND get_auth_user_role() = 'employee'
  );

-- C. Employees can ONLY edit or delete vouchers while in Draft status
CREATE POLICY "Employees can update draft vouchers"
  ON public.vouchers FOR UPDATE
  USING (
    employee_id = auth.uid()
    AND status = 'Draft'
  )
  WITH CHECK (
    employee_id = auth.uid()
    -- Cannot self-approve; status can only change to 'Draft' or 'Pending Approval'
    AND (status IN ('Draft', 'Pending Approval'))
  );

CREATE POLICY "Employees can delete draft vouchers"
  ON public.vouchers FOR DELETE
  USING (
    employee_id = auth.uid()
    AND status = 'Draft'
  );

-- D. Directors can review, approve, or reject vouchers
CREATE POLICY "Directors can review and approve vouchers"
  ON public.vouchers FOR UPDATE
  USING (get_auth_user_role() = 'director')
  WITH CHECK (
    get_auth_user_role() = 'director'
    AND (
      (status = 'Approved' AND director_signature IS NOT NULL)
      OR
      (status = 'Rejected' AND rejection_reason IS NOT NULL)
      OR
      status = 'Pending Approval'
    )
  );

-- E. Accounts Team can mark reimbursement settlement
CREATE POLICY "Accounts can settle reimbursements"
  ON public.vouchers FOR UPDATE
  USING (get_auth_user_role() = 'accounts')
  WITH CHECK (get_auth_user_role() = 'accounts');

-- ==============================================================================
-- 9. Enable Realtime Replication for Instant Dashboard Sync
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.vouchers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ==============================================================================
-- 10. Supabase Storage Bucket Setup (Run in Storage SQL or Dashboard)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;
`;
