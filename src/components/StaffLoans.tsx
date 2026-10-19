import React, { useState, useMemo } from 'react';
import { AppUser, FacultyMember, LoanStatus, LoanType, StaffLoan, UniversityInfo } from '../types';
import { formatPGK } from '../utils/pngPayroll';
import { 
  Landmark, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Search, 
  Filter, 
  FileText, 
  AlertCircle, 
  X, 
  Printer, 
  DollarSign, 
  HeartHandshake, 
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

interface StaffLoansProps {
  university: UniversityInfo;
  currentUser: AppUser;
  facultyMembers: FacultyMember[];
  loans: StaffLoan[];
  onAddLoan: (newLoan: StaffLoan) => void;
  onUpdateLoanStatus: (loanId: string, status: LoanStatus, approverName: string) => void;
  isOpenApplyModal?: boolean;
  onCloseApplyModal?: () => void;
}

export const StaffLoans: React.FC<StaffLoansProps> = ({
  university,
  currentUser,
  facultyMembers,
  loans,
  onAddLoan,
  onUpdateLoanStatus,
  isOpenApplyModal = false,
  onCloseApplyModal,
}) => {
  const isEmployee = currentUser.role === 'Employee';

  // Scoped loans for active user
  const scopedLoans = useMemo(() => {
    if (isEmployee && currentUser.staffId) {
      return loans.filter(l => l.staffId === currentUser.staffId);
    }
    return loans;
  }, [loans, isEmployee, currentUser]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(isOpenApplyModal);
  const [selectedLoanDetails, setSelectedLoanDetails] = useState<StaffLoan | null>(null);

  React.useEffect(() => {
    if (isOpenApplyModal) setIsApplyModalOpen(true);
  }, [isOpenApplyModal]);

  const handleCloseModal = () => {
    setIsApplyModalOpen(false);
    if (onCloseApplyModal) onCloseApplyModal();
  };

  // New Loan Form State
  const [formStaffId, setFormStaffId] = useState(
    isEmployee && currentUser.staffId ? currentUser.staffId : facultyMembers[0]?.staffId || ''
  );
  const [formLoanType, setFormLoanType] = useState<LoanType>('Salary Advance');
  const [formAmount, setFormAmount] = useState<number>(2000);
  const [formFortnights, setFormFortnights] = useState<number>(6);
  const [formPurpose, setFormPurpose] = useState('');

  // Computed Portfolio Totals
  const totals = useMemo(() => {
    const totalPrincipal = scopedLoans.reduce((acc, l) => acc + l.principalAmount, 0);
    const totalOutstanding = scopedLoans.reduce((acc, l) => acc + l.remainingBalance, 0);
    const activeLoansCount = scopedLoans.filter(l => l.status === 'Approved' || l.status === 'Disbursed').length;
    const pendingReviewCount = scopedLoans.filter(l => l.status === 'Pending HR Review' || l.status === 'Bursar Clearance').length;

    return { totalPrincipal, totalOutstanding, activeLoansCount, pendingReviewCount };
  }, [scopedLoans]);

  // Filtered loans list
  const filteredLoans = useMemo(() => {
    return scopedLoans.filter(l => {
      const matchesSearch = 
        l.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedTypeFilter === 'all' || l.loanType === selectedTypeFilter;
      const matchesStatus = selectedStatusFilter === 'all' || l.status === selectedStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [scopedLoans, searchTerm, selectedTypeFilter, selectedStatusFilter]);

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const faculty = facultyMembers.find(f => f.staffId === formStaffId);
    if (!faculty) return;

    const principal = Number(formAmount);
    const fnCount = Number(formFortnights) || 6;
    const fnDeduction = Math.round((principal / fnCount) * 100) / 100;

    const newLoan: StaffLoan = {
      id: `LN-2026-${Math.floor(100 + Math.random() * 900)}`,
      staffId: faculty.staffId,
      staffName: `${faculty.firstName} ${faculty.lastName}`,
      department: faculty.department,
      loanType: formLoanType,
      principalAmount: principal,
      purpose: formPurpose || `${formLoanType} requested for personal commitments`,
      repaymentFortnights: fnCount,
      fortnightDeduction: fnDeduction,
      totalRepaid: 0,
      remainingBalance: principal,
      status: 'Pending HR Review',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    onAddLoan(newLoan);
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>{isEmployee ? 'My Active Loans' : 'Total Outstanding Balance'}</span>
            <Landmark className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatPGK(totals.totalOutstanding)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Payroll direct deduction recovery
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>{isEmployee ? 'Total Borrowed' : 'Principal Disbursed'}</span>
            <CreditCard className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatPGK(totals.totalPrincipal)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Across {scopedLoans.length} loan accounts
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 tabular-nums">
            {totals.pendingReviewCount}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Awaiting HR & Bursar clearance
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Active Repaying Loans</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {totals.activeLoansCount}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Auto-deducted on fortnight cycle
          </div>
        </div>
      </div>

      {/* Control Strip & Filters */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">Loan Type:</span>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Loan Schemes</option>
                <option value="Salary Advance">Salary Advance (Short Term)</option>
                <option value="Staff SACCO Loan">Staff SACCO Loan</option>
                <option value="TISA Credit Union Loan">TISA Credit Union Loan</option>
                <option value="Emergency Wantok Loan">Emergency Wantok Loan</option>
                <option value="Children School Fee Advance">Children School Fee Advance</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Statuses</option>
                <option value="Pending HR Review">Pending HR Review</option>
                <option value="Bursar Clearance">Bursar Clearance</option>
                <option value="Approved">Approved</option>
                <option value="Disbursed">Disbursed / Repaying</option>
                <option value="Fully Repaid">Fully Repaid</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search staff, loan ID, purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-400 text-neutral-800 placeholder-neutral-400"
              />
            </div>

            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors whitespace-nowrap shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Apply for Loan / Advance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Loan ID & Staff</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Department</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Scheme & Purpose</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Principal</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">FN Deduction</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Repaid</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right font-semibold text-neutral-900">Balance</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-400">
                    No loan or advance records found.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((l) => {
                  const isPending = l.status === 'Pending HR Review' || l.status === 'Bursar Clearance';

                  return (
                    <tr key={l.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-neutral-900">{l.staffName}</div>
                        <div className="text-[11px] font-mono text-neutral-500">{l.id} · {l.staffId}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-neutral-900">{l.department}</div>
                        <div className="text-[11px] text-neutral-400">Applied {l.appliedDate}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-neutral-900 flex items-center gap-1">
                          {l.loanType === 'Emergency Wantok Loan' && (
                            <HeartHandshake className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          {l.loanType === 'Children School Fee Advance' && (
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                          <span>{l.loanType}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-[200px]" title={l.purpose}>
                          {l.purpose}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-900 font-medium">
                        {formatPGK(l.principalAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {formatPGK(l.fortnightDeduction)} / fn
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-500">
                        {formatPGK(l.totalRepaid)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-neutral-900">
                        {l.remainingBalance === 0 ? (
                          <span className="text-emerald-700">Cleared</span>
                        ) : (
                          <span className="text-rose-700">{formatPGK(l.remainingBalance)}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          l.status === 'Disbursed' || l.status === 'Approved'
                            ? 'text-emerald-700'
                            : l.status === 'Fully Repaid'
                              ? 'text-neutral-500'
                              : l.status === 'Declined'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                        }`}>
                          {l.status === 'Disbursed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {l.status === 'Pending HR Review' && <Clock className="w-3 h-3 text-amber-600" />}
                          <span>{l.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedLoanDetails(l)}
                            className="px-2 py-1 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                          >
                            Dossier
                          </button>
                          {!isEmployee && isPending && (
                            <>
                              <button
                                onClick={() => onUpdateLoanStatus(l.id, 'Approved', `${currentUser.name} (${currentUser.role})`)}
                                className="px-2 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => onUpdateLoanStatus(l.id, 'Declined', `${currentUser.name} (${currentUser.role})`)}
                                className="px-2 py-1 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </div>
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
            University Staff Credit & Payroll Deduction Scheme · Bursar Clearance Required
          </span>
          <span className="font-mono text-[11px]">
            Statutory Fortnightly Deduction Caps Enforced (Max 40% Net Pay)
          </span>
        </div>
      </div>

      {/* Loan Details Modal */}
      {selectedLoanDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative border border-neutral-200 my-8">
            <button
              onClick={() => setSelectedLoanDetails(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 text-xs">
              <div className="border-b border-neutral-200 pb-3">
                <h3 className="text-base font-bold text-neutral-900">Staff Loan Account Voucher</h3>
                <p className="text-neutral-500 font-mono text-[11px]">Account {selectedLoanDetails.id} · {selectedLoanDetails.loanType}</p>
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Applicant:</span>
                  <strong className="text-neutral-900">{selectedLoanDetails.staffName} ({selectedLoanDetails.staffId})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Department:</span>
                  <span className="text-neutral-800 font-medium">{selectedLoanDetails.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Principal Advance:</span>
                  <span className="font-mono font-bold text-neutral-900">{formatPGK(selectedLoanDetails.principalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Fortnightly Deduction:</span>
                  <span className="font-mono font-medium text-rose-700">-{formatPGK(selectedLoanDetails.fortnightDeduction)} / FN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Remaining Balance:</span>
                  <span className="font-mono font-bold text-neutral-900">{formatPGK(selectedLoanDetails.remainingBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Repayment Period:</span>
                  <span className="font-mono text-neutral-800">{selectedLoanDetails.repaymentFortnights} Fortnights (~{Math.round(selectedLoanDetails.repaymentFortnights / 2)} Months)</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-neutral-500 font-medium block">Declared Purpose & Customary Justification:</span>
                <p className="p-2.5 bg-white border border-neutral-200 rounded text-neutral-800 leading-relaxed">
                  {selectedLoanDetails.purpose}
                </p>
              </div>

              {selectedLoanDetails.approvedBy && (
                <div className="pt-2 border-t border-neutral-100 flex justify-between text-neutral-600">
                  <span>Approved By:</span>
                  <span className="font-medium text-emerald-800">{selectedLoanDetails.approvedBy} ({selectedLoanDetails.approvedDate})</span>
                </div>
              )}

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedLoanDetails(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply for Loan Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative border border-neutral-200 my-8">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-5">
              <h2 className="text-lg font-bold text-neutral-900">Staff Loan & Advance Application</h2>
              <p className="text-xs text-neutral-500">
                Fortnightly payroll deduction scheme administered through {university.name} Bursar & SACCO.
              </p>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Applying Staff Member</label>
                {isEmployee ? (
                  <div className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-md text-xs font-semibold text-neutral-800">
                    {currentUser.name} ({currentUser.staffId})
                  </div>
                ) : (
                  <select
                    value={formStaffId}
                    onChange={(e) => setFormStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  >
                    {facultyMembers.map(f => (
                      <option key={f.id} value={f.staffId}>
                        {f.firstName} {f.lastName} ({f.academicRank} - {f.department})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Loan / Advance Scheme</label>
                  <select
                    value={formLoanType}
                    onChange={(e) => setFormLoanType(e.target.value as LoanType)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="Salary Advance">Fortnight Salary Advance</option>
                    <option value="Staff SACCO Loan">University Staff SACCO Loan</option>
                    <option value="TISA Credit Union Loan">TISA Credit Union Loan</option>
                    <option value="Emergency Wantok Loan">Emergency Wantok Loan (Haus Krai)</option>
                    <option value="Children School Fee Advance">Children School Fee Advance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Amount Requested (PGK)</label>
                  <input
                    type="number"
                    min={500}
                    max={25000}
                    step={100}
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Repayment Term (Fortnights)</label>
                  <select
                    value={formFortnights}
                    onChange={(e) => setFormFortnights(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value={4}>4 Fortnights (~2 Months)</option>
                    <option value={6}>6 Fortnights (~3 Months)</option>
                    <option value={10}>10 Fortnights (~5 Months)</option>
                    <option value={12}>12 Fortnights (~6 Months)</option>
                    <option value={26}>26 Fortnights (1 Full Year)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Est. Fortnight Deduction</label>
                  <div className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-md text-xs font-mono font-bold text-rose-700">
                    -{formatPGK(Math.round((formAmount / (formFortnights || 1)) * 100) / 100)} / FN
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Purpose / Justification</label>
                <textarea
                  rows={2}
                  required
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="Specify purpose (e.g. school fees invoice, urgent village medical/funeral assistance, building supplies)..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 space-y-1">
                <strong>Payroll Direct Deduction Agreement:</strong>
                <p>
                  By submitting this request, I authorize {university.name} Bursar & Payroll division to deduct the agreed fortnightly installment directly from my net salary until the balance is completely amortized.
                </p>
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
                  Submit Loan Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
