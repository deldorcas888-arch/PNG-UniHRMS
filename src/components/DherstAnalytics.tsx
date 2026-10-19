import React, { useMemo } from 'react';
import { FacultyMember, StudentRecord, UniversityInfo, UniversitySchool } from '../types';
import { formatPGK } from '../utils/pngPayroll';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  MapPin, 
  Landmark, 
  Award, 
  FileCheck, 
  Download, 
  Printer,
  ShieldCheck,
  TrendingUp,
  PieChart
} from 'lucide-react';

interface DherstAnalyticsProps {
  university: UniversityInfo;
  schools: UniversitySchool[];
  facultyMembers: FacultyMember[];
  students: StudentRecord[];
}

export const DherstAnalytics: React.FC<DherstAnalyticsProps> = ({
  university,
  schools,
  facultyMembers,
  students,
}) => {
  // Regional Breakdown
  const regionalStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Highlands': 0,
      'Momase': 0,
      'Southern': 0,
      'New Guinea Islands': 0,
    };

    students.forEach(s => {
      if (counts[s.region] !== undefined) {
        counts[s.region]++;
      }
    });

    const total = students.length || 1;
    return Object.entries(counts).map(([region, count]) => ({
      region,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [students]);

  // Sponsorship Breakdown
  const sponsorshipStats = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach(s => {
      const type = s.sponsorship.split('(')[0].trim();
      counts[type] = (counts[type] || 0) + 1;
    });

    const total = students.length || 1;
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [students]);

  // Superannuation Breakdown
  const superStats = useMemo(() => {
    const nambawanCount = facultyMembers.filter(f => f.superFund === 'Nambawan Super').length;
    const nasfundCount = facultyMembers.filter(f => f.superFund === 'Nasfund').length;
    return { nambawanCount, nasfundCount };
  }, [facultyMembers]);

  // Annualized payroll burn estimate (26 fortnights)
  const annualizedPayroll = useMemo(() => {
    return facultyMembers.reduce((acc, f) => acc + f.annualBaseSalary, 0);
  }, [facultyMembers]);

  const handlePrintDherstAudit = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-900 text-white rounded-lg p-6 border border-neutral-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DHERST National Higher Education Audit · 2026 Academic Subvention</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {university.name} Institutional Performance Dossier
            </h2>
            <p className="text-xs text-neutral-400 max-w-2xl">
              Grounded in the Department of Higher Education, Research, Science and Technology Quality Assurance framework and PNG National Budget subvention criteria.
            </p>
          </div>

          <button
            onClick={handlePrintDherstAudit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap self-start md:self-auto shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print DHERST Audit Dossier</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Annual Faculty Salary Burn</span>
            <Landmark className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatPGK(annualizedPayroll)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            26 Fortnight cycles p.a.
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Overall Student : Faculty Ratio</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {Math.round(students.length / (facultyMembers.length || 1))}:1
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            Meets DHERST standard (≤ 25:1)
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>TESAS Sponsorship Density</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {Math.round((students.filter(s => s.sponsorship.includes('TESAS')).length / (students.length || 1)) * 100)}%
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            DHERST AES / HECAS recipients
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Nambawan Super Participation</span>
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {Math.round((superStats.nambawanCount / (facultyMembers.length || 1)) * 100)}%
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {superStats.nambawanCount} Nambawan · {superStats.nasfundCount} Nasfund
          </div>
        </div>
      </div>

      {/* Grid: School Ratios and Regional Diversity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Faculty & Student Distribution */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Academic Schools Capacity</h3>
              <p className="text-xs text-neutral-500">
                Staffing and enrollment ratios by constituent faculty school.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">HEMIS 2026</span>
          </div>

          <div className="space-y-3">
            {schools.map(s => {
              const facultyInSchool = facultyMembers.filter(f => f.schoolId === s.id).length;
              const studentsInSchool = students.filter(stu => stu.schoolId === s.id).length;
              const ratio = Math.round(studentsInSchool / (facultyInSchool || 1));

              return (
                <div key={s.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 text-xs">{s.name} ({s.acronym})</span>
                    <span className="font-mono text-xs font-bold text-neutral-800">{ratio}:1 ratio</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>Dean: {s.deanName}</span>
                    <span className="font-mono tabular-nums text-neutral-500">
                      {facultyInSchool} Faculty · {studentsInSchool} Students
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-neutral-800 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (studentsInSchool / (students.length || 1)) * 100 * 2.5)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Representation (Highlands, Momase, Southern, NGI) */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">National Regional Representation</h3>
              <p className="text-xs text-neutral-500">
                Distribution across Papua New Guinea's four geographical regions.
              </p>
            </div>
            <MapPin className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="space-y-4">
            {regionalStats.map(r => (
              <div key={r.region} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-800">{r.region} Region</span>
                  <span className="font-mono tabular-nums text-neutral-700">
                    {r.count} students ({r.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                  <div 
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600 space-y-1 pt-3">
            <div className="font-semibold text-neutral-800">DHERST National Integration Policy:</div>
            <p className="text-[11px] text-neutral-500">
              State universities are mandated to maintain admissions diversity representing students from across all 22 provinces, ensuring balanced access to tertiary programs.
            </p>
          </div>
        </div>
      </div>

      {/* Sponsorship Matrix */}
      <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Student Financial Sponsorship Schemes</h3>
            <p className="text-xs text-neutral-500">
              Breakdown of funding sources across the enrolled student body.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">Treasury Subvention Alignment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sponsorshipStats.map(s => (
            <div key={s.type} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
              <div className="text-xs font-semibold text-neutral-900">{s.type}</div>
              <div className="flex items-center justify-between text-xs text-neutral-600">
                <span className="font-mono tabular-nums font-bold text-neutral-900">{s.count} Students</span>
                <span className="font-mono text-neutral-500">{s.percentage}% of cohort</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
