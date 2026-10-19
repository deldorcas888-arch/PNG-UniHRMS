import { AcademicRank, FacultyMember, PayrollAllowance, PayrollDeductions, PayslipRecord } from '../types';

/**
 * Calculates PNG Internal Revenue Commission (IRC) Salary & Wages Tax (SWT)
 * Based on the official PNG resident individual income tax scale.
 * 26 fortnights in the PNG fiscal year.
 */
export function calculatePngIrcSwt(fortnightlyGross: number): number {
  const annualGross = fortnightlyGross * 26;
  let annualTax = 0;

  if (annualGross <= 20000) {
    annualTax = 0;
  } else if (annualGross <= 33000) {
    annualTax = (annualGross - 20000) * 0.30;
  } else if (annualGross <= 70000) {
    annualTax = 3900 + (annualGross - 33000) * 0.35;
  } else if (annualGross <= 250000) {
    annualTax = 16850 + (annualGross - 70000) * 0.40;
  } else {
    annualTax = 88850 + (annualGross - 250000) * 0.42;
  }

  // Round to 2 decimal places per fortnight
  return Math.round((annualTax / 26) * 100) / 100;
}

/**
 * Calculate standard PNG university allowances by academic rank
 */
export function getDefaultAllowancesForRank(rank: AcademicRank): PayrollAllowance {
  switch (rank) {
    case 'Professor':
      return {
        dma: 1250.00,
        housing: 850.00,
        bookResearch: 350.00,
        clinicalConsulting: 400.00,
        schoolFeeSubsidy: 250.00,
      };
    case 'Associate Professor':
      return {
        dma: 1000.00,
        housing: 750.00,
        bookResearch: 300.00,
        clinicalConsulting: 250.00,
        schoolFeeSubsidy: 250.00,
      };
    case 'Senior Lecturer':
      return {
        dma: 780.00,
        housing: 650.00,
        bookResearch: 250.00,
        clinicalConsulting: 0.00,
        schoolFeeSubsidy: 200.00,
      };
    case 'Lecturer II':
      return {
        dma: 580.00,
        housing: 550.00,
        bookResearch: 180.00,
        clinicalConsulting: 0.00,
        schoolFeeSubsidy: 150.00,
      };
    case 'Lecturer I':
      return {
        dma: 450.00,
        housing: 500.00,
        bookResearch: 150.00,
        clinicalConsulting: 0.00,
        schoolFeeSubsidy: 150.00,
      };
    case 'Tutor / Teaching Fellow':
      return {
        dma: 280.00,
        housing: 350.00,
        bookResearch: 100.00,
        clinicalConsulting: 0.00,
        schoolFeeSubsidy: 0.00,
      };
    default:
      return {
        dma: 200.00,
        housing: 300.00,
        bookResearch: 50.00,
        clinicalConsulting: 0.00,
        schoolFeeSubsidy: 0.00,
      };
  }
}

/**
 * Computes deductions according to PNG Employment and Superannuation legislation
 */
export function calculateDeductions(
  fortnightBase: number,
  totalGross: number,
  hasCampusHousing: boolean
): PayrollDeductions {
  // IRC Salary & Wages Tax is assessed on total taxable gross
  const ircTax = calculatePngIrcSwt(totalGross);

  // Superannuation is 6.0% employee and 8.4% employer on fortnightly base pay
  const superEmployee = Math.round((fortnightBase * 0.06) * 100) / 100;
  const superEmployer = Math.round((fortnightBase * 0.084) * 100) / 100;

  // NASA (National Academic Staff Association) / NSA Union Dues
  const staffUnionDues = 35.00;

  // TISA / UPNG SACCO credit union standard deduction
  const creditUnionTisa = 75.00;

  // Institutional campus quarters maintenance fee if residing in university quarters
  const housingRentalDeduction = hasCampusHousing ? 110.00 : 0.00;

  const totalDeductions = Math.round(
    (ircTax + superEmployee + staffUnionDues + creditUnionTisa + housingRentalDeduction) * 100
  ) / 100;

  return {
    ircTax,
    superEmployee,
    superEmployer,
    staffUnionDues,
    creditUnionTisa,
    housingRentalDeduction,
    totalDeductions,
  };
}

/**
 * Generates a full payslip record for a faculty member
 */
export function generatePayslip(
  faculty: FacultyMember,
  payPeriod: string = 'FN 21 - 2026 (05 Oct - 18 Oct 2026)',
  payDate: string = '16 Oct 2026'
): PayslipRecord {
  const fortnightBaseSalary = Math.round((faculty.annualBaseSalary / 26) * 100) / 100;
  const allowances = getDefaultAllowancesForRank(faculty.academicRank);
  
  const totalAllowances = 
    allowances.dma + 
    allowances.housing + 
    allowances.bookResearch + 
    allowances.clinicalConsulting + 
    allowances.schoolFeeSubsidy;

  const grossPay = Math.round((fortnightBaseSalary + totalAllowances) * 100) / 100;
  const hasCampusHousing = faculty.campusHousingUnit.toLowerCase().includes('quarters') || 
                           faculty.campusHousingUnit.toLowerCase().includes('block');
  
  const deductions = calculateDeductions(fortnightBaseSalary, grossPay, hasCampusHousing);
  const netPay = Math.round((grossPay - deductions.totalDeductions) * 100) / 100;

  return {
    id: `PAY-${faculty.staffId}-${payPeriod.split(' ')[1]}`,
    payPeriod,
    payDate,
    staffId: faculty.staffId,
    staffName: `${faculty.firstName} ${faculty.lastName}`,
    academicRank: faculty.academicRank,
    department: faculty.department,
    schoolName: faculty.schoolName,
    tinNumber: faculty.tinNumber,
    superFund: faculty.superFund,
    superMemberNo: faculty.superMemberNo,
    bankName: faculty.bankName,
    bankAccountNo: faculty.bankAccountNo,
    fortnightBaseSalary,
    allowances,
    grossPay,
    deductions,
    netPay,
    status: 'Approved & Disbursed',
  };
}

/**
 * Format currency in Papua New Guinea Kina (PGK / K)
 */
export function formatPGK(amount: number): string {
  return `K ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
