# Expense Voucher Management System
**Full Stack Developer Internship Assignment — ABC Company / Prachay Securities Private Limited**

A production-grade, human-centered web application designed to digitize the complete lifecycle of corporate expense reimbursement vouchers: from employee submission, through Director review and authorization, to Accounts Team reimbursement monitoring and settlement.

---

## 1. Project Overview & Architecture

### Business Workflow
```
[Employee: Draft] 
       │ (Edit/Delete allowed)
       ▼
[Employee: Submitted with Signature]
       │
       ▼
[Status: Pending Approval]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
[Director: Approved with Signature]   [Director: Rejected with Reason]
       │                                 │
       ▼                                 ▼
[Accounts Team: Settle Payment]      [Employee: Views Detailed Rejection Remarks]
       │
       ▼
[Printable Official Voucher Document]
```

### Core Architecture & Tech Stack
- **Frontend**: React 19 + TypeScript + Vite.
- **Backend & REST APIs**: Node.js + Express.js running on port 3000 (`server.ts`).
- **JWT Authentication**: Full RFC 7519 standard JWT implementation using `jsonwebtoken` (HMAC-SHA256 / HS256):
  - `POST /api/auth/login`: Issues cryptographically signed 24h Bearer tokens containing user profile & RBAC role claims.
  - `GET /api/auth/me`: Protected endpoint secured with `authenticateJWT` middleware.
  - `POST /api/auth/verify`: Diagnostics endpoint that decodes header/payload and validates token signature and expiration.
  - In-app **JWT Token Inspector & Diagnostics modal** for live token inspection, copy-ready cURL requests, and claim analysis.
- **Styling**: Tailwind CSS v4, custom typography pairing (`Plus Jakarta Sans` for display prose and `JetBrains Mono` for tabular currency figures). Humanized, clean layout following anti-AI slop design discipline.
- **Database & Realtime**: Supabase PostgreSQL with real-time replication (`supabase_realtime`), automated voucher sequence triggers, and Row Level Security (RLS) policies.
- **Signatures & Proof**: Supports both HTML5 Canvas interactive drawing pads and PNG/JPG image file uploads for both Employee and Director sign-offs, plus receipt/invoice attachments.
- **State Synchronization**: Dual-engine real-time architecture:
  1. Connected to live Supabase: subscribes to `postgres_changes` on `public.vouchers`.
  2. Local/Offline mode: multi-tab `BroadcastChannel` real-time sync with reactive storage.

---

## 2. User Roles & RBAC Matrix

| Role | Permissions & Capabilities | Restrictions |
| :--- | :--- | :--- |
| **Employee** | Create vouchers, save as Draft, edit/delete Drafts, upload/draw signature, view only own vouchers, track real-time status. | Cannot view peers' vouchers, cannot approve/reject, cannot edit once submitted. |
| **Director (Admin)** | View all organization vouchers, review pending approvals queue, search/filter/sort, approve vouchers with Director signature, reject with mandatory reason remarks. | Cannot edit employee input fields (preserves audit integrity). |
| **Accounts Team** | View all organization vouchers, search/filter/sort, view both signatures, print/download official paper vouchers, mark reimbursement payout. | Cannot create, edit, delete, or approve/reject vouchers. |

---

## 3. Database Schema Explanation

### Tables
1. **`public.profiles`**:
   - `id`: UUID (matches `auth.users(id)`).
   - `name`: Full user name.
   - `email`: Corporate email address.
   - `role`: ENUM (`employee`, `director`, `accounts`).
   - `employee_code`: Unique identifier (e.g., `EMP-ENG-402`).
   - `department`: Assigned department.
   - `saved_signature`: Stored signature URL.

2. **`public.vouchers`**:
   - `id`: UUID (Primary Key).
   - `voucher_number`: Unique auto-generated identifier (`VCH-2026-1001`).
   - `voucher_date`: Date voucher was logged.
   - `expense_date`: Date the expense occurred.
   - `department`: Department charging the expense.
   - `expense_title`: Short summary.
   - `expense_category`: Category (Travel, Meals, SaaS, Hardware, etc.).
   - `expense_description`: Comprehensive business justification.
   - `amount`: Numeric value (> 0).
   - `employee_id`: Foreign key referencing submitter profile.
   - `employee_name`, `employee_code`: Snapshot submitter metadata.
   - `employee_signature`: Base64 / Storage URL (mandatory for submission).
   - `receipt_url`, `receipt_name`: Optional supporting invoice attachment.
   - `status`: ENUM (`Draft`, `Pending Approval`, `Approved`, `Rejected`).
   - `director_signature`: Mandatory upon approval.
   - `approval_date`: Timestamp of director sign-off.
   - `rejection_reason`: Mandatory reason if rejected.
   - `is_reimbursed`: Boolean settlement flag.
   - `payment_reference`: Bank/cheque transaction reference.
   - `created_at`, `updated_at`: Timestamps.

3. **`public.voucher_audit_logs`**:
   - Tracks state changes, actors, timestamps, and notes.

### Automated Voucher Number Sequence Trigger
```sql
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
```

---

## 4. Setup & Installation Instructions

### Prerequisites
- Node.js 18+ and npm.

### Quick Start
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

3. (Optional) Connect Your Supabase Project:
   - Create a project on [Supabase](https://supabase.com).
   - Open the **SQL Editor** in Supabase and paste the script provided in `src/lib/supabase-schema-sql.ts` (or click "Supabase & SQL Schema" in the app header).
   - Add your Supabase credentials to `.env`:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```
   - Alternatively, configure credentials directly through the in-app "Supabase & SQL Schema" modal.

---

## 5. REST & Realtime API Documentation

| Endpoint / Channel | Method / Event | Description |
| :--- | :--- | :--- |
| `vouchers` | `SELECT` | Fetch vouchers according to user's RLS role permissions. |
| `vouchers` | `INSERT` | Create new draft or submitted voucher (Employees only). |
| `vouchers` | `UPDATE` (Draft) | Update expense details while status = 'Draft'. |
| `vouchers` | `DELETE` (Draft) | Permanently delete a Draft voucher. |
| `vouchers` | `UPDATE` (Status) | Director sign-off (`Approved` + signature) or (`Rejected` + reason). |
| `vouchers` | `UPDATE` (Settlement)| Accounts team records payout transaction reference. |
| `realtime:vouchers` | `postgres_changes` | WebSocket broadcast for live instant dashboard metric updates. |

---

## 6. Assumptions Made During Development
1. **Currency**: Configured for USD ($) with tabular financial decimal alignment.
2. **Dual-Format Signatures**: Employees and Directors may either draw their signature directly using the interactive HTML5 canvas pad or upload an image file (PNG, JPG, SVG).
3. **Audit Immutability**: Once submitted or approved, vouchers cannot be edited by employees or directors, preventing retroactive modification of financial claims.
4. **Instant Multi-Role Testing**: An in-app test account switcher is provided in the header to allow reviewers to inspect all 3 distinct user role perspectives without requiring multiple email accounts.
