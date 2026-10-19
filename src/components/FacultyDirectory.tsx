import React, { useState, useMemo } from 'react';
import { AcademicRank, AppUser, EmploymentType, FacultyMember, PNGCommercialBank, SuperannuationFund, UniversityInfo } from '../types';
import { formatPGK } from '../utils/pngPayroll';
import { 
  Search, 
  UserPlus, 
  Home, 
  BookOpen, 
  CreditCard, 
  Mail, 
  Phone, 
  GraduationCap, 
  X, 
  Award,
  Users,
  Lock
} from 'lucide-react';

interface FacultyDirectoryProps {
  university: UniversityInfo;
  currentUser?: AppUser;
  facultyMembers: FacultyMember[];
  onAddFaculty: (newFaculty: FacultyMember) => void;
  isOpenAddFacultyModal?: boolean;
  onCloseAddFacultyModal?: () => void;
}

export const FacultyDirectory: React.FC<FacultyDirectoryProps> = ({
  university,
  currentUser,
  facultyMembers,
  onAddFaculty,
  isOpenAddFacultyModal = false,
  onCloseAddFacultyModal,
}) => {
  const isEmployee = currentUser?.role === 'Employee';

  const scopedFaculty = useMemo(() => {
    if (isEmployee && currentUser?.staffId) {
      const own = facultyMembers.filter(f => f.staffId === currentUser.staffId);
      return own.length > 0 ? own : [facultyMembers[0]];
    }
    return facultyMembers;
  }, [facultyMembers, isEmployee, currentUser]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedRank, setSelectedRank] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(isOpenAddFacultyModal);
  const [selectedFacultyDetails, setSelectedFacultyDetails] = useState<FacultyMember | null>(null);

  React.useEffect(() => {
    if (isOpenAddFacultyModal) {
      setIsAddModalOpen(true);
    }
  }, [isOpenAddFacultyModal]);

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    if (onCloseAddFacultyModal) onCloseAddFacultyModal();
  };

  // New Faculty Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female',
    email: '',
    phone: '',
    homeProvince: 'Morobe',
    tinNumber: '',
    superFund: 'Nambawan Super' as SuperannuationFund,
    superMemberNo: '',
    bankName: 'Bank South Pacific (BSP)' as PNGCommercialBank,
    bankAccountNo: '',
    bankBsb: '088-301',
    schoolId: 'snps',
    department: 'Mathematics & Computing',
    academicRank: 'Senior Lecturer' as AcademicRank,
    employmentType: 'Permanent Local' as EmploymentType,
    salaryGrade: 'Grade 14.3',
    annualBaseSalary: 72000,
    campusHousingUnit: 'Waigani Quarters Block 5',
    qualifications: 'PhD (UPNG), MSc',
  });

  const filteredFaculty = useMemo(() => {
    return scopedFaculty.filter(f => {
      const matchesSearch = 
        `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.qualifications.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSchool = selectedSchool === 'all' || f.schoolId === selectedSchool;
      const matchesRank = selectedRank === 'all' || f.academicRank === selectedRank;

      return matchesSearch && matchesSchool && matchesRank;
    });
  }, [scopedFaculty, searchTerm, selectedSchool, selectedRank]);

  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    const schoolMap: Record<string, string> = {
      snps: 'School of Natural and Physical Sciences',
      sbpp: 'School of Business and Public Policy',
      shss: 'School of Humanities and Social Sciences',
      sol: 'School of Law',
      smhs: 'School of Medicine and Health Sciences (Taurama)',
    };

    const newFaculty: FacultyMember = {
      id: `fac-${Date.now()}`,
      staffId: `${university.acronym}-ACA-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      email: formData.email || `${formData.firstName[0].toLowerCase()}.${formData.lastName.toLowerCase()}@${university.acronym.toLowerCase()}.ac.pg`,
      phone: formData.phone || '+675 326 7000',
      homeProvince: formData.homeProvince,
      tinNumber: formData.tinNumber || `TIN-${Math.floor(100000 + Math.random() * 900000)}-01`,
      superFund: formData.superFund,
      superMemberNo: formData.superMemberNo || `NS-${Math.floor(1000000 + Math.random() * 9000000)}`,
      bankName: formData.bankName,
      bankAccountNo: formData.bankAccountNo || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      bankBsb: formData.bankBsb,
      schoolId: formData.schoolId,
      schoolName: schoolMap[formData.schoolId] || 'School of Natural and Physical Sciences',
      department: formData.department,
      academicRank: formData.academicRank,
      employmentType: formData.employmentType,
      salaryGrade: formData.salaryGrade,
      annualBaseSalary: Number(formData.annualBaseSalary),
      campusHousingUnit: formData.campusHousingUnit,
      dateJoined: '2026-10-14',
      qualifications: formData.qualifications,
      avatarUrl: '',
      coursesTaught: ['UNIT201: Intermediate Studies', 'UNIT301: Research Methods'],
      adviseesCount: 15,
      activeStatus: 'Active',
    };

    onAddFaculty(newFaculty);
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">School:</span>
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

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">Academic Rank:</span>
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Ranks</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Senior Lecturer">Senior Lecturer</option>
                <option value="Lecturer II">Lecturer II</option>
                <option value="Lecturer I">Lecturer I</option>
                <option value="Tutor / Teaching Fellow">Tutor / Teaching Fellow</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search name, staff ID, qualifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-400 text-neutral-800 placeholder-neutral-400"
              />
            </div>

            {!isEmployee && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors whitespace-nowrap shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Faculty</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.map((f) => (
          <div 
            key={f.id} 
            className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs hover:border-neutral-300 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header with Avatar and Basic Info */}
              <div className="flex items-start gap-3">
                {f.avatarUrl ? (
                  <img
                    src={f.avatarUrl}
                    alt={`${f.firstName} ${f.lastName}`}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-neutral-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-sm shrink-0">
                    {f.firstName[0]}{f.lastName[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-neutral-900 text-sm truncate">
                      {f.firstName} {f.lastName}
                    </h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      f.activeStatus === 'Active' 
                        ? 'text-emerald-800 bg-emerald-50' 
                        : 'text-amber-800 bg-amber-50'
                    }`}>
                      {f.activeStatus}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 font-medium">
                    {f.academicRank}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {f.department}
                  </p>
                </div>
              </div>

              {/* Qualifications */}
              <div className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded border border-neutral-100 flex items-start gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                <span className="truncate" title={f.qualifications}>
                  {f.qualifications}
                </span>
              </div>

              {/* Data points */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Annual Base</span>
                  <span className="font-mono font-medium text-neutral-900 tabular-nums">
                    {formatPGK(f.annualBaseSalary)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block">Salary Grade</span>
                  <span className="font-mono text-neutral-800">{f.salaryGrade}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block">Super Fund</span>
                  <span className="text-neutral-800 truncate block">{f.superFund}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block">Bank</span>
                  <span className="text-neutral-800 truncate block">{f.bankName.split(' ')[0]}</span>
                </div>
              </div>

              {/* Housing and advisee details */}
              <div className="text-[11px] text-neutral-500 space-y-1 pt-1 border-t border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <Home className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span className="truncate">{f.campusHousingUnit}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span>{f.adviseesCount} Student Advisees</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-neutral-400">{f.staffId}</span>
              <button
                onClick={() => setSelectedFacultyDetails(f)}
                className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
              >
                View Dossier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Faculty Dossier Modal */}
      {selectedFacultyDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative border border-neutral-200 my-8">
            <button
              onClick={() => setSelectedFacultyDetails(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
                {selectedFacultyDetails.avatarUrl ? (
                  <img
                    src={selectedFacultyDetails.avatarUrl}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover border border-neutral-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-lg">
                    {selectedFacultyDetails.firstName[0]}{selectedFacultyDetails.lastName[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    {selectedFacultyDetails.firstName} {selectedFacultyDetails.lastName}
                  </h3>
                  <p className="text-neutral-700 font-medium">
                    {selectedFacultyDetails.academicRank} · {selectedFacultyDetails.department}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {selectedFacultyDetails.schoolName}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-neutral-500 block">Staff ID:</span>
                    <strong className="font-mono text-neutral-900">{selectedFacultyDetails.staffId}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Employment Type:</span>
                    <strong className="text-neutral-900">{selectedFacultyDetails.employmentType}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">IRC TIN:</span>
                    <span className="font-mono text-neutral-900">{selectedFacultyDetails.tinNumber}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">{selectedFacultyDetails.superFund}:</span>
                    <span className="font-mono text-neutral-900">{selectedFacultyDetails.superMemberNo}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Bank Account:</span>
                    <span className="font-mono text-neutral-900">{selectedFacultyDetails.bankName} · {selectedFacultyDetails.bankAccountNo}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Annual Base Salary:</span>
                    <span className="font-mono font-bold text-neutral-900">{formatPGK(selectedFacultyDetails.annualBaseSalary)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500 block">Qualifications & Degrees:</span>
                  <p className="text-neutral-800 font-medium mt-0.5">{selectedFacultyDetails.qualifications}</p>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500 block">Campus Housing Allocation:</span>
                  <p className="text-neutral-800 font-medium mt-0.5">{selectedFacultyDetails.campusHousingUnit}</p>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500 block mb-1">Courses Taught This Academic Year:</span>
                  <ul className="list-disc list-inside text-neutral-700 pl-2 space-y-0.5">
                    {selectedFacultyDetails.coursesTaught.map((c, i) => (
                      <li key={i} className="font-mono text-[11px]">{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end">
                <button
                  onClick={() => setSelectedFacultyDetails(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl relative border border-neutral-200 my-8">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-5">
              <h2 className="text-lg font-bold text-neutral-900">Add Academic Faculty Member</h2>
              <p className="text-xs text-neutral-500">
                Register new faculty appointment in {university.name}.
              </p>
            </div>

            <form onSubmit={handleCreateFaculty} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                    placeholder="e.g. Gabriel"
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
                    placeholder="e.g. Andale"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Academic Rank</label>
                  <select
                    value={formData.academicRank}
                    onChange={(e) => setFormData({ ...formData, academicRank: e.target.value as AcademicRank })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                    <option value="Lecturer II">Lecturer II</option>
                    <option value="Lecturer I">Lecturer I</option>
                    <option value="Tutor / Teaching Fellow">Tutor / Teaching Fellow</option>
                  </select>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                    placeholder="e.g. Mathematics & Computing"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Annual Base Salary (PGK)</label>
                  <input
                    type="number"
                    required
                    value={formData.annualBaseSalary}
                    onChange={(e) => setFormData({ ...formData, annualBaseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Superannuation Fund</label>
                  <select
                    value={formData.superFund}
                    onChange={(e) => setFormData({ ...formData, superFund: e.target.value as SuperannuationFund })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="Nambawan Super">Nambawan Super (State Standard)</option>
                    <option value="Nasfund">Nasfund</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Disbursement Bank</label>
                  <select
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value as PNGCommercialBank })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="Bank South Pacific (BSP)">Bank South Pacific (BSP)</option>
                    <option value="Kina Bank">Kina Bank</option>
                    <option value="Westpac PNG">Westpac PNG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Qualifications & Degrees</label>
                <input
                  type="text"
                  required
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  placeholder="e.g. PhD (ANU), MSc (UPNG), BSc"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Campus Housing Allocation</label>
                <input
                  type="text"
                  value={formData.campusHousingUnit}
                  onChange={(e) => setFormData({ ...formData, campusHousingUnit: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  placeholder="e.g. Waigani Senior Quarters Flat 4B"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
                >
                  Add to Faculty Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
