import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  AppUser, 
  AttachmentCategory,
  DigitalAttachment,
  FacultyMember, 
  JobApplicant, 
  JobContract, 
  JobOpening, 
  OffboardingCase, 
  OnboardingTask, 
  UniversityInfo, 
  UniversitySchool 
} from '../types';
import { formatPGK } from '../utils/pngPayroll';
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  UserX, 
  PlusCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  X, 
  Calendar, 
  FileCheck2, 
  GraduationCap, 
  Home, 
  Laptop, 
  ShieldCheck,
  Star,
  FileSignature,
  Printer,
  ChevronRight,
  Send,
  Award,
  Sparkles,
  Check,
  CreditCard,
  Paperclip,
  Upload,
  FileText,
  Eye,
  Trash2,
  Download,
  FileCheck,
  FileBadge
} from 'lucide-react';

interface RecruitmentOnboardingProps {
  university: UniversityInfo;
  currentUser: AppUser;
  schools: UniversitySchool[];
  facultyMembers: FacultyMember[];
  jobOpenings: JobOpening[];
  applicants: JobApplicant[];
  contracts: JobContract[];
  onboardingTasks: OnboardingTask[];
  offboardingCases: OffboardingCase[];
  onAddJobOpening: (job: JobOpening) => void;
  onApplyForJob: (applicant: JobApplicant) => void;
  onUpdateApplicantStage: (applicantId: string, stage: JobApplicant['stage']) => void;
  onIssueContract: (contract: JobContract) => void;
  onSignContractCandidate: (contractId: string, signatureName: string) => void;
  onSignContractRegistrar: (contractId: string) => void;
  onExecuteAndOnboardStaff: (contractId: string) => void;
  onToggleOnboardingTask: (taskId: string) => void;
  onAddOnboardingTask: (task: OnboardingTask) => void;
  onAttachDocumentToOnboardingTask?: (taskId: string, attachment: DigitalAttachment) => void;
  onVerifyOnboardingAttachment?: (taskId: string, attachmentId: string, officerName: string) => void;
  onDeleteOnboardingAttachment?: (taskId: string, attachmentId: string) => void;
  onUpdateOffboardingStatus: (caseId: string, field: 'libraryClearance' | 'itEquipmentReturned' | 'campusHousingSurrendered' | 'bursarClearance') => void;
  initialSubTab?: 'openings' | 'applicants' | 'contracts' | 'onboarding' | 'offboarding';
  onSubTabChange?: (subTab: 'openings' | 'applicants' | 'contracts' | 'onboarding' | 'offboarding') => void;
}

