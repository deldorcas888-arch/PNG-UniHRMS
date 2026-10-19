export type PNGUniversityId = 'upng' | 'unitech' | 'uog' | 'unre' | 'dwu' | 'wpu';

export interface UniversityInfo {
  id: PNGUniversityId;
  name: string;
  acronym: string;
  motto: string;
  location: string;
  province: string;
  chancellor: string;
  viceChancellor: string;
  foundedYear: number;
  primaryColor: string;
  accentColor: string;
}

export type AcademicRank = 
  | 'Professor'
  | 'Associate Professor'
  | 'Senior Lecturer'
  | 'Lecturer II'
  | 'Lecturer I'
  | 'Tutor / Teaching Fellow'
  | 'Chief Technical Officer'
  | 'Administrative Officer';

export type EmploymentType = 'Permanent Local' | 'National Contract' | 'Expatriate Contract';

export type SuperannuationFund = 'Nambawan Super' | 'Nasfund';

export type PNGCommercialBank = 'Bank South Pacific (BSP)' | 'Kina Bank' | 'Westpac PNG';

// RBAC Role Definitions
export type UserRole = 'Administrator' | 'HR Manager' | 'Employee';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  staffId?: string; // Linked faculty member ID
  department?: string;
  title: string;
  avatarUrl?: string;
}

export interface FacultyMember {
  id: string;
  staffId: string; // e.g. UPNG-ACA-1042
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  email: string;
  phone: string;
  homeProvince: string;
  tinNumber: string; // IRC Tax Identification Number
  superFund: SuperannuationFund;
  superMemberNo: string;
  bankName: PNGCommercialBank;
  bankAccountNo: string;
  bankBsb: string;
  schoolId: string;
  schoolName: string;
  department: string;
  academicRank: AcademicRank;
  employmentType: EmploymentType;
  salaryGrade: string; // e.g. "Grade 15.3"
  annualBaseSalary: number; // in PGK (Kina)
  campusHousingUnit: string; // e.g. "Waigani Quarters Block 4B"
  dateJoined: string;
  qualifications: string; // e.g. "PhD (ANU), MSc (UPNG), BSc (UNITECH)"
  avatarUrl?: string;
  coursesTaught: string[];
  adviseesCount: number;
  activeStatus: 'Active' | 'On Leave' | 'Sabbatical' | 'Seconded';
}

export interface PayrollAllowance {
  dma: number; // Domestic Market Allowance / Retention
  housing: number; // Campus housing or allowance
  bookResearch: number; // Academic Book & Research
  clinicalConsulting: number; // Taurama clinical or engineering consulting
  schoolFeeSubsidy: number; // Children education subsidy
}

export interface PayrollDeductions {
  ircTax: number; // Salary & Wages Tax (SWT)
  superEmployee: number; // 6.0% mandatory employee
  superEmployer: number; // 8.4% employer contribution
  staffUnionDues: number; // NASA / PEA union dues
  creditUnionTisa: number; // TISA / UPNG Credit Union
  housingRentalDeduction: number;
  totalDeductions: number;
}

export interface PayslipRecord {
  id: string;
  payPeriod: string; // e.g. "FN 21 - 2026 (05 Oct - 18 Oct 2026)"
  payDate: string;
  staffId: string;
  staffName: string;
  academicRank: AcademicRank;
  department: string;
  schoolName: string;
  tinNumber: string;
  superFund: SuperannuationFund;
  superMemberNo: string;
  bankName: PNGCommercialBank;
  bankAccountNo: string;
  fortnightBaseSalary: number;
  allowances: PayrollAllowance;
  grossPay: number;
  deductions: PayrollDeductions;
  netPay: number;
  status: 'Approved & Disbursed' | 'Pending Dean Signoff' | 'Processing';
}

export type LeaveType = 
  | 'Annual Recreation' 
  | 'Wantok / Kastom Bereavement' 
  | 'Sick Leave' 
  | 'Study / Sabbatical' 
  | 'Maternity / Paternity' 
  | 'Long Service';

export type LeaveStatus = 'Pending HOD' | 'Dean Review' | 'Approved' | 'Declined' | 'Completed';

export interface LeaveRecord {
  id: string;
  staffId: string;
  staffName: string;
  academicRank: string;
  department: string;
  schoolName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  workingDays: number;
  reason: string;
  kastomDetails?: string; // e.g. village funeral / haus krai in Kainantu, EHP
  reliefOfficerStaffId: string;
  reliefOfficerName: string;
  status: LeaveStatus;
  submittedDate: string;
  approvalDate?: string;
  approvedBy?: string;
  medicalCertAttached?: boolean;
}

