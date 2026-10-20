import React, { useState, useMemo } from 'react';
import { AppUser, StudentRecord, UniversityInfo, SponsorshipType, EnrollmentStatus } from '../types';
import { formatPGK } from '../utils/pngPayroll';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Download, 
  GraduationCap, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  BookOpen, 
  Printer,
  Award,
  DollarSign,
  Lock
} from 'lucide-react';

interface StudentEnrollmentProps {
  university: UniversityInfo;
  currentUser?: AppUser;
  students: StudentRecord[];
  onAddStudent: (newStudent: StudentRecord) => void;
  onUpdateStudent: (updatedStudent: StudentRecord) => void;
  isOpenEnrollModal?: boolean;
  onCloseEnrollModal?: () => void;
}

const PNG_PROVINCES = [
  { name: 'National Capital District', region: 'Southern' },
  { name: 'Central Province', region: 'Southern' },
  { name: 'Gulf', region: 'Southern' },
  { name: 'Western (Fly River)', region: 'Southern' },
  { name: 'Milne Bay', region: 'Southern' },
  { name: 'Oro (Northern)', region: 'Southern' },
  { name: 'Morobe', region: 'Momase' },
  { name: 'Madang', region: 'Momase' },
  { name: 'East Sepik', region: 'Momase' },
  { name: 'West Sepik (Sandaun)', region: 'Momase' },
  { name: 'Eastern Highlands', region: 'Highlands' },
  { name: 'Simbu (Chimbu)', region: 'Highlands' },
  { name: 'Western Highlands', region: 'Highlands' },
  { name: 'Jiwaka', region: 'Highlands' },
  { name: 'Enga', region: 'Highlands' },
  { name: 'Southern Highlands', region: 'Highlands' },
  { name: 'Hela', region: 'Highlands' },
  { name: 'East New Britain', region: 'New Guinea Islands' },
  { name: 'West New Britain', region: 'New Guinea Islands' },
  { name: 'New Ireland', region: 'New Guinea Islands' },
  { name: 'Manus', region: 'New Guinea Islands' },
  { name: 'Autonomous Region of Bougainville', region: 'New Guinea Islands' },
];

