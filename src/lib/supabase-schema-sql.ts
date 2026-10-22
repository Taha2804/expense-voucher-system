export const SUPABASE_FIX_POLICY_SQL = `-- ==============================================================================
-- IMMEDIATE FIX: "cannot alter type of a column used in a policy definition"
-- Copy and run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Drop all policies on public.vouchers that depend on employee_id
DROP POLICY IF EXISTS "Vouchers Read Access" ON public.vouchers;
DROP POLICY IF EXISTS "Employees can insert vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Employees can update draft vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Employees can delete draft vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Directors can review and approve vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Accounts can settle reimbursements" ON public.vouchers;
DROP POLICY IF EXISTS "App Read Vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "App Insert Vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "App Update Vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "App Delete Vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Allow all vouchers actions" ON public.vouchers;

-- 2. Drop any foreign key constraints referencing profiles(id)
ALTER TABLE public.vouchers DROP CONSTRAINT IF EXISTS vouchers_employee_id_fkey;

-- 3. Safely alter employee_id column type from UUID to TEXT
ALTER TABLE public.vouchers ALTER COLUMN employee_id TYPE TEXT;

-- 4. Disable Row Level Security on vouchers for smooth frontend client sync
ALTER TABLE public.vouchers DISABLE ROW LEVEL SECURITY;

-- 5. If voucher_audit_logs exists, also drop constraint and alter performed_by_id
DO $$ BEGIN
  ALTER TABLE public.voucher_audit_logs DROP CONSTRAINT IF EXISTS voucher_audit_logs_performed_by_id_fkey;
  ALTER TABLE public.voucher_audit_logs ALTER COLUMN performed_by_id TYPE TEXT;
  ALTER TABLE public.voucher_audit_logs DISABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN undefined_table THEN null;
END $$;

-- 6. Ensure Realtime publication includes vouchers table
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.vouchers;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
`;

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- EXPENSE VOUCHER MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA
-- Company: ABC Company / Prachay Securities Private Limited
-- Supports: Role-Based Operations, Realtime Subscriptions, Auto Sequences.
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

-- 3. Sequence for Human-Readable Voucher Numbers (e.g. VCH-2026-1001)
CREATE SEQUENCE IF NOT EXISTS voucher_number_seq START WITH 1001;

-- 4. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
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
  
  -- Employee Submitter Info (Text identifier to support both auth UID & demo accounts)
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_code TEXT,
  employee_signature TEXT NOT NULL,
  receipt_url TEXT,
  receipt_name TEXT,
  
  -- Workflow & Status
  status voucher_status_type NOT NULL DEFAULT 'Draft',
  director_signature TEXT,
  approval_date TIMESTAMPTZ,
  rejection_reason TEXT,
  
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
  performed_by_id TEXT,
  performed_by_name TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Disable RLS for seamless client sync with Supabase Anon API Key
ALTER TABLE public.vouchers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_audit_logs DISABLE ROW LEVEL SECURITY;

-- 9. Enable Realtime Replication for Instant Multi-Tab and Multi-User Sync
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.vouchers;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
`;
