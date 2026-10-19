import React, { useState } from 'react';
import { AppUser, UniversityInfo } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  User, 
  Sparkles, 
  Menu, 
  X,
  CreditCard,
  Calendar,
  Wallet,
  CheckSquare,
  Briefcase,
  Clock,
  Award,
  Users,
  FileBarChart,
  ChevronRight
} from 'lucide-react';

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
  universities?: UniversityInfo[];
  onSelectUniversity?: (uni: UniversityInfo) => void;
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
  currentUser,
  users,
  onSelectUser,
  activeTab,
  onSelectTab,
  onExportReport,
  pendingApprovalsCount = 0,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdministrator = currentUser.role === 'Administrator';
  const isHRManager = currentUser.role === 'HR Manager';
  const isEmployee = currentUser.role === 'Employee';

  const handleTabClick = (tab: ActiveNavTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    {
      id: 'payroll' as ActiveNavTab,
      label: isEmployee ? 'My Payslips' : 'Faculty Payroll',
      mobileLabel: isEmployee ? 'My Payslips' : 'Payroll',
      icon: CreditCard,
      badge: null,
      show: true,
    },
    {
      id: 'leave' as ActiveNavTab,
      label: isEmployee ? 'My Leave' : 'Staff Leave',
      mobileLabel: 'Leave',
      icon: Calendar,
      badge: null,
      show: true,
    },
    {
      id: 'loans' as ActiveNavTab,
      label: isEmployee ? 'My Loans' : 'Staff Loans',
      mobileLabel: 'Loans',
      icon: Wallet,
      badge: null,
      show: true,
    },
    {
      id: 'approvals' as ActiveNavTab,
      label: isEmployee ? 'My Requests' : 'Approvals Hub',
      mobileLabel: 'Approvals',
      icon: CheckSquare,
      badge: !isEmployee && pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
      show: true,
    },
    {
      id: 'recruitment' as ActiveNavTab,
      label: isEmployee ? 'Vacancies & Contracts' : 'Recruitment & Contracts',
      mobileLabel: 'Recruitment',
      icon: Briefcase,
      badge: null,
      show: true,
    },
    {
      id: 'attendance' as ActiveNavTab,
      label: 'Campus Attendance',
      mobileLabel: 'Attendance',
      icon: Clock,
      badge: null,
      show: true,
    },
    {
      id: 'performance' as ActiveNavTab,
      label: 'Academic Appraisals',
      mobileLabel: 'Appraisals',
      icon: Award,
      badge: null,
      show: true,
    },
    {
      id: 'faculty' as ActiveNavTab,
      label: 'Faculty Directory',
      mobileLabel: 'Directory',
      icon: Users,
      badge: null,
      show: true,
    },
    {
      id: 'reports' as ActiveNavTab,
      label: 'Statutory Reports',
      mobileLabel: 'Reports',
      icon: FileBarChart,
      badge: null,
      show: !isEmployee,
    },
    {
      id: 'integration' as ActiveNavTab,
      label: 'Integrate System',
      mobileLabel: 'Integrate',
      icon: Sparkles,
      badge: 'Procure',
      show: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16">
          {/* Zone 1: Wordmark & Enterprise Brand */}
          <div 
            onClick={() => handleTabClick('payroll')}
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer group"
          >
            <div 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm sm:text-base shadow-xs shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: currentUniversity.primaryColor || '#0f172a' }}
            >
              {currentUniversity.acronym.substring(0, 2)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-neutral-900 whitespace-nowrap">
                  PNG UniHR
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-neutral-500 whitespace-nowrap truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[260px] md:max-w-none">
                {currentUniversity.name}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Desktop 2xl / xl) */}
          <nav className="hidden xl:flex items-center gap-3 lg:gap-4 text-xs font-semibold">
            {navItems.filter(item => item.show && item.id !== 'integration').map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 flex items-center gap-1.5 ${
                    isActive
                      ? 'border-neutral-900 text-neutral-900 font-bold'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: CTA, RBAC Switcher & Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* CTA Button: Procure / Integrate for Any University */}
            <button
              onClick={() => handleTabClick('integration')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold rounded-md transition-all shadow-xs ${
                activeTab === 'integration'
                  ? 'bg-amber-500 text-neutral-950 ring-2 ring-amber-400'
                  : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 hover:shadow-sm'
              }`}
              title="Procure or Integrate PNG UniHR for your University or College"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="hidden md:inline">Buy / Integrate System</span>
              <span className="md:hidden">Integrate</span>
            </button>

            {/* RBAC Role & User Switcher */}
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
                className="text-[11px] sm:text-xs bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-semibold py-1.5 pl-2 sm:pl-2.5 pr-5 sm:pr-6 rounded-md border border-neutral-300 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-neutral-400 max-w-[110px] sm:max-w-[180px] truncate"
                title="Switch User Persona Simulation"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    [{u.role}] {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-hidden focus:ring-1 focus:ring-neutral-400 shrink-0"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-neutral-900" />
              ) : (
                <Menu className="w-5 h-5 text-neutral-900" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Expandable) */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-neutral-200 bg-white/98 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                System Modules & Workflows
              </div>
              <div className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                Role: {currentUser.role}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navItems.filter(item => item.show).map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isActive ? 'bg-amber-400 text-neutral-950' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* University Deployment Banner inside Mobile Drawer */}
            <div className="pt-2 border-t border-neutral-100">
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-neutral-900">
                    Deploy for Another University
                  </div>
                  <div className="text-[11px] text-neutral-600">
                    UPNG, UNITECH, UOG, DWU, UNRE, WPU or private colleges.
                  </div>
                </div>
                <button
                  onClick={() => handleTabClick('integration')}
                  className="px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-md text-xs font-bold shrink-0"
                >
                  Inquire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-header horizontal swipeable tab strip for mobile and tablets */}
      <div className="xl:hidden border-t border-neutral-200/80 bg-neutral-50/90 py-1.5 px-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {navItems.filter(item => item.show).map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200/80'
                }`}
              >
                <span>{item.mobileLabel}</span>
                {item.badge && (
                  <span className={`px-1 rounded-full text-[9px] font-bold ${
                    isActive ? 'bg-amber-400 text-neutral-950' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