export const StudentEnrollment: React.FC<StudentEnrollmentProps> = ({
  university,
  currentUser,
  students,
  onAddStudent,
  onUpdateStudent,
  isOpenEnrollModal = false,
  onCloseEnrollModal,
}) => {
  // RBAC Access Control Guard
  if (currentUser && currentUser.role !== 'Administrator') {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center max-w-xl mx-auto space-y-4 my-12 shadow-xs">
        <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-200">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-neutral-900">Module Access Restricted</h3>
          <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
            Your current assigned role is <strong>{currentUser.role}</strong>. Under university data governance policies, student admission records and academic transcripts are restricted to <strong>Administrator</strong> (Registrar's Division).
          </p>
        </div>
        <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-500 font-mono">
          Papua New Guinea Higher Education Act · Student Academic Privacy
        </div>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedSponsorship, setSelectedSponsorship] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(isOpenEnrollModal);
  const [selectedStudentForLetter, setSelectedStudentForLetter] = useState<StudentRecord | null>(null);

  // Sync prop changes
  React.useEffect(() => {
    if (isOpenEnrollModal) {
      setIsAddModalOpen(true);
    }
  }, [isOpenEnrollModal]);

  const handleCloseEnrollModal = () => {
    setIsAddModalOpen(false);
    if (onCloseEnrollModal) onCloseEnrollModal();
  };

  // Form State for New Student
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female',
    email: '',
    phone: '',
    homeProvince: 'Morobe',
    schoolId: 'snps',
    programName: 'Bachelor of Science (Computer Science)',
    degreeLevel: 'Bachelor' as 'Bachelor' | 'Postgraduate Diploma' | 'Master' | 'Doctor of Philosophy (PhD)',
    yearOfStudy: 1,
    sponsorship: 'TESAS - AES (Academic Excellence)' as SponsorshipType,
    sponsorshipId: '',
    semesterTuitionDue: 4500,
    semesterTuitionPaid: 4500,
    advisorStaffId: 'UPNG-ACA-1042',
    advisorName: 'Prof. Michael Mondo',
  });

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.homeProvince.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.programName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSchool = selectedSchool === 'all' || s.schoolId === selectedSchool;
      const matchesSponsorship = selectedSponsorship === 'all' || s.sponsorship === selectedSponsorship;
      const matchesStatus = selectedStatus === 'all' || s.enrollmentStatus === selectedStatus;

      return matchesSearch && matchesSchool && matchesSponsorship && matchesStatus;
    });
  }, [students, searchTerm, selectedSchool, selectedSponsorship, selectedStatus]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = students.length;
    const tesasCount = students.filter(s => s.sponsorship.includes('TESAS')).length;
    const helpCount = students.filter(s => s.sponsorship.includes('HELP')).length;
    const fullyPaidCount = students.filter(s => s.semesterTuitionPaid >= s.semesterTuitionDue).length;
    const avgGpa = (students.reduce((acc, s) => acc + s.gpa, 0) / (total || 1)).toFixed(2);

    return { total, tesasCount, helpCount, fullyPaidCount, avgGpa };
  }, [students]);

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    const selectedProv = PNG_PROVINCES.find(p => p.name === formData.homeProvince);
    const region = (selectedProv ? selectedProv.region : 'Southern') as 'Highlands' | 'Momase' | 'Southern' | 'New Guinea Islands';

    const schoolMap: Record<string, string> = {
      snps: 'School of Natural and Physical Sciences',
      sbpp: 'School of Business and Public Policy',
      shss: 'School of Humanities and Social Sciences',
      sol: 'School of Law',
      smhs: 'School of Medicine and Health Sciences (Taurama)',
    };

    const newStudent: StudentRecord = {
      id: `stu-${Date.now()}`,
      studentId: `2026-${formData.schoolId.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      email: formData.email || `${formData.firstName[0].toLowerCase()}.${formData.lastName.toLowerCase()}26@student.upng.ac.pg`,
      phone: formData.phone || '+675 7000 0000',
      homeProvince: formData.homeProvince,
      region,
      schoolId: formData.schoolId,
      schoolName: schoolMap[formData.schoolId] || 'School of Natural and Physical Sciences',
      programName: formData.programName,
      degreeLevel: formData.degreeLevel,
      yearOfStudy: Number(formData.yearOfStudy),
      currentSemester: 'Semester 2, 2026',
      sponsorship: formData.sponsorship,
      sponsorshipId: formData.sponsorshipId || `PNG-DHERST-${Math.floor(10000 + Math.random() * 90000)}`,
      gpa: 4.00,
      academicStanding: 'Good Standing',
      enrollmentStatus: formData.semesterTuitionPaid >= formData.semesterTuitionDue ? 'Enrolled & Active' : 'Pending Fee Clearance',
      semesterTuitionDue: Number(formData.semesterTuitionDue),
      semesterTuitionPaid: Number(formData.semesterTuitionPaid),
      advisorStaffId: formData.advisorStaffId,
      advisorName: formData.advisorName,
      coursesEnrolled: ['UNIT101: Foundation Studies', 'CORE102: Academic English & Research'],
    };

    onAddStudent(newStudent);
    handleCloseEnrollModal();
  };

  const handleExportStudentsCsv = () => {
    const headers = [
      'Student ID',
      'First Name',
      'Last Name',
      'Gender',
      'Province of Origin',
      'Region',
      'School',
      'Program',
      'Year',
      'Sponsorship',
      'GPA',
      'Status',
      'Tuition Due (PGK)',
      'Tuition Paid (PGK)',
      'Advisor',
    ];

    const rows = filteredStudents.map(s => [
      s.studentId,
      `"${s.firstName}"`,
      `"${s.lastName}"`,
      s.gender,
      `"${s.homeProvince}"`,
      s.region,
      `"${s.schoolName}"`,
      `"${s.programName}"`,
      s.yearOfStudy,
      `"${s.sponsorship}"`,
      s.gpa.toFixed(2),
      s.enrollmentStatus,
      s.semesterTuitionDue.toFixed(2),
      s.semesterTuitionPaid.toFixed(2),
      `"${s.advisorName}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${university.acronym}_Student_Registry_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Enrolled Students</span>
            <GraduationCap className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {metrics.total}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Semester 2, 2026 Academic Term
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>DHERST TESAS Scholars</span>
            <Award className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {metrics.tesasCount}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            AES Merit & HECAS Assistance awards
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>HELP Loan & Provincial</span>
            <BookOpen className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {metrics.helpCount}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Higher Education Loan Program
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Tuition Clearance Rate</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {Math.round((metrics.fullyPaidCount / (metrics.total || 1)) * 100)}%
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {metrics.fullyPaidCount} of {metrics.total} accounts settled
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* School filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium shrink-0">School:</span>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Schools</option>
                <option value="snps">Natural & Physical Sciences (SNPS)</option>
                <option value="sbpp">Business & Public Policy (SBPP)</option>
                <option value="shss">Humanities & Social Sciences (SHSS)</option>
                <option value="sol">School of Law (SOL)</option>
                <option value="smhs">Medicine & Health Sciences (SMHS)</option>
              </select>
            </div>

            {/* Sponsorship filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium shrink-0">Sponsorship:</span>
              <select
                value={selectedSponsorship}
                onChange={(e) => setSelectedSponsorship(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Sponsorships</option>
                <option value="TESAS - AES (Academic Excellence)">TESAS - AES (Academic Excellence)</option>
                <option value="TESAS - HECAS (Higher Education)">TESAS - HECAS</option>
                <option value="HELP Loan Scheme">HELP Loan Scheme</option>
                <option value="Provincial Government Sponsor">Provincial Government</option>
                <option value="Corporate / Mining Sponsor">Corporate / Mining</option>
                <option value="Self-Sponsored">Self-Sponsored</option>
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium shrink-0">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Statuses</option>
                <option value="Enrolled & Active">Enrolled & Active</option>
                <option value="Pending Fee Clearance">Pending Fee Clearance</option>
                <option value="Deferred">Deferred</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search student, province, degree..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-400 text-neutral-800 placeholder-neutral-400"
              />
            </div>

            <button
              onClick={handleExportStudentsCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-md transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export HEMIS</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors whitespace-nowrap shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Student ID & Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Program & School</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Province / Region</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Year</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Sponsorship</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">GPA</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Standing</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Fee Balance</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Enrollment Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-neutral-400">
                    No student records found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const feeBalance = s.semesterTuitionDue - s.semesterTuitionPaid;

                  return (
                    <tr key={s.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-neutral-900">{s.firstName} {s.lastName}</div>
                        <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                          <span>{s.studentId}</span>
                          <span aria-hidden="true">·</span>
                          <span>{s.gender}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-neutral-900 font-medium">{s.programName}</div>
                        <div className="text-[11px] text-neutral-500">{s.schoolName}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-neutral-900 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span>{s.homeProvince}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 pl-4">{s.region} Region</div>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        Year {s.yearOfStudy}
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-neutral-900">{s.sponsorship}</div>
                        {s.sponsorshipId && (
                          <div className="text-[11px] font-mono text-neutral-500">{s.sponsorshipId}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900">
                        {s.gpa.toFixed(2)}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`text-[11px] font-medium ${
                          s.academicStanding.includes('Honours') 
                            ? 'text-amber-700' 
                            : s.academicStanding.includes('Warning') 
                              ? 'text-rose-700' 
                              : 'text-neutral-700'
                        }`}>
                          {s.academicStanding}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        {feeBalance <= 0 ? (
                          <span className="text-emerald-700 font-medium">Cleared</span>
                        ) : (
                          <span className="text-rose-700">{formatPGK(feeBalance)}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          s.enrollmentStatus === 'Enrolled & Active'
                            ? 'text-emerald-700'
                            : s.enrollmentStatus === 'Pending Fee Clearance'
                              ? 'text-amber-700'
                              : 'text-neutral-500'
                        }`}>
                          {s.enrollmentStatus === 'Enrolled & Active' ? (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{s.enrollmentStatus}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedStudentForLetter(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap"
                        >
                          <FileText className="w-3 h-3 text-neutral-500" />
                          <span>Verification</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Showing <strong className="text-neutral-800">{filteredStudents.length}</strong> of {students.length} student records
          </span>
          <span className="font-mono text-[11px]">
            DHERST National Higher Education Management Information System (HEMIS) Compliant
          </span>
        </div>
      </div>

      {/* Official Enrollment Letter / Verification Modal */}
      {selectedStudentForLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-200 my-8">
            <button
              onClick={() => setSelectedStudentForLetter(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Official Academic Letterhead */}
              <div className="text-center border-b border-neutral-300 pb-4 space-y-1">
                <h2 className="text-lg font-bold tracking-tight text-neutral-900 uppercase">
                  {university.name}
                </h2>
                <p className="text-xs text-neutral-600 font-medium">
                  OFFICE OF THE REGISTRAR · STUDENT ACADEMIC ADMINISTRATION
                </p>
                <p className="text-[11px] text-neutral-500">
                  {university.location} · Papua New Guinea · Tel: +675 326 7100
                </p>
              </div>

              {/* Document Title */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-500">Reference:</span>{' '}
                  <span className="font-mono font-semibold text-neutral-800">
                    REG/ENR/2026/{selectedStudentForLetter.studentId}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Date:</span>{' '}
                  <span className="font-medium text-neutral-800">14 October 2026</span>
                </div>
              </div>

              <div className="text-center font-bold text-sm tracking-wide text-neutral-900 border-y border-neutral-200 py-2">
                OFFICIAL CERTIFICATE OF ENROLLMENT & ACADEMIC STANDING
              </div>

              {/* Student Record Content */}
              <div className="space-y-4 text-xs text-neutral-800 leading-relaxed">
                <p>
                  To Whom It May Concern,
                </p>
                <p>
                  This is to certify that the student named below is bona fide, currently registered, and in active enrollment at the <strong>{university.name}</strong> for the <strong>Semester 2, 2026</strong> academic period.
                </p>

                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-neutral-500 block">Full Name:</span>
                      <strong className="text-neutral-900 text-sm">
                        {selectedStudentForLetter.firstName} {selectedStudentForLetter.lastName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Student ID Number:</span>
                      <strong className="font-mono text-neutral-900">
                        {selectedStudentForLetter.studentId}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
                    <div>
                      <span className="text-neutral-500 block">Program of Study:</span>
                      <strong className="text-neutral-900">
                        {selectedStudentForLetter.programName} ({selectedStudentForLetter.degreeLevel})
                      </strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Academic School:</span>
                      <strong className="text-neutral-900">
                        {selectedStudentForLetter.schoolName}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-200">
                    <div>
                      <span className="text-neutral-500 block">Year of Study:</span>
                      <span className="font-semibold text-neutral-900">Year {selectedStudentForLetter.yearOfStudy}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Cumulative GPA:</span>
                      <span className="font-mono font-bold text-neutral-900">{selectedStudentForLetter.gpa.toFixed(2)} / 5.00</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Academic Standing:</span>
                      <span className="font-semibold text-neutral-900">{selectedStudentForLetter.academicStanding}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
                    <div>
                      <span className="text-neutral-500 block">Funding / Sponsorship:</span>
                      <span className="text-neutral-900 font-medium">{selectedStudentForLetter.sponsorship}</span>
                      {selectedStudentForLetter.sponsorshipId && (
                        <span className="text-[11px] font-mono text-neutral-500 block">{selectedStudentForLetter.sponsorshipId}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Province of Origin:</span>
                      <span className="text-neutral-900 font-medium">
                        {selectedStudentForLetter.homeProvince} ({selectedStudentForLetter.region} Region)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="font-semibold text-neutral-900">Registered Semester Course Units:</div>
                  <ul className="list-disc list-inside text-neutral-700 pl-2">
                    {selectedStudentForLetter.coursesEnrolled.map((course: string, idx: number) => (
                      <li key={idx} className="font-mono">{course}</li>
                    ))}
                  </ul>
                </div>

                <p className="text-[11px] text-neutral-500 pt-2">
                  This document is issued upon request for official purposes including DHERST TESAS scholarship verification, bank educational allowances, provincial government grant acquittals, and immigration authorities.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-neutral-300 flex items-end justify-between text-xs">
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-neutral-400">OFFICIAL REGISTRAR STAMP</div>
                  <div className="w-24 h-24 border-2 border-dashed border-neutral-300 rounded-full flex items-center justify-center text-[10px] text-neutral-400 font-bold uppercase rotate-[-12deg]">
                    UNIVERSITY<br/>SEAL
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-serif italic text-base text-neutral-700">Dr. Peter Petsul</div>
                  <div className="border-t border-neutral-400 pt-1 font-semibold text-neutral-900">
                    Registrar & Secretary to Council
                  </div>
                  <div className="text-[11px] text-neutral-500">{university.name}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedStudentForLetter(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll New Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl relative border border-neutral-200 my-8">
            <button
              onClick={handleCloseEnrollModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-5">
              <h2 className="text-lg font-bold text-neutral-900">Enroll New University Student</h2>
              <p className="text-xs text-neutral-500">
                Register admission into {university.name} academic registry.
              </p>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                    placeholder="e.g. Stanley"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                    placeholder="e.g. Kondo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Home Province</label>
                  <select
                    value={formData.homeProvince}
                    onChange={(e) => setFormData({ ...formData, homeProvince: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  >
                    {PNG_PROVINCES.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name} ({p.region})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Academic School</label>
                  <select
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="snps">Natural & Physical Sciences (SNPS)</option>
                    <option value="sbpp">Business & Public Policy (SBPP)</option>
                    <option value="shss">Humanities & Social Sciences (SHSS)</option>
                    <option value="sol">School of Law (SOL)</option>
                    <option value="smhs">Medicine & Health Sciences (SMHS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Year of Study</label>
                  <select
                    value={formData.yearOfStudy}
                    onChange={(e) => setFormData({ ...formData, yearOfStudy: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value={1}>Year 1 (Freshman)</option>
                    <option value={2}>Year 2 (Sophomore)</option>
                    <option value={3}>Year 3 (Junior)</option>
                    <option value={4}>Year 4 (Finalist)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Degree Program Name</label>
                <input
                  type="text"
                  required
                  value={formData.programName}
                  onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  placeholder="e.g. Bachelor of Science (Computer Science)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Sponsorship Category</label>
                  <select
                    value={formData.sponsorship}
                    onChange={(e) => setFormData({ ...formData, sponsorship: e.target.value as SponsorshipType })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="TESAS - AES (Academic Excellence)">TESAS - AES (Academic Excellence)</option>
                    <option value="TESAS - HECAS (Higher Education)">TESAS - HECAS</option>
                    <option value="HELP Loan Scheme">HELP Loan Scheme</option>
                    <option value="Provincial Government Sponsor">Provincial Government Sponsor</option>
                    <option value="Corporate / Mining Sponsor">Corporate / Mining Sponsor</option>
                    <option value="Self-Sponsored">Self-Sponsored</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Sponsorship / Grant ID</label>
                  <input
                    type="text"
                    value={formData.sponsorshipId}
                    onChange={(e) => setFormData({ ...formData, sponsorshipId: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                    placeholder="e.g. DHERST-AES-2026-9921"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Semester Tuition Due (PGK)</label>
                  <input
                    type="number"
                    value={formData.semesterTuitionDue}
                    onChange={(e) => setFormData({ ...formData, semesterTuitionDue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Initial Tuition Paid (PGK)</label>
                  <input
                    type="number"
                    value={formData.semesterTuitionPaid}
                    onChange={(e) => setFormData({ ...formData, semesterTuitionPaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEnrollModal}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
                >
                  Complete Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