export const RecruitmentOnboarding: React.FC<RecruitmentOnboardingProps> = ({
  university,
  currentUser,
  schools,
  facultyMembers,
  jobOpenings,
  applicants,
  contracts,
  onboardingTasks,
  offboardingCases,
  onAddJobOpening,
  onApplyForJob,
  onUpdateApplicantStage,
  onIssueContract,
  onSignContractCandidate,
  onSignContractRegistrar,
  onExecuteAndOnboardStaff,
  onToggleOnboardingTask,
  onAddOnboardingTask,
  onAttachDocumentToOnboardingTask,
  onVerifyOnboardingAttachment,
  onDeleteOnboardingAttachment,
  onUpdateOffboardingStatus,
  initialSubTab,
  onSubTabChange,
}) => {
  const isEmployee = currentUser.role === 'Employee';

  const [activeTab, setActiveTab] = useState<'openings' | 'applicants' | 'contracts' | 'onboarding' | 'offboarding'>(initialSubTab || 'openings');

  useEffect(() => {
    if (initialSubTab && initialSubTab !== activeTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabChange = (tab: 'openings' | 'applicants' | 'contracts' | 'onboarding' | 'offboarding') => {
    setActiveTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const [selectedContractFilter, setSelectedContractFilter] = useState<string>('all');

  // Modals
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [applyingJobOpening, setApplyingJobOpening] = useState<JobOpening | null>(null);
  const [selectedApplicantForContract, setSelectedApplicantForContract] = useState<JobApplicant | null>(null);
  const [viewingContract, setViewingContract] = useState<JobContract | null>(null);
  const [selectedApplicantDossier, setSelectedApplicantDossier] = useState<JobApplicant | null>(null);
  
  // Document Attachment & Inspection State
  const [applicationAttachments, setApplicationAttachments] = useState<DigitalAttachment[]>([]);
  const [selectedTaskForDocs, setSelectedTaskForDocs] = useState<OnboardingTask | null>(null);
  const [previewingAttachment, setPreviewingAttachment] = useState<DigitalAttachment | null>(null);
  const [appAttachCategory, setAppAttachCategory] = useState<AttachmentCategory>('qualification');
  const [appAttachNotes, setAppAttachNotes] = useState('');
  const [taskAttachCategory, setTaskAttachCategory] = useState<AttachmentCategory>('tax_document');
  const [taskAttachNotes, setTaskAttachNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskFileInputRef = useRef<HTMLInputElement>(null);

  // New Job Form State
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('Mathematics & Computing');
  const [formSchool, setFormSchool] = useState('School of Natural and Physical Sciences');
  const [formRank, setFormRank] = useState('Senior Lecturer');
  const [formVacancies, setFormVacancies] = useState(1);
  const [formClosingDate, setFormClosingDate] = useState('2026-11-30');
  const [formSalaryRange, setFormSalaryRange] = useState('K68,000 - K82,000 p.a. + DMA');
  const [formDescription, setFormDescription] = useState('');

  // Application Form State
  const [appCandidateName, setAppCandidateName] = useState(isEmployee ? currentUser.name : '');
  const [appEmail, setAppEmail] = useState(isEmployee ? currentUser.email : '');
  const [appPhone, setAppPhone] = useState('+675 7');
  const [appProvince, setAppProvince] = useState('National Capital District (NCD)');
  const [appQualification, setAppQualification] = useState(
    isEmployee ? 'PhD in Academic Discipline (UPNG / Australian Uni)' : 'Master of Science (MSc) in Field'
  );
  const [appCoverLetter, setAppCoverLetter] = useState(
    'I write to formally submit my candidature for this academic appointment, bringing over 8 years of tertiary instructional experience and research publication in Papua New Guinea.'
  );
  const [appCurrentEmployer, setAppCurrentEmployer] = useState(isEmployee ? university.name : 'Government of PNG / Private Sector');
  const [applicationSuccess, setApplicationSuccess] = useState<string | null>(null);

  // Contract Drafting Form State
  const [contractGrade, setContractGrade] = useState('Grade 14.3');
  const [contractBaseSalary, setContractBaseSalary] = useState(78000);
  const [contractDma, setContractDma] = useState(450.00);
  const [contractHousing, setContractHousing] = useState(700.00);
  const [contractBookResearch, setContractBookResearch] = useState(250.00);
  const [contractSuperFund, setContractSuperFund] = useState<'Nambawan Super' | 'Nasfund'>('Nambawan Super');
  const [contractStartDate, setContractStartDate] = useState('2026-11-15');
  const [contractTenure, setContractTenure] = useState<'Permanent Local' | 'National Contract'>('Permanent Local');

  // Candidate Digital Signature Input
  const [signTypedName, setSignTypedName] = useState('');

  // Format File Size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Category labels helper
  const getCategoryLabel = (cat: AttachmentCategory): string => {
    switch (cat) {
      case 'qualification': return 'Academic Qualification / Degree';
      case 'identification': return 'National Identification (NID / Passport)';
      case 'tax_document': return 'Tax Document (IRC TIN Certificate)';
      case 'superannuation': return 'Superannuation (Nambawan / Nasfund)';
      case 'cv_resume': return 'Curriculum Vitae / Resume';
      case 'clearance_medical': return 'Clearance / Medical Fitness';
      default: return 'Official Document';
    }
  };

  // Quick Attach Sample Pack
  const handleAttachSamplePack = () => {
    const candidateBase = isEmployee ? currentUser.name : (appCandidateName || 'Appointee');
    const safeName = candidateBase.replace(/[^a-zA-Z0-9]/g, '_');
    
    const samples: DigitalAttachment[] = [
      {
        id: `att-sample-${Date.now()}-1`,
        name: `${safeName}_Postgraduate_Degree_Attested.pdf`,
        category: 'qualification',
        categoryLabel: 'Academic Qualification (Attested Degree)',
        fileSizeBytes: 2145000,
        fileSizeFormatted: '2.0 MB',
        fileType: 'application/pdf',
        uploadDate: new Date().toISOString().split('T')[0],
        verifiedByHR: true,
        verifiedAt: new Date().toISOString().split('T')[0],
        verifiedByOfficer: 'Academic Registrar Attestation Unit',
        notes: 'Original certified true copy from Papua New Guinea Commission for Higher Education.'
      },
      {
        id: `att-sample-${Date.now()}-2`,
        name: `PNG_National_Identity_Card_${safeName}.pdf`,
        category: 'identification',
        categoryLabel: 'National Identification (PNG NID Card)',
        fileSizeBytes: 980000,
        fileSizeFormatted: '960 KB',
        fileType: 'application/pdf',
        uploadDate: new Date().toISOString().split('T')[0],
        verifiedByHR: true,
        verifiedAt: new Date().toISOString().split('T')[0],
        verifiedByOfficer: 'National Civil & Identity Registry',
        notes: 'PNG Civil Registry Verified NID Card #NID-88290-POM.'
      },
      {
        id: `att-sample-${Date.now()}-3`,
        name: `IRC_Certificate_of_TIN_${safeName}.pdf`,
        category: 'tax_document',
        categoryLabel: 'Tax Document (IRC TIN Certificate)',
        fileSizeBytes: 780000,
        fileSizeFormatted: '760 KB',
        fileType: 'application/pdf',
        uploadDate: new Date().toISOString().split('T')[0],
        verifiedByHR: true,
        verifiedAt: new Date().toISOString().split('T')[0],
        verifiedByOfficer: 'IRC Waigani Operational Division',
        notes: 'Certified active Taxpayer Identification Number for 26-fortnight SWT compliance.'
      },
      {
        id: `att-sample-${Date.now()}-4`,
        name: `Academic_Curriculum_Vitae_${safeName}_2026.pdf`,
        category: 'cv_resume',
        categoryLabel: 'Curriculum Vitae & Research Monograph',
        fileSizeBytes: 1420000,
        fileSizeFormatted: '1.4 MB',
        fileType: 'application/pdf',
        uploadDate: new Date().toISOString().split('T')[0],
        verifiedByHR: false,
        notes: 'Comprehensive curriculum vitae detailing tertiary teaching, peer-reviewed publications, and university service.'
      }
    ];

    setApplicationAttachments(prev => {
      const existingCats = new Set(prev.map(p => p.category));
      const filtered = samples.filter(s => !existingCats.has(s.category));
      return [...prev, ...filtered];
    });
  };

  // Quick Attach Sample Document for an Onboarding Task
  const handleQuickAttachTaskSample = (task: OnboardingTask) => {
    const safeName = task.staffName.replace(/[^a-zA-Z0-9]/g, '_');
    const isTax = task.taskTitle.toLowerCase().includes('tin') || task.taskTitle.toLowerCase().includes('tax') || task.requiredDocumentType?.toLowerCase().includes('tax');
    const isSuper = task.taskTitle.toLowerCase().includes('super') || task.requiredDocumentType?.toLowerCase().includes('super');
    const isQual = task.taskTitle.toLowerCase().includes('degree') || task.taskTitle.toLowerCase().includes('qual') || task.requiredDocumentType?.toLowerCase().includes('qualification');

    const docName = isTax
      ? `IRC_Waigani_SWT_Registration_${safeName}.pdf`
      : isSuper
      ? `Nambawan_Super_Member_Certificate_${safeName}.pdf`
      : isQual
      ? `Attested_Doctorate_Jurisprudence_${safeName}.pdf`
      : `PNG_National_ID_Card_${safeName}.pdf`;

    const docCategory: AttachmentCategory = isTax
      ? 'tax_document'
      : isSuper
      ? 'superannuation'
      : isQual
      ? 'qualification'
      : 'identification';

    const newAttachment: DigitalAttachment = {
      id: `att-sample-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: docName,
      category: docCategory,
      categoryLabel: getCategoryLabel(docCategory),
      fileSizeBytes: 1048576,
      fileSizeFormatted: '1.0 MB',
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString().split('T')[0],
      verifiedByHR: true,
      verifiedAt: new Date().toISOString().split('T')[0],
      verifiedByOfficer: 'IRC Waigani & UPNG Human Resources',
      notes: `Verified certified copy for statutory onboarding: ${task.taskTitle}`
    };

    if (onAttachDocumentToOnboardingTask) {
      onAttachDocumentToOnboardingTask(task.id, newAttachment);
    }
    setSelectedTaskForDocs(prev => prev ? {
      ...prev,
      attachments: [newAttachment, ...(prev.attachments || [])]
    } : null);
  };

  // Handle Real File Upload via FileReader
  const handleFileUpload = (files: FileList | null, target: 'application' | 'task') => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const assignedCat = target === 'application' ? appAttachCategory : taskAttachCategory;
        const newAttachment: DigitalAttachment = {
          id: `att-upload-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: file.name,
          category: assignedCat,
          categoryLabel: getCategoryLabel(assignedCat),
          fileSizeBytes: file.size,
          fileSizeFormatted: formatFileSize(file.size),
          fileType: file.type || 'application/pdf',
          uploadDate: new Date().toISOString().split('T')[0],
          dataUrl,
          verifiedByHR: false,
          notes: target === 'application' ? appAttachNotes : taskAttachNotes,
        };

        if (target === 'application') {
          setApplicationAttachments(prev => [newAttachment, ...prev]);
        } else if (target === 'task' && selectedTaskForDocs) {
          if (onAttachDocumentToOnboardingTask) {
            onAttachDocumentToOnboardingTask(selectedTaskForDocs.id, newAttachment);
          }
          setSelectedTaskForDocs(prev => prev ? {
            ...prev,
            attachments: [newAttachment, ...(prev.attachments || [])]
          } : null);
        }
      };
      reader.readAsDataURL(file);
    });

    if (target === 'application') {
      setAppAttachNotes('');
    } else {
      setTaskAttachNotes('');
    }
  };

  // Compute Stats
  const stats = useMemo(() => {
    const totalVacancies = jobOpenings.reduce((acc, j) => acc + j.openingsCount, 0);
    const totalApplicants = applicants.length;
    const activeContracts = contracts.length;
    const pendingOnboarding = onboardingTasks.filter(t => t.status !== 'Completed').length;
    const activeOffboarding = offboardingCases.filter(c => c.status !== 'Archived').length;

    return { totalVacancies, totalApplicants, activeContracts, pendingOnboarding, activeOffboarding };
  }, [jobOpenings, applicants, contracts, onboardingTasks, offboardingCases]);

  // Handle Post New Job
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJobTitle) return;

    const newJob: JobOpening = {
      id: `JOB-2026-${Math.floor(10 + Math.random() * 90)}`,
      title: formJobTitle,
      department: formDepartment,
      schoolName: formSchool,
      academicRank: formRank,
      employmentType: 'Permanent Local',
      openingsCount: Number(formVacancies),
      closingDate: formClosingDate,
      salaryGrade: 'Grade 14.2',
      salaryRange: formSalaryRange,
      status: 'Accepting Applications',
      description: formDescription || 'Academic teaching and research appointment in university department.',
      requirements: ['Tertiary postgraduate qualification', 'Demonstrated teaching experience', 'Research track record'],
      applicantCount: 0,
    };

    onAddJobOpening(newJob);
    setIsNewJobModalOpen(false);
    setFormJobTitle('');
    setFormDescription('');
  };

  // Handle Staff/Candidate Job Application
  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJobOpening || !appCandidateName || !appEmail) return;

    const newAppId = `APP-${Math.floor(200 + Math.random() * 800)}`;
    const newApplicant: JobApplicant = {
      id: newAppId,
      jobOpeningId: applyingJobOpening.id,
      jobTitle: applyingJobOpening.title,
      candidateName: appCandidateName,
      email: appEmail,
      phone: appPhone,
      highestQualification: appQualification,
      homeProvince: appProvince,
      appliedDate: new Date().toISOString().split('T')[0],
      stage: 'Applied',
      coverLetter: appCoverLetter,
      currentEmployer: appCurrentEmployer,
      rating: 4,
      attachments: applicationAttachments,
    };

    onApplyForJob(newApplicant);
    const attachCount = applicationAttachments.length;
    setApplicationSuccess(`Application submitted with ${attachCount} verified credential attachment${attachCount === 1 ? '' : 's'}! Reference: ${newAppId}`);
    setTimeout(() => {
      setApplyingJobOpening(null);
      setApplicationSuccess(null);
      setApplicationAttachments([]);
      setActiveTab('applicants');
    }, 1800);
  };

  // Open Contract Drafting for an Applicant
  const handleOpenDraftContract = (applicant: JobApplicant) => {
    setSelectedApplicantForContract(applicant);
    const relatedJob = jobOpenings.find(j => j.id === applicant.jobOpeningId);
    if (relatedJob) {
      if (relatedJob.academicRank.includes('Professor')) {
        setContractGrade('Grade 16.4');
        setContractBaseSalary(115000);
        setContractDma(650);
        setContractHousing(850);
      } else if (relatedJob.academicRank.includes('Senior Lecturer')) {
        setContractGrade('Grade 14.3');
        setContractBaseSalary(78000);
        setContractDma(450);
        setContractHousing(700);
      } else {
        setContractGrade('Grade 13.2');
        setContractBaseSalary(62000);
        setContractDma(350);
        setContractHousing(600);
      }
    }
  };

  // Submit Draft Contract
  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicantForContract) return;

    const relatedJob = jobOpenings.find(j => j.id === selectedApplicantForContract.jobOpeningId);
    const contractId = `CON-2026-${Math.floor(100 + Math.random() * 900)}`;
    const councilRef = `${university.acronym}/COUNCIL/APPT/2026/${Math.floor(10 + Math.random() * 90)}`;
    const fortnightBase = Math.round((contractBaseSalary / 26) * 100) / 100;

    const newContract: JobContract = {
      id: contractId,
      applicantId: selectedApplicantForContract.id,
      jobOpeningId: selectedApplicantForContract.jobOpeningId,
      candidateName: selectedApplicantForContract.candidateName,
      email: selectedApplicantForContract.email,
      phone: selectedApplicantForContract.phone,
      homeProvince: selectedApplicantForContract.homeProvince,
      academicRank: relatedJob?.academicRank as string || 'Senior Lecturer',
      department: relatedJob?.department || 'Academic Division',
      schoolName: relatedJob?.schoolName || 'School of Natural and Physical Sciences',
      employmentType: contractTenure,
      salaryGrade: contractGrade,
      annualBaseSalary: contractBaseSalary,
      fortnightBaseSalary: fortnightBase,
      dmaAllowance: contractDma,
      housingAllowance: contractHousing,
      bookResearchAllowance: contractBookResearch,
      superFund: contractSuperFund,
      startDate: contractStartDate,
      contractTenureYears: contractTenure === 'Permanent Local' ? 0 : 3,
      probationPeriodMonths: 6,
      contractReferenceNo: councilRef,
      candidateSigned: false,
      registrarSigned: true,
      registrarSignedDate: new Date().toISOString().split('T')[0],
      councilSealStamped: true,
      status: 'Offer Issued',
      createdDate: new Date().toISOString().split('T')[0],
    };

    onIssueContract(newContract);
    onUpdateApplicantStage(selectedApplicantForContract.id, 'Contract Issued');
    setSelectedApplicantForContract(null);
    setActiveTab('contracts');
    setViewingContract(newContract);
  };

  // Handle Candidate Digital Signature
  const handleSignAsCandidate = (contractId: string) => {
    if (!signTypedName) return;
    onSignContractCandidate(contractId, signTypedName);
    if (viewingContract && viewingContract.id === contractId) {
      setViewingContract({
        ...viewingContract,
        candidateSigned: true,
        candidateSignedDate: new Date().toISOString().split('T')[0],
        candidateSignatureName: signTypedName,
        status: viewingContract.registrarSigned ? 'Fully Executed' : 'Candidate Signed'
      });
    }
    setSignTypedName('');
  };

  // Handle Registrar Seal & Sign
  const handleSignAsRegistrar = (contractId: string) => {
    onSignContractRegistrar(contractId);
    if (viewingContract && viewingContract.id === contractId) {
      setViewingContract({
        ...viewingContract,
        registrarSigned: true,
        registrarSignedDate: new Date().toISOString().split('T')[0],
        councilSealStamped: true,
        status: viewingContract.candidateSigned ? 'Fully Executed' : 'Offer Issued'
      });
    }
  };

  // Handle Onboard to Staff & Payroll
  const handleExecuteOnboard = (contractId: string) => {
    onExecuteAndOnboardStaff(contractId);
    if (viewingContract && viewingContract.id === contractId) {
      setViewingContract({
        ...viewingContract,
        status: 'Onboarded to Payroll'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Open Staff Vacancies</span>
            <Briefcase className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {stats.totalVacancies}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Across {jobOpenings.length} recruitments
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Candidates in Pipeline</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {stats.totalApplicants}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Applied & Shortlisted
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Staff Employment Contracts</span>
            <FileSignature className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-700 tabular-nums">
            {stats.activeContracts}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Issued & Executed contracts
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Onboarding Checklist</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {stats.pendingOnboarding} Pending
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            TIN, Super, Quarters & IT
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Staff Offboarding</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-700 tabular-nums">
            {stats.activeOffboarding}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Clearances & Gratuity
          </div>
        </div>
      </div>

      {/* Control Strip & Tab Selection */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSubTabChange('openings')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'openings'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {isEmployee ? 'Explore Vacancies' : 'Job Vacancies'} ({jobOpenings.length})
          </button>

          <button
            onClick={() => handleSubTabChange('applicants')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'applicants'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span>{isEmployee ? 'My Applications' : 'Applicant Pool'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              {applicants.length}
            </span>
          </button>

          <button
            onClick={() => handleSubTabChange('contracts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'contracts'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <FileSignature className="w-3.5 h-3.5 text-purple-400" />
            <span>Employment Contracts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold">
              {contracts.length}
            </span>
          </button>

          <button
            onClick={() => handleSubTabChange('onboarding')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'onboarding'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isEmployee ? 'My Onboarding & Documents' : 'Onboarding & Documents'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {onboardingTasks.length}
            </span>
          </button>

          {!isEmployee && (
            <button
              onClick={() => handleSubTabChange('offboarding')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'offboarding'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Staff Offboarding ({offboardingCases.length})
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search positions, candidates, contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {!isEmployee && (
            <button
              onClick={() => setIsNewJobModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Post New Vacancy</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Job Vacancies Board with direct "Apply for Vacancy" */}
      {activeTab === 'openings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobOpenings
            .filter(j => 
              j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              j.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
              j.academicRank.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((job) => (
              <div 
                key={job.id} 
                className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {job.id} · {job.openingsCount} Vacancy{job.openingsCount > 1 ? 'ies' : ''}
                      </span>
                      <h3 className="text-base font-bold text-neutral-900 mt-1.5 leading-snug">
                        {job.title}
                      </h3>
                      <div className="text-xs text-neutral-500 font-medium">
                        {job.department} · {job.schoolName}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 shrink-0">
                      {job.status}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Academic Rank:</span>
                      <strong className="text-neutral-900">{job.academicRank} ({job.salaryGrade})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Compensation Package:</span>
                      <span className="font-mono text-emerald-800 font-semibold">{job.salaryRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Employment Terms:</span>
                      <span className="text-neutral-800 font-medium">{job.employmentType} (Council Appointed)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Closing Deadline:</span>
                      <span className="font-mono text-amber-800 font-medium">{job.closingDate}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-neutral-700 block">Required Qualifications:</span>
                    <ul className="list-disc list-inside text-[11px] text-neutral-600 space-y-0.5">
                      {job.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-neutral-500">
                    <strong>{job.applicantCount}</strong> applicants received
                  </span>

                  <div className="flex items-center gap-2">
                    {!isEmployee && (
                      <button
                        onClick={() => {
                          setSelectedJobFilter(job.id);
                          setActiveTab('applicants');
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                      >
                        Candidates ({job.applicantCount})
                      </button>
                    )}

                    <button
                      onClick={() => setApplyingJobOpening(job)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Apply for Vacancy</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Tab 2: Applicant Review, Selection & Offer Desk */}
      {activeTab === 'applicants' && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                {isEmployee ? 'My Submitted University Job Applications' : 'University Recruitment & Selection Review Desk'}
              </h3>
              <p className="text-xs text-neutral-500">
                {isEmployee 
                  ? 'Track your application status, committee stage advances, and formal employment contracts'
                  : 'Review applicant dossiers, ratings, interview outcomes, and issue council employment contracts'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="text-xs bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-neutral-800"
              >
                <option value="all">All Positions ({jobOpenings.length})</option>
                {jobOpenings.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Candidate & Dossier</th>
                  <th className="py-3 px-4">Target Academic Position</th>
                  <th className="py-3 px-4">Home Province</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Recruitment Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {applicants
                  .filter(app => selectedJobFilter === 'all' || app.jobOpeningId === selectedJobFilter)
                  .filter(app => 
                    app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.homeProvince.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(app => (
                    <tr key={app.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900">{app.candidateName}</div>
                        <div className="text-[11px] text-neutral-500 font-medium">{app.highestQualification}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{app.email} · {app.phone}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">{app.jobTitle}</div>
                        <div className="text-[11px] font-mono text-neutral-400">{app.jobOpeningId}</div>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-800">
                        {app.homeProvince}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-600">
                        {app.appliedDate}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: app.rating || 4 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          app.stage === 'Hired' || app.stage === 'Contract Issued'
                            ? 'text-emerald-800 bg-emerald-50'
                            : app.stage === 'Offer Extended' || app.stage === 'Offer Accepted'
                            ? 'text-purple-800 bg-purple-50'
                            : app.stage === 'Interview'
                            ? 'text-indigo-800 bg-indigo-50'
                            : app.stage === 'Shortlisted'
                            ? 'text-amber-800 bg-amber-50'
                            : 'text-neutral-700 bg-neutral-100'
                        }`}>
                          {app.stage}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedApplicantDossier(app)}
                            className="px-2 py-1 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200"
                            title="View Full Application & Cover Letter"
                          >
                            Dossier
                          </button>

                          {!isEmployee && (
                            <>
                              {app.stage !== 'Contract Issued' && app.stage !== 'Hired' && (
                                <select
                                  value={app.stage}
                                  onChange={(e) => onUpdateApplicantStage(app.id, e.target.value as any)}
                                  className="bg-neutral-100 border border-neutral-300 rounded px-1.5 py-1 text-[11px] font-medium"
                                >
                                  <option value="Applied">Applied</option>
                                  <option value="Shortlisted">Shortlisted</option>
                                  <option value="Interview">Interview</option>
                                  <option value="Offer Extended">Offer Extended</option>
                                  <option value="Offer Accepted">Offer Accepted</option>
                                  <option value="Regret">Regret</option>
                                </select>
                              )}

                              {/* Accept & Draft Contract Button */}
                              {app.stage !== 'Contract Issued' && app.stage !== 'Hired' && (
                                <button
                                  onClick={() => handleOpenDraftContract(app)}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded transition-colors shadow-xs whitespace-nowrap"
                                >
                                  Accept & Issue Contract
                                </button>
                              )}

                              {app.stage === 'Contract Issued' && (
                                <button
                                  onClick={() => {
                                    const c = contracts.find(con => con.applicantId === app.id);
                                    if (c) setViewingContract(c);
                                    setActiveTab('contracts');
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded"
                                >
                                  View Contract
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Official University Employment Contracts */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-purple-600" />
                Papua New Guinea University Employment Contracts & Appointments
              </h3>
              <p className="text-xs text-neutral-500">
                Official statutory employment contracts under PNG Higher Education Act and University Council by-laws.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-mono">
                {contracts.length} Contracts Registered
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Contract Ref & Appointee</th>
                  <th className="py-3 px-4">Substantive Rank & Department</th>
                  <th className="py-3 px-4">Salary Grade & Fortnightly Pay</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Signatures Status</th>
                  <th className="py-3 px-4">Execution Status</th>
                  <th className="py-3 px-4 text-right">Contract Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {contracts
                  .filter(c => 
                    c.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.academicRank.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.contractReferenceNo.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(con => (
                    <tr key={con.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-neutral-900">{con.contractReferenceNo}</div>
                        <div className="font-semibold text-neutral-800">{con.candidateName}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{con.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">{con.academicRank}</div>
                        <div className="text-[11px] text-neutral-500">{con.department}</div>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] bg-neutral-100 text-neutral-700 mt-0.5">
                          {con.employmentType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-neutral-900">{con.salaryGrade} ({formatPGK(con.annualBaseSalary)} p.a.)</div>
                        <div className="text-[11px] text-emerald-700 font-semibold">{formatPGK(con.fortnightBaseSalary)} / FN base</div>
                        <div className="text-[10px] text-neutral-400">+ DMA & Housing</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-800">
                        {con.startDate}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {con.candidateSigned ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span className="text-[11px]">
                              Candidate: {con.candidateSigned ? 'Signed' : 'Awaiting Sign'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {con.registrarSigned ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span className="text-[11px]">
                              Council Seal: {con.registrarSigned ? 'Sealed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          con.status === 'Onboarded to Payroll'
                            ? 'bg-emerald-100 text-emerald-800'
                            : con.status === 'Fully Executed'
                            ? 'bg-purple-100 text-purple-900'
                            : con.status === 'Candidate Signed'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {con.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingContract(con)}
                            className="px-2.5 py-1 text-xs font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors shadow-xs"
                          >
                            Open Contract
                          </button>

                          {!isEmployee && con.status === 'Fully Executed' && (
                            <button
                              onClick={() => handleExecuteOnboard(con.id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-600 transition-colors shadow-xs"
                              title="Provision Staff ID & add to Faculty Directory & Payroll"
                            >
                              Onboard into Staff
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Onboarding Tasks & Document Attachments */}
      {activeTab === 'onboarding' && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>{isEmployee ? 'My Academic Staff Onboarding & Compliance Documents' : 'New Academic Staff Onboarding Roster & Documents'}</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Upload certified digital copies of qualifications, PNG National ID, and IRC tax documents (TIN / SWT) for compliance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-mono">
                {onboardingTasks.filter(t => t.status === 'Completed').length} / {onboardingTasks.length} Completed
              </span>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {onboardingTasks
              .filter(task => {
                if (searchTerm) {
                  return task.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    task.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    task.staffId.toLowerCase().includes(searchTerm.toLowerCase());
                }
                return true;
              })
              .map(task => (
                <div key={task.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleOnboardingTask(task.id)}
                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          task.status === 'Completed'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                        title="Toggle task completion"
                      >
                        {task.status === 'Completed' && <Check className="w-3 h-3" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold ${task.status === 'Completed' ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                            {task.taskTitle}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium">
                            {task.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                          {task.staffName} ({task.staffId}) · {task.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="font-mono text-[11px] text-neutral-500">
                        Due: {task.dueDate}
                      </div>
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        task.status === 'Completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {task.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedTaskForDocs(task)}
                        className="px-2.5 py-1 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md shadow-2xs flex items-center gap-1.5 transition-colors"
                        title="Attach or verify digital documentation"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                        <span>Upload / Manage Files ({task.attachments?.length || 0})</span>
                      </button>
                    </div>
                  </div>

                  {/* Statutory Document Requirement Notice */}
                  {task.requiredDocumentType && (
                    <div className="ml-7 flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200/80 px-2.5 py-1 rounded-md">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>Document Required:</strong> {task.requiredDocumentType}</span>
                    </div>
                  )}

                  {/* Attached Files List for This Task */}
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="ml-7 flex flex-wrap gap-2 pt-1">
                      {task.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="inline-flex items-center gap-1.5 text-[11px] bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1 text-neutral-800 hover:bg-neutral-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span className="font-medium truncate max-w-48">{att.name}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">({att.fileSizeFormatted})</span>
                          {att.verifiedByHR && (
                            <span className="text-emerald-700 font-bold" title="Statutory copy attested by HR/IRC">
                              ✓
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setPreviewingAttachment(att)}
                            className="p-0.5 text-neutral-400 hover:text-neutral-700 rounded"
                            title="Inspect Document"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 5: Offboarding Clearances */}
      {activeTab === 'offboarding' && !isEmployee && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Academic & Non-Academic Staff Offboarding Clearances</h3>
              <p className="text-xs text-neutral-500">Statutory retirement, secondment, and resignation sign-offs across divisions.</p>
            </div>
          </div>

          <div className="space-y-4">
            {offboardingCases.map(c => (
              <div key={c.id} className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-neutral-900 text-sm">{c.staffName}</div>
                    <div className="text-neutral-500 font-mono">{c.staffId} · {c.academicRank} · {c.department}</div>
                    <div className="text-neutral-600 font-medium mt-1">Reason: {c.exitReason} · Effective: {c.effectiveExitDate}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-800 font-bold text-sm block">{formatPGK(c.gratuityOrSeverancePay)}</span>
                    <span className="text-[11px] text-neutral-500">Statutory Gratuity Settlement</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-200 text-center">
                  <button
                    onClick={() => onUpdateOffboardingStatus(c.id, 'libraryClearance')}
                    className={`p-2 rounded border transition-colors ${
                      c.libraryClearance ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : 'bg-white border-neutral-200 text-neutral-600'
                    }`}
                  >
                    Library Books: {c.libraryClearance ? '✓ Cleared' : 'Pending'}
                  </button>
                  <button
                    onClick={() => onUpdateOffboardingStatus(c.id, 'itEquipmentReturned')}
                    className={`p-2 rounded border transition-colors ${
                      c.itEquipmentReturned ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : 'bg-white border-neutral-200 text-neutral-600'
                    }`}
                  >
                    IT Laptop/Account: {c.itEquipmentReturned ? '✓ Returned' : 'Pending'}
                  </button>
                  <button
                    onClick={() => onUpdateOffboardingStatus(c.id, 'campusHousingSurrendered')}
                    className={`p-2 rounded border transition-colors ${
                      c.campusHousingSurrendered ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : 'bg-white border-neutral-200 text-neutral-600'
                    }`}
                  >
                    Housing Keys: {c.campusHousingSurrendered ? '✓ Surrendered' : 'Pending'}
                  </button>
                  <button
                    onClick={() => onUpdateOffboardingStatus(c.id, 'bursarClearance')}
                    className={`p-2 rounded border transition-colors ${
                      c.bursarClearance ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : 'bg-white border-neutral-200 text-neutral-600'
                    }`}
                  >
                    Bursar Account: {c.bursarClearance ? '✓ Cleared' : 'Pending'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal 1: Apply for University Vacancy Modal */}
      {applyingJobOpening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-2xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[11px] font-mono text-amber-700 font-semibold">
                  Official Application · {applyingJobOpening.id}
                </span>
                <h3 className="text-base font-bold text-neutral-900 leading-snug">
                  Apply for: {applyingJobOpening.title}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setApplyingJobOpening(null);
                  setApplicationAttachments([]);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-xs font-bold text-emerald-900">{applicationSuccess}</div>
                <p className="text-[11px] text-emerald-700">Redirecting to candidate pool...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-3.5 text-xs">
                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">School & Department:</span>
                    <strong className="text-neutral-900">{applyingJobOpening.department}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Rank & Compensation:</span>
                    <span className="font-mono text-emerald-800 font-bold">{applyingJobOpening.academicRank} ({applyingJobOpening.salaryRange})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={appCandidateName}
                      onChange={(e) => setAppCandidateName(e.target.value)}
                      placeholder="e.g. Dr. Jennifer Kerua"
                      className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-700">Official Email *</label>
                    <input
                      type="email"
                      required
                      value={appEmail}
                      onChange={(e) => setAppEmail(e.target.value)}
                      placeholder="e.g. j.kerua@upng.ac.pg"
                      className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-700">Contact Phone (+675)</label>
                    <input
                      type="tel"
                      value={appPhone}
                      onChange={(e) => setAppPhone(e.target.value)}
                      className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-700">Home Province</label>
                    <input
                      type="text"
                      value={appProvince}
                      onChange={(e) => setAppProvince(e.target.value)}
                      className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Highest Academic Qualification *</label>
                  <input
                    type="text"
                    required
                    value={appQualification}
                    onChange={(e) => setAppQualification(e.target.value)}
                    placeholder="e.g. PhD in Computer Science (ANU, Canberra)"
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Current Employer / Substantive Appointment</label>
                  <input
                    type="text"
                    value={appCurrentEmployer}
                    onChange={(e) => setAppCurrentEmployer(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Statement of Purpose / Cover Note</label>
                  <textarea
                    rows={2}
                    value={appCoverLetter}
                    onChange={(e) => setAppCoverLetter(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden text-xs"
                  />
                </div>

                {/* File Attachment Section for Job Applications */}
                <div className="pt-3 border-t border-neutral-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                        <Paperclip className="w-4 h-4 text-amber-600" />
                        <span>Digital Document Attachments & Credentials</span>
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Upload certified digital copies of your academic qualifications, national ID, and IRC tax documents.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAttachSamplePack}
                      className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-300 transition-colors whitespace-nowrap shadow-2xs self-start sm:self-auto"
                      title="Instantly attach realistic certified PNG sample files (Degrees, NID, TIN, CV)"
                    >
                      + 1-Click Attach Sample Pack
                    </button>
                  </div>

                  {/* Required Documents Status Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-medium">
                    <div className={`p-2 rounded border flex items-center justify-between ${
                      applicationAttachments.some(a => a.category === 'qualification')
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                    }`}>
                      <span>1. Qualifications / Degrees</span>
                      {applicationAttachments.some(a => a.category === 'qualification') ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-amber-700 font-mono text-[9px] bg-amber-50 px-1 rounded">Required</span>
                      )}
                    </div>

                    <div className={`p-2 rounded border flex items-center justify-between ${
                      applicationAttachments.some(a => a.category === 'identification')
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                    }`}>
                      <span>2. National ID / Passport</span>
                      {applicationAttachments.some(a => a.category === 'identification') ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-amber-700 font-mono text-[9px] bg-amber-50 px-1 rounded">Required</span>
                      )}
                    </div>

                    <div className={`p-2 rounded border flex items-center justify-between ${
                      applicationAttachments.some(a => a.category === 'tax_document')
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                    }`}>
                      <span>3. IRC TIN Certificate</span>
                      {applicationAttachments.some(a => a.category === 'tax_document') ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-amber-700 font-mono text-[9px] bg-amber-50 px-1 rounded">Required</span>
                      )}
                    </div>
                  </div>

                  {/* Upload Controls & Category Selector */}
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-semibold text-neutral-700">Document Type:</label>
                        <select
                          value={appAttachCategory}
                          onChange={(e) => setAppAttachCategory(e.target.value as AttachmentCategory)}
                          className="bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-800"
                        >
                          <option value="qualification">Academic Qualification / Transcripts</option>
                          <option value="identification">National Identification (NID / Passport)</option>
                          <option value="tax_document">Tax Document (IRC TIN Registration)</option>
                          <option value="cv_resume">Curriculum Vitae / Publications List</option>
                          <option value="clearance_medical">Police Clearance / Medical Certificate</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          multiple
                          onChange={(e) => handleFileUpload(e.target.files, 'application')}
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-md shadow-2xs flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Browse Files from Device</span>
                        </button>
                      </div>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFileUpload(e.dataTransfer.files, 'application');
                      }}
                      className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
                        isDragging ? 'border-amber-500 bg-amber-50/50' : 'border-neutral-300 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <Upload className="w-4 h-4 mx-auto text-neutral-400 mb-1" />
                      <div className="text-[11px] text-neutral-600">
                        Drag and drop files here, or click <button type="button" onClick={() => fileInputRef.current?.click()} className="text-amber-700 font-semibold underline">Browse</button>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        Supports PDF, PNG, JPG scans up to 10 MB per file
                      </div>
                    </div>
                  </div>

                  {/* Attached Files List */}
                  {applicationAttachments.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-neutral-700 flex items-center justify-between">
                        <span>Attached Files ({applicationAttachments.length}):</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          Total: {formatFileSize(applicationAttachments.reduce((acc, a) => acc + a.fileSizeBytes, 0))}
                        </span>
                      </div>

                      <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden bg-white max-h-40 overflow-y-auto">
                        {applicationAttachments.map((att) => (
                          <div key={att.id} className="p-2.5 flex items-center justify-between gap-3 text-xs hover:bg-neutral-50">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="w-4 h-4 text-purple-700 shrink-0" />
                              <div className="min-w-0">
                                <div className="font-semibold text-neutral-900 truncate text-[11px]">{att.name}</div>
                                <div className="text-[10px] text-neutral-500 flex items-center gap-1.5">
                                  <span className="font-medium text-neutral-700">{att.categoryLabel}</span>
                                  <span>·</span>
                                  <span className="font-mono">{att.fileSizeFormatted}</span>
                                  {att.verifiedByHR && (
                                    <>
                                      <span>·</span>
                                      <span className="text-emerald-700 font-medium">✓ Attested</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewingAttachment(att)}
                                className="p-1 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded"
                                title="Inspect Digital Document"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setApplicationAttachments(prev => prev.filter(p => p.id !== att.id))}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Remove file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => {
                      setApplyingJobOpening(null);
                      setApplicationAttachments([]);
                    }}
                    className="px-3 py-1.5 font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-md shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit University Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Candidate Dossier View */}
      {selectedApplicantDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-bold text-neutral-900">
                  Candidate Academic Dossier
                </h3>
              </div>
              <button 
                onClick={() => setSelectedApplicantDossier(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Applicant Name:</span>
                  <strong className="text-neutral-900">{selectedApplicantDossier.candidateName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Target Position:</span>
                  <span className="font-semibold text-neutral-800">{selectedApplicantDossier.jobTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Highest Qualification:</span>
                  <span className="font-medium text-neutral-900">{selectedApplicantDossier.highestQualification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Home Province & Origin:</span>
                  <span>{selectedApplicantDossier.homeProvince}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Contact Channels:</span>
                  <span className="font-mono">{selectedApplicantDossier.email} · {selectedApplicantDossier.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Current Employer:</span>
                  <span>{selectedApplicantDossier.currentEmployer || 'National Tertiary Sector'}</span>
                </div>
              </div>

              {selectedApplicantDossier.coverLetter && (
                <div className="space-y-1">
                  <span className="font-semibold text-neutral-700 block">Candidate Statement of Purpose:</span>
                  <div className="bg-neutral-50 p-3 rounded border border-neutral-200 text-neutral-700 leading-relaxed italic">
                    "{selectedApplicantDossier.coverLetter}"
                  </div>
                </div>
              )}

              {selectedApplicantDossier.interviewNotes && (
                <div className="space-y-1">
                  <span className="font-semibold text-neutral-700 block">Selection Committee Evaluation Notes:</span>
                  <div className="bg-amber-50 p-3 rounded border border-amber-200 text-amber-900 leading-relaxed">
                    {selectedApplicantDossier.interviewNotes}
                  </div>
                </div>
              )}

              {/* Attached Credentials & Statutory Documents */}
              <div className="space-y-2 pt-2 border-t border-neutral-200">
                <span className="font-semibold text-neutral-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                    <span>Attached Digital Credentials & Tax Documentation ({(selectedApplicantDossier.attachments || []).length})</span>
                  </span>
                </span>

                {(!selectedApplicantDossier.attachments || selectedApplicantDossier.attachments.length === 0) ? (
                  <div className="text-[11px] text-neutral-400 italic bg-neutral-50 p-2.5 rounded border border-neutral-200">
                    No digital documents attached to this application yet.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden bg-white max-h-48 overflow-y-auto">
                    {selectedApplicantDossier.attachments.map((att) => (
                      <div key={att.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-neutral-50 text-[11px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-purple-700 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-neutral-900 truncate">{att.name}</div>
                            <div className="text-[10px] text-neutral-500 flex items-center gap-1.5">
                              <span className="font-medium text-neutral-700">{att.categoryLabel}</span>
                              <span>·</span>
                              <span className="font-mono">{att.fileSizeFormatted}</span>
                              {att.verifiedByHR && (
                                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                  · ✓ Attested
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPreviewingAttachment(att)}
                          className="px-2 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200 flex items-center gap-1 shrink-0"
                          title="Inspect certified digital copy"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setSelectedApplicantDossier(null)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
              >
                Close Dossier
              </button>

              {!isEmployee && (
                <button
                  onClick={() => {
                    handleOpenDraftContract(selectedApplicantDossier);
                    setSelectedApplicantDossier(null);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-md shadow-xs"
                >
                  Accept Candidate & Issue Contract
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: University Employment Contract Generator & Acceptance Form */}
      {selectedApplicantForContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-purple-700" />
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Draft University Employment Contract
                  </h3>
                  <div className="text-xs text-neutral-500">
                    Appointee: {selectedApplicantForContract.candidateName}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedApplicantForContract(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4 text-xs">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-1 font-mono text-[11px]">
                <div>Target Position: <strong>{selectedApplicantForContract.jobTitle}</strong></div>
                <div>Appointee: {selectedApplicantForContract.candidateName}</div>
                <div>Home Province: {selectedApplicantForContract.homeProvince}</div>
                <div>Council Minutes Ref: {university.acronym}/COUNCIL/APPT/2026/SEC</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Salary Grade</label>
                  <select
                    value={contractGrade}
                    onChange={(e) => setContractGrade(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                  >
                    <option value="Grade 13.2">Grade 13.2 (Lecturer I)</option>
                    <option value="Grade 14.3">Grade 14.3 (Senior Lecturer)</option>
                    <option value="Grade 15.2">Grade 15.2 (Associate Professor)</option>
                    <option value="Grade 16.4">Grade 16.4 (Full Professor)</option>
                    <option value="Grade 11.2">Grade 11.2 (Technical / Officer)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Annual Base Salary (PGK)</label>
                  <input
                    type="number"
                    value={contractBaseSalary}
                    onChange={(e) => setContractBaseSalary(Number(e.target.value))}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">DMA Allowance / FN</label>
                  <input
                    type="number"
                    value={contractDma}
                    onChange={(e) => setContractDma(Number(e.target.value))}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Housing Entitlement / FN</label>
                  <input
                    type="number"
                    value={contractHousing}
                    onChange={(e) => setContractHousing(Number(e.target.value))}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Book & Research Grant / FN</label>
                  <input
                    type="number"
                    value={contractBookResearch}
                    onChange={(e) => setContractBookResearch(Number(e.target.value))}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Superannuation Fund</label>
                  <select
                    value={contractSuperFund}
                    onChange={(e) => setContractSuperFund(e.target.value as any)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                  >
                    <option value="Nambawan Super">Nambawan Super (Mandatory Public Service / Uni)</option>
                    <option value="Nasfund">Nasfund</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Tenure Classification</label>
                  <select
                    value={contractTenure}
                    onChange={(e) => setContractTenure(e.target.value as any)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                  >
                    <option value="Permanent Local">Permanent Local Tenure</option>
                    <option value="National Contract">National Contract (3 Years)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Duty Commencement Date</label>
                <input
                  type="date"
                  value={contractStartDate}
                  onChange={(e) => setContractStartDate(e.target.value)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden font-mono"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  Statutory Contract Compliance
                </div>
                <div className="text-[11px] text-purple-800 leading-relaxed">
                  Generates an official employment deed including <strong>PNG IRC SWT tax schedule</strong>, 
                  <strong>6.0% employee + 8.4% employer superannuation</strong>, and <strong>Melanesian Kastom Haus Krai bereavement leave</strong> per PNG Employment Act 1978.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedApplicantForContract(null)}
                  className="px-3 py-1.5 font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-md shadow-xs flex items-center gap-1.5"
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  <span>Issue & Transmit Contract</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Official University Employment Agreement Viewer & Digital Signing Pad */}
      {viewingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Agreement Letterhead */}
            <div className="border-b-2 border-neutral-900 pb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-xs"
                  style={{ backgroundColor: university.primaryColor }}
                >
                  {university.acronym.substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 tracking-tight uppercase">
                    {university.name}
                  </h2>
                  <div className="text-xs text-neutral-600 font-medium">
                    Office of the Registrar & University Council Secretariat
                  </div>
                  <div className="text-[11px] text-neutral-500 italic">
                    "{university.motto}" · {university.location}, Papua New Guinea
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-2 py-1 rounded border border-purple-200 block">
                  {viewingContract.contractReferenceNo}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                  Date: {viewingContract.createdDate}
                </span>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-2 bg-neutral-50 rounded border border-neutral-200">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Deed of Academic Appointment & Terms of Employment
              </h3>
              <div className="text-[11px] text-neutral-500 font-medium">
                Pursuant to the Higher Education (General Provisions) Act & University Council By-Laws
              </div>
            </div>

            {/* Contract Body Clauses */}
            <div className="space-y-4 text-xs text-neutral-700 leading-relaxed font-sans">
              <p>
                This Employment Agreement is entered into by and between the <strong>Council of the {university.name}</strong> ("the University") 
                and <strong>{viewingContract.candidateName}</strong> ("the Appointee"), of <strong>{viewingContract.homeProvince}</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <div>
                  <span className="text-neutral-500 block">Appointed Substantive Rank:</span>
                  <strong className="text-neutral-900 text-sm">{viewingContract.academicRank}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Department & School:</span>
                  <strong className="text-neutral-900 text-sm">{viewingContract.department}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Tenure Classification:</span>
                  <span className="font-semibold text-neutral-900">{viewingContract.employmentType} ({viewingContract.contractTenureYears === 0 ? 'Permanent' : '3-Year Fixed'})</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Duty Commencement Date:</span>
                  <span className="font-mono font-semibold text-neutral-900">{viewingContract.startDate}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 uppercase text-[11px] tracking-wide">
                  Schedule of Fortnightly Emoluments & Allowances
                </h4>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-neutral-200">
                      <tr>
                        <td className="py-2 px-3 text-neutral-600">Annual Base Remuneration ({viewingContract.salaryGrade})</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">{formatPGK(viewingContract.annualBaseSalary)} p.a.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-neutral-600">Gross Fortnight Base Salary</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">{formatPGK(viewingContract.fortnightBaseSalary)} / FN</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-neutral-600">Domestic Market Allowance (DMA)</td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-800">{formatPGK(viewingContract.dmaAllowance)} / FN</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-neutral-600">Housing Entitlement / Quarters Allocation</td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-800">{formatPGK(viewingContract.housingAllowance)} / FN</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-neutral-600">Academic Book & Research Grant</td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-800">{formatPGK(viewingContract.bookResearchAllowance)} / FN</td>
                      </tr>
                      <tr className="bg-neutral-50 font-semibold">
                        <td className="py-2 px-3 text-neutral-900">Total Fortnightly Disbursed Emoluments</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-800 font-bold">
                          {formatPGK(viewingContract.fortnightBaseSalary + viewingContract.dmaAllowance + viewingContract.housingAllowance + viewingContract.bookResearchAllowance)} / FN
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-neutral-600">
                <p><strong>Clause 1. Statutory Superannuation:</strong> Mandatory contributions shall be remitted to <strong>{viewingContract.superFund}</strong> (6.0% Employee contribution deducted at source; 8.4% Employer contribution funded by the University Council).</p>
                <p><strong>Clause 2. IRC Taxation:</strong> Subject to fortnightly deduction of Salary & Wages Tax (SWT) in accordance with the Internal Revenue Commission of Papua New Guinea.</p>
                <p><strong>Clause 3. Melanesian Kastom & Recreation Leave:</strong> 18 working days recreation leave per annum, statutory sick leave, and full compassionate leave for Wantok clan obligations and Haus Krai attendance as mandated by the PNG Employment Act 1978.</p>
              </div>

              {/* Digital Signatures Box */}
              <div className="pt-4 border-t-2 border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Candidate Signature Box */}
                <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 text-xs">Appointee Acceptance</span>
                    {viewingContract.candidateSigned ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ✓ Digitally Signed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                        Pending Signature
                      </span>
                    )}
                  </div>

                  {viewingContract.candidateSigned ? (
                    <div className="space-y-1">
                      <div className="font-serif italic text-base text-neutral-900 border-b border-neutral-300 pb-1">
                        {viewingContract.candidateSignatureName || viewingContract.candidateName}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Signed Date: {viewingContract.candidateSignedDate}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-neutral-600">
                        Type your full legal name below to sign and accept this University appointment:
                      </p>
                      <input
                        type="text"
                        placeholder="Type full legal name..."
                        value={signTypedName}
                        onChange={(e) => setSignTypedName(e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-300 rounded text-xs font-serif"
                      />
                      <button
                        onClick={() => handleSignAsCandidate(viewingContract.id)}
                        disabled={!signTypedName}
                        className="w-full py-1.5 px-3 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded shadow-xs"
                      >
                        Affix Digital Signature
                      </button>
                    </div>
                  )}
                </div>

                {/* University Registrar & Council Seal Box */}
                <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 text-xs">University Council Execution</span>
                    {viewingContract.councilSealStamped ? (
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px]">
                        ✓ Sealed & Executed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                        Pending Seal
                      </span>
                    )}
                  </div>

                  {viewingContract.registrarSigned ? (
                    <div className="space-y-1">
                      <div className="font-serif italic text-base text-neutral-900 border-b border-neutral-300 pb-1">
                        Dr. Peter Petsul, PhD (Registrar)
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-purple-700 font-bold font-mono">
                        <Award className="w-3.5 h-3.5" />
                        <span>COUNCIL SEAL AFFIXED · {viewingContract.registrarSignedDate}</span>
                      </div>
                    </div>
                  ) : (
                    !isEmployee && (
                      <div className="space-y-2">
                        <p className="text-[11px] text-neutral-600">
                          Authorize appointment on behalf of the University Council:
                        </p>
                        <button
                          onClick={() => handleSignAsRegistrar(viewingContract.id)}
                          className="w-full py-2 px-3 text-xs font-bold text-white bg-purple-800 hover:bg-purple-700 rounded shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Award className="w-4 h-4" />
                          <span>Affix Registrar Seal & Sign</span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-neutral-200">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md border border-neutral-300"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Deed</span>
              </button>

              <div className="flex items-center gap-2">
                {!isEmployee && viewingContract.status === 'Fully Executed' && (
                  <button
                    onClick={() => handleExecuteOnboard(viewingContract.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-md shadow-xs flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Execute & Onboard into Active Staff & Payroll</span>
                  </button>
                )}

                {viewingContract.status === 'Onboarded to Payroll' && (
                  <span className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active in Faculty Roster & Payroll</span>
                  </span>
                )}

                <button
                  onClick={() => setViewingContract(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Post New Job Vacancy (HR/Admin) */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-neutral-900" />
                <h3 className="text-base font-bold text-neutral-900">
                  Post New University Staff Vacancy
                </h3>
              </div>
              <button 
                onClick={() => setIsNewJobModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Position Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Lecturer in Environmental Law"
                  value={formJobTitle}
                  onChange={(e) => setFormJobTitle(e.target.value)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Department</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Academic Rank</label>
                  <select
                    value={formRank}
                    onChange={(e) => setFormRank(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                    <option value="Lecturer II">Lecturer II</option>
                    <option value="Lecturer I">Lecturer I</option>
                    <option value="Administrative Officer">Administrative Officer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Vacancies Count</label>
                  <input
                    type="number"
                    min={1}
                    value={formVacancies}
                    onChange={(e) => setFormVacancies(Number(e.target.value))}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Closing Date</label>
                  <input
                    type="date"
                    value={formClosingDate}
                    onChange={(e) => setFormClosingDate(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Salary Band & Allowances (in PGK)</label>
                <input
                  type="text"
                  value={formSalaryRange}
                  onChange={(e) => setFormSalaryRange(e.target.value)}
                  placeholder="e.g. K68,000 - K82,000 p.a. + DMA & Housing"
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Position Summary & Scope</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe academic teaching, research expectations, and postgraduate supervision..."
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(false)}
                  className="px-3 py-1.5 font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs"
                >
                  Publish Vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Onboarding Document Upload & Verification */}
      {selectedTaskForDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Onboarding Document Upload & Verification
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {selectedTaskForDocs.taskTitle} · {selectedTaskForDocs.staffName} ({selectedTaskForDocs.staffId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTaskForDocs(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedTaskForDocs.requiredDocumentType && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Statutory Compliance: {selectedTaskForDocs.requiredDocumentType}</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Please upload clear, certified digital scans of IRC tax registration, national ID, or verified qualifications for university records.
                </p>
              </div>
            )}

            {/* Document Upload Control */}
            <div className="space-y-3 bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-neutral-800">Select Document Classification:</label>
                <button
                  type="button"
                  onClick={() => handleQuickAttachTaskSample(selectedTaskForDocs)}
                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Attach Official Certified Copy</span>
                </button>
              </div>

              <select
                value={taskAttachCategory}
                onChange={(e) => setTaskAttachCategory(e.target.value as AttachmentCategory)}
                className="w-full bg-white border border-neutral-300 rounded p-2 text-xs text-neutral-800 font-medium"
              >
                <option value="tax_document">Tax Document (IRC TIN Registration / SWT Exemption)</option>
                <option value="identification">National Identification (PNG NID Card / Passport)</option>
                <option value="qualification">Academic Qualification (Degree / Diploma Parchment)</option>
                <option value="superannuation">Superannuation (Nambawan Super / Nasfund Member Record)</option>
                <option value="clearance_medical">Police Clearance / Medical Fitness Assessment</option>
                <option value="other">Other Official Document</option>
              </select>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileUpload(e.dataTransfer.files, 'task');
                }}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  isDragging ? 'border-amber-500 bg-amber-50/50' : 'border-neutral-300 hover:border-neutral-400 bg-white'
                }`}
              >
                <input
                  type="file"
                  ref={taskFileInputRef}
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files, 'task')}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
                <Upload className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
                <div className="text-xs text-neutral-700 font-medium">
                  Drag files here, or <button type="button" onClick={() => taskFileInputRef.current?.click()} className="text-amber-700 font-bold underline">Browse Device</button>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  PDF scans, JPG/PNG certified copies up to 10 MB
                </div>
              </div>
            </div>

            {/* Attached Documents List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-800">
                Attached Digital Documents ({selectedTaskForDocs.attachments?.length || 0})
              </h4>

              {(!selectedTaskForDocs.attachments || selectedTaskForDocs.attachments.length === 0) ? (
                <div className="p-4 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-lg">
                  No digital files attached yet for this onboarding task.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden bg-white max-h-52 overflow-y-auto text-xs">
                  {selectedTaskForDocs.attachments.map((att) => (
                    <div key={att.id} className="p-3 flex items-center justify-between gap-3 hover:bg-neutral-50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-purple-700 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-neutral-900 truncate text-xs">{att.name}</div>
                          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-neutral-700">{att.categoryLabel}</span>
                            <span>·</span>
                            <span className="font-mono">{att.fileSizeFormatted}</span>
                            <span>·</span>
                            <span>{att.uploadDate}</span>
                            {att.verifiedByHR ? (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Attested ({att.verifiedByOfficer || 'HR'})
                              </span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                Pending Attestation
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewingAttachment(att)}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                          title="Inspect Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!isEmployee && !att.verifiedByHR && onVerifyOnboardingAttachment && (
                          <button
                            type="button"
                            onClick={() => {
                              onVerifyOnboardingAttachment(selectedTaskForDocs.id, att.id, currentUser.name);
                              setSelectedTaskForDocs(prev => prev ? {
                                ...prev,
                                attachments: prev.attachments?.map(a => a.id === att.id ? {
                                  ...a,
                                  verifiedByHR: true,
                                  verifiedAt: new Date().toISOString().split('T')[0],
                                  verifiedByOfficer: currentUser.name
                                } : a)
                              } : null);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                            title="Attest Document"
                          >
                            Attest
                          </button>
                        )}

                        {onDeleteOnboardingAttachment && (
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteOnboardingAttachment(selectedTaskForDocs.id, att.id);
                              setSelectedTaskForDocs(prev => prev ? {
                                ...prev,
                                attachments: prev.attachments?.filter(a => a.id !== att.id)
                              } : null);
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete attachment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setSelectedTaskForDocs(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 7: Document Inspection & Attestation Preview Modal */}
      {previewingAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-300 max-w-lg w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-700" />
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 truncate max-w-xs">
                    {previewingAttachment.name}
                  </h3>
                  <span className="text-[11px] text-neutral-500">
                    {previewingAttachment.categoryLabel} · {previewingAttachment.fileSizeFormatted}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewingAttachment(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Document Preview Canvas */}
            <div className="border border-neutral-300 rounded-lg p-5 bg-neutral-50 space-y-4 shadow-inner text-xs">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-neutral-800 tracking-wide uppercase text-[11px]">
                    Independent State of Papua New Guinea
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  {previewingAttachment.uploadDate}
                </span>
              </div>

              <div className="bg-white p-4 rounded border border-neutral-200 space-y-2 text-neutral-800">
                <div className="text-center font-serif text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                  {previewingAttachment.category === 'tax_document' && 'INTERNAL REVENUE COMMISSION — SALARY OR WAGES TAX (SWT)'}
                  {previewingAttachment.category === 'identification' && 'NATIONAL IDENTITY REGISTRATION CARD (PNG NID)'}
                  {previewingAttachment.category === 'qualification' && 'UNIVERSITY DEGREE PARCHMENT & ACADEMIC TRANSCRIPT'}
                  {previewingAttachment.category === 'superannuation' && 'NATIONAL SUPERANNUATION FUND OF PAPUA NEW GUINEA'}
                  {previewingAttachment.category === 'cv_resume' && 'ACADEMIC CURRICULUM VITAE & SCHOLARSHIP RECORD'}
                  {previewingAttachment.category !== 'tax_document' && previewingAttachment.category !== 'identification' && previewingAttachment.category !== 'qualification' && previewingAttachment.category !== 'superannuation' && previewingAttachment.category !== 'cv_resume' && 'OFFICIAL STATUTORY RECORD'}
                </div>

                <div className="space-y-1 font-mono text-[11px] text-neutral-600 py-2">
                  <div>Document: <strong className="text-neutral-800">{previewingAttachment.name}</strong></div>
                  <div>Classification: <span className="font-semibold">{previewingAttachment.categoryLabel}</span></div>
                  <div>File Size: {previewingAttachment.fileSizeFormatted} ({previewingAttachment.fileSizeBytes.toLocaleString()} bytes)</div>
                  <div>File Type: {previewingAttachment.fileType}</div>
                  {previewingAttachment.notes && (
                    <div className="pt-2 text-neutral-700 italic border-t border-neutral-100 font-sans">
                      Notes: "{previewingAttachment.notes}"
                    </div>
                  )}
                </div>

                {previewingAttachment.verifiedByHR && (
                  <div className="mt-3 p-2 bg-emerald-50 border border-emerald-300 rounded text-center space-y-0.5">
                    <div className="font-bold text-emerald-900 flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>OFFICIAL STATUTORY ATTESTATION</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-mono">
                      Attested by: {previewingAttachment.verifiedByOfficer || 'University Human Resources Division'} · {previewingAttachment.verifiedAt || 'Certified'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <a
                href={previewingAttachment.dataUrl || '#'}
                download={previewingAttachment.name}
                onClick={(e) => {
                  if (!previewingAttachment.dataUrl) {
                    e.preventDefault();
                    alert(`Simulated copy download for: ${previewingAttachment.name}`);
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-300 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Document</span>
              </a>

              <button
                type="button"
                onClick={() => setPreviewingAttachment(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

