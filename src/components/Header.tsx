import React from 'react';
import { AppUser, UniversityInfo } from '../types';
import { Building2, Download, ShieldCheck, User, ChevronDown, Sparkles } from 'lucide-react';

export type ActiveNavTab = 
  | 'payroll' 
  | 'leave' 
  | 'loans' 
  | 'approvals' 
  | 'recruitment' 
  | 'attendance' 
  | 'performance' 
  | 'faculty' 
  | 'reports' 
  | 'integration';

interface HeaderProps {
  currentUniversity: UniversityInfo;
  universities: UniversityInfo[];
  onSelectUniversity: (uni: UniversityInfo) => void;
  currentUser: AppUser;
  users: AppUser[];
  onSelectUser: (user: AppUser) => void;
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onExportReport: () => void;
  pendingApprovalsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUniversity,
  universities,
  onSelectUniversity,
  currentUser,
  users,
  onSelectUser,
  activeTab,
  onSelectTab,
  onExportReport,
  pendingApprovalsCount = 0,
}) => {
  const isAdministrator = currentUser.role === 'Administrator';
  const isHRManager = currentUser.role === 'HR Manager';
  const isEmployee = currentUser.role === 'Employee';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Wordmark Brand */}
          <div 
            onClick={() => onSelectTab('payroll')}
            className="flex items-center gap-3 shrink-0 cursor-pointer"
          >
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-base shadow-xs"
              style={{ backgroundColor: currentUniversity.primaryColor }}
            >
              {currentUniversity.acronym.substring(0, 2)}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-neutral-900 whitespace-nowrap">
                PNG UniHR
              </span>
              <span className="text-[11px] text-neutral-500 whitespace-nowrap hidden sm:inline">
                {currentUniversity.name}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-4 text-xs font-semibold">
            {/* Payroll */}
            <button
              onClick={() => onSelectTab('payroll')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'payroll'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {isEmployee ? 'My Payslips' : 'Faculty Payroll'}
            </button>

            {/* Leave */}
            <button
              onClick={() => onSelectTab('leave')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'leave'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {isEmployee ? 'My Leave' : 'Staff Leave'}
            </button>

            {/* Loans */}
            <button
              onClick={() => onSelectTab('loans')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'loans'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {isEmployee ? 'My Loans' : 'Staff Loans'}
            </button>

            {/* Approvals Hub */}
            <button
              onClick={() => onSelectTab('approvals')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'approvals'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span>{isEmployee ? 'My Requests' : 'Approvals Hub'}</span>
              {!isEmployee && pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-bold">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {/* Vacancies, Recruitment & Contracts */}
            <button
              onClick={() => onSelectTab('recruitment')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'recruitment'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {isEmployee ? 'Vacancies & Contracts' : 'Recruitment & Contracts'}
            </button>

            {/* Attendance & Timesheets */}
            <button
              onClick={() => onSelectTab('attendance')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'attendance'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Attendance
            </button>

            {/* Performance Appraisals */}
            <button
              onClick={() => onSelectTab('performance')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'performance'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Performance
            </button>

            {/* Faculty Directory */}
            <button
              onClick={() => onSelectTab('faculty')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'faculty'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {isEmployee ? 'My Dossier' : 'Staff Directory'}
            </button>

            {/* HR Reports */}
            {(isAdministrator || isHRManager) && (
              <button
                onClick={() => onSelectTab('reports')}
                className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === 'reports'
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                HR Reports
              </button>
            )}
          </nav>

          {/* Zone 3: CTA & RBAC Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* CTA Button: Contact / Integrate This System */}
            <button
              onClick={() => onSelectTab('integration')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors shadow-xs ${
                activeTab === 'integration'
                  ? 'bg-amber-500 text-neutral-950 ring-2 ring-amber-400'
                  : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
              }`}
              title="Request Integration for Your PNG University"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Integrate System</span>
              <span className="sm:hidden">Integrate</span>
            </button>

            {/* RBAC Role & User Switcher */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <div className="relative inline-flex items-center">
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const found = users.find(u => u.id === e.target.value);
                    if (found) {
                      onSelectUser(found);
                      if (found.role === 'Employee' && activeTab === 'reports') {
                        onSelectTab('leave');
                      }
                    }
                  }}
                  className="text-xs bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-semibold py-1.5 pl-2.5 pr-6 rounded-md border border-neutral-300 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                  title="Switch RBAC User Simulation"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      [{u.role}] {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* University Switcher */}
            <div className="relative inline-flex items-center hidden 2xl:block">
              <select
                value={currentUniversity.id}
                onChange={(e) => {
                  const selected = universities.find(u => u.id === e.target.value);
                  if (selected) onSelectUniversity(selected);
                }}
                className="text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-600 font-medium py-1.5 pl-2 pr-6 rounded-md border border-neutral-200 cursor-pointer focus:outline-hidden"
                title="Switch PNG Institution"
              >
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.acronym}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-header Navigation strip for medium & mobile screens */}
      <div className="xl:hidden flex overflow-x-auto px-4 py-2 border-t border-neutral-100 gap-4 text-xs font-semibold bg-neutral-50/50">
        <button
          onClick={() => onSelectTab('payroll')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'payroll' ? 'text-neutral-900 font-bold border-b border-neutral-900' : 'text-neutral-500'}`}
        >
          {isEmployee ? 'My Payslips' : 'Payroll'}
        </button>

        <button
          onClick={() => onSelectTab('leave')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'leave' ? 'text-neutral-900 font-bold border-b border-neutral-900' : 'text-neutral-500'}`}
        >
          {isEmployee ? 'My Leave' : 'Leave'}
        </button>

        <button
          onClick={() => onSelectTab('loans')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'loans' ? 'text-neutral-900 font-bold border-b border-neutral-900' : 'text-neutral-500'}`}
        >
          {isEmployee ? 'My Loans' : 'Loans'}
        </button>

        <button
          onClick={() => onSelectTab('approvals')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'approvals' ? 'text-neutral-900 font-bold border-b border-neutral-900' : 'text-neutral-500'}`}
        >
          {isEmployee ? 'My Requests' : `Approvals (${pendingApprovalsCount})`}
        </button>

        <button
          onClick={() => onSelectTab('recruitment')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'recruitment' ? 'text-neutral-900 font-bold border-b border-neutral-900' : 'text-neutral-500'}`}
        >
          {isEmployee ? 'Vacancies & Contracts' : 'Recruitment'}
        </button>

        <button
          onClick={() => onSelectTab('attendance')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'attendance' ? 'text-neutral-900 font-bold border-b border-neutral-900' : 'text-neutral-500'}`}
        >
          Attendance
        </button>

        <button
          onClick={() => onSelectTab('performance')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'performance' ? 'text-neutral-900 font-bold border-b border-neutral-900' : 'text-neutral-500'}`}
        >
          Performance
        </button>

        <button
          onClick={() => onSelectTab('faculty')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'faculty' ? 'text-neutral-900 font-bold border-b border-neutral-900' : 'text-neutral-500'}`}
        >
          Staff Directory
        </button>

        {(isAdministrator || isHRManager) && (
          <button
            onClick={() => onSelectTab('reports')}
            className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'reports' ? 'text-neutral-900 font-bold border-b border-neutral-900' : 'text-neutral-500'}`}
          >
            Reports
          </button>
        )}

        <button
          onClick={() => onSelectTab('integration')}
          className={`whitespace-nowrap shrink-0 py-1 text-amber-700 font-bold ${activeTab === 'integration' ? 'border-b border-amber-600' : ''}`}
        >
          Integrate System
        </button>
      </div>
    </header>
  );
};
