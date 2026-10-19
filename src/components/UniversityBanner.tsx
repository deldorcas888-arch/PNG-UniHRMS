import React from 'react';
import { UniversityInfo } from '../types';
import { MapPin, Calendar, Award, UserCheck, ShieldCheck, CreditCard, Sparkles, Briefcase } from 'lucide-react';

interface UniversityBannerProps {
  university: UniversityInfo;
  activeFortnight: string;
  totalFaculty: number;
  totalLoansCount?: number;
  isEmployee?: boolean;
  onRunPayrollQuick: () => void;
  onApplyLeaveQuick: () => void;
  onApplyLoanQuick: () => void;
  onVacanciesQuick?: () => void;
  onIntegrateQuick: () => void;
}

export const UniversityBanner: React.FC<UniversityBannerProps> = ({
  university,
  activeFortnight,
  totalFaculty,
  totalLoansCount = 5,
  isEmployee = false,
  onRunPayrollQuick,
  onApplyLeaveQuick,
  onApplyLoanQuick,
  onVacanciesQuick,
  onIntegrateQuick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 text-white shadow-xs mb-6">
      {/* Background Image with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/png_university_campus_banner_1791954629616.jpg"
          alt={`${university.name} campus scenery`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-900/50" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-amber-400 font-medium">
              <span className="font-bold tracking-wide">{university.acronym}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 inline shrink-0" /> {university.location}
              </span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Est. {university.foundedYear}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold">Human Resources & Payroll</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white text-balance">
              {university.name}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 italic">
              "{university.motto}"
            </p>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 pt-1 text-[11px] sm:text-xs text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Chancellor: <strong className="text-white font-medium">{university.chancellor}</strong></span>
              </div>
              <span aria-hidden="true" className="text-neutral-600 hidden xs:inline">·</span>
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Vice-Chancellor: <strong className="text-white font-medium">{university.viceChancellor}</strong></span>
              </div>
              <span aria-hidden="true" className="text-neutral-600 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>IRC SWT & Super Compliant</span>
              </div>
            </div>
          </div>

          {/* Quick Action & Fortnight Strip */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="bg-neutral-800/80 backdrop-blur-xs border border-neutral-700/70 rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center justify-between gap-3 text-neutral-400">
                <span className="text-[11px] sm:text-xs">Active Fortnight</span>
                <span className="font-mono text-amber-300 font-medium text-[11px] sm:text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3 shrink-0" /> {activeFortnight}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-neutral-400 pt-1 border-t border-neutral-700">
                <span className="text-[11px] sm:text-xs">Staff Roster</span>
                <span className="font-mono text-white text-[11px] sm:text-xs tabular-nums">
                  {totalFaculty} Faculty & Staff
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
              <button
                onClick={onRunPayrollQuick}
                className="px-3 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-md transition-colors shadow-xs text-center whitespace-nowrap"
              >
                {isEmployee ? 'My Payslip' : 'Run Payroll'}
              </button>
              <button
                onClick={onApplyLeaveQuick}
                className="px-3 py-2 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white rounded-md transition-colors text-center whitespace-nowrap"
              >
                Request Leave
              </button>
              <button
                onClick={onApplyLoanQuick}
                className="px-3 py-2 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white rounded-md transition-colors text-center whitespace-nowrap"
              >
                Apply for Loan
              </button>
              {onVacanciesQuick && (
                <button
                  onClick={onVacanciesQuick}
                  className="px-3 py-2 text-xs font-semibold bg-purple-700 hover:bg-purple-600 text-white rounded-md transition-colors text-center whitespace-nowrap flex items-center justify-center gap-1"
                  title="Explore university job vacancies & applications"
                >
                  <Briefcase className="w-3 h-3 shrink-0" />
                  <span>Vacancies</span>
                </button>
              )}
              <button
                onClick={onIntegrateQuick}
                className="col-span-2 sm:col-span-1 px-3 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-md transition-colors text-center whitespace-nowrap flex items-center justify-center gap-1 shadow-xs"
                title="Procure or integrate system for any tertiary institution"
              >
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Buy / Integrate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
