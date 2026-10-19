import React, { useState, useMemo, useEffect } from 'react';
import { 
  AppUser,
  AttendanceRecord,
  DigitalAttachment,
  FacultyMember, 
  JobApplicant,
  JobContract,
  JobOpening,
  LeaveRecord, 
  LeaveStatus, 
  LoanStatus,
  OffboardingCase,
  OnboardingTask,
  PerformanceReview,
  StaffLeaveBalance, 
  StaffLoan,
  StudentRecord, 
  UniversityInfo, 
  UniversityInquiry
} from './types';
import { 
  PNG_UNIVERSITIES, 
  MOCK_FACULTY, 
  MOCK_STUDENTS, 
  MOCK_LEAVE_RECORDS, 
  MOCK_LEAVE_BALANCES, 
  MOCK_SCHOOLS,
  MOCK_USERS,
  MOCK_LOANS,
  MOCK_JOB_OPENINGS,
  MOCK_APPLICANTS,
  MOCK_CONTRACTS,
  MOCK_ONBOARDING_TASKS,
  MOCK_OFFBOARDING_CASES,
  MOCK_PERFORMANCE_REVIEWS,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_INQUIRIES
} from './data/mockData';
import { Header, ActiveNavTab } from './components/Header';
import { UniversityBanner } from './components/UniversityBanner';
import { FacultyPayroll } from './components/FacultyPayroll';
import { LeaveTracking } from './components/LeaveTracking';
import { StaffLoans } from './components/StaffLoans';
import { ApprovalsHub } from './components/ApprovalsHub';
import { RecruitmentOnboarding } from './components/RecruitmentOnboarding';
import { AttendanceTimesheet } from './components/AttendanceTimesheet';
import { PerformanceAppraisal } from './components/PerformanceAppraisal';
import { FacultyDirectory } from './components/FacultyDirectory';
import { ReportingModule } from './components/ReportingModule';
import { UniversityIntegrationPortal } from './components/UniversityIntegrationPortal';
import { ShieldCheck, Mail, Sparkles, Building2 } from 'lucide-react';

function getInitialNavigation(): { tab: ActiveNavTab; subTab?: 'openings' | 'applicants' | 'contracts' | 'onboarding' | 'offboarding' } {
  if (typeof window === 'undefined') {
    return { tab: 'payroll' };
  }

  // 1. Check body dataset attribute
  const bodyTab = document.body?.dataset?.initialTab as ActiveNavTab | undefined;
  const bodySubTab = document.body?.dataset?.initialSubtab as any;

  // 2. Check query params (?tab=..., ?page=...)
  const params = new URLSearchParams(window.location.search);
  const queryTab = params.get('tab') || params.get('page');
  const querySubTab = params.get('subtab') as any;

  // 3. Check hash (#vacancies, #onboarding, #payroll)
  const hash = window.location.hash.replace('#', '').toLowerCase();

  // 4. Check pathname (/vacancies.html, /onboarding.html, /payroll.html)
  const pathname = window.location.pathname.toLowerCase();

  let resolvedTab: ActiveNavTab = 'payroll';
  let resolvedSubTab: 'openings' | 'applicants' | 'contracts' | 'onboarding' | 'offboarding' | undefined = undefined;

  const candidate = queryTab || hash || (pathname.includes('.html') ? pathname : undefined);

  if (bodyTab) {
    resolvedTab = bodyTab;
    resolvedSubTab = bodySubTab;
  } else if (candidate) {
    if (candidate.includes('onboard')) {
      resolvedTab = 'recruitment';
      resolvedSubTab = 'onboarding';
    } else if (candidate.includes('vacanc') || candidate.includes('recruit') || candidate.includes('job') || candidate.includes('contract')) {
      resolvedTab = 'recruitment';
      resolvedSubTab = 'openings';
    } else if (candidate.includes('pay') || candidate.includes('tax') || candidate.includes('swt')) {
      resolvedTab = 'payroll';
    } else if (candidate.includes('leave')) {
      resolvedTab = 'leave';
    } else if (candidate.includes('loan') || candidate.includes('advance')) {
      resolvedTab = 'loans';
    } else if (candidate.includes('approval')) {
      resolvedTab = 'approvals';
    } else if (candidate.includes('attend') || candidate.includes('timesheet')) {
      resolvedTab = 'attendance';
    } else if (candidate.includes('perform') || candidate.includes('apprais')) {
      resolvedTab = 'performance';
    } else if (candidate.includes('facult') || candidate.includes('director') || candidate.includes('staff')) {
      resolvedTab = 'faculty';
    } else if (candidate.includes('report') || candidate.includes('audit')) {
      resolvedTab = 'reports';
    } else if (candidate.includes('integ') || candidate.includes('portal')) {
      resolvedTab = 'integration';
    }
  }

  if (querySubTab) {
    resolvedSubTab = querySubTab;
  }

  return { tab: resolvedTab, subTab: resolvedSubTab };
}

