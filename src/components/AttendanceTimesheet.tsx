import React, { useState, useMemo } from 'react';
import { 
  AppUser, 
  AttendanceRecord, 
  FacultyMember, 
  UniversityInfo, 
  UniversitySchool 
} from '../types';
import { 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  UserCheck, 
  AlertCircle, 
  BookOpen, 
  Download, 
  PlusCircle, 
  X,
  FileText
} from 'lucide-react';

interface AttendanceTimesheetProps {
  university: UniversityInfo;
  currentUser: AppUser;
  facultyMembers: FacultyMember[];
  attendanceRecords: AttendanceRecord[];
  onAddAttendanceRecord: (record: AttendanceRecord) => void;
  activeFortnight: string;
}

export const AttendanceTimesheet: React.FC<AttendanceTimesheetProps> = ({
  university,
  currentUser,
  facultyMembers,
  attendanceRecords,
  onAddAttendanceRecord,
  activeFortnight,
}) => {
  const isEmployee = currentUser.role === 'Employee';

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);

  // Clock-in form state
  const [clockStaffId, setClockStaffId] = useState(
    isEmployee && currentUser.staffId ? currentUser.staffId : facultyMembers[0]?.staffId || ''
  );
  const [clockCampusLocation, setClockCampusLocation] = useState('Waigani Campus - Main Lecture Theatre');
  const [clockTeachingHours, setClockTeachingHours] = useState<number>(3);
  const [clockStatus, setClockStatus] = useState<AttendanceRecord['status']>('Present / On Duty');
  const [clockNotes, setClockNotes] = useState('');

  // Scoped records
  const scopedRecords = useMemo(() => {
    if (isEmployee && currentUser.staffId) {
      return attendanceRecords.filter(r => r.staffId === currentUser.staffId);
    }
    return attendanceRecords;
  }, [attendanceRecords, isEmployee, currentUser]);

  // Unique departments
  const departments = useMemo(() => {
    return Array.from(new Set(facultyMembers.map(f => f.department))).sort();
  }, [facultyMembers]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return scopedRecords.filter(rec => {
      const matchesSearch = 
        rec.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDeptFilter === 'all' || rec.department === selectedDeptFilter;
      const matchesStatus = selectedStatusFilter === 'all' || rec.status === selectedStatusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [scopedRecords, searchTerm, selectedDeptFilter, selectedStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalPresent = scopedRecords.filter(r => r.status === 'Present / On Duty').length;
    const totalLate = scopedRecords.filter(r => r.status === 'Late Arrival').length;
    const totalOnLeave = scopedRecords.filter(r => r.status === 'On Leave').length;
    const totalTeachingHours = scopedRecords.reduce((acc, r) => acc + (r.teachingHoursLogged || 0), 0);

    return { totalPresent, totalLate, totalOnLeave, totalTeachingHours };
  }, [scopedRecords]);

  // Handle Clock In
  const handleClockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const faculty = facultyMembers.find(f => f.staffId === clockStaffId);
    if (!faculty) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      staffId: faculty.staffId,
      staffName: `${faculty.firstName} ${faculty.lastName}`,
      department: faculty.department,
      date: dateStr,
      checkInTime: timeStr,
      location: clockCampusLocation,
      status: clockStatus,
      teachingHoursLogged: Number(clockTeachingHours) || 0,
    };

    onAddAttendanceRecord(newRecord);
    setIsClockInModalOpen(false);
  };

  // Export timesheet CSV
  const handleExportTimesheet = () => {
    const headers = ['Record ID', 'Date', 'Staff ID', 'Staff Name', 'Department', 'Check In', 'Check Out', 'Location', 'Status', 'Teaching Hours'];
    const rows = filteredRecords.map(r => [
      r.id,
      r.date,
      r.staffId,
      `"${r.staffName}"`,
      `"${r.department}"`,
      r.checkInTime,
      r.checkOutTime || 'On Duty',
      `"${r.location}"`,
      r.status,
      r.teachingHoursLogged.toString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${university.acronym}_Attendance_Timesheet_FN21_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>{isEmployee ? 'My Present Days' : 'On-Duty Today'}</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {stats.totalPresent}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Campus lecture & clinical duties
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Teaching Hours Logged</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {stats.totalTeachingHours} hrs
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Lectures, tutorials & lab sessions
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Late Arrivals / Irregular</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 tabular-nums">
            {stats.totalLate}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Beyond 08:00 AM roster cutoff
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>On Approved Leave</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-700 tabular-nums">
            {stats.totalOnLeave}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Recreation or Haus Krai leave
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium shrink-0">Department:</span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Departments ({departments.length})</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium shrink-0">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Statuses</option>
                <option value="Present / On Duty">Present / On Duty</option>
                <option value="Late Arrival">Late Arrival</option>
                <option value="Excused Academic Duty">Excused Academic Duty</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full xl:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search staff or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            <button
              onClick={() => setIsClockInModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEmployee ? 'Clock In / Duty Log' : 'Log Attendance'}</span>
            </button>

            <button
              onClick={handleExportTimesheet}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md border border-neutral-200 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Timesheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-neutral-200 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              {isEmployee ? 'My Daily Attendance & Contact Hours Roster' : 'Campus-Wide Staff Attendance & Timesheet Log'}
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {activeFortnight}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                <th className="py-3 px-6">Staff Member</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-In / Out</th>
                <th className="py-3 px-4">Campus Venue / Station</th>
                <th className="py-3 px-4">Teaching Hours</th>
                <th className="py-3 px-6">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-neutral-500">
                    No attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-neutral-900">{record.staffName}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {record.staffId} · {record.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-800">
                      {record.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-medium text-neutral-900">{record.checkInTime}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {record.checkOutTime ? `Out: ${record.checkOutTime}` : 'Currently On Duty'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate max-w-xs">{record.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-neutral-900">{record.teachingHoursLogged} hrs</span>
                      <div className="text-[10px] text-neutral-500">lecture / lab contact</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        record.status === 'Present / On Duty'
                          ? 'bg-emerald-100 text-emerald-800'
                          : record.status === 'Late Arrival'
                          ? 'bg-amber-100 text-amber-800'
                          : record.status === 'On Leave'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clock-in Modal */}
      {isClockInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-neutral-900" />
                <h3 className="text-base font-bold text-neutral-900">
                  Daily Attendance & Duty Log
                </h3>
              </div>
              <button 
                onClick={() => setIsClockInModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClockInSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Staff Member</label>
                {isEmployee && currentUser.staffId ? (
                  <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs font-semibold text-neutral-800">
                    {currentUser.name} ({currentUser.staffId})
                  </div>
                ) : (
                  <select
                    value={clockStaffId}
                    onChange={(e) => setClockStaffId(e.target.value)}
                    className="w-full text-xs p-2 border border-neutral-300 rounded-md bg-white focus:outline-hidden"
                  >
                    {facultyMembers.map((f) => (
                      <option key={f.staffId} value={f.staffId}>
                        {f.firstName} {f.lastName} ({f.staffId}) - {f.department}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Campus Facility / Station</label>
                <select
                  value={clockCampusLocation}
                  onChange={(e) => setClockCampusLocation(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-300 rounded-md bg-white focus:outline-hidden"
                >
                  <option value="Waigani Campus - Science 1 Hall">Waigani Campus - Science 1 Hall</option>
                  <option value="Waigani Campus - Arts Lecture Complex">Waigani Campus - Arts Lecture Complex</option>
                  <option value="Waigani Campus - Law Library & Moot Court">Waigani Campus - Law Library & Moot Court</option>
                  <option value="Taurama Medical Campus - PMGH Wards">Taurama Medical Campus - PMGH Wards</option>
                  <option value="Bursar & HR Administration Building">Bursar & HR Administration Building</option>
                  <option value="Fieldwork - Off-Campus Academic Duty">Fieldwork - Off-Campus Academic Duty</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Teaching Contact Hours</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={clockTeachingHours}
                    onChange={(e) => setClockTeachingHours(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-neutral-300 rounded-md focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Duty Status</label>
                  <select
                    value={clockStatus}
                    onChange={(e) => setClockStatus(e.target.value as any)}
                    className="w-full text-xs p-2 border border-neutral-300 rounded-md bg-white focus:outline-hidden"
                  >
                    <option value="Present / On Duty">Present / On Duty</option>
                    <option value="Late Arrival">Late Arrival</option>
                    <option value="Excused Academic Duty">Excused Academic Duty</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsClockInModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs"
                >
                  Confirm Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
