import React, { useState, useMemo } from 'react';
import { AppUser, FacultyMember, LeaveRecord, LeaveStatus, LeaveType, StaffLeaveBalance, UniversityInfo } from '../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  HeartHandshake, 
  PlusCircle, 
  Search, 
  Filter, 
  UserCheck, 
  X,
  FileCheck2,
  CalendarDays,
  ShieldAlert,
  Info,
  Lock
} from 'lucide-react';

interface LeaveTrackingProps {
  university: UniversityInfo;
  currentUser?: AppUser;
  facultyMembers: FacultyMember[];
  leaveRecords: LeaveRecord[];
  leaveBalances: Record<string, StaffLeaveBalance>;
  onAddLeaveRecord: (record: LeaveRecord) => void;
  onUpdateLeaveStatus: (recordId: string, status: LeaveStatus, approverName: string) => void;
  isOpenApplyModal?: boolean;
  onCloseApplyModal?: () => void;
}

export const LeaveTracking: React.FC<LeaveTrackingProps> = ({
  university,
  currentUser,
  facultyMembers,
  leaveRecords,
  leaveBalances,
  onAddLeaveRecord,
  onUpdateLeaveStatus,
  isOpenApplyModal = false,
  onCloseApplyModal,
}) => {
  const isEmployee = currentUser?.role === 'Employee';

  // Scoped records and faculty based on RBAC role
  const scopedLeaveRecords = useMemo(() => {
    if (isEmployee && currentUser?.staffId) {
      return leaveRecords.filter(r => r.staffId === currentUser.staffId);
    }
    return leaveRecords;
  }, [leaveRecords, isEmployee, currentUser]);

  const scopedFacultyMembers = useMemo(() => {
    if (isEmployee && currentUser?.staffId) {
      const own = facultyMembers.filter(f => f.staffId === currentUser.staffId);
      return own.length > 0 ? own : [facultyMembers[0]];
    }
    return facultyMembers;
  }, [facultyMembers, isEmployee, currentUser]);

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'balances' | 'calendar'>('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(isOpenApplyModal);
  const [selectedRecordDetails, setSelectedRecordDetails] = useState<LeaveRecord | null>(null);

  React.useEffect(() => {
    if (isOpenApplyModal) {
      setIsApplyModalOpen(true);
    }
  }, [isOpenApplyModal]);

  const handleCloseModal = () => {
    setIsApplyModalOpen(false);
    if (onCloseApplyModal) onCloseApplyModal();
  };

  // Form State
  const [formStaffId, setFormStaffId] = useState(facultyMembers[0]?.staffId || '');
  const [formLeaveType, setFormLeaveType] = useState<LeaveType>('Annual Recreation');
  const [formStartDate, setFormStartDate] = useState('2026-11-02');
  const [formEndDate, setFormEndDate] = useState('2026-11-13');
  const [formWorkingDays, setFormWorkingDays] = useState(10);
  const [formReason, setFormReason] = useState('');
  const [formKastomDetails, setFormKastomDetails] = useState('');
  const [formReliefOfficer, setFormReliefOfficer] = useState(facultyMembers[1]?.staffId || '');
  const [formMedicalCert, setFormMedicalCert] = useState(false);

  // Compute stats based on scoped records
  const stats = useMemo(() => {
    const onLeaveNow = scopedLeaveRecords.filter(r => r.status === 'Approved').length;
    const pendingReviews = scopedLeaveRecords.filter(r => r.status === 'Pending HOD' || r.status === 'Dean Review').length;
    const wantokCount = scopedLeaveRecords.filter(r => r.leaveType === 'Wantok / Kastom Bereavement').length;
    const totalDaysApproved = scopedLeaveRecords
      .filter(r => r.status === 'Approved' || r.status === 'Completed')
      .reduce((acc, curr) => acc + curr.workingDays, 0);

    return { onLeaveNow, pendingReviews, wantokCount, totalDaysApproved };
  }, [scopedLeaveRecords]);

  // Filtered Leave Records
  const filteredRecords = useMemo(() => {
    return scopedLeaveRecords.filter(r => {
      const matchesSearch = 
        r.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedTypeFilter === 'all' || r.leaveType === selectedTypeFilter;
      const matchesStatus = selectedStatusFilter === 'all' || r.status === selectedStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [scopedLeaveRecords, searchTerm, selectedTypeFilter, selectedStatusFilter]);

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const faculty = facultyMembers.find(f => f.staffId === formStaffId);
    const relief = facultyMembers.find(f => f.staffId === formReliefOfficer);
    if (!faculty) return;

    const newRecord: LeaveRecord = {
      id: `LV-2026-${Math.floor(100 + Math.random() * 900)}`,
      staffId: faculty.staffId,
      staffName: `${faculty.firstName} ${faculty.lastName}`,
      academicRank: faculty.academicRank,
      department: faculty.department,
      schoolName: faculty.schoolName,
      leaveType: formLeaveType,
      startDate: formStartDate,
      endDate: formEndDate,
      workingDays: Number(formWorkingDays),
      reason: formReason || `${formLeaveType} requested for personal/customary commitments`,
      kastomDetails: formLeaveType === 'Wantok / Kastom Bereavement' ? formKastomDetails : undefined,
      reliefOfficerStaffId: relief ? relief.staffId : 'TBD',
      reliefOfficerName: relief ? `${relief.firstName} ${relief.lastName}` : 'Unassigned',
      status: 'Pending HOD',
      submittedDate: '2026-10-14',
      medicalCertAttached: formMedicalCert,
    };

    onAddLeaveRecord(newRecord);
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Staff On Leave Today</span>
            <Calendar className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {stats.onLeaveNow}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Relief faculty assigned to lecture slots
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 tabular-nums">
            {stats.pendingReviews}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Awaiting HOD / Academic Dean recommendation
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Wantok & Kastom Leaves</span>
            <HeartHandshake className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {stats.wantokCount}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Customary Haus Krai & tribal obligations
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Approved Days Granted</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {stats.totalDaysApproved} Days
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            2026 Academic Calendar Year
          </div>
        </div>
      </div>

      {/* Sub Tabs and Header Strip */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setActiveSubTab('requests')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeSubTab === 'requests'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Leave Applications ({leaveRecords.length})
            </button>
            <button
              onClick={() => setActiveSubTab('balances')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeSubTab === 'balances'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Entitlements & Balances
            </button>
            <button
              onClick={() => setActiveSubTab('calendar')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeSubTab === 'calendar'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Semester Coverage Roster
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors whitespace-nowrap shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Apply for Staff Leave</span>
            </button>
          </div>
        </div>

        {/* Filters if in 'requests' tab */}
        {activeSubTab === 'requests' && (
          <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium shrink-0">Leave Type:</span>
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                >
                  <option value="all">All Leave Types</option>
                  <option value="Annual Recreation">Annual Recreation</option>
                  <option value="Wantok / Kastom Bereavement">Wantok / Kastom Bereavement</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Study / Sabbatical">Study / Sabbatical</option>
                  <option value="Maternity / Paternity">Maternity / Paternity</option>
                  <option value="Long Service">Long Service</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium shrink-0">Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending HOD">Pending HOD</option>
                  <option value="Dean Review">Dean Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search staff, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-400 text-neutral-800 placeholder-neutral-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tab 1: Requests Table */}
      {activeSubTab === 'requests' && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">App ID & Staff</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">School & Department</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Leave Category</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Dates & Duration</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Relief Officer</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Review Status</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">Workflow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-400">
                      No leave applications found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const isPending = r.status === 'Pending HOD' || r.status === 'Dean Review';

                    return (
                      <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-neutral-900">{r.staffName}</div>
                          <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                            <span>{r.id}</span>
                            <span aria-hidden="true">·</span>
                            <span>{r.staffId}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-neutral-900 font-medium">{r.department}</div>
                          <div className="text-[11px] text-neutral-500 truncate max-w-[160px]">{r.schoolName}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-neutral-900 flex items-center gap-1">
                            {r.leaveType === 'Wantok / Kastom Bereavement' && (
                              <HeartHandshake className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            )}
                            <span>{r.leaveType}</span>
                          </div>
                          <div className="text-[11px] text-neutral-500 truncate max-w-[200px]" title={r.reason}>
                            {r.reason}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono">
                          <div className="text-neutral-900">{r.startDate} to {r.endDate}</div>
                          <div className="text-[11px] text-neutral-500">{r.workingDays} working days</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-neutral-900 font-medium">{r.reliefOfficerName}</div>
                          <div className="text-[11px] text-neutral-500">Lectures covered</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            r.status === 'Approved'
                              ? 'text-emerald-700'
                              : r.status === 'Declined'
                                ? 'text-rose-700'
                                : r.status === 'Dean Review'
                                  ? 'text-indigo-700'
                                  : r.status === 'Pending HOD'
                                    ? 'text-amber-700'
                                    : 'text-neutral-600'
                          }`}>
                            {r.status === 'Approved' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                            {r.status === 'Declined' && <XCircle className="w-3 h-3 text-rose-600" />}
                            {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                            <span>{r.status}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedRecordDetails(r)}
                              className="px-2 py-1 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                              title="View full submission details"
                            >
                              Details
                            </button>
                            {!isEmployee && isPending && (
                              <>
                                <button
                                  onClick={() => onUpdateLeaveStatus(r.id, 'Approved', `${university.viceChancellor}`)}
                                  className="px-2 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => onUpdateLeaveStatus(r.id, 'Declined', 'Department Head')}
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
        </div>
      )}

      {/* Tab 2: Entitlements and Balances */}
      {activeSubTab === 'balances' && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 text-xs text-neutral-500">
            Staff statutory recreation leave accrues at <strong>18 working days per year</strong> under the Papua New Guinea Public Service General Orders & University Academic Staff Enterprise Agreement.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Faculty Member</th>
                  <th className="py-2.5 px-3">Rank & Department</th>
                  <th className="py-2.5 px-3 text-right">Annual Entitlement</th>
                  <th className="py-2.5 px-3 text-right">Annual Taken</th>
                  <th className="py-2.5 px-3 text-right font-semibold text-neutral-900">Annual Remaining</th>
                  <th className="py-2.5 px-3 text-right">Wantok / Kastom Days</th>
                  <th className="py-2.5 px-3 text-right">Sick Leave Remaining</th>
                  <th className="py-2.5 px-3 text-right">Long Service Accrual</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {scopedFacultyMembers.map((fac) => {
                  const bal = leaveBalances[fac.staffId] || {
                    staffId: fac.staffId,
                    annualEntitlement: 18,
                    annualTaken: 0,
                    annualRemaining: 18,
                    wantokTaken: 0,
                    sickEntitlement: 12,
                    sickTaken: 0,
                    sickRemaining: 12,
                    longServiceAccruedYears: 3,
                  };

                  return (
                    <tr key={fac.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-neutral-900">{fac.firstName} {fac.lastName}</div>
                        <div className="text-[11px] font-mono text-neutral-500">{fac.staffId}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-neutral-900 font-medium">{fac.academicRank}</div>
                        <div className="text-[11px] text-neutral-500">{fac.department}</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        {bal.annualEntitlement} days
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-500">
                        {bal.annualTaken} days
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                        {bal.annualRemaining} days
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-800">
                        {bal.wantokTaken} days
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {bal.sickRemaining} of {bal.sickEntitlement} days
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-800">
                        {bal.longServiceAccruedYears} yrs service
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="text-[11px] text-emerald-700 font-medium">Eligible</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Semester Coverage Roster */}
      {activeSubTab === 'calendar' && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Academic Lecture Duty Coverage Schedule</h3>
              <p className="text-xs text-neutral-500">
                Semester 2, 2026 Teaching Weeks (Weeks 8 - 14). Confirms designated relief lecturers during faculty leave.
              </p>
            </div>
            <div className="text-xs font-mono text-neutral-500">
              UPNG / DHERST Academic Calendar
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaveRecords.map(r => (
              <div key={r.id} className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-neutral-900">{r.staffName}</div>
                  <span className={`text-[11px] font-medium ${r.status === 'Approved' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {r.status}
                  </span>
                </div>
                <div className="text-neutral-600">
                  <strong className="text-neutral-800">{r.leaveType}</strong> · {r.workingDays} working days ({r.startDate} to {r.endDate})
                </div>
                <div className="p-2.5 bg-white rounded border border-neutral-200 space-y-1">
                  <div className="text-neutral-500 text-[11px]">Designated Relief Lecturer & Handover:</div>
                  <div className="font-medium text-neutral-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{r.reliefOfficerName} ({r.reliefOfficerStaffId})</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 italic">
                    Reason: {r.reason}
                  </div>
                  {r.kastomDetails && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                      <strong>Customary Details:</strong> {r.kastomDetails}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Details Modal */}
      {selectedRecordDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative border border-neutral-200 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRecordDetails(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 text-xs">
              <div className="border-b border-neutral-200 pb-3">
                <h3 className="text-base font-bold text-neutral-900">Leave Application Details</h3>
                <p className="text-neutral-500 font-mono text-[11px]">{selectedRecordDetails.id} · Submitted {selectedRecordDetails.submittedDate}</p>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-neutral-500 block">Applicant:</span>
                  <div className="font-semibold text-neutral-900 text-sm">{selectedRecordDetails.staffName}</div>
                  <div className="text-neutral-600">{selectedRecordDetails.academicRank} · {selectedRecordDetails.department}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                  <div>
                    <span className="text-neutral-500 block">Leave Type:</span>
                    <strong className="text-neutral-900">{selectedRecordDetails.leaveType}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Working Days:</span>
                    <strong className="text-neutral-900">{selectedRecordDetails.workingDays} Days</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                  <div>
                    <span className="text-neutral-500 block">Start Date:</span>
                    <span className="font-mono text-neutral-900">{selectedRecordDetails.startDate}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">End Date:</span>
                    <span className="font-mono text-neutral-900">{selectedRecordDetails.endDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500 block">Reason for Leave:</span>
                  <p className="text-neutral-800 bg-neutral-50 p-2.5 rounded border border-neutral-200 mt-1">
                    {selectedRecordDetails.reason}
                  </p>
                </div>

                {selectedRecordDetails.kastomDetails && (
                  <div className="pt-2">
                    <span className="text-amber-800 font-medium block">Wantok / Kastom Bereavement Details:</span>
                    <p className="text-amber-900 bg-amber-50/70 p-2.5 rounded border border-amber-200 mt-1">
                      {selectedRecordDetails.kastomDetails}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500 block">Designated Relief Officer:</span>
                  <strong className="text-neutral-900">{selectedRecordDetails.reliefOfficerName} ({selectedRecordDetails.reliefOfficerStaffId})</strong>
                </div>

                {selectedRecordDetails.approvedBy && (
                  <div className="pt-2 border-t border-neutral-100">
                    <span className="text-neutral-500 block">Approved By:</span>
                    <span className="text-emerald-800 font-medium">{selectedRecordDetails.approvedBy} on {selectedRecordDetails.approvalDate}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end">
                <button
                  onClick={() => setSelectedRecordDetails(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply for Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative border border-neutral-200 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-5">
              <h2 className="text-lg font-bold text-neutral-900">Staff Leave Application</h2>
              <p className="text-xs text-neutral-500">
                Statutory and customary leave application for local academic & administrative staff.
              </p>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Applying Staff Member</label>
                {isEmployee ? (
                  <div className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-md text-xs font-semibold text-neutral-800 flex items-center justify-between">
                    <span>{currentUser?.name} ({currentUser?.staffId})</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Self-Application</span>
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

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Leave Category</label>
                <select
                  value={formLeaveType}
                  onChange={(e) => setFormLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                >
                  <option value="Annual Recreation">Annual Recreation Leave (18 Days)</option>
                  <option value="Wantok / Kastom Bereavement">Wantok / Kastom Bereavement (Customary Obligations)</option>
                  <option value="Sick Leave">Sick Leave (Medical Certificate Required)</option>
                  <option value="Study / Sabbatical">Study / Sabbatical Research Leave</option>
                  <option value="Maternity / Paternity">Maternity / Paternity Leave</option>
                  <option value="Long Service">Long Service Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Working Days</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formWorkingDays}
                    onChange={(e) => setFormWorkingDays(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Reason for Leave</label>
                <textarea
                  rows={2}
                  required
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="State the purpose or itinerary for this leave period..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              {/* Wantok / Kastom custom obligations input */}
              {formLeaveType === 'Wantok / Kastom Bereavement' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1.5">
                  <label className="block text-amber-900 font-semibold">
                    Customary Haus Krai / Village Obligation Details
                  </label>
                  <p className="text-[11px] text-amber-800">
                    Specify the village location, district/province, tribal relation, and customary funeral or settlement obligations.
                  </p>
                  <input
                    type="text"
                    required
                    value={formKastomDetails}
                    onChange={(e) => setFormKastomDetails(e.target.value)}
                    placeholder="e.g. Haus Krai at Kainantu District, EHP. Contribution for maternal uncle burial ceremony."
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-md text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Nominated Relief Officer (Course Lectures Handover)</label>
                <select
                  value={formReliefOfficer}
                  onChange={(e) => setFormReliefOfficer(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:ring-1 focus:ring-neutral-400"
                >
                  {facultyMembers
                    .filter(f => f.staffId !== formStaffId)
                    .map(f => (
                      <option key={f.id} value={f.staffId}>
                        {f.firstName} {f.lastName} ({f.academicRank} - {f.department})
                      </option>
                    ))}
                </select>
              </div>

              {formLeaveType === 'Sick Leave' && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formMedicalCert}
                    onChange={(e) => setFormMedicalCert(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                  />
                  <span>Medical Certificate from University Clinic / Hospital Attached</span>
                </label>
              )}

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
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
