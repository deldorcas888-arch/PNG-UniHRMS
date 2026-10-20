import React, { useState, useMemo } from 'react';
import { 
  FacultyMember, 
  PreBuiltReportTemplate, 
  ReportDateRangePreset, 
  ReportType, 
  StaffLeaveBalance, 
  StudentRecord, 
  UniversityInfo, 
  UniversitySchool, 
  UserRole 
} from '../types';
import { PREBUILT_REPORT_TEMPLATES } from '../data/mockData';
import { formatPGK, generatePayslip } from '../utils/pngPayroll';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  Landmark, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  HeartHandshake, 
  Clock, 
  Filter, 
  Sparkles,
  X
} from 'lucide-react';

interface ReportingModuleProps {
  university: UniversityInfo;
  userRole: UserRole;
  schools: UniversitySchool[];
  facultyMembers: FacultyMember[];
  students: StudentRecord[];
  leaveBalances: Record<string, StaffLeaveBalance>;
  activeFortnight: string;
}

export const ReportingModule: React.FC<ReportingModuleProps> = ({
  university,
  userRole,
  schools,
  facultyMembers,
  students,
  leaveBalances,
  activeFortnight,
}) => {
  // Report Configuration State
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('payroll-summary');
  const [dateRangePreset, setDateRangePreset] = useState<ReportDateRangePreset>('ytd-2026');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [activeTemplateId, setActiveTemplateId] = useState<string>('tpl-irc-super');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Extract all unique departments from faculty
  const allDepartments = useMemo(() => {
    const set = new Set<string>();
    facultyMembers.forEach(f => {
      if (f.department) set.add(f.department);
    });
    return Array.from(set).sort();
  }, [facultyMembers]);

  // Load template helper
  const handleApplyTemplate = (tpl: PreBuiltReportTemplate) => {
    setActiveTemplateId(tpl.id);
    setSelectedReportType(tpl.reportType);
    setDateRangePreset(tpl.defaultDatePreset);
    setSelectedDepartment(tpl.defaultDepartment);

    if (tpl.defaultDatePreset === 'ytd-2026') {
      setStartDate('2026-01-01');
      setEndDate('2026-10-31');
    } else if (tpl.defaultDatePreset === 'semester-2-2026') {
      setStartDate('2026-07-01');
      setEndDate('2026-11-30');
    } else if (tpl.defaultDatePreset === 'last-30-days') {
      setStartDate('2026-09-14');
      setEndDate('2026-10-14');
    }
  };

  // Handle Preset change
  const handleDatePresetChange = (preset: ReportDateRangePreset) => {
    setDateRangePreset(preset);
    if (preset === 'ytd-2026') {
      setStartDate('2026-01-01');
      setEndDate('2026-10-31');
    } else if (preset === 'semester-2-2026') {
      setStartDate('2026-07-01');
      setEndDate('2026-11-30');
    } else if (preset === 'last-quarter') {
      setStartDate('2026-07-01');
      setEndDate('2026-09-30');
    } else if (preset === 'last-30-days') {
      setStartDate('2026-09-14');
      setEndDate('2026-10-14');
    }
  };

  // 1. Filtered Payroll Data
  const payrollData = useMemo(() => {
    let list = facultyMembers;
    if (selectedDepartment !== 'all') {
      list = list.filter(f => f.department === selectedDepartment);
    }
    return list.map(f => generatePayslip(f, activeFortnight));
  }, [facultyMembers, selectedDepartment, activeFortnight]);

  const payrollTotals = useMemo(() => {
    return payrollData.reduce((acc, curr) => {
      acc.gross += curr.grossPay;
      acc.base += curr.fortnightBaseSalary;
      acc.tax += curr.deductions.ircTax;
      acc.superEmployee += curr.deductions.superEmployee;
      acc.superEmployer += curr.deductions.superEmployer;
      acc.net += curr.netPay;
      return acc;
    }, { gross: 0, base: 0, tax: 0, superEmployee: 0, superEmployer: 0, net: 0 });
  }, [payrollData]);

  // 2. Filtered Program Enrollment Data
  const programData = useMemo(() => {
    // Group students by program
    const map = new Map<string, {
      programName: string;
      schoolName: string;
      degreeLevel: string;
      totalStudents: number;
      maleCount: number;
      femaleCount: number;
      tesasCount: number;
      helpCount: number;
      selfCount: number;
      totalTuitionDue: number;
      totalTuitionPaid: number;
      avgGpa: number;
      gpaSum: number;
    }>();

    let filtered = students;
    if (selectedDepartment !== 'all') {
      // Find school matching the department
      const matchingFaculty = facultyMembers.find(f => f.department === selectedDepartment);
      if (matchingFaculty) {
        filtered = filtered.filter(s => s.schoolId === matchingFaculty.schoolId);
      }
    }

    filtered.forEach(s => {
      const key = s.programName;
      if (!map.has(key)) {
        map.set(key, {
          programName: s.programName,
          schoolName: s.schoolName,
          degreeLevel: s.degreeLevel,
          totalStudents: 0,
          maleCount: 0,
          femaleCount: 0,
          tesasCount: 0,
          helpCount: 0,
          selfCount: 0,
          totalTuitionDue: 0,
          totalTuitionPaid: 0,
          avgGpa: 0,
          gpaSum: 0,
        });
      }

      const rec = map.get(key)!;
      rec.totalStudents++;
      if (s.gender === 'Male') rec.maleCount++;
      if (s.gender === 'Female') rec.femaleCount++;
      if (s.sponsorship.includes('TESAS')) rec.tesasCount++;
      else if (s.sponsorship.includes('HELP')) rec.helpCount++;
      else rec.selfCount++;

      rec.totalTuitionDue += s.semesterTuitionDue;
      rec.totalTuitionPaid += s.semesterTuitionPaid;
      rec.gpaSum += s.gpa;
      rec.avgGpa = rec.gpaSum / rec.totalStudents;
    });

    return Array.from(map.values()).sort((a, b) => b.totalStudents - a.totalStudents);
  }, [students, selectedDepartment, facultyMembers]);

  // 3. Filtered Staff Leave Balances Data
  const leaveData = useMemo(() => {
    let list = facultyMembers;
    if (selectedDepartment !== 'all') {
      list = list.filter(f => f.department === selectedDepartment);
    }

    return list.map(f => {
      const bal = leaveBalances[f.staffId] || {
        staffId: f.staffId,
        annualEntitlement: 18,
        annualTaken: 0,
        annualRemaining: 18,
        wantokTaken: 0,
        sickEntitlement: 12,
        sickTaken: 0,
        sickRemaining: 12,
        longServiceAccruedYears: 3,
      };

      return {
        faculty: f,
        balance: bal,
      };
    });
  }, [facultyMembers, leaveBalances, selectedDepartment]);

  const leaveTotals = useMemo(() => {
    return leaveData.reduce((acc, curr) => {
      acc.entitlement += curr.balance.annualEntitlement;
      acc.taken += curr.balance.annualTaken;
      acc.remaining += curr.balance.annualRemaining;
      acc.wantokTaken += curr.balance.wantokTaken;
      acc.sickRemaining += curr.balance.sickRemaining;
      return acc;
    }, { entitlement: 0, taken: 0, remaining: 0, wantokTaken: 0, sickRemaining: 0 });
  }, [leaveData]);

  // CSV Exporter
  const handleExportCsv = () => {
    let filename = '';
    let headers: string[] = [];
    let rows: string[][] = [];

    if (selectedReportType === 'payroll-summary') {
      filename = `${university.acronym}_Faculty_Payroll_Report_${startDate}_to_${endDate}.csv`;
      headers = [
        'Staff ID',
        'Faculty Member',
        'Rank',
        'Department',
        'IRC TIN',
        'Super Fund',
        'Fortnight Base (PGK)',
        'Gross Pay (PGK)',
        'IRC SWT Tax (PGK)',
        'Super EE 6% (PGK)',
        'Super ER 8.4% (PGK)',
        'Net Pay (PGK)',
        'Pay Period'
      ];
      rows = payrollData.map(p => [
        p.staffId,
        `"${p.staffName}"`,
        `"${p.academicRank}"`,
        `"${p.department}"`,
        p.tinNumber,
        p.superFund,
        p.fortnightBaseSalary.toFixed(2),
        p.grossPay.toFixed(2),
        p.deductions.ircTax.toFixed(2),
        p.deductions.superEmployee.toFixed(2),
        p.deductions.superEmployer.toFixed(2),
        p.netPay.toFixed(2),
        `"${p.payPeriod}"`
      ]);
    } else if (selectedReportType === 'student-enrollment') {
      filename = `${university.acronym}_Student_Enrollment_By_Program_${startDate}_to_${endDate}.csv`;
      headers = [
        'Program Name',
        'Academic School',
        'Degree Level',
        'Total Enrolled',
        'Male Count',
        'Female Count',
        'TESAS Scholars',
        'HELP Loan Scholars',
        'Average GPA',
        'Tuition Revenue Due (PGK)',
        'Tuition Collected (PGK)',
        'Collection Rate %'
      ];
      rows = programData.map(prog => [
        `"${prog.programName}"`,
        `"${prog.schoolName}"`,
        `"${prog.degreeLevel}"`,
        prog.totalStudents.toString(),
        prog.maleCount.toString(),
        prog.femaleCount.toString(),
        prog.tesasCount.toString(),
        prog.helpCount.toString(),
        prog.avgGpa.toFixed(2),
        prog.totalTuitionDue.toFixed(2),
        prog.totalTuitionPaid.toFixed(2),
        prog.totalTuitionDue > 0 ? ((prog.totalTuitionPaid / prog.totalTuitionDue) * 100).toFixed(1) : '100.0'
      ]);
    } else if (selectedReportType === 'leave-balances') {
      filename = `${university.acronym}_Local_Staff_Leave_Balances_${startDate}_to_${endDate}.csv`;
      headers = [
        'Staff ID',
        'Staff Name',
        'Academic Rank',
        'Department',
        'Annual Entitlement (Days)',
        'Annual Taken (Days)',
        'Annual Remaining (Days)',
        'Wantok / Kastom Days Taken',
        'Sick Days Remaining',
        'Long Service Service (Years)',
        'Status'
      ];
      rows = leaveData.map(d => [
        d.faculty.staffId,
        `"${d.faculty.firstName} ${d.faculty.lastName}"`,
        `"${d.faculty.academicRank}"`,
        `"${d.faculty.department}"`,
        d.balance.annualEntitlement.toString(),
        d.balance.annualTaken.toString(),
        d.balance.annualRemaining.toString(),
        d.balance.wantokTaken.toString(),
        d.balance.sickRemaining.toString(),
        d.balance.longServiceAccruedYears.toString(),
        d.faculty.activeStatus
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Generated ${filename}`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const currentTemplate = PREBUILT_REPORT_TEMPLATES.find(t => t.id === activeTemplateId);

  return (
    <div className="space-y-6">
      {/* Pre-built Templates Carousel / Selection Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Pre-Built Statutory & Institutional Report Templates</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Official reporting dossiers formatted for DHERST, PNG Internal Revenue Commission, and University Council.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">3 Verified Templates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PREBUILT_REPORT_TEMPLATES.map((tpl) => {
            const isSelected = activeTemplateId === tpl.id;

            return (
              <button
                key={tpl.id}
                onClick={() => handleApplyTemplate(tpl)}
                className={`text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-1 ring-neutral-900'
                    : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isSelected ? 'text-amber-400' : 'text-neutral-500'
                    }`}>
                      {tpl.badge}
                    </span>
                    <span className={`text-[10px] font-mono ${
                      isSelected ? 'text-neutral-400' : 'text-neutral-400'
                    }`}>
                      {tpl.regulatoryBody.split(' ')[0]}
                    </span>
                  </div>

                  <h3 className={`text-xs font-bold leading-snug mb-1 ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                    {tpl.title}
                  </h3>

                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {tpl.description}
                  </p>
                </div>

                <div className={`mt-3 pt-2 text-[10px] font-medium border-t flex items-center justify-between ${
                  isSelected ? 'border-neutral-800 text-neutral-300' : 'border-neutral-100 text-neutral-400'
                }`}>
                  <span>{tpl.subtitle}</span>
                  <span className={isSelected ? 'text-amber-400 font-bold' : 'text-neutral-700'}>
                    {isSelected ? 'Active Template' : 'Load Template →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export feedback toast */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button onClick={() => setExportNotice(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Control Strip & Interactive Filters */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Report Category Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg overflow-x-auto">
            <button
              onClick={() => {
                setSelectedReportType('payroll-summary');
                setActiveTemplateId('tpl-irc-super');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedReportType === 'payroll-summary'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Faculty Payroll Summaries
            </button>
            <button
              onClick={() => {
                setSelectedReportType('student-enrollment');
                setActiveTemplateId('tpl-dherst-enrollment');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedReportType === 'student-enrollment'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Student Enrollment by Program
            </button>
            <button
              onClick={() => {
                setSelectedReportType('leave-balances');
                setActiveTemplateId('tpl-staff-leave-liability');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedReportType === 'leave-balances'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Local Staff Leave Balances
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-md transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors whitespace-nowrap shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Report</span>
            </button>
          </div>
        </div>

        {/* Date Range and Department Filtering Grid */}
        <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Preset Selector */}
          <div>
            <label className="block text-neutral-500 font-medium mb-1">Date Range Window</label>
            <select
              value={dateRangePreset}
              onChange={(e) => handleDatePresetChange(e.target.value as ReportDateRangePreset)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            >
              <option value="ytd-2026">Year to Date 2026 (Jan - Oct)</option>
              <option value="semester-2-2026">Semester 2, 2026 Academic Term</option>
              <option value="last-quarter">Last Quarter (Q3 2026)</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-neutral-500 font-medium mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateRangePreset('custom');
              }}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-neutral-500 font-medium mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateRangePreset('custom');
              }}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-neutral-500 font-medium mb-1">Academic Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            >
              <option value="all">All University Departments</option>
              {allDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Cards Based on Selected Report Type */}
      {selectedReportType === 'payroll-summary' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Department Gross Salary</span>
              <TrendingUp className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
              {formatPGK(payrollTotals.gross)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {payrollData.length} faculty members included
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>IRC SWT Tax Withheld</span>
              <Landmark className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-800 tabular-nums">
              {formatPGK(payrollTotals.tax)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              PNG Resident Individual Tax Scale
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Total Superannuation (14.4%)</span>
              <ShieldCheck className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
              {formatPGK(payrollTotals.superEmployee + payrollTotals.superEmployer)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              EE 6%: <span className="font-mono">{formatPGK(payrollTotals.superEmployee)}</span> · ER 8.4%: <span className="font-mono">{formatPGK(payrollTotals.superEmployer)}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Net Disbursement</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
              {formatPGK(payrollTotals.net)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Commercial bank direct credit
            </div>
          </div>
        </div>
      )}

      {selectedReportType === 'student-enrollment' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Active Programs Tracked</span>
              <GraduationCap className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
              {programData.length}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Undergraduate & Postgraduate
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Enrolled Cohort Headcount</span>
              <Users className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
              {programData.reduce((acc, p) => acc + p.totalStudents, 0)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {programData.reduce((acc, p) => acc + p.maleCount, 0)} Male · {programData.reduce((acc, p) => acc + p.femaleCount, 0)} Female
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>TESAS Scholarships</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
              {programData.reduce((acc, p) => acc + p.tesasCount, 0)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              DHERST AES / HECAS sponsored
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Total Tuition Billed</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
              {formatPGK(programData.reduce((acc, p) => acc + p.totalTuitionPaid, 0))}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              of {formatPGK(programData.reduce((acc, p) => acc + p.totalTuitionDue, 0))} billed
            </div>
          </div>
        </div>
      )}

      {selectedReportType === 'leave-balances' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Accrued Annual Leave Liability</span>
              <Calendar className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
              {leaveTotals.remaining} Days
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {leaveTotals.taken} days consumed this cycle
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Wantok & Kastom Days</span>
              <HeartHandshake className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-800 tabular-nums">
              {leaveTotals.wantokTaken} Days
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Customary Haus Krai commitments
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Sick Leave Pool Remaining</span>
              <ShieldCheck className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
              {leaveTotals.sickRemaining} Days
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Certified by University Health Clinic
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Staff Compliance Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
              100%
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              All relief officers formally designated
            </div>
          </div>
        </div>
      )}

      {/* Main Report Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
        {/* Table Title and Subheader */}
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-neutral-50/50">
          <div>
            <h3 className="font-bold text-sm text-neutral-900">
              {selectedReportType === 'payroll-summary' && 'Faculty Payroll & Remittance Register'}
              {selectedReportType === 'student-enrollment' && 'Academic Program Cohort & Funding Census'}
              {selectedReportType === 'leave-balances' && 'Staff Statutory Leave & Customary Entitlements Ledger'}
            </h3>
            <p className="text-xs text-neutral-500">
              Department: <strong className="text-neutral-700">{selectedDepartment === 'all' ? 'All Departments' : selectedDepartment}</strong> · Window: <span className="font-mono">{startDate} to {endDate}</span>
            </p>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 self-start sm:self-auto">
            {university.acronym} Institutional Report Engine
          </span>
        </div>

        {/* 1. Payroll Summary Table */}
        {selectedReportType === 'payroll-summary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Staff ID & Name</th>
                  <th className="py-2.5 px-3">Department & Rank</th>
                  <th className="py-2.5 px-3 text-right">Fortnight Base</th>
                  <th className="py-2.5 px-3 text-right">Allowances</th>
                  <th className="py-2.5 px-3 text-right">Gross Salary</th>
                  <th className="py-2.5 px-3 text-right">IRC Tax (SWT)</th>
                  <th className="py-2.5 px-3 text-right">Super 6% (EE)</th>
                  <th className="py-2.5 px-3 text-right">Super 8.4% (ER)</th>
                  <th className="py-2.5 px-3 text-right font-bold text-neutral-900">Net Pay</th>
                  <th className="py-2.5 px-3">Super Fund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {payrollData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-neutral-400">
                      No payroll records match the selected department or date parameters.
                    </td>
                  </tr>
                ) : (
                  payrollData.map((p) => {
                    const allowanceTotal = p.grossPay - p.fortnightBaseSalary;

                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-neutral-900">{p.staffName}</div>
                          <div className="text-[11px] font-mono text-neutral-500">{p.staffId} · {p.tinNumber}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-neutral-900 font-medium">{p.department}</div>
                          <div className="text-[11px] text-neutral-500">{p.academicRank}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          {formatPGK(p.fortnightBaseSalary)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-600">
                          {formatPGK(allowanceTotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900">
                          {formatPGK(p.grossPay)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-700">
                          -{formatPGK(p.deductions.ircTax)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                          -{formatPGK(p.deductions.superEmployee)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-500">
                          {formatPGK(p.deductions.superEmployer)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                          {formatPGK(p.netPay)}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-neutral-600">
                          {p.superFund}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Student Enrollment by Program Table */}
        {selectedReportType === 'student-enrollment' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Academic Program</th>
                  <th className="py-2.5 px-3">Degree Level</th>
                  <th className="py-2.5 px-3 text-right">Headcount</th>
                  <th className="py-2.5 px-3 text-right">Gender (M / F)</th>
                  <th className="py-2.5 px-3 text-right">TESAS Scholars</th>
                  <th className="py-2.5 px-3 text-right">HELP Loan</th>
                  <th className="py-2.5 px-3 text-right">Avg GPA</th>
                  <th className="py-2.5 px-3 text-right">Tuition Revenue</th>
                  <th className="py-2.5 px-3 text-right">Collected</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {programData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-neutral-400">
                      No programs match the selected department criteria.
                    </td>
                  </tr>
                ) : (
                  programData.map((prog) => {
                    const rate = prog.totalTuitionDue > 0 
                      ? Math.round((prog.totalTuitionPaid / prog.totalTuitionDue) * 100) 
                      : 100;

                    return (
                      <tr key={prog.programName} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-neutral-900">{prog.programName}</div>
                          <div className="text-[11px] text-neutral-500">{prog.schoolName}</div>
                        </td>
                        <td className="py-3 px-3 text-neutral-700 font-medium">
                          {prog.degreeLevel}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-neutral-900">
                          {prog.totalStudents}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-600">
                          {prog.maleCount}M / {prog.femaleCount}F
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-800 font-medium">
                          {prog.tesasCount}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-600">
                          {prog.helpCount}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-neutral-900">
                          {prog.avgGpa.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-600">
                          {formatPGK(prog.totalTuitionDue)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-medium">
                          {formatPGK(prog.totalTuitionPaid)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          <span className={`text-[11px] font-semibold ${
                            rate >= 90 ? 'text-emerald-700' : 'text-amber-700'
                          }`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Leave Balances for Local Staff Table */}
        {selectedReportType === 'leave-balances' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Staff ID & Name</th>
                  <th className="py-2.5 px-3">Department & Rank</th>
                  <th className="py-2.5 px-3 text-right">Annual Entitlement</th>
                  <th className="py-2.5 px-3 text-right">Recreation Taken</th>
                  <th className="py-2.5 px-3 text-right font-bold text-neutral-900">Remaining Balance</th>
                  <th className="py-2.5 px-3 text-right">Wantok / Kastom Days</th>
                  <th className="py-2.5 px-3 text-right">Sick Leave Remaining</th>
                  <th className="py-2.5 px-3 text-right">Long Service Accrual</th>
                  <th className="py-2.5 px-3">Duty Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {leaveData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-neutral-400">
                      No staff leave records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  leaveData.map(({ faculty, balance }) => (
                    <tr key={faculty.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-neutral-900">
                          {faculty.firstName} {faculty.lastName}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500">
                          {faculty.staffId}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-neutral-900 font-medium">{faculty.department}</div>
                        <div className="text-[11px] text-neutral-500">{faculty.academicRank}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        {balance.annualEntitlement} days
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-500">
                        {balance.annualTaken} days
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                        {balance.annualRemaining} days
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-800 font-medium">
                        {balance.wantokTaken} days
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {balance.sickRemaining} of {balance.sickEntitlement}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-900">
                        {balance.longServiceAccruedYears} yrs
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[11px] font-medium ${
                          faculty.activeStatus === 'Active' ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {faculty.activeStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Certified for <strong className="text-neutral-800">{university.name}</strong> Institutional Records
          </span>
          <span className="font-mono text-[11px]">
            Generated on {new Date().toLocaleDateString('en-GB')} · Ref: {university.acronym}-REP-2026
          </span>
        </div>
      </div>

      {/* Official Printable Executive Report Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-4 sm:p-8 shadow-2xl relative border border-neutral-200 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 text-xs text-neutral-800">
              {/* Official Academic Header */}
              <div className="text-center border-b border-neutral-300 pb-4 space-y-1">
                <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-900">
                  {university.name}
                </h2>
                <p className="text-xs font-semibold text-neutral-700">
                  OFFICE OF HUMAN RESOURCES & BURSAR'S DIVISION
                </p>
                <p className="text-[11px] text-neutral-500">
                  {university.location} · {university.province} · Papua New Guinea
                </p>
              </div>

              {/* Report Header Metadata */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-neutral-500 block">Report Document:</span>
                    <strong className="text-neutral-900 text-sm">
                      {currentTemplate ? currentTemplate.title : 'University Management Audit Report'}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500 block">Report Date:</span>
                    <strong className="font-mono text-neutral-800">14 October 2026</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-neutral-200 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Department Filter:</span>
                    <span className="font-medium text-neutral-900">{selectedDepartment === 'all' ? 'All University Departments' : selectedDepartment}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Audit Window:</span>
                    <span className="font-mono text-neutral-900">{startDate} to {endDate}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Regulatory Compliance:</span>
                    <span className="font-medium text-neutral-900">{currentTemplate ? currentTemplate.regulatoryBody : 'DHERST & PNG IRC'}</span>
                  </div>
                </div>
              </div>

              {/* Report Narrative / Findings Summary */}
              <div className="space-y-2">
                <div className="font-bold text-neutral-900 text-xs uppercase tracking-wide border-b border-neutral-200 pb-1">
                  Executive Summary & Statistical Overview
                </div>

                {selectedReportType === 'payroll-summary' && (
                  <p className="leading-relaxed">
                    This statutory payroll summary accounts for <strong>{payrollData.length} active academic faculty members</strong>. 
                    Total fortnightly gross salary disbursements amount to <strong>{formatPGK(payrollTotals.gross)}</strong>, 
                    with <strong>{formatPGK(payrollTotals.tax)}</strong> withheld for Papua New Guinea Internal Revenue Commission (IRC) 
                    Salary & Wages Tax compliance. Mandatory superannuation remittances total <strong>{formatPGK(payrollTotals.superEmployee + payrollTotals.superEmployer)}</strong> 
                    (comprising 6.0% employee contributions and 8.4% university employer contributions) remitted to Nambawan Super and Nasfund.
                  </p>
                )}

                {selectedReportType === 'student-enrollment' && (
                  <p className="leading-relaxed">
                    Student cohort census covers <strong>{programData.length} distinct academic programs</strong> with a total enrollment 
                    of <strong>{programData.reduce((acc, p) => acc + p.totalStudents, 0)} registered students</strong>. 
                    DHERST TESAS scholarship recipients represent <strong>{programData.reduce((acc, p) => acc + p.tesasCount, 0)} scholars</strong> 
                    across Academic Excellence (AES) and Higher Education Contribution Assistance (HECAS) schemes. 
                    Cumulative tuition fees paid to date amount to <strong>{formatPGK(programData.reduce((acc, p) => acc + p.totalTuitionPaid, 0))}</strong>.
                  </p>
                )}

                {selectedReportType === 'leave-balances' && (
                  <p className="leading-relaxed">
                    Staff leave audit reviews <strong>{leaveData.length} permanent local academic personnel</strong>. 
                    Total statutory annual recreation leave liability currently accrued across departments stands at <strong>{leaveTotals.remaining} working days</strong>. 
                    Cultural obligations under Wantok / Kastom bereavement (Haus Krai funeral protocols) accounted for <strong>{leaveTotals.wantokTaken} days</strong>, 
                    with all lecture commitments formally covered by confirmed departmental relief officers.
                  </p>
                )}
              </div>

              {/* Official Signatures */}
              <div className="pt-8 border-t border-neutral-300 grid grid-cols-2 gap-8 text-xs">
                <div className="space-y-1">
                  <div className="font-serif italic text-base text-neutral-800">Mrs. Lois Baloiloi</div>
                  <div className="border-t border-neutral-400 pt-1 font-semibold text-neutral-900">
                    Director of Human Resources & Payroll
                  </div>
                  <div className="text-[11px] text-neutral-500">{university.name}</div>
                </div>

                <div className="space-y-1 text-right">
                  <div className="font-serif italic text-base text-neutral-800">Dr. Peter Petsul</div>
                  <div className="border-t border-neutral-400 pt-1 font-semibold text-neutral-900">
                    University Registrar
                  </div>
                  <div className="text-[11px] text-neutral-500">{university.name}</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