export interface StaffLeaveBalance {
  staffId: string;
  annualEntitlement: number;
  annualTaken: number;
  annualRemaining: number;
  wantokTaken: number; // Kastom bereavement
  sickEntitlement: number;
  sickTaken: number;
  sickRemaining: number;
  longServiceAccruedYears: number;
}

// Staff Loans & Advances Model
export type LoanType = 
  | 'Salary Advance' 
  | 'Staff SACCO Loan' 
  | 'TISA Credit Union Loan' 
  | 'Emergency Wantok Loan' 
  | 'Children School Fee Advance';

export type LoanStatus = 
  | 'Pending HR Review' 
  | 'Bursar Clearance' 
  | 'Approved' 
  | 'Disbursed' 
  | 'Declined' 
  | 'Fully Repaid';

export interface StaffLoan {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  loanType: LoanType;
  principalAmount: number; // in PGK
  purpose: string;
  repaymentFortnights: number;
  fortnightDeduction: number; // calculated deduction per FN
  totalRepaid: number;
  remainingBalance: number;
  status: LoanStatus;
  appliedDate: string;
  approvedDate?: string;
  approvedBy?: string;
  disbursedDate?: string;
}

// Recruitment & Onboarding Models
export interface JobOpening {
  id: string;
  title: string;
  department: string;
  schoolName: string;
  academicRank: AcademicRank | string;
  employmentType: EmploymentType;
  openingsCount: number;
  closingDate: string;
  salaryGrade: string;
  salaryRange: string;
  status: 'Accepting Applications' | 'Shortlisting' | 'Interviews Ongoing' | 'Position Filled';
  description: string;
  requirements: string[];
  applicantCount: number;
}

// File & Document Attachment Models
export type AttachmentCategory = 
  | 'qualification'      // Degrees, academic transcripts, professional diplomas
  | 'identification'     // PNG NID Card, Passport biodata, Driver's License
  | 'tax_document'       // IRC TIN Certificate, Salary Wages Tax Declaration Form
  | 'superannuation'     // Nambawan Super / Nasfund membership & nomination
  | 'cv_resume'          // Curriculum Vitae
  | 'clearance_medical'  // Police clearance, medical fitness certificate
  | 'other';

export interface DigitalAttachment {
  id: string;
  name: string;
  category: AttachmentCategory;
  categoryLabel: string;
  fileSizeBytes: number;
  fileSizeFormatted: string; // e.g. "1.8 MB"
  fileType: string; // e.g. "application/pdf", "image/png", "image/jpeg"
  uploadDate: string;
  dataUrl?: string; // Base64 data URL or simulated asset link for instant preview
  verifiedByHR?: boolean;
  verifiedAt?: string;
  verifiedByOfficer?: string;
  notes?: string;
}

export interface JobApplicant {
  id: string;
  jobOpeningId: string;
  jobTitle: string;
  candidateName: string;
  email: string;
  phone: string;
  highestQualification: string;
  homeProvince: string;
  appliedDate: string;
  stage: 'Applied' | 'Shortlisted' | 'Interview' | 'Offer Extended' | 'Offer Accepted' | 'Contract Issued' | 'Hired' | 'Regret';
  coverLetter?: string;
  currentEmployer?: string;
  interviewNotes?: string;
  rating: number; // 1 to 5
  contractId?: string;
  attachments?: DigitalAttachment[];
}

export interface JobContract {
  id: string; // e.g. CON-2026-088
  applicantId: string;
  jobOpeningId: string;
  candidateName: string;
  email: string;
  phone: string;
  homeProvince: string;
  academicRank: string;
  department: string;
  schoolName: string;
  employmentType: EmploymentType;
  salaryGrade: string; // e.g. "Grade 15.3"
  annualBaseSalary: number; // in PGK
  fortnightBaseSalary: number;
  dmaAllowance: number; // Domestic Market Allowance
  housingAllowance: number; // Housing or campus quarters
  bookResearchAllowance: number;
  superFund: SuperannuationFund;
  startDate: string;
  contractTenureYears: number; // 0 for Permanent Local, 3 for Fixed Contract
  probationPeriodMonths: number;
  contractReferenceNo: string; // e.g. "UPNG-COUNCIL-ACT-2026-089"
  candidateSigned: boolean;
  candidateSignedDate?: string;
  candidateSignatureName?: string;
  registrarSigned: boolean;
  registrarSignedDate?: string;
  councilSealStamped: boolean;
  status: 'Offer Issued' | 'Candidate Signed' | 'Fully Executed' | 'Onboarded to Payroll';
  createdDate: string;
}

export interface OnboardingTask {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  taskTitle: string;
  category: 'Documentation & NID' | 'IRC TIN & Taxation' | 'Superannuation Enrollment' | 'Campus Housing Quarters' | 'Academic Office & IT' | 'Medical Examination';
  assignedOfficer: string;
  dueDate: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  requiredDocumentCategory?: AttachmentCategory;
  requiredDocumentType?: string;
  attachments?: DigitalAttachment[];
  verifiedDate?: string;
  verifiedBy?: string;
}

