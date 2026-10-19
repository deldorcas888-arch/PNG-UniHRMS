import React, { useState } from 'react';
import { UniversityInfo, UniversityInquiry } from '../types';
import { 
  Building2, 
  Mail, 
  Phone, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Landmark, 
  Clock, 
  FileCheck, 
  Download, 
  Server, 
  Users, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  HelpCircle,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface UniversityIntegrationPortalProps {
  currentUniversity: UniversityInfo;
  universities: UniversityInfo[];
  inquiries: UniversityInquiry[];
  onAddInquiry: (inquiry: UniversityInquiry) => void;
}

export const UniversityIntegrationPortal: React.FC<UniversityIntegrationPortalProps> = ({
  currentUniversity,
  universities,
  inquiries,
  onAddInquiry,
}) => {
  const [formUniName, setFormUniName] = useState(currentUniversity.name);
  const [formRepName, setFormRepName] = useState('');
  const [formTitle, setFormTitle] = useState('Registrar / HR Director');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('+675 ');
  const [formHeadcount, setFormHeadcount] = useState('250 - 500 Staff');
  const [formDeployment, setFormDeployment] = useState('Managed PNG Cloud (NICTA / Port Moresby)');
  const [formTargetDate, setFormTargetDate] = useState('Semester 1, 2027 (FN 01)');
  const [formNotes, setFormNotes] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'Faculty Payroll & IRC SWT',
    'Staff Leave & Kastom Bereavement',
    'Staff Loans & SACCO Advances',
    'Recruitment & Onboarding',
    'Attendance & Timesheets',
  ]);

  const [submittedInquiry, setSubmittedInquiry] = useState<UniversityInquiry | null>(null);

  const toggleModule = (moduleName: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleName)
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRepName || !formEmail) return;

    const newInq: UniversityInquiry = {
      id: `INQ-${Math.floor(100 + Math.random() * 900)}`,
      universityName: formUniName,
      representativeName: `${formRepName} (${formTitle})`,
      officialEmail: formEmail,
      phone: formPhone,
      facultyAndStaffCount: formHeadcount,
      modulesNeeded: selectedModules,
      notes: `${formDeployment} · Target: ${formTargetDate}. ${formNotes}`,
      status: 'New Inquiry',
      submittedAt: new Date().toISOString().split('T')[0],
    };

    onAddInquiry(newInq);
    setSubmittedInquiry(newInq);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Integration Banner */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 rounded-2xl p-6 sm:p-10 text-white border border-neutral-700 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <Building2 className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Papua New Guinea Higher Education HRMS Implementation
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-balance text-white">
            Implement PNG UniHR for Your University
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Interested in deploying an HR & Staff system built specifically for Papua New Guinean tertiary institutions? 
            PNG UniHR comes fully configured with <strong>PNG Internal Revenue Commission (IRC) SWT tax tables</strong>, 
            <strong>Nambawan Super & Nasfund electronic schedules</strong>, <strong>Bank South Pacific (BSP) EFT batch dispatches</strong>, 
            and <strong>Melanesian Kastom & Haus Krai leave workflows</strong> compliant with the PNG Employment Act 1978.
          </p>

          {/* Contact Direct Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2 bg-neutral-800/80 px-3.5 py-2 rounded-lg border border-neutral-700">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Direct Implementation Contact:</span>
              <a 
                href="mailto:ddel@emtv.com.pg?subject=PNG%20University%20HRMS%20Integration%20Request"
                className="font-bold text-amber-300 hover:underline"
              >
                ddel@emtv.com.pg
              </a>
            </div>

            <div className="flex items-center gap-2 bg-neutral-800/80 px-3.5 py-2 rounded-lg border border-neutral-700">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Base: Port Moresby, Papua New Guinea</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Request Form + Technical Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-600" />
              University Integration Request Form
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Submit your institution's profile for a customized deployment proposal, migration plan, and live demonstration.
            </p>
          </div>

          <form onSubmit={handleSubmitInquiry} className="space-y-4 text-xs">
            {/* University Selection */}
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Select Tertiary Institution</label>
              <select
                value={formUniName}
                onChange={(e) => setFormUniName(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                {universities.map(u => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.acronym}) - {u.location}
                  </option>
                ))}
                <option value="Pacific Adventist University (PAU)">Pacific Adventist University (PAU) - Koiari Park</option>
                <option value="Sonoma Adventist College">Sonoma Adventist College - Kokopo, ENBP</option>
                <option value="National Polytechnic Institute of PNG">National Polytechnic Institute of PNG - Lae</option>
                <option value="Custom Tertiary Institution">Other PNG Tertiary College / Institute</option>
              </select>
            </div>

            {/* Representative Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Official Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kila Kila"
                  value={formRepName}
                  onChange={(e) => setFormRepName(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Designation / Role</label>
                <input
                  type="text"
                  placeholder="e.g. University Registrar / Bursar"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>

            {/* Contact Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Official Institutional Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. registrar@upng.ac.pg"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Phone / WhatsApp (+675)</label>
                <input
                  type="tel"
                  placeholder="+675 7... or landline"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>

            {/* Staff Size & Deployment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Estimated Total Staff Count</label>
                <select
                  value={formHeadcount}
                  onChange={(e) => setFormHeadcount(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 focus:outline-hidden"
                >
                  <option value="Under 100 Staff">Under 100 Staff</option>
                  <option value="100 - 250 Staff">100 - 250 Staff</option>
                  <option value="250 - 500 Staff">250 - 500 Staff</option>
                  <option value="500 - 1,200 Staff">500 - 1,200 Staff (Large Multi-Campus)</option>
                  <option value="1,200+ Staff">1,200+ Staff (UPNG / UNITECH scale)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Target Go-Live Period</label>
                <select
                  value={formTargetDate}
                  onChange={(e) => setFormTargetDate(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 focus:outline-hidden"
                >
                  <option value="Immediate / Pilot (Current Fortnight)">Immediate / Pilot (Current Fortnight)</option>
                  <option value="Semester 1, 2027 (FN 01)">Semester 1, 2027 (FN 01)</option>
                  <option value="Semester 2, 2027">Semester 2, 2027</option>
                  <option value="Fiscal Year 2027 Planning">Fiscal Year 2027 Planning</option>
                </select>
              </div>
            </div>

            {/* Modules Multi-select Checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="font-semibold text-neutral-700 block">
                Required HRMS System Modules
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Faculty Payroll & IRC SWT',
                  'Staff Leave & Kastom Bereavement',
                  'Staff Loans & SACCO Advances',
                  'Recruitment & Onboarding',
                  'Attendance & Timesheets',
                  'Performance Appraisals',
                  'Faculty & Staff Directory',
                  'HR Compliance Reports'
                ].map((mod) => (
                  <label 
                    key={mod}
                    className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                      selectedModules.includes(mod)
                        ? 'bg-amber-50/70 border-amber-300 text-neutral-900 font-medium'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(mod)}
                      onChange={() => toggleModule(mod)}
                      className="w-3.5 h-3.5 rounded text-amber-600 border-neutral-300"
                    />
                    <span>{mod}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-1 pt-1">
              <label className="font-semibold text-neutral-700">
                Legacy Systems & Special Requirements
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Currently using manual Excel sheets and Alesco payroll. Need data migration for 350 staff and direct connection with BSP Port Moresby branch..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit University Integration Request</span>
              </button>
              <p className="text-[11px] text-neutral-400 text-center mt-2">
                Sent directly to <strong>ddel@emtv.com.pg</strong>. A representative will contact your office within 24 hours.
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Why Choose & Readiness Specs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Creator Profile Box */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                DD
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Danley Del</h3>
                <div className="text-xs text-neutral-500">System Architect & HRMS Integrator</div>
                <div className="text-xs text-amber-700 font-medium">EMTV & PNG Tertiary Systems</div>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Leading the development of modern human resource and institutional software tailored for Papua New Guinea universities, colleges, and national educational institutions.
            </p>

            <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
              <a
                href="mailto:ddel@emtv.com.pg?subject=University%20HRMS%20Consultation"
                className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email: ddel@emtv.com.pg</span>
              </a>
            </div>
          </div>

          {/* PNG Statutory Certifications */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pre-Configured PNG Compliance
            </h3>

            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">IRC Salary & Wages Tax (SWT)</strong>
                  Official 26-fortnight resident tax brackets with K20,000 threshold and allowances.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">Nambawan Super & Nasfund Schedules</strong>
                  Automatic calculation of 6.0% employee and 8.4% employer statutory superannuation.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">PNG Banking EFT Batch Formats</strong>
                  Export ready for Bank South Pacific (BSP) electronic funds transfer and Kina Bank payroll.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">Melanesian Kastom Bereavement Leave</strong>
                  Specialized tracking for Haus Krai and wantok community obligations with duty relief.
                </div>
              </div>
            </div>
          </div>

          {/* Active Pipeline Status */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Current Institution Pipeline
              </h3>
              <span className="text-[11px] font-mono text-neutral-500">
                {inquiries.length} inquiries
              </span>
            </div>

            <div className="space-y-2.5">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-neutral-900 font-semibold">{inq.universityName}</strong>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      inq.status === 'Consultation Scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : inq.status === 'Proposal Sent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inq.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Rep: {inq.representativeName}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    Logged: {inq.submittedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal upon Submission */}
      {submittedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-neutral-900">
                  Integration Request Received
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-neutral-600">
              <p>
                Thank you, <strong>{submittedInquiry.representativeName}</strong>. Your integration request for <strong>{submittedInquiry.universityName}</strong> has been registered successfully.
              </p>

              <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 font-mono space-y-1.5">
                <div>Reference ID: <strong className="text-neutral-900">{submittedInquiry.id}</strong></div>
                <div>Institution: {submittedInquiry.universityName}</div>
                <div>Staff Cohort: {submittedInquiry.facultyAndStaffCount}</div>
                <div>Status: <span className="text-emerald-700 font-semibold">Ready for Architecture Review</span></div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                <div className="font-semibold">Next Implementation Step:</div>
                <div className="text-[11px]">
                  Our lead architect (<strong>ddel@emtv.com.pg</strong>) will review your legacy structure and forward an official technical memorandum and sample staging database within 24 hours.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => setSubmittedInquiry(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
