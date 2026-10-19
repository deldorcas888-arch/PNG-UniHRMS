# PNG UniHR — University HRMS & Staff Operations System

A specialized, comprehensive Human Resource Management and Staff Operations Web Application tailored for Papua New Guinea tertiary institutions (UPNG, PNG UNITECH, University of Goroka, Divine Word University, UNRE, and Western Pacific University).

Designed to address university HR governance, national statutory compliance (PNG IRC Salary Wages Tax, Nambawan Super / Nasfund), employee self-service, recruitment, digital contracting, approvals, performance appraisals, and institutional integration inquiries.

---

## Key Modules & Capabilities

### 1. Role-Based Access Control (RBAC) System
The system enforces strict permission boundaries with three distinct operational roles:
* **Administrator (Full Access)**: Complete administrative authority across all modules, university profile settings, subvention budget exports, approval overrides, reporting, and full faculty/staff records.
* **HR Manager (Administrative Access)**: Access to payroll runs, employee records, leave administration, loan approvals, job postings, candidate pipelines, contract issuance, council seal execution, onboarding checklists, offboarding clearances, and reporting.
* **Employee (Self-Service Access)**: Restricted view providing personal staff records, individual payslip breakdowns, personal leave application and balance monitoring, staff loan applications, vacancy applications, candidate contract reviews and digital signature, personal attendance/timesheet logging, and annual self-appraisal submissions. Protected against accessing confidential compensation data of other faculty members.

#### Pre-Configured Simulation Personas:
* **Administrator**: Dr. Pulapa Subbarao (`admin-1`) — Registrar / Chief University Administrator
* **HR Manager**: Maryanne Kuman (`hrm-1`) — Senior HR Director & Staff Welfare Officer
* **Employee**: Dr. Samuel Karani (`emp-1`) — Senior Lecturer in Distributed Systems (School of Natural & Physical Sciences)

---

### 2. Job Vacancies, Staff Applications & Digital Employment Contracting
A complete web-based recruitment and contracting workflow:
* **Public & Internal Vacancy Board**: Browse academic and administrative openings categorized by school, department, academic rank, salary grade (Grade 12 to 16.4), openings count, and application closing date.
* **Staff & Candidate Job Application**: Staff members and external candidates can apply directly with qualifications, home province, cover letter, and contact information.
* **Hiring Pipeline**: Track candidate stages from `Applied` → `Shortlisted` → `Interview` → `Offer Extended` → `Contract Issued` → `Offer Accepted` → `Hired`.
* **Digital University Employment Contract**:
  - Automatically formats formal appointment contracts on institutional letterhead.
  - Specifies Council Appointment Resolution reference numbers, tenure, department, base salary, Domestic Market Allowance (DMA), Housing Allowance, and Superannuation fund.
  - **Candidate Digital Signing**: Candidates type their name and submit agreement timestamp.
  - **Registrar Countersigning & Council Seal**: Official registrar stamp and Council verification.
  - **1-Click Execution & Onboarding**: Instantly creates a permanent `FacultyMember` record, allocates staff ID, initial leave entitlement balances, and assigns mandatory PNG onboarding tasks (IRC TIN setup, Superannuation beneficiary cards, IT/LMS access).

---

### 3. Staff Self-Service & Approvals Hub
* **Leave Management**:
  - Request Statutory Annual Recreation Leave (18 days p.a.), Kastom / Wantok Bereavement Leave, Sick Leave, and Study Leave.
  - Live tracking of accrued entitlements, days taken, and remaining balances.
  - Multi-tiered clearance workflow (HOD endorsement, Dean clearance, HR sign-off).
* **Staff Loans & Salary Advances**:
  - Staff loan applications for Emergency Medical, School/Tuition Fees, Housing/Settlement, and Customary Kastom Obligations.
  - Automatic maximum borrowing cap calculations (up to 40% of net annual salary) and amortized fort-nightly salary deductions.
  - Direct clearance by HR Division and Bursar/Payroll Section.
* **Centralized Approvals Hub**:
  - Consolidated inbox for HR Managers and Administrators displaying all pending leave requests, staff loans, contract signings, and annual performance reviews with quick-approve/decline actions.

---

### 4. Papua New Guinea Statutory Payroll & Attendance
* **IRC Salary Wages Tax (SWT) Engine**:
  - Precise implementation of PNG 26-Fortnight income tax brackets.
  - Calculations for Fortnightly Gross Pay, Taxable Base, and Net Disbursed Salary.
* **Superannuation Compliance**:
  - Employee statutory deduction: 6.0%.
  - University employer statutory contribution: 8.4%.
  - Supports both **Nambawan Super** and **Nasfund**.
* **Academic Allowances**:
  - Domestic Market Allowance (DMA), Housing Subvention, and Book/Research Allowances.
* **Attendance & Campus Timesheets**:
  - Daily check-in / check-out with time, campus location, and duty status (Teaching Lecture, Laboratory Supervision, Research & Consultation, Official Travel, Fieldwork).
  - Fortnightly hours reconciliation and audit logs.

---

### 5. Academic Performance Appraisals & Lifecycle
* **Performance Evaluations**:
  - Academic review cycle evaluating Teaching Quality, Research Publications, University Service, and Community Engagement.
  - Overall rating (1 to 5 stars), promotion recommendations (e.g., Senior Lecturer to Associate Professor), and HOD sign-offs.
