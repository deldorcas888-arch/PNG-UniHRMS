import React, { useState, useMemo } from 'react';
import { 
  AppUser, 
  FacultyMember, 
  JobContract,
  LeaveRecord, 
  LeaveStatus, 
  LoanStatus, 
  PerformanceReview, 
  StaffLoan, 
  UniversityInfo 
} from '../types';
import { formatPGK } from '../utils/pngPayroll';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  Award, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  FileSignature,
  Check, 
  X,
  MessageSquare,
  Building2,
  ChevronRight
} from 'lucide-react';

interface ApprovalsHubProps {
  university: UniversityInfo;
  currentUser: AppUser;
  facultyMembers: FacultyMember[];
  leaveRecords: LeaveRecord[];
  loans: StaffLoan[];
  performanceReviews: PerformanceReview[];
  contracts?: JobContract[];
  onUpdateLeaveStatus: (recordId: string, status: LeaveStatus, approverName: string) => void;
  onUpdateLoanStatus: (loanId: string, status: LoanStatus, approverName: string) => void;
  onUpdateReviewStatus?: (reviewId: string, status: PerformanceReview['status']) => void;
  onNavigateToLeave: () => void;
  onNavigateToLoans: () => void;
  onNavigateToContracts?: () => void;
}

export const ApprovalsHub: React.FC<ApprovalsHubProps> = ({
  university,
  currentUser,
  facultyMembers,
  leaveRecords,
  loans,
  performanceReviews,
  contracts = [],
  onUpdateLeaveStatus,
  onUpdateLoanStatus,
  onUpdateReviewStatus,
  onNavigateToLeave,
  onNavigateToLoans,
  onNavigateToContracts,
}) => {
  const isEmployee = currentUser.role === 'Employee';
  const isHRManager = currentUser.role === 'HR Manager';
  const isAdministrator = currentUser.role === 'Administrator';

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'leave' | 'loans' | 'performance' | 'contracts'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionModal, setSelectedActionModal] = useState<{
    type: 'leave' | 'loan';
    id: string;
    item: any;
    action: 'approve' | 'decline';
  } | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  // Pending counts
  const pendingLeave = useMemo(() => {
    return leaveRecords.filter(r => r.status === 'Pending HOD' || r.status === 'Dean Review');
  }, [leaveRecords]);

  const pendingLoans = useMemo(() => {
    return loans.filter(l => l.status === 'Pending HR Review' || l.status === 'Bursar Clearance');
  }, [loans]);

  const pendingReviews = useMemo(() => {
    return performanceReviews.filter(p => p.status === 'Submitted' || p.status === 'HOD Endorsed');
  }, [performanceReviews]);

  // Employee scoped view vs HR/Admin view
  const employeeLeave = useMemo(() => {
    if (!currentUser.staffId) return [];
    return leaveRecords.filter(r => r.staffId === currentUser.staffId);
  }, [leaveRecords, currentUser]);

  const employeeLoans = useMemo(() => {
    if (!currentUser.staffId) return [];
    return loans.filter(l => l.staffId === currentUser.staffId);
  }, [loans, currentUser]);

  const employeeReviews = useMemo(() => {
    if (!currentUser.staffId) return [];
    return performanceReviews.filter(p => p.staffId === currentUser.staffId);
  }, [performanceReviews, currentUser]);

  // Action execution
  const handleConfirmAction = () => {
    if (!selectedActionModal) return;
    const approverName = `${currentUser.name} (${currentUser.title})`;

    if (selectedActionModal.type === 'leave') {
      const nextStatus: LeaveStatus = selectedActionModal.action === 'approve' ? 'Approved' : 'Declined';
      onUpdateLeaveStatus(selectedActionModal.id, nextStatus, approverName);
    } else if (selectedActionModal.type === 'loan') {
      const nextStatus: LoanStatus = selectedActionModal.action === 'approve' ? 'Approved' : 'Declined';
      onUpdateLoanStatus(selectedActionModal.id, nextStatus, approverName);
    }

    setSelectedActionModal(null);
    setActionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>{isEmployee ? 'My Pending Submissions' : 'Actionable Requests'}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {isEmployee 
              ? (employeeLeave.filter(r => r.status.includes('Pending') || r.status.includes('Review')).length + 
                 employeeLoans.filter(l => l.status.includes('Pending') || l.status.includes('Bursar')).length)
              : (pendingLeave.length + pendingLoans.length + pendingReviews.length)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {isEmployee ? 'Under Dean & HR review' : 'Awaiting signoff & clearance'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Leave Applications</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {isEmployee ? employeeLeave.length : pendingLeave.length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {isEmployee ? 'Total submitted records' : 'Annual & Kastom requests'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Staff Loan Advances</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {isEmployee 
              ? formatPGK(employeeLoans.reduce((a, b) => a + b.principalAmount, 0))
              : formatPGK(pendingLoans.reduce((a, b) => a + b.principalAmount, 0))}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {isEmployee ? 'My total loan balance' : `${pendingLoans.length} requests in queue`}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>{isEmployee ? 'Approved Requests' : 'Academic Appraisals'}</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {isEmployee 
              ? employeeLeave.filter(r => r.status === 'Approved').length + employeeLoans.filter(l => l.status === 'Approved' || l.status === 'Disbursed').length
              : pendingReviews.length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {isEmployee ? 'Approved & active' : 'HOD endorsed appraisals'}
          </div>
        </div>
      </div>

      {/* Control & Tab Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Submissions
          </button>
          <button
            onClick={() => setActiveSubTab('leave')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'leave'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span>Staff Leave</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              {isEmployee ? employeeLeave.length : pendingLeave.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('loans')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'loans'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span>Staff Loans</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              {isEmployee ? employeeLoans.length : pendingLoans.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('performance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'performance'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span>Appraisals</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 text-[10px]">
              {isEmployee ? employeeReviews.length : pendingReviews.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('contracts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'contracts'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <FileSignature className="w-3.5 h-3.5 text-purple-600" />
            <span>Contracts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold">
              {contracts.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by staff name, ID or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>
          {isEmployee && (
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToLeave}
                className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs whitespace-nowrap"
              >
                + New Leave
              </button>
              <button
                onClick={onNavigateToLoans}
                className="px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-xs whitespace-nowrap"
              >
                + Apply Loan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Approval Desk / Track Records Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-neutral-200 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900">
              {isEmployee ? 'My Submitted Staff Requests & Status History' : 'University Staff Request Endorsement Queue'}
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {university.name}
          </span>
        </div>

        <div className="divide-y divide-neutral-200">
          {/* LEAVE SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'leave') && (
            <div>
              <div className="bg-neutral-50 px-6 py-2.5 flex items-center justify-between text-xs font-semibold text-neutral-700">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Leave & Kastom Bereavement Requests
                </span>
                <span className="text-neutral-500 font-mono text-[11px]">
                  {isEmployee ? `${employeeLeave.length} items` : `${pendingLeave.length} pending`}
                </span>
              </div>

              {(isEmployee ? employeeLeave : pendingLeave).length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No active leave requests in queue.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-white text-neutral-500 font-medium">
                        <th className="py-2.5 px-6">Staff Member</th>
                        <th className="py-2.5 px-4">Leave Type</th>
                        <th className="py-2.5 px-4">Duration & Dates</th>
                        <th className="py-2.5 px-4">Relief Officer</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {(isEmployee ? employeeLeave : pendingLeave)
                        .filter(r => 
                          r.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.staffId.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((req) => (
                          <tr key={req.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-3 px-6">
                              <div className="font-semibold text-neutral-900">{req.staffName}</div>
                              <div className="text-[11px] text-neutral-500 font-mono">{req.staffId} · {req.department}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-neutral-800">{req.leaveType}</span>
                              {req.kastomDetails && (
                                <div className="text-[11px] text-amber-700 italic max-w-xs truncate" title={req.kastomDetails}>
                                  Kastom: {req.kastomDetails}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono font-semibold text-neutral-900">{req.workingDays} working days</span>
                              <div className="text-[11px] text-neutral-500">{req.startDate} to {req.endDate}</div>
                            </td>
                            <td className="py-3 px-4 text-neutral-600">
                              {req.reliefOfficerName || 'None assigned'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                req.status === 'Approved' 
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'Declined'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-right">
                              {!isEmployee && (req.status === 'Pending HOD' || req.status === 'Dean Review') ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedActionModal({
                                      type: 'leave',
                                      id: req.id,
                                      item: req,
                                      action: 'approve'
                                    })}
                                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors shadow-xs"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => setSelectedActionModal({
                                      type: 'leave',
                                      id: req.id,
                                      item: req,
                                      action: 'decline'
                                    })}
                                    className="px-2.5 py-1 text-xs font-medium bg-neutral-100 hover:bg-rose-50 text-rose-700 border border-neutral-200 rounded transition-colors"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <span className="text-neutral-400 text-[11px]">
                                  {req.approvedBy ? `Signed by ${req.approvedBy}` : 'Processed'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* LOANS SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'loans') && (
            <div>
              <div className="bg-neutral-50 px-6 py-2.5 flex items-center justify-between text-xs font-semibold text-neutral-700">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Staff Loan & Salary Advance Applications
                </span>
                <span className="text-neutral-500 font-mono text-[11px]">
                  {isEmployee ? `${employeeLoans.length} items` : `${pendingLoans.length} pending`}
                </span>
              </div>

              {(isEmployee ? employeeLoans : pendingLoans).length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No active staff loan applications in queue.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-white text-neutral-500 font-medium">
                        <th className="py-2.5 px-6">Staff Member</th>
                        <th className="py-2.5 px-4">Loan Type & Purpose</th>
                        <th className="py-2.5 px-4">Principal Amount</th>
                        <th className="py-2.5 px-4">FN Deduction</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {(isEmployee ? employeeLoans : pendingLoans)
                        .filter(l => 
                          l.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.id.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((loan) => (
                          <tr key={loan.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-3 px-6">
                              <div className="font-semibold text-neutral-900">{loan.staffName}</div>
                              <div className="text-[11px] text-neutral-500 font-mono">{loan.staffId} · {loan.department}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-neutral-800">{loan.loanType}</span>
                              <div className="text-[11px] text-neutral-500 max-w-xs truncate" title={loan.purpose}>
                                {loan.purpose}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-neutral-900">{formatPGK(loan.principalAmount)}</span>
                              <div className="text-[11px] text-neutral-500">{loan.repaymentFortnights} Fortnights</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono font-semibold text-amber-700">{formatPGK(loan.fortnightDeduction)} / FN</span>
                              <div className="text-[11px] text-neutral-500">Auto-deducted</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                loan.status === 'Approved' || loan.status === 'Disbursed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : loan.status === 'Declined'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {loan.status}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-right">
                              {!isEmployee && (loan.status === 'Pending HR Review' || loan.status === 'Bursar Clearance') ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedActionModal({
                                      type: 'loan',
                                      id: loan.id,
                                      item: loan,
                                      action: 'approve'
                                    })}
                                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors shadow-xs"
                                  >
                                    Approve Loan
                                  </button>
                                  <button
                                    onClick={() => setSelectedActionModal({
                                      type: 'loan',
                                      id: loan.id,
                                      item: loan,
                                      action: 'decline'
                                    })}
                                    className="px-2.5 py-1 text-xs font-medium bg-neutral-100 hover:bg-rose-50 text-rose-700 border border-neutral-200 rounded transition-colors"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <span className="text-neutral-400 text-[11px]">
                                  {loan.approvedBy || loan.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PERFORMANCE REVIEWS SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'performance') && (
            <div>
              <div className="bg-neutral-50 px-6 py-2.5 flex items-center justify-between text-xs font-semibold text-neutral-700">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  Academic Staff Performance Appraisals & Endorsements
                </span>
                <span className="text-neutral-500 font-mono text-[11px]">
                  {isEmployee ? `${employeeReviews.length} items` : `${pendingReviews.length} pending`}
                </span>
              </div>

              {(isEmployee ? employeeReviews : pendingReviews).length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No pending performance appraisals.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-white text-neutral-500 font-medium">
                        <th className="py-2.5 px-6">Faculty Member</th>
                        <th className="py-2.5 px-4">Evaluation Year</th>
                        <th className="py-2.5 px-4">Teaching Score</th>
                        <th className="py-2.5 px-4">Research Outputs</th>
                        <th className="py-2.5 px-4">Overall Band</th>
                        <th className="py-2.5 px-6 text-right">Status / Endorsement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {(isEmployee ? employeeReviews : pendingReviews).map((rev) => (
                        <tr key={rev.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-6">
                            <div className="font-semibold text-neutral-900">{rev.staffName}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">{rev.staffId} · {rev.department}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-neutral-800">
                            {rev.evaluationYear}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                            {rev.teachingEvaluationScore}%
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-800">
                            {rev.researchOutputsCount} publications
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-900">
                              {rev.ratingBand}
                            </span>
                            {rev.promotionRecommended && (
                              <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                                Rec: {rev.recommendedRank}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-6 text-right">
                            {!isEmployee && onUpdateReviewStatus && rev.status !== 'Confirmed' ? (
                              <button
                                onClick={() => onUpdateReviewStatus(rev.id, 'Confirmed')}
                                className="px-2.5 py-1 text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white rounded transition-colors shadow-xs"
                              >
                                Endorse & Confirm
                              </button>
                            ) : (
                              <span className="text-emerald-700 font-medium text-xs">
                                Confirmed by {rev.reviewerName}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* CONTRACTS SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'contracts') && (
            <div>
              <div className="bg-neutral-50 px-6 py-2.5 flex items-center justify-between text-xs font-semibold text-neutral-700">
                <span className="flex items-center gap-1.5">
                  <FileSignature className="w-3.5 h-3.5 text-purple-600" />
                  University Academic & Staff Employment Contracts
                </span>
                <span className="text-neutral-500 font-mono text-[11px]">
                  {contracts.length} contracts
                </span>
              </div>

              {contracts.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No staff employment contracts registered.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-white text-neutral-500 font-medium">
                        <th className="py-2.5 px-6">Contract Ref & Appointee</th>
                        <th className="py-2.5 px-4">Substantive Rank</th>
                        <th className="py-2.5 px-4">Fortnightly Emoluments</th>
                        <th className="py-2.5 px-4">Signatures Status</th>
                        <th className="py-2.5 px-4">Execution Status</th>
                        <th className="py-2.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {contracts
                        .filter(c => 
                          c.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.contractReferenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.department.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((con) => (
                          <tr key={con.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-3 px-6">
                              <div className="font-mono font-bold text-neutral-900">{con.contractReferenceNo}</div>
                              <div className="font-semibold text-neutral-800">{con.candidateName}</div>
                              <div className="text-[11px] text-neutral-500 font-mono">{con.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-neutral-900">{con.academicRank}</span>
                              <div className="text-[11px] text-neutral-500">{con.department}</div>
                            </td>
                            <td className="py-3 px-4 font-mono">
                              <span className="font-bold text-neutral-900">{formatPGK(con.fortnightBaseSalary)} / FN</span>
                              <div className="text-[10px] text-emerald-700 font-semibold">{con.salaryGrade} · {formatPGK(con.annualBaseSalary)} p.a.</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-[11px] space-y-0.5">
                                <div>Appointee: {con.candidateSigned ? '✓ Signed' : 'Pending'}</div>
                                <div>Registrar: {con.registrarSigned ? '✓ Sealed' : 'Pending'}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                con.status === 'Onboarded to Payroll'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : con.status === 'Fully Executed'
                                  ? 'bg-purple-100 text-purple-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}>
                                {con.status}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-right">
                              {onNavigateToContracts ? (
                                <button
                                  onClick={onNavigateToContracts}
                                  className="px-2.5 py-1 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded transition-colors shadow-xs"
                                >
                                  Open in Contracts
                                </button>
                              ) : (
                                <span className="text-neutral-400 text-[11px]">{con.status}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation & Endorsement Modal */}
      {selectedActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                {selectedActionModal.action === 'approve' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <h3 className="text-base font-bold text-neutral-900">
                  {selectedActionModal.action === 'approve' ? 'Authorize & Endorse Request' : 'Decline Request'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedActionModal(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-neutral-600 space-y-2">
              <p>
                You are about to <strong>{selectedActionModal.action.toUpperCase()}</strong> the following {selectedActionModal.type} submission:
              </p>
              <div className="bg-neutral-50 p-3 rounded border border-neutral-200 font-mono space-y-1">
                <div>Staff: <strong className="text-neutral-900">{selectedActionModal.item.staffName}</strong></div>
                <div>ID: {selectedActionModal.item.staffId}</div>
                <div>Department: {selectedActionModal.item.department}</div>
                {selectedActionModal.type === 'leave' && (
                  <div>Leave Type: {selectedActionModal.item.leaveType} ({selectedActionModal.item.workingDays} days)</div>
                )}
                {selectedActionModal.type === 'loan' && (
                  <div>Principal: {formatPGK(selectedActionModal.item.principalAmount)} ({selectedActionModal.item.repaymentFortnights} FNs)</div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Official Notes / Council Reference:
              </label>
              <textarea
                rows={3}
                placeholder="Enter endorsement details, payroll code or remarks..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full text-xs p-2.5 border border-neutral-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setSelectedActionModal(null)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-1.5 text-xs font-semibold text-white rounded-md transition-colors shadow-xs ${
                  selectedActionModal.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {selectedActionModal.action === 'approve' ? 'Approval' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