export interface OffboardingCase {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  academicRank: string;
  exitReason: 'Statutory Retirement' | 'Resignation' | 'End of Contract' | 'Secondment to Public Service';
  effectiveExitDate: string;
  libraryClearance: boolean;
  itEquipmentReturned: boolean;
  campusHousingSurrendered: boolean;
  bursarClearance: boolean;
  gratuityOrSeverancePay: number; // in PGK
  status: 'In Progress' | 'Clearance Verified' | 'Archived';
}

// Performance & Attendance Models
export interface PerformanceReview {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  academicRank: string;
  evaluationYear: string; // e.g. "2026 Academic Appraisal"
  teachingEvaluationScore: number; // 0-100
  researchOutputsCount: number;
  communityServiceScore: number; // 0-100
  overallScore: number; // 0-100
  ratingBand: 'Outstanding' | 'Exceeds Standards' | 'Meets Standards' | 'Needs Development';
  promotionRecommended: boolean;
  recommendedRank?: AcademicRank;
  reviewerName: string;
  reviewDate: string;
  status: 'Draft' | 'Submitted' | 'HOD Endorsed' | 'Confirmed';
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  location: string;
  status: 'Present / On Duty' | 'Late Arrival' | 'Excused Academic Duty' | 'On Leave';
  teachingHoursLogged: number;
}

// University Integration Contact Inquiry Model
export interface UniversityInquiry {
  id: string;
  universityName: string;
  representativeName: string;
  officialEmail: string;
  phone: string;
  facultyAndStaffCount: string;
  modulesNeeded: string[];
  notes: string;
  status: 'New Inquiry' | 'Consultation Scheduled' | 'Proposal Sent';
  submittedAt: string;
}

export interface UniversitySchool {
  id: string;
  name: string;
  acronym: string;
  deanName: string;
  departments: string[];
  facultyCount: number;
  studentCount: number;
}

// Reporting & Analytics Models
export type ReportType = 
  | 'payroll-summary' 
  | 'leave-balances' 
  | 'loan-portfolio'
  | 'recruitment-turnover'
  | 'student-enrollment';

export type ReportDateRangePreset = 
  | 'ytd-2026' 
  | 'semester-2-2026' 
  | 'last-quarter' 
  | 'last-30-days' 
  | 'custom';

export interface ReportFilterConfig {
  reportType: ReportType;
  dateRangePreset: ReportDateRangePreset;
  startDate: string;
  endDate: string;
  department: string;
  schoolId: string;
}

export interface PreBuiltReportTemplate {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  reportType: ReportType;
  defaultDatePreset: ReportDateRangePreset;
  defaultDepartment: string;
  regulatoryBody: string;
  badge: string;
}

// Student & Academic Program Records (for DHERST & academic reporting)
export type SponsorshipType = 
  | 'Self-Sponsored'
  | 'Self-Sponsored / Corporate'
  | 'TESAS - AES (Academic Excellence)'
  | 'TESAS - Academic Excellence (AES)'
  | 'TESAS - HECAS (Higher Education)'
  | 'HELP Loan (Higher Education Loan Program)'
  | 'HELP Loan Scheme'
  | 'Provincial Government Grant'
  | 'Provincial Government Sponsor'
  | 'Corporate / Mining Scholarship'
  | 'Corporate / Mining Sponsor'
  | string;

export type EnrollmentStatus = 
  | 'Enrolled & Active'
  | 'Pending Fee Clearance'
  | 'Provisional Registration'
  | 'Deferred'
  | 'Suspended'
  | 'Graduated'
  | string;

export interface StudentRecord {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  email: string;
  phone: string;
  homeProvince: string;
  region: 'Papua' | 'Southern' | 'Momase' | 'Highlands' | 'New Guinea Islands' | string;
  schoolId: string;
  schoolName: string;
  programName: string;
  degreeLevel: 'Bachelor' | 'Master' | 'Doctoral' | 'Doctor of Philosophy (PhD)' | 'Postgraduate Diploma' | string;
  yearOfStudy: number;
  currentSemester: string;
  sponsorship: SponsorshipType;
  sponsorshipId?: string;
  gpa: number;
  academicStanding: "Dean's Honours List" | 'Dean List' | 'Good Standing' | 'Academic Warning' | 'Academic Probation' | string;
  enrollmentStatus: EnrollmentStatus;
  semesterTuitionDue: number;
  semesterTuitionPaid: number;
  advisorStaffId: string;
  advisorName: string;
  coursesEnrolled: string[];
}