export default function App() {
  const [currentUniversity, setCurrentUniversity] = useState<UniversityInfo>(PNG_UNIVERSITIES[0]);
  const [currentUser, setCurrentUser] = useState<AppUser>(MOCK_USERS[0]); // Starts as Administrator
  
  const initialNav = useMemo(() => getInitialNavigation(), []);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>(initialNav.tab);
  const [recruitmentSubTab, setRecruitmentSubTab] = useState<'openings' | 'applicants' | 'contracts' | 'onboarding' | 'offboarding'>(initialNav.subTab || 'openings');

  // Dynamic Browser Tab Title
  useEffect(() => {
    const tabTitles: Record<ActiveNavTab, string> = {
      payroll: 'Statutory Payroll & IRC Tax Engine',
      recruitment: recruitmentSubTab === 'onboarding' 
        ? 'Staff Onboarding & Document Verification' 
        : 'Job Vacancies & Digital Contracting',
      leave: 'Leave Tracking & Kastom Bereavement',
      loans: 'Staff Loans & Salary Advances',
      approvals: 'Approvals & Governance Hub',
      attendance: 'Campus Attendance & Fortnightly Timesheets',
      performance: 'Academic Performance Appraisals',
      faculty: 'Faculty & Staff Roster Directory',
      reports: 'Statutory Reports & DHERST Audits',
      integration: 'University Integration Portal',
    };

    const sectionTitle = tabTitles[activeTab] || 'HRMS';
    document.title = `${sectionTitle} — PNG UniHR (${currentUniversity.acronym})`;
  }, [activeTab, recruitmentSubTab, currentUniversity]);

  const handleSelectTab = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    } catch {
      window.location.hash = tab;
    }
  };
  
  // HR & Staff State
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>(MOCK_FACULTY);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>(MOCK_LEAVE_RECORDS);
  const [leaveBalances, setLeaveBalances] = useState<Record<string, StaffLeaveBalance>>(MOCK_LEAVE_BALANCES);
  const [loans, setLoans] = useState<StaffLoan[]>(MOCK_LOANS);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(MOCK_JOB_OPENINGS);
  const [applicants, setApplicants] = useState<JobApplicant[]>(MOCK_APPLICANTS);
  const [contracts, setContracts] = useState<JobContract[]>(MOCK_CONTRACTS);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>(MOCK_ONBOARDING_TASKS);
  const [offboardingCases, setOffboardingCases] = useState<OffboardingCase[]>(MOCK_OFFBOARDING_CASES);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(MOCK_PERFORMANCE_REVIEWS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE_RECORDS);
  const [inquiries, setInquiries] = useState<UniversityInquiry[]>(MOCK_INQUIRIES);
  
  const activeFortnight = 'FN 21 - 2026 (05 Oct - 18 Oct 2026)';

  // Quick Action Modal flags
  const [isOpenApplyLeaveModal, setIsOpenApplyLeaveModal] = useState(false);
  const [isOpenApplyLoanModal, setIsOpenApplyLoanModal] = useState(false);
  const [isOpenAddFacultyModal, setIsOpenAddFacultyModal] = useState(false);

  // Role switch handler
  const handleSelectUser = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === 'Employee') {
      if (activeTab === 'reports') {
        setActiveTab('leave');
      }
    }
  };

  // Pending items count for HR / Admin badge
  const pendingApprovalsCount = useMemo(() => {
    const pendingLeave = leaveRecords.filter(r => r.status === 'Pending HOD' || r.status === 'Dean Review').length;
    const pendingLoans = loans.filter(l => l.status === 'Pending HR Review' || l.status === 'Bursar Clearance').length;
    const pendingReviews = performanceReviews.filter(p => p.status === 'Submitted').length;
    return pendingLeave + pendingLoans + pendingReviews;
  }, [leaveRecords, loans, performanceReviews]);

  // Handlers: Staff & Faculty
  const handleAddFaculty = (newFaculty: FacultyMember) => {
    setFacultyMembers(prev => [newFaculty, ...prev]);
    setLeaveBalances(prev => ({
      ...prev,
      [newFaculty.staffId]: {
        staffId: newFaculty.staffId,
        annualEntitlement: 18,
        annualTaken: 0,
        annualRemaining: 18,
        wantokTaken: 0,
        sickEntitlement: 12,
        sickTaken: 0,
        sickRemaining: 12,
        longServiceAccruedYears: 0,
      }
    }));
  };

  // Handlers: Leave
  const handleAddLeaveRecord = (record: LeaveRecord) => {
    setLeaveRecords(prev => [record, ...prev]);
  };

  const handleUpdateLeaveStatus = (recordId: string, status: LeaveStatus, approverName: string) => {
    setLeaveRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        if (status === 'Approved') {
          const currentBal = leaveBalances[rec.staffId];
          if (currentBal) {
            if (rec.leaveType === 'Annual Recreation') {
              setLeaveBalances(prevBal => ({
                ...prevBal,
                [rec.staffId]: {
                  ...currentBal,
                  annualTaken: currentBal.annualTaken + rec.workingDays,
                  annualRemaining: Math.max(0, currentBal.annualRemaining - rec.workingDays),
                }
              }));
            } else if (rec.leaveType === 'Wantok / Kastom Bereavement') {
              setLeaveBalances(prevBal => ({
                ...prevBal,
                [rec.staffId]: {
                  ...currentBal,
                  wantokTaken: currentBal.wantokTaken + rec.workingDays,
                }
              }));
            } else if (rec.leaveType === 'Sick Leave') {
              setLeaveBalances(prevBal => ({
                ...prevBal,
                [rec.staffId]: {
                  ...currentBal,
                  sickTaken: currentBal.sickTaken + rec.workingDays,
                  sickRemaining: Math.max(0, currentBal.sickRemaining - rec.workingDays),
                }
              }));
            }
          }
        }

        return {
          ...rec,
          status,
          approvedBy: approverName,
          approvalDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        };
      }
      return rec;
    }));
  };

  // Handlers: Loans
  const handleAddLoan = (newLoan: StaffLoan) => {
    setLoans(prev => [newLoan, ...prev]);
  };

  const handleUpdateLoanStatus = (loanId: string, status: LoanStatus, approverName: string) => {
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          status,
          approvedBy: approverName,
          approvedDate: new Date().toISOString().split('T')[0],
        };
      }
      return l;
    }));
  };

  // Handlers: Recruitment, Vacancy Application & Contracting
  const handleAddJobOpening = (job: JobOpening) => {
    setJobOpenings(prev => [job, ...prev]);
  };

  const handleApplyForJob = (applicant: JobApplicant) => {
    setApplicants(prev => [applicant, ...prev]);
    setJobOpenings(prev => prev.map(j => j.id === applicant.jobOpeningId ? { ...j, applicantCount: j.applicantCount + 1 } : j));
  };

  const handleUpdateApplicantStage = (applicantId: string, stage: JobApplicant['stage']) => {
    setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, stage } : a));
  };

  const handleIssueContract = (contract: JobContract) => {
    setContracts(prev => [contract, ...prev]);
  };

  const handleSignContractCandidate = (contractId: string, signatureName: string) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        const isBothSigned = c.registrarSigned;
        return {
          ...c,
          candidateSigned: true,
          candidateSignedDate: new Date().toISOString().split('T')[0],
          candidateSignatureName: signatureName,
          status: isBothSigned ? 'Fully Executed' : 'Candidate Signed',
        };
      }
      return c;
    }));
  };

  const handleSignContractRegistrar = (contractId: string) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        const isBothSigned = c.candidateSigned;
        return {
          ...c,
          registrarSigned: true,
          registrarSignedDate: new Date().toISOString().split('T')[0],
          councilSealStamped: true,
          status: isBothSigned ? 'Fully Executed' : 'Offer Issued',
        };
      }
      return c;
    }));
  };

  const handleExecuteAndOnboardStaff = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    // 1. Generate new faculty member
    const newStaffId = `${currentUniversity.acronym}-ACA-${Math.floor(1300 + Math.random() * 100)}`;
    const [firstName, ...lastNameParts] = contract.candidateName.split(' ');
    const lastName = lastNameParts.join(' ') || 'Appointee';

    const newFaculty: FacultyMember = {
      id: `fac-${Date.now()}`,
      staffId: newStaffId,
      firstName,
      lastName,
      gender: 'Male',
      email: contract.email,
      phone: contract.phone,
      homeProvince: contract.homeProvince,
      tinNumber: `TIN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      superFund: contract.superFund,
      superMemberNo: `NS-${Math.floor(100000 + Math.random() * 900000)}`,
      bankName: 'Bank South Pacific (BSP)',
      bankAccountNo: `100${Math.floor(1000000 + Math.random() * 9000000)}`,
      bankBsb: '088-301',
      schoolId: 'snps',
      schoolName: contract.schoolName,
      department: contract.department,
      academicRank: contract.academicRank as any,
      employmentType: contract.employmentType,
      salaryGrade: contract.salaryGrade,
      annualBaseSalary: contract.annualBaseSalary,
      campusHousingUnit: 'Waigani Campus Residential Quarters Block C',
      dateJoined: contract.startDate,
      qualifications: 'Postgraduate Tertiary Qualifications',
      coursesTaught: ['Introductory Semester Unit 1', 'Advanced Research Seminar'],
      adviseesCount: 15,
      activeStatus: 'Active',
    };

    handleAddFaculty(newFaculty);

    // Find applicant attachments to auto-link to onboarding documents
    const applicant = applicants.find(a => a.id === contract.applicantId);
    const applicantDocs = applicant?.attachments || [];
    const taxDocs = applicantDocs.filter(a => a.category === 'tax_document');
    const nidDocs = applicantDocs.filter(a => a.category === 'identification' || a.category === 'qualification');
    const superDocs = applicantDocs.filter(a => a.category === 'superannuation');

    // 2. Provision initial onboarding tasks with attached candidate documentation
    const newTasks: OnboardingTask[] = [
      {
        id: `ONB-${Date.now()}-1`,
        staffId: newStaffId,
        staffName: contract.candidateName,
        department: contract.department,
        taskTitle: 'Internal Revenue Commission (IRC) SWT Declaration & Tax File Setup',
        category: 'IRC TIN & Taxation',
        assignedOfficer: 'Payroll Section',
        dueDate: contract.startDate,
        status: taxDocs.length > 0 ? 'Completed' : 'In Progress',
        requiredDocumentCategory: 'tax_document',
        verifiedDate: taxDocs.length > 0 ? new Date().toISOString().split('T')[0] : undefined,
        verifiedBy: taxDocs.length > 0 ? 'Payroll Section (Auto-Verified from Job Application)' : undefined,
        attachments: taxDocs.map(t => ({
          ...t,
          notes: 'Transferred and verified from candidate job application submission.'
        }))
      },
      {
        id: `ONB-${Date.now()}-2`,
        staffId: newStaffId,
        staffName: contract.candidateName,
        department: contract.department,
        taskTitle: `${contract.superFund} Enrollment & Beneficiary Card Submission`,
        category: 'Superannuation Enrollment',
        assignedOfficer: 'HR Division',
        dueDate: contract.startDate,
        status: superDocs.length > 0 ? 'Completed' : 'Pending',
        requiredDocumentCategory: 'superannuation',
        attachments: superDocs
      },
      {
        id: `ONB-${Date.now()}-3`,
        staffId: newStaffId,
        staffName: contract.candidateName,
        department: contract.department,
        taskTitle: 'University Staff ID, Official Campus Email & LMS Instructor Access',
        category: 'Academic Office & IT',
        assignedOfficer: 'ICT Division',
        dueDate: contract.startDate,
        status: 'Pending',
        requiredDocumentCategory: 'identification',
        attachments: nidDocs.map(n => ({
          ...n,
          notes: 'Candidate NID / Qualification submitted during recruitment.'
        }))
      },
    ];

    setOnboardingTasks(prev => [...newTasks, ...prev]);

    // 3. Update contract status
    setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status: 'Onboarded to Payroll' } : c));

    // 4. Update applicant stage
    setApplicants(prev => prev.map(a => a.id === contract.applicantId ? { ...a, stage: 'Hired' } : a));
  };

  const handleToggleOnboardingTask = (taskId: string) => {
    setOnboardingTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'Completed' ? 'In Progress' : 'Completed';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleAddOnboardingTask = (task: OnboardingTask) => {
    setOnboardingTasks(prev => [task, ...prev]);
  };

  const handleAttachDocumentToOnboardingTask = (taskId: string, attachment: DigitalAttachment) => {
    setOnboardingTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const existing = t.attachments || [];
        return {
          ...t,
          attachments: [attachment, ...existing],
        };
      }
      return t;
    }));
  };

  const handleVerifyOnboardingAttachment = (taskId: string, attachmentId: string, officerName: string) => {
    setOnboardingTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedAttachments = (t.attachments || []).map(att => {
          if (att.id === attachmentId) {
            return {
              ...att,
              verifiedByHR: true,
              verifiedAt: new Date().toISOString().split('T')[0],
              verifiedByOfficer: officerName,
            };
          }
          return att;
        });

        // If all attachments are verified, optionally mark task completed
        return {
          ...t,
          attachments: updatedAttachments,
          verifiedDate: new Date().toISOString().split('T')[0],
          verifiedBy: officerName,
        };
      }
      return t;
    }));
  };

  const handleDeleteOnboardingAttachment = (taskId: string, attachmentId: string) => {
    setOnboardingTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          attachments: (t.attachments || []).filter(a => a.id !== attachmentId),
        };
      }
      return t;
    }));
  };

  const handleUpdateOffboardingStatus = (
    caseId: string, 
    field: 'libraryClearance' | 'itEquipmentReturned' | 'campusHousingSurrendered' | 'bursarClearance'
  ) => {
    setOffboardingCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updated = { ...c, [field]: !c[field] };
        const allCleared = updated.libraryClearance && updated.itEquipmentReturned && updated.campusHousingSurrendered && updated.bursarClearance;
        return {
          ...updated,
          status: allCleared ? 'Clearance Verified' : 'In Progress'
        };
      }
      return c;
    }));
  };

  // Handlers: Attendance
  const handleAddAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => [record, ...prev]);
  };

  // Handlers: Performance
  const handleAddPerformanceReview = (review: PerformanceReview) => {
    setPerformanceReviews(prev => [review, ...prev]);
  };

  const handleUpdatePerformanceReviewStatus = (reviewId: string, status: PerformanceReview['status']) => {
    setPerformanceReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
  };

  // Handlers: Integration Inquiry
  const handleAddInquiry = (inquiry: UniversityInquiry) => {
    setInquiries(prev => [inquiry, ...prev]);
  };

  const handleExportSubvention = () => {
    const headers = ['Category', 'Institution', 'Metric', 'Value (PGK / Count)', 'Details'];
    const rows = [
      ['Subvention Summary', currentUniversity.name, 'Institution Acronym', currentUniversity.acronym, currentUniversity.location],
      ['Subvention Summary', currentUniversity.name, 'Total Academic & Tech Staff', facultyMembers.length.toString(), 'Permanent & Contract Faculty'],
      ['Subvention Summary', currentUniversity.name, 'Annualized Faculty Payroll Burn', facultyMembers.reduce((a, b) => a + b.annualBaseSalary, 0).toFixed(2), 'PGK per annum'],
      ['Subvention Summary', currentUniversity.name, 'Active Staff Loans Outstanding', loans.reduce((a, b) => a + b.remainingBalance, 0).toFixed(2), 'Direct Payroll Recovery'],
      ['Subvention Summary', currentUniversity.name, 'Active Leave Applications', leaveRecords.length.toString(), 'Customary & Annual Records'],
      ['Subvention Summary', currentUniversity.name, 'Vacancies in Recruitment', jobOpenings.length.toString(), 'Active University Searches'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentUniversity.acronym}_HR_Subvention_Summary_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col text-neutral-900">
      {/* Top Header */}
      <Header
        currentUniversity={currentUniversity}
        universities={PNG_UNIVERSITIES}
        onSelectUniversity={(uni) => setCurrentUniversity(uni)}
        currentUser={currentUser}
        users={MOCK_USERS}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onExportReport={handleExportSubvention}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* RBAC Role Context Strip */}
      <div className="bg-neutral-900 text-neutral-300 text-xs border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 font-semibold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Active Role: <strong className="text-amber-400">{currentUser.role}</strong>
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-400">
              {currentUser.role === 'Administrator' && 'Full system authority across Payroll, Staff Loans, Approvals, Recruitment & HR Analytics.'}
              {currentUser.role === 'HR Manager' && 'Authority to approve leave requests, staff loans, manage recruitment, attendance & appraisals.'}
              {currentUser.role === 'Employee' && 'Staff self-service access: request leave, apply for loans, clock attendance, view payslips & dossier.'}
            </span>
          </div>

          {/* Quick RBAC Role Simulator Buttons & Contact Hint */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-neutral-500 mr-1 hidden lg:inline">Simulate Role:</span>
            {MOCK_USERS.map((user) => {
              const isActive = currentUser.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                  }`}
                  title={`Switch to ${user.name} (${user.role})`}
                >
                  {user.role}
                </button>
              );
            })}

            <button
              onClick={() => handleSelectTab('integration')}
              className="ml-2 text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1 underline underline-offset-2"
            >
              <Sparkles className="w-3 h-3" />
              <span>Contact to Integrate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Campus & Institution Banner with HR Quick Actions */}
        <UniversityBanner
          university={currentUniversity}
          activeFortnight={activeFortnight}
          totalFaculty={facultyMembers.length}
          totalLoansCount={loans.length}
          isEmployee={currentUser.role === 'Employee'}
          onRunPayrollQuick={() => handleSelectTab('payroll')}
          onApplyLeaveQuick={() => {
            handleSelectTab('leave');
            setIsOpenApplyLeaveModal(true);
          }}
          onApplyLoanQuick={() => {
            handleSelectTab('loans');
            setIsOpenApplyLoanModal(true);
          }}
          onVacanciesQuick={() => handleSelectTab('recruitment')}
          onIntegrateQuick={() => handleSelectTab('integration')}
        />

        {/* Tab View Router */}
        {activeTab === 'payroll' && (
          <FacultyPayroll
            university={currentUniversity}
            currentUser={currentUser}
            facultyMembers={facultyMembers}
            activeFortnight={activeFortnight}
          />
        )}

        {activeTab === 'leave' && (
          <LeaveTracking
            university={currentUniversity}
            currentUser={currentUser}
            facultyMembers={facultyMembers}
            leaveRecords={leaveRecords}
            leaveBalances={leaveBalances}
            onAddLeaveRecord={handleAddLeaveRecord}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            isOpenApplyModal={isOpenApplyLeaveModal}
            onCloseApplyModal={() => setIsOpenApplyLeaveModal(false)}
          />
        )}

        {activeTab === 'loans' && (
          <StaffLoans
            university={currentUniversity}
            currentUser={currentUser}
            facultyMembers={facultyMembers}
            loans={loans}
            onAddLoan={handleAddLoan}
            onUpdateLoanStatus={handleUpdateLoanStatus}
            isOpenApplyModal={isOpenApplyLoanModal}
            onCloseApplyModal={() => setIsOpenApplyLoanModal(false)}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalsHub
            university={currentUniversity}
            currentUser={currentUser}
            facultyMembers={facultyMembers}
            leaveRecords={leaveRecords}
            loans={loans}
            performanceReviews={performanceReviews}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            onUpdateLoanStatus={handleUpdateLoanStatus}
            onUpdateReviewStatus={handleUpdatePerformanceReviewStatus}
            onNavigateToLeave={() => {
              handleSelectTab('leave');
              setIsOpenApplyLeaveModal(true);
            }}
            onNavigateToLoans={() => {
              handleSelectTab('loans');
              setIsOpenApplyLoanModal(true);
            }}
            contracts={contracts}
            onNavigateToContracts={() => handleSelectTab('recruitment')}
          />
        )}

        {activeTab === 'recruitment' && (
          <RecruitmentOnboarding
            university={currentUniversity}
            currentUser={currentUser}
            schools={MOCK_SCHOOLS}
            facultyMembers={facultyMembers}
            jobOpenings={jobOpenings}
            applicants={applicants}
            contracts={contracts}
            onboardingTasks={onboardingTasks}
            offboardingCases={offboardingCases}
            onAddJobOpening={handleAddJobOpening}
            onApplyForJob={handleApplyForJob}
            onUpdateApplicantStage={handleUpdateApplicantStage}
            onIssueContract={handleIssueContract}
            onSignContractCandidate={handleSignContractCandidate}
            onSignContractRegistrar={handleSignContractRegistrar}
            onExecuteAndOnboardStaff={handleExecuteAndOnboardStaff}
            onToggleOnboardingTask={handleToggleOnboardingTask}
            onAddOnboardingTask={handleAddOnboardingTask}
            onAttachDocumentToOnboardingTask={handleAttachDocumentToOnboardingTask}
            onVerifyOnboardingAttachment={handleVerifyOnboardingAttachment}
            onDeleteOnboardingAttachment={handleDeleteOnboardingAttachment}
            onUpdateOffboardingStatus={handleUpdateOffboardingStatus}
            initialSubTab={recruitmentSubTab}
            onSubTabChange={(sub) => setRecruitmentSubTab(sub)}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTimesheet
            university={currentUniversity}
            currentUser={currentUser}
            facultyMembers={facultyMembers}
            attendanceRecords={attendanceRecords}
            onAddAttendanceRecord={handleAddAttendanceRecord}
            activeFortnight={activeFortnight}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceAppraisal
            university={currentUniversity}
            currentUser={currentUser}
            facultyMembers={facultyMembers}
            performanceReviews={performanceReviews}
            onAddReview={handleAddPerformanceReview}
            onUpdateReviewStatus={handleUpdatePerformanceReviewStatus}
          />
        )}

        {activeTab === 'faculty' && (
          <FacultyDirectory
            university={currentUniversity}
            currentUser={currentUser}
            facultyMembers={facultyMembers}
            onAddFaculty={handleAddFaculty}
            isOpenAddFacultyModal={isOpenAddFacultyModal}
            onCloseAddFacultyModal={() => setIsOpenAddFacultyModal(false)}
          />
        )}

        {activeTab === 'reports' && (currentUser.role === 'Administrator' || currentUser.role === 'HR Manager') && (
          <ReportingModule
            university={currentUniversity}
            userRole={currentUser.role}
            schools={MOCK_SCHOOLS}
            facultyMembers={facultyMembers}
            students={MOCK_STUDENTS}
            leaveBalances={leaveBalances}
            activeFortnight={activeFortnight}
          />
        )}

        {activeTab === 'integration' && (
          <UniversityIntegrationPortal
            currentUniversity={currentUniversity}
            universities={PNG_UNIVERSITIES}
            inquiries={inquiries}
            onAddInquiry={handleAddInquiry}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="font-semibold text-neutral-900">{currentUniversity.name}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>Division of Human Resources, Payroll & Staff Welfare</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-neutral-500">
            <span>PNG Employment Act 1978</span>
            <span aria-hidden="true">·</span>
            <span>IRC SWT 26 Fortnights</span>
            <span aria-hidden="true">·</span>
            <span>Nambawan Super & Nasfund</span>
            <span aria-hidden="true">·</span>
            <a 
              href="mailto:ddel@emtv.com.pg?subject=PNG%20University%20HRMS%20Implementation" 
              className="text-amber-600 hover:underline font-semibold"
            >
              Contact Integration: ddel@emtv.com.pg
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