* **Onboarding & Offboarding Checklists**:
  - **Onboarding**: IRC TIN declaration, Superannuation card, Staff ID, University email, and Moodle/LMS instructor privileges.
  - **Offboarding**: Formal clearance tracking for University Library books, ICT laptops/equipment, Campus Housing surrender, and Bursar/Finance clearance.

---

### 6. Reporting & Analytics Module
Comprehensive reporting engine with date range filters (presets + custom pickers) and school/department filters:
* **Pre-built Templates**:
  1. *Fortnightly IRC SWT & Superannuation Compliance Audit*
  2. *DHERST National Higher Education Student Enrollment & Subvention Audit*
  3. *Annual Recreation & Customary Kastom Leave Liability Audit*
  4. *Staff Salary Advance & Emergency Loan Exposure Report*
* **Core Generated Reports**:
  - Faculty Payroll Summary (Fortnightly Base, Gross, IRC Tax, Superannuation, Net Pay by Department).
  - Student Enrollment Numbers by Academic Program (Total headcount, Male/Female, TESAS AES/HECAS vs HELP vs Self-sponsored, tuition fees collected).
  - Local Staff Leave Balances (Entitlement, taken, remaining, customary bereavement days).
  - Loan Portfolio Exposure and Outstanding Recovery Balances.
* **Export & Print**:
  - Instant CSV export for IRC tax filings, Superannuation batch upload, and DHERST subvention submissions.
  - Printer-friendly official summary dossier format.

---

### 7. University Integration & Contact Portal
* Built for PNG and Pacific tertiary institutions (UPNG, PNG UNITECH, UOG, DWU, UNRE, WPU, PAU, Polytechs) seeking to deploy the system.
* **Interactive Implementation Inquiry**:
  - Select institution, staff cohort size (e.g., 250–500, 1,200+), target go-live fortnight, and desired modules.
  - Hosting preference selection: On-Premises Campus Server vs. NICTA PNG Government Cloud.
  - Immediate readiness score calculation, estimated timeline, and automated implementation roadmap.
* **Direct Creator Contact**:
  - **Email**: `ddel@emtv.com.pg`
  - **Division**: EMTV / PNG Tertiary Systems Division
  - 24-hour consultation response guarantee.

---

## Technical Stack

* **Framework**: React 19 (TypeScript)
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **State Management**: React state hooks with persistent multi-university and multi-persona simulation models

---

## HTML Pages for Browser Tabs & GitHub Repository Hosting

The web application is equipped with standalone, search-optimized HTML pages with embedded favicons and dynamic browser tab title synchronization. When opened in browser tabs from a GitHub repository or hosted via **GitHub Pages**, each page displays its dedicated title, icon, and module:

| HTML Page | Browser Tab Title | Module Description |
| :--- | :--- | :--- |
| `index.html` | **PNG UniHR — University HRMS & Statutory Payroll Portal** | Master Dashboard & Operations Hub |
| `vacancies.html` | **Job Vacancies & Applications — PNG UniHR** | Vacancy board, candidate applications & digital contracting |
| `onboarding.html` | **Staff Onboarding & Document Verification — PNG UniHR** | Digital document uploads (IDs, qualifications, tax TIN) & checklists |
| `payroll.html` | **Statutory Payroll & IRC Tax Engine — PNG UniHR** | PNG 26-fortnight IRC SWT calculation & superannuation engine |
| `leave.html` | **Staff Leave & Kastom Bereavement — PNG UniHR** | Annual recreation & customary kastom bereavement tracking |
| `loans.html` | **Staff Loans & Salary Advances — PNG UniHR** | Emergency advances, borrowing eligibility & deduction schedules |
| `approvals.html` | **Approvals & Governance Hub — PNG UniHR** | Central inbox for leave, loans, contracts & appraisals |
| `attendance.html` | **Campus Attendance & Timesheets — PNG UniHR** | Daily duty check-ins, lecturing & fortnightly timesheets |
| `performance.html` | **Academic Appraisals & Reviews — PNG UniHR** | Academic reviews, teaching ratings & promotion recommendations |
| `faculty.html` | **Faculty & Staff Directory — PNG UniHR** | Academic personnel database & departmental rosters |
| `reports.html` | **Statutory & Audit Reports — PNG UniHR** | IRC SWT tax audits, Super remittances & DHERST subvention exports |
| `integration.html` | **University Integration Portal — PNG UniHR** | Multi-campus deployment & NICTA Government Cloud integration |
| `404.html` | **PNG UniHR — Page Not Found & Route Recovery** | GitHub Pages single-page route recovery & navigation directory |

### GitHub Pages Setup
1. In your GitHub repository, navigate to **Settings > Pages**.
2. Under **Build and deployment > Source**, select either:
   - **GitHub Actions** (using the included `.github/workflows/pages.yml`), or
   - **Deploy from a branch** > branch: `main` / folder: `/docs` (or `/root`).
3. Assets use relative base paths (`./`) ensuring all pages and scripts load properly on any repository subfolder.

---

## Development & Verification

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run TypeScript linter
npm run lint

# Compile production build
npm run build
```

---

## Compliance & Governance References
* **Papua New Guinea Employment Act 1978** (Annual recreation leave, sick leave, statutory conditions of service)
* **PNG Internal Revenue Commission (IRC) Income Tax Act 1959** (Salary Wages Tax 26-fortnight scale)
* **PNG Superannuation (General Provisions) Act 2000** (6% employee / 8.4% employer minimums)
* **DHERST Higher Education (General Provisions) Act 2014**
