import React, { useState, useMemo } from 'react';
import { 
  AcademicRank, 
  AppUser, 
  FacultyMember, 
  PerformanceReview, 
  UniversityInfo, 
  UniversitySchool 
} from '../types';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  UserCheck, 
  AlertCircle, 
  BookOpen, 
  Download, 
  PlusCircle, 
  X, 
  FileText, 
  TrendingUp, 
  Star,
  Printer,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface PerformanceAppraisalProps {
  university: UniversityInfo;
  currentUser: AppUser;
  facultyMembers: FacultyMember[];
  performanceReviews: PerformanceReview[];
  onAddReview: (review: PerformanceReview) => void;
  onUpdateReviewStatus: (reviewId: string, status: PerformanceReview['status']) => void;
}

export const PerformanceAppraisal: React.FC<PerformanceAppraisalProps> = ({
  university,
  currentUser,
  facultyMembers,
  performanceReviews,
  onAddReview,
  onUpdateReviewStatus,
}) => {
  const isEmployee = currentUser.role === 'Employee';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBandFilter, setSelectedBandFilter] = useState('all');
  const [selectedReviewDetails, setSelectedReviewDetails] = useState<PerformanceReview | null>(null);
  const [isNewReviewModalOpen, setIsNewReviewModalOpen] = useState(false);

  // Form State
  const [formStaffId, setFormStaffId] = useState(
    isEmployee && currentUser.staffId ? currentUser.staffId : facultyMembers[0]?.staffId || ''
  );
  const [formTeachingScore, setFormTeachingScore] = useState<number>(88);
  const [formResearchCount, setFormResearchCount] = useState<number>(3);
  const [formCommunityScore, setFormCommunityScore] = useState<number>(85);
  const [formPromotionRec, setFormPromotionRec] = useState<boolean>(false);
  const [formRecommendedRank, setFormRecommendedRank] = useState<AcademicRank>('Associate Professor');
  const [formNotes, setFormNotes] = useState('');

  // Scoped reviews
  const scopedReviews = useMemo(() => {
    if (isEmployee && currentUser.staffId) {
      return performanceReviews.filter(r => r.staffId === currentUser.staffId);
    }
    return performanceReviews;
  }, [performanceReviews, isEmployee, currentUser]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return scopedReviews.filter(r => {
      const matchesSearch = 
        r.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBand = selectedBandFilter === 'all' || r.ratingBand === selectedBandFilter;
      return matchesSearch && matchesBand;
    });
  }, [scopedReviews, searchTerm, selectedBandFilter]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = scopedReviews.length;
    const outstanding = scopedReviews.filter(r => r.ratingBand === 'Outstanding').length;
    const avgScore = total > 0 
      ? Math.round(scopedReviews.reduce((acc, r) => acc + r.overallScore, 0) / total) 
      : 0;
    const promotionsPending = scopedReviews.filter(r => r.promotionRecommended).length;

    return { total, outstanding, avgScore, promotionsPending };
  }, [scopedReviews]);

  // Handle Form Submission
  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    const faculty = facultyMembers.find(f => f.staffId === formStaffId);
    if (!faculty) return;

    // Weighted Overall: 50% Teaching, 30% Research, 20% Community
    const researchScoreWeighted = Math.min(100, formResearchCount * 25);
    const overall = Math.round(
      (formTeachingScore * 0.5) + (researchScoreWeighted * 0.3) + (formCommunityScore * 0.2)
    );

    let ratingBand: PerformanceReview['ratingBand'] = 'Meets Standards';
    if (overall >= 90) ratingBand = 'Outstanding';
    else if (overall >= 80) ratingBand = 'Exceeds Standards';
    else if (overall >= 70) ratingBand = 'Meets Standards';
    else ratingBand = 'Needs Development';

    const newReview: PerformanceReview = {
      id: `PR-${Date.now()}`,
      staffId: faculty.staffId,
      staffName: `${faculty.firstName} ${faculty.lastName}`,
      department: faculty.department,
      academicRank: faculty.academicRank,
      evaluationYear: '2026 Academic Appraisal',
      teachingEvaluationScore: formTeachingScore,
      researchOutputsCount: formResearchCount,
      communityServiceScore: formCommunityScore,
      overallScore: overall,
      ratingBand,
      promotionRecommended: formPromotionRec,
      recommendedRank: formPromotionRec ? formRecommendedRank : undefined,
      reviewerName: isEmployee ? 'Self-Review Submitted' : currentUser.name,
      reviewDate: new Date().toISOString().split('T')[0],
      status: isEmployee ? 'Submitted' : 'Confirmed',
    };

    onAddReview(newReview);
    setIsNewReviewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>{isEmployee ? 'My Average Rating' : 'Institutional Mean Score'}</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {stats.avgScore} / 100
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Council KRA academic index
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Outstanding Faculty</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 tabular-nums">
            {stats.outstanding}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            90%+ overall composite score
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Promotion Endorsements</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {stats.promotionsPending}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Recommended for rank advancement
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Total Appraisals</span>
            <FileText className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
            {stats.total}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            2026 Academic Appraisal Cycle
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">Performance Band:</span>
              <select
                value={selectedBandFilter}
                onChange={(e) => setSelectedBandFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="all">All Rating Bands</option>
                <option value="Outstanding">Outstanding (90-100)</option>
                <option value="Exceeds Standards">Exceeds Standards (80-89)</option>
                <option value="Meets Standards">Meets Standards (70-79)</option>
                <option value="Needs Development">Needs Development (&lt;70)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search staff, ID, rank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            <button
              onClick={() => setIsNewReviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEmployee ? 'Submit Self-Appraisal' : 'Conduct Appraisal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Appraisals Roster */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              {isEmployee ? 'My Academic Performance Portfolio' : 'Academic Faculty Annual Performance Reviews'}
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {university.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                <th className="py-3 px-6">Faculty Member</th>
                <th className="py-3 px-4">Evaluation Cycle</th>
                <th className="py-3 px-4">Teaching Score (50%)</th>
                <th className="py-3 px-4">Publications (30%)</th>
                <th className="py-3 px-4">Community (20%)</th>
                <th className="py-3 px-4">Composite Score</th>
                <th className="py-3 px-4">Promotion Rec</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-neutral-500">
                    No academic appraisals found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-neutral-900">{rev.staffName}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {rev.staffId} · {rev.academicRank} · {rev.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-800">
                      {rev.evaluationYear}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      {rev.teachingEvaluationScore}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-800">
                      {rev.researchOutputsCount} papers
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-800">
                      {rev.communityServiceScore}%
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-neutral-900">{rev.overallScore}%</div>
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold mt-0.5 ${
                        rev.ratingBand === 'Outstanding'
                          ? 'bg-purple-100 text-purple-900'
                          : rev.ratingBand === 'Exceeds Standards'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {rev.ratingBand}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {rev.promotionRecommended ? (
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          ✓ To {rev.recommendedRank}
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">Substantive Rank</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedReviewDetails(rev)}
                        className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200 transition-colors"
                      >
                        Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Dossier Modal */}
      {selectedReviewDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-bold text-neutral-900">
                  Official Academic Appraisal Assessment
                </h3>
              </div>
              <button 
                onClick={() => setSelectedReviewDetails(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Faculty:</span>
                  <strong className="text-neutral-900">{selectedReviewDetails.staffName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Staff ID & Rank:</span>
                  <span className="font-mono">{selectedReviewDetails.staffId} · {selectedReviewDetails.academicRank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Department:</span>
                  <span>{selectedReviewDetails.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Evaluation Cycle:</span>
                  <span>{selectedReviewDetails.evaluationYear}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-md">
                  <div className="text-[11px] text-neutral-500">Teaching Quality</div>
                  <div className="text-base font-bold font-mono text-neutral-900">{selectedReviewDetails.teachingEvaluationScore}%</div>
                  <div className="text-[10px] text-neutral-400">Student feedback</div>
                </div>
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-md">
                  <div className="text-[11px] text-neutral-500">Research Output</div>
                  <div className="text-base font-bold font-mono text-neutral-900">{selectedReviewDetails.researchOutputsCount}</div>
                  <div className="text-[10px] text-neutral-400">Peer articles</div>
                </div>
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-md">
                  <div className="text-[11px] text-neutral-500">Community / KRA</div>
                  <div className="text-base font-bold font-mono text-neutral-900">{selectedReviewDetails.communityServiceScore}%</div>
                  <div className="text-[10px] text-neutral-400">Institutional duty</div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-1">
                <div className="flex justify-between text-purple-900">
                  <span className="font-semibold">Composite Performance Band:</span>
                  <span className="font-bold">{selectedReviewDetails.ratingBand} ({selectedReviewDetails.overallScore}/100)</span>
                </div>
                {selectedReviewDetails.promotionRecommended && (
                  <div className="text-xs text-purple-800 font-medium">
                    Dean Recommendation: Formally endorsed for promotion to <strong>{selectedReviewDetails.recommendedRank}</strong>.
                  </div>
                )}
                <div className="text-[11px] text-purple-700 pt-1">
                  Endorsed by: {selectedReviewDetails.reviewerName} on {selectedReviewDetails.reviewDate}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md border border-neutral-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Certificate</span>
              </button>
              <button
                onClick={() => setSelectedReviewDetails(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Appraisal Modal */}
      {isNewReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-bold text-neutral-900">
                  {isEmployee ? 'Submit Academic Self-Appraisal' : 'Conduct Faculty Performance Review'}
                </h3>
              </div>
              <button 
                onClick={() => setIsNewReviewModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Faculty Member</label>
                {isEmployee && currentUser.staffId ? (
                  <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs font-semibold text-neutral-800">
                    {currentUser.name} ({currentUser.staffId})
                  </div>
                ) : (
                  <select
                    value={formStaffId}
                    onChange={(e) => setFormStaffId(e.target.value)}
                    className="w-full text-xs p-2 border border-neutral-300 rounded-md bg-white focus:outline-hidden"
                  >
                    {facultyMembers.map((f) => (
                      <option key={f.staffId} value={f.staffId}>
                        {f.firstName} {f.lastName} ({f.academicRank}) - {f.department}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Teaching %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formTeachingScore}
                    onChange={(e) => setFormTeachingScore(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-neutral-300 rounded-md focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Publications</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={formResearchCount}
                    onChange={(e) => setFormResearchCount(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-neutral-300 rounded-md focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Community %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formCommunityScore}
                    onChange={(e) => setFormCommunityScore(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-neutral-300 rounded-md focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="promotionRec"
                    checked={formPromotionRec}
                    onChange={(e) => setFormPromotionRec(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 border-neutral-300"
                  />
                  <label htmlFor="promotionRec" className="text-xs font-semibold text-neutral-800">
                    Recommend for Academic Promotion
                  </label>
                </div>

                {formPromotionRec && (
                  <div className="pl-6 space-y-1">
                    <label className="text-[11px] text-neutral-600">Recommended Next Rank:</label>
                    <select
                      value={formRecommendedRank}
                      onChange={(e) => setFormRecommendedRank(e.target.value as AcademicRank)}
                      className="w-full text-xs p-2 border border-neutral-300 rounded-md bg-white focus:outline-hidden"
                    >
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor">Professor</option>
                      <option value="Senior Lecturer">Senior Lecturer</option>
                      <option value="Lecturer II">Lecturer II</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewReviewModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-md shadow-xs"
                >
                  Submit Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
