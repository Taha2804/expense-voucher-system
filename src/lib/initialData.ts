import { UserProfile, Voucher } from '../types';

export const DEPARTMENTS = [
  'Engineering',
  'Product & Design',
  'Marketing & Growth',
  'Sales & BD',
  'Finance & Accounts',
  'Human Resources',
  'Operations & Admin'
];

export const EXPENSE_CATEGORIES = [
  'Travel & Conveyance',
  'Client Entertainment & Meals',
  'Office Supplies & Stationery',
  'Software & Cloud Subscriptions',
  'Hardware & Peripheral Equipment',
  'Training & Certifications',
  'Courier & Logistics',
  'Team Engagement & Events',
  'Other Business Expenses'
];

// SVG handwritten signatures encoded as Data URLs for authentic rendering
export const SAMPLE_EMPLOYEE_SIGNATURE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70" viewBox="0 0 220 70"><path d="M20,45 Q40,15 60,35 T100,28 T130,48 T170,30 T200,40 M65,40 Q110,65 190,45" fill="none" stroke="%231e3a8a" stroke-width="2.5" stroke-linecap="round"/></svg>';
export const SAMPLE_DIRECTOR_SIGNATURE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70" viewBox="0 0 220 70"><path d="M15,50 C35,10 50,60 80,30 S130,20 150,45 S190,15 210,35 M40,55 C90,62 160,52 195,48" fill="none" stroke="%230f172a" stroke-width="3" stroke-linecap="round"/></svg>';
export const SAMPLE_ANANYA_SIGNATURE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70" viewBox="0 0 220 70"><path d="M25,52 Q45,20 70,38 T110,32 T145,50 T180,35 M50,48 Q100,68 185,52" fill="none" stroke="%233b82f6" stroke-width="2.2" stroke-linecap="round"/></svg>';

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'emp-rahul-01',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@abccompany.com',
    role: 'employee',
    employeeId: 'EMP-ENG-402',
    department: 'Engineering',
    savedSignature: SAMPLE_EMPLOYEE_SIGNATURE
  },
  {
    id: 'emp-ananya-02',
    name: 'Ananya Patel',
    email: 'ananya.patel@abccompany.com',
    role: 'employee',
    employeeId: 'EMP-PRD-108',
    department: 'Product & Design',
    savedSignature: SAMPLE_ANANYA_SIGNATURE
  },
  {
    id: 'dir-sarah-01',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@abccompany.com',
    role: 'director',
    employeeId: 'DIR-EXEC-001',
    department: 'Executive Management',
    savedSignature: SAMPLE_DIRECTOR_SIGNATURE
  },
  {
    id: 'acc-michael-01',
    name: 'Michael Chang',
    email: 'michael.chang@abccompany.com',
    role: 'accounts',
    employeeId: 'ACC-FIN-204',
    department: 'Finance & Accounts'
  }
];

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'vch-1001',
    voucherNumber: 'VCH-2026-1001',
    voucherDate: '2026-10-09',
    expenseDate: '2026-10-08',
    department: 'Engineering',
    expenseTitle: 'Server Rack Cable Organizers & Testing Adapters',
    expenseCategory: 'Hardware & Peripheral Equipment',
    expenseDescription: 'Urgent replacement of damaged patch cables and USB-C Ethernet test adapters for the staging server rack at headquarters.',
    amount: 1450.00,
    employeeId: 'emp-rahul-01',
    employeeName: 'Rahul Sharma',
    employeeCode: 'EMP-ENG-402',
    employeeSignature: SAMPLE_EMPLOYEE_SIGNATURE,
    receiptName: 'Invoice_DigiConnect_8892.pdf',
    status: 'Pending Approval',
    createdAt: '2026-10-09T08:30:00Z',
    updatedAt: '2026-10-09T08:35:00Z'
  },
  {
    id: 'vch-1002',
    voucherNumber: 'VCH-2026-1002',
    voucherDate: '2026-10-07',
    expenseDate: '2026-10-06',
    department: 'Engineering',
    expenseTitle: 'Client Technical Workshop Lunch & Beverages',
    expenseCategory: 'Client Entertainment & Meals',
    expenseDescription: 'Working lunch with senior architects from Delta Capital regarding the security audit and cloud infrastructure migration.',
    amount: 3240.50,
    employeeId: 'emp-rahul-01',
    employeeName: 'Rahul Sharma',
    employeeCode: 'EMP-ENG-402',
    employeeSignature: SAMPLE_EMPLOYEE_SIGNATURE,
    receiptName: 'Bistro_Cafe_Receipt_441.jpg',
    status: 'Approved',
    directorSignature: SAMPLE_DIRECTOR_SIGNATURE,
    approvalDate: '2026-10-08T11:20:00Z',
    isReimbursed: true,
    reimbursedDate: '2026-10-09T14:00:00Z',
    paymentReference: 'NEFT-ABC-20261009-8472',
    createdAt: '2026-10-07T14:15:00Z',
    updatedAt: '2026-10-09T14:00:00Z'
  },
  {
    id: 'vch-1003',
    voucherNumber: 'VCH-2026-1003',
    voucherDate: '2026-10-10',
    expenseDate: '2026-10-09',
    department: 'Product & Design',
    expenseTitle: 'User Experience Usability Testing Software Pass',
    expenseCategory: 'Software & Cloud Subscriptions',
    expenseDescription: 'Single-month user testing seat licence on UserTesting.com for validation of the Q4 mobile navigation redesign.',
    amount: 4800.00,
    employeeId: 'emp-ananya-02',
    employeeName: 'Ananya Patel',
    employeeCode: 'EMP-PRD-108',
    employeeSignature: SAMPLE_ANANYA_SIGNATURE,
    receiptName: 'Subscription_UserTesting_Receipt.pdf',
    status: 'Pending Approval',
    createdAt: '2026-10-10T09:40:00Z',
    updatedAt: '2026-10-10T09:40:00Z'
  },
  {
    id: 'vch-1004',
    voucherNumber: 'VCH-2026-1004',
    voucherDate: '2026-10-05',
    expenseDate: '2026-10-04',
    department: 'Engineering',
    expenseTitle: 'Personal Ergonomic Desk Lamp Purchase',
    expenseCategory: 'Office Supplies & Stationery',
    expenseDescription: 'Purchased personal lamp for remote home workspace.',
    amount: 2200.00,
    employeeId: 'emp-rahul-01',
    employeeName: 'Rahul Sharma',
    employeeCode: 'EMP-ENG-402',
    employeeSignature: SAMPLE_EMPLOYEE_SIGNATURE,
    status: 'Rejected',
    rejectionReason: 'Home office furniture and decorative lighting items require prior approval from Facilities and cannot be expensed via standard travel/supplies vouchers as per section 4.2 of corporate policy.',
    createdAt: '2026-10-05T10:15:00Z',
    updatedAt: '2026-10-06T12:30:00Z'
  },
  {
    id: 'vch-1005',
    voucherNumber: 'VCH-2026-1005',
    voucherDate: '2026-10-11',
    expenseDate: '2026-10-10',
    department: 'Engineering',
    expenseTitle: 'Airport Cab Conveyance - Customer Site Visit',
    expenseCategory: 'Travel & Conveyance',
    expenseDescription: 'Late-evening cab ride back from customer demonstration at suburban facility after public transit hours.',
    amount: 850.00,
    employeeId: 'emp-rahul-01',
    employeeName: 'Rahul Sharma',
    employeeCode: 'EMP-ENG-402',
    employeeSignature: SAMPLE_EMPLOYEE_SIGNATURE,
    status: 'Draft',
    createdAt: '2026-10-11T07:15:00Z',
    updatedAt: '2026-10-11T07:15:00Z'
  },
  {
    id: 'vch-1006',
    voucherNumber: 'VCH-2026-1006',
    voucherDate: '2026-10-08',
    expenseDate: '2026-10-07',
    department: 'Product & Design',
    expenseTitle: 'Whiteboard Supplies & Sprint Planning Stickies',
    expenseCategory: 'Office Supplies & Stationery',
    expenseDescription: 'Pack of magnetic dry-erase markers and Post-it wall pads for the physical sprint room.',
    amount: 620.00,
    employeeId: 'emp-ananya-02',
    employeeName: 'Ananya Patel',
    employeeCode: 'EMP-PRD-108',
    employeeSignature: SAMPLE_ANANYA_SIGNATURE,
    status: 'Approved',
    directorSignature: SAMPLE_DIRECTOR_SIGNATURE,
    approvalDate: '2026-10-08T16:45:00Z',
    isReimbursed: false,
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-08T16:45:00Z'
  }
];
