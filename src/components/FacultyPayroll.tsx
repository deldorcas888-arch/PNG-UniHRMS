import React, { useState, useMemo } from 'react';
import { AppUser, FacultyMember, PayslipRecord, UniversityInfo } from '../types';
import { 
  formatPGK, 
  generatePayslip, 
  calculatePngIrcSwt,
  getDefaultAllowancesForRank 
} from '../utils/pngPayroll';
import { 
  Search, 
  Filter, 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  Building, 
  X,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Landmark,
  Calculator,
  Lock,
  UserCheck
} from 'lucide-react';

interface FacultyPayrollProps {
  university: UniversityInfo;
  currentUser?: AppUser;
  facultyMembers: FacultyMember[];
  activeFortnight: string;
}

export const FacultyPayroll: React.FC<FacultyPayrollProps> = ({
  university,
  currentUser,
  facultyMembers,
  activeFortnight,
}) => {
  const isEmployee = currentUser?.role === 'Employee';

  // If employee role, restrict to own profile only
  const scopedFaculty = useMemo(() => {
    if (isEmployee && currentUser?.staffId) {
      const own = facultyMembers.filter(f => f.staffId === currentUser.staffId);
      return own.length > 0 ? own : [facultyMembers[0]];
    }
    return facultyMembers;
  }, [facultyMembers, isEmployee, currentUser]);

  const [selectedFortnight, setSelectedFortnight] = useState(activeFortnight);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);
  const [showBatchExportSuccess, setShowBatchExportSuccess] = useState(false);

  // Allowances adjustment override state for active simulation
  const [includeDma, setIncludeDma] = useState(true);
  const [includeHousing, setIncludeHousing] = useState(true);
  const [includeBookAllowance, setIncludeBookAllowance] = useState(true);

  // Compute payslips dynamically
  const payslips: PayslipRecord[] = useMemo(() => {
    return scopedFaculty.map(faculty => {
      const payslip = generatePayslip(faculty, selectedFortnight);
      
      // Apply simulation overrides if toggled
      const adjustedAllowances = {
        ...payslip.allowances,
        dma: includeDma ? payslip.allowances.dma : 0,
        housing: includeHousing ? payslip.allowances.housing : 0,
        bookResearch: includeBookAllowance ? payslip.allowances.bookResearch : 0,
      };

      const totalAllowances = 
        adjustedAllowances.dma + 
        adjustedAllowances.housing + 
        adjustedAllowances.bookResearch + 
        adjustedAllowances.clinicalConsulting + 
        adjustedAllowances.schoolFeeSubsidy;

      const grossPay = Math.round((payslip.fortnightBaseSalary + totalAllowances) * 100) / 100;
      const ircTax = calculatePngIrcSwt(grossPay);
      const totalDeductions = Math.round(
        (ircTax + 
         payslip.deductions.superEmployee + 
         payslip.deductions.staffUnionDues + 
         payslip.deductions.creditUnionTisa + 
         payslip.deductions.housingRentalDeduction) * 100
      ) / 100;
      const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

      return {
        ...payslip,
        allowances: adjustedAllowances,
        grossPay,
        deductions: {
          ...payslip.deductions,
          ircTax,
          totalDeductions,
        },
        netPay,
      };
    });
  }, [scopedFaculty, selectedFortnight, includeDma, includeHousing, includeBookAllowance]);

  // Filtered payslips
  const filteredPayslips = useMemo(() => {
    return payslips.filter(p => {
      const matchesSearch = 
        p.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tinNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const faculty = scopedFaculty.find(f => f.staffId === p.staffId);
      const matchesSchool = selectedSchool === 'all' || (faculty && faculty.schoolId === selectedSchool);

      return matchesSearch && matchesSchool;
    });
  }, [payslips, searchTerm, selectedSchool, scopedFaculty]);

  // Summary Totals
  const totals = useMemo(() => {
    return filteredPayslips.reduce((acc, curr) => {
      acc.gross += curr.grossPay;
      acc.base += curr.fortnightBaseSalary;
      acc.tax += curr.deductions.ircTax;
      acc.superEmployee += curr.deductions.superEmployee;
      acc.superEmployer += curr.deductions.superEmployer;
      acc.net += curr.netPay;
      return acc;
    }, { gross: 0, base: 0, tax: 0, superEmployee: 0, superEmployer: 0, net: 0 });
  }, [filteredPayslips]);

  const handleExportCsv = () => {
    const headers = [
      'Staff ID',
      'Staff Name',
      'Academic Rank',
      'Department',
      'IRC TIN Number',
      'Superannuation Fund',
      'Super Member No',
      'Bank',
      'Account Number',
      'Fortnight Base (PGK)',
      'Allowances (PGK)',
      'Gross Pay (PGK)',
      'IRC Tax (SWT)',
      'Super 6% (Employee)',
      'Super 8.4% (Employer)',
      'Union Dues',
      'TISA/Credit Union',
      'Quarters Rental',
      'Net Pay (PGK)',
    ];

    const rows = filteredPayslips.map(p => [
      p.staffId,
      `"${p.staffName}"`,
      `"${p.academicRank}"`,
      `"${p.department}"`,
      p.tinNumber,
      p.superFund,
      p.superMemberNo,
      `"${p.bankName}"`,
      p.bankAccountNo,
      p.fortnightBaseSalary.toFixed(2),
      (p.grossPay - p.fortnightBaseSalary).toFixed(2),
      p.grossPay.toFixed(2),
      p.deductions.ircTax.toFixed(2),
      p.deductions.superEmployee.toFixed(2),
      p.deductions.superEmployer.toFixed(2),
      p.deductions.staffUnionDues.toFixed(2),
      p.deductions.creditUnionTisa.toFixed(2),
      p.deductions.housingRentalDeduction.toFixed(2),
      p.netPay.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${university.acronym}_Payroll_Schedule_${selectedFortnight.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowBatchExportSuccess(true);
    setTimeout(() => setShowBatchExportSuccess(false), 4000);
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Fortnight Gross Pay</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatPGK(totals.gross)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Base: <span className="font-mono tabular-nums">{formatPGK(totals.base)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>IRC Salary & Wages Tax (SWT)</span>
            <Landmark className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatPGK(totals.tax)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Withheld for PNG Internal Revenue Commission
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Superannuation Remittance</span>
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatPGK(totals.superEmployee + totals.superEmployer)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            EE 6%: <span className="font-mono tabular-nums">{formatPGK(totals.superEmployee)}</span> · ER 8.4%: <span className="font-mono tabular-nums">{formatPGK(totals.superEmployer)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Net Fortnightly Disbursement</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {formatPGK(totals.net)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Via BSP, Kina Bank, Westpac Direct Credit
          </div>
        </div>
      </div>

      {/* Export notification alert */}
      {showBatchExportSuccess && (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Payroll schedule and IRC SWT compliance batch exported successfully.</span>
          </div>
          <button 
            onClick={() => setShowBatchExportSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control Strip & Interactive Filters */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Pay Period Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium shrink-0">Pay Cycle:</span>
              <select
                value={selectedFortnight}
                onChange={(e) => setSelectedFortnight(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs font-mono font-medium text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="FN 21 - 2026 (05 Oct - 18 Oct 2026)">FN 21 - 2026 (05 Oct - 18 Oct 2026)</option>
                <option value="FN 20 - 2026 (21 Sep - 04 Oct 2026)">FN 20 - 2026 (21 Sep - 04 Oct 2026)</option>
                <option value="FN 19 - 2026 (07 Sep - 20 Sep 2026)">FN 19 - 2026 (07 Sep - 20 Sep 2026)</option>
                <option value="FN 18 - 2026 (24 Aug - 06 Sep 2026)">FN 18 - 2026 (24 Aug - 06 Sep 2026)</option>
              </select>
            </div>

            {/* School Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium shrink-0">School:</span>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Academic Schools</option>
                <option value="snps">Natural & Physical Sciences (SNPS)</option>
                <option value="sbpp">Business & Public Policy (SBPP)</option>
                <option value="shss">Humanities & Social Sciences (SHSS)</option>
                <option value="sol">School of Law (SOL)</option>
                <option value="smhs">Medicine & Health Sciences (SMHS)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search faculty, TIN, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-400 text-neutral-800 placeholder-neutral-400"
              />
            </div>

            {!isEmployee && (
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-md transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* PNG Allowance Simulation Toggles - Hidden for Employee */}
        {!isEmployee ? (
          <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600">
            <div className="flex items-center gap-1.5 font-medium text-neutral-700">
              <Calculator className="w-3.5 h-3.5 text-neutral-500" />
              <span>Statutory Allowance Modifiers:</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDma}
                  onChange={(e) => setIncludeDma(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                />
                <span>Domestic Market Allowance (DMA)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHousing}
                  onChange={(e) => setIncludeHousing(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                />
                <span>Housing Subsidy</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBookAllowance}
                  onChange={(e) => setIncludeBookAllowance(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                />
                <span>Book & Academic Research</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500">
            <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>
              Role-Based Access: Personal employee payslip records for <strong>{currentUser?.name}</strong>. University-wide payroll modifications restricted to HR Managers.
            </span>
          </div>
        )}
      </div>

      {/* High Density Payroll Ledger Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Staff ID & Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Rank & Department</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Base Salary</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Allowances</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Gross Pay</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">IRC Tax (SWT)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Super (6%)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Other Ded.</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right font-semibold text-neutral-800">Net Pay</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Super / Bank</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filteredPayslips.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-neutral-400">
                    No faculty payroll records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPayslips.map((item) => {
                  const otherDeductions = 
                    item.deductions.staffUnionDues + 
                    item.deductions.creditUnionTisa + 
                    item.deductions.housingRentalDeduction;

                  const totalAllowances = item.grossPay - item.fortnightBaseSalary;

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-neutral-50/80 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-neutral-900">{item.staffName}</div>
                        <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                          <span>{item.staffId}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.tinNumber}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-neutral-900 font-medium">{item.academicRank}</div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-[180px]">{item.department}</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {formatPGK(item.fortnightBaseSalary)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {formatPGK(totalAllowances)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-neutral-900">
                        {formatPGK(item.grossPay)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-700">
                        -{formatPGK(item.deductions.ircTax)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        -{formatPGK(item.deductions.superEmployee)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-500">
                        -{formatPGK(otherDeductions)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                        {formatPGK(item.netPay)}
                      </td>

                      <td className="py-3 px-3 text-[11px]">
                        <div className="text-neutral-800">{item.superFund}</div>
                        <div className="text-neutral-500 truncate max-w-[130px]">{item.bankName.split(' ')[0]} · {item.bankAccountNo.slice(-4)}</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedPayslip(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap"
                        >
                          <FileText className="w-3 h-3 text-neutral-500" />
                          <span>Payslip</span>
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
            Showing <strong className="text-neutral-800">{filteredPayslips.length}</strong> of {facultyMembers.length} faculty member payroll records
          </span>
          <span className="font-mono text-[11px]">
            PNG IRC SWT Act 2026 Compliant · Superannuation General Provisions Act 2000
          </span>
        </div>
      </div>

      {/* Official Printable Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-200 my-4 max-h-[90dvh] overflow-y-auto">
            <button
              onClick={() => setSelectedPayslip(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Payslip Body */}
            <div id="printable-payslip" className="space-y-6">
              {/* Header with Institution Information */}
              <div className="border-b border-neutral-300 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold uppercase tracking-wide text-neutral-900">
                    {university.name}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Bursar's Office · Payroll & Salaries Section · {university.location}
                  </p>
                  <p className="text-xs font-semibold text-neutral-800 mt-1">
                    CONFIDENTIAL FORTNIGHTLY PAY ADVICE
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-mono font-semibold text-neutral-900">{selectedPayslip.payPeriod}</div>
                  <div className="text-neutral-500">Date: {selectedPayslip.payDate}</div>
                </div>
              </div>

              {/* Employee & Bank Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50 p-3.5 rounded-lg border border-neutral-200">
                <div>
                  <div className="text-neutral-500">Employee Name:</div>
                  <div className="font-semibold text-neutral-900 text-sm">{selectedPayslip.staffName}</div>
                  <div className="text-neutral-600 mt-0.5">{selectedPayslip.academicRank}</div>
                  <div className="text-neutral-500 text-[11px]">{selectedPayslip.schoolName}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Staff ID:</span>
                    <span className="font-mono font-semibold text-neutral-800">{selectedPayslip.staffId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">IRC TIN:</span>
                    <span className="font-mono text-neutral-800">{selectedPayslip.tinNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{selectedPayslip.superFund}:</span>
                    <span className="font-mono text-neutral-800">{selectedPayslip.superMemberNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Disbursement Bank:</span>
                    <span className="text-neutral-800 font-medium">{selectedPayslip.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Account No:</span>
                    <span className="font-mono text-neutral-800">{selectedPayslip.bankAccountNo}</span>
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Dual Ledger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Earnings */}
                <div className="space-y-2">
                  <div className="font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-1 flex justify-between">
                    <span>Earnings</span>
                    <span>Amount (PGK)</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-neutral-700">
                      <span>Fortnight Base Salary</span>
                      <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.fortnightBaseSalary)}</span>
                    </div>
                    {selectedPayslip.allowances.dma > 0 && (
                      <div className="flex justify-between text-neutral-700">
                        <span>Domestic Market Allowance (DMA)</span>
                        <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.allowances.dma)}</span>
                      </div>
                    )}
                    {selectedPayslip.allowances.housing > 0 && (
                      <div className="flex justify-between text-neutral-700">
                        <span>Housing Subsidy</span>
                        <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.allowances.housing)}</span>
                      </div>
                    )}
                    {selectedPayslip.allowances.bookResearch > 0 && (
                      <div className="flex justify-between text-neutral-700">
                        <span>Book & Academic Research</span>
                        <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.allowances.bookResearch)}</span>
                      </div>
                    )}
                    {selectedPayslip.allowances.clinicalConsulting > 0 && (
                      <div className="flex justify-between text-neutral-700">
                        <span>Clinical / Specialist Allowance</span>
                        <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.allowances.clinicalConsulting)}</span>
                      </div>
                    )}
                    {selectedPayslip.allowances.schoolFeeSubsidy > 0 && (
                      <div className="flex justify-between text-neutral-700">
                        <span>Children School Fee Subsidy</span>
                        <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.allowances.schoolFeeSubsidy)}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-900">
                    <span>Total Gross Pay:</span>
                    <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.grossPay)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <div className="font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-1 flex justify-between">
                    <span>Deductions</span>
                    <span>Amount (PGK)</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-neutral-700">
                      <span>IRC Salary & Wages Tax (SWT)</span>
                      <span className="font-mono tabular-nums text-amber-700">{formatPGK(selectedPayslip.deductions.ircTax)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>{selectedPayslip.superFund} (6.0%)</span>
                      <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.deductions.superEmployee)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>Staff Academic Union (NASA)</span>
                      <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.deductions.staffUnionDues)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>Credit Union (TISA / SACCO)</span>
                      <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.deductions.creditUnionTisa)}</span>
                    </div>
                    {selectedPayslip.deductions.housingRentalDeduction > 0 && (
                      <div className="flex justify-between text-neutral-700">
                        <span>University Quarters Maintenance</span>
                        <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.deductions.housingRentalDeduction)}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-900">
                    <span>Total Deductions:</span>
                    <span className="font-mono tabular-nums">{formatPGK(selectedPayslip.deductions.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Highlight Banner */}
              <div className="bg-neutral-900 text-white p-4 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-neutral-400">Net Fortnight Payout</div>
                  <div className="text-xs text-neutral-300">Direct Credit to {selectedPayslip.bankName}</div>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-300">
                  {formatPGK(selectedPayslip.netPay)}
                </div>
              </div>

              {/* Statutory Employer Contributions Section */}
              <div className="border border-neutral-200 rounded-lg p-3 text-xs bg-neutral-50/50 space-y-1">
                <div className="font-semibold text-neutral-800">Employer Statutory Contributions (University Funded):</div>
                <div className="flex justify-between text-neutral-600">
                  <span>{selectedPayslip.superFund} Employer Share (8.4%):</span>
                  <span className="font-mono font-medium text-neutral-900">{formatPGK(selectedPayslip.deductions.superEmployer)}</span>
                </div>
                <div className="text-[11px] text-neutral-500 italic">
                  Note: Total superannuation remitted to fund is {formatPGK(selectedPayslip.deductions.superEmployee + selectedPayslip.deductions.superEmployer)} (14.4% combined).
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrintPayslip}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Pay Advice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
