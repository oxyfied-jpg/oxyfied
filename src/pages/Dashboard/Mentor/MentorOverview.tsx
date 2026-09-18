import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, Award, TrendingUp, ShieldAlert, 
  Loader2, ArrowRight, CheckCircle2, Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { courseService } from '../../../services/courseService';
import { certificateService } from '../../../services/certificateService';

interface KPIMetrics {
  totalCourses: number;
  totalEnrollments: number;
  activeStudents: number;
  avgProgress: number;
}

interface MentorCoursePerf {
  id: string;
  name: string;
  totalEnrolled: number;
  activeStudents: number;
  completionRate: number;
  avgProgress: number;
  status: string;
}

export const MentorOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard states
  const [kpis, setKpis] = useState<KPIMetrics | null>(null);
  const [performances, setPerformances] = useState<MentorCoursePerf[]>([]);
  const [pendingCertCount, setPendingCertCount] = useState(0);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const [data, certRequests] = await Promise.all([
          courseService.getMentorAnalytics(),
          certificateService.getMentorCertificateRequests().catch(() => [])
        ]);
        setKpis(data.kpis);
        setPerformances(data.coursesPerformance);
        const pending = (Array.isArray(certRequests) ? certRequests : []).filter((r: any) => r.status === 'pending').length;
        setPendingCertCount(pending);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch your mentor profile analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading && !kpis) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Loading Workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header section */}
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-2xl font-display font-extrabold text-stone-900">Mentor Command</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Review performance metrics across your assigned programs, student tracking, and certificate project verifications.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200/80 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pending Certificate Reviews Alert Banner */}
      {pendingCertCount > 0 && (
        <div className="p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-300 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-bold text-stone-900 text-sm">
                {pendingCertCount} Student Certificate {pendingCertCount === 1 ? 'Application' : 'Applications'} Pending Review
              </h4>
              <p className="text-xs text-stone-600">
                Students have completed course syllabi and submitted requests for project verification and certificate issuance.
              </p>
            </div>
          </div>
          <Link
            to="/mentor/dashboard/certificates"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm flex items-center gap-2 flex-shrink-0 transition-all hover:scale-[1.02]"
          >
            <span>Review Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI: Courses Assigned */}
        <div className="bg-white border border-stone-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">My Courses</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 block">{kpis?.totalCourses || 0}</span>
            <span className="text-[11px] text-stone-500 block font-medium">Active syllabus tracks</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Total Enrollments */}
        <div className="bg-white border border-stone-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Total Learners</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 block">{kpis?.totalEnrollments || 0}</span>
            <span className="text-[11px] text-stone-500 block font-medium">Across all classrooms</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Active Classroom */}
        <div className="bg-white border border-stone-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Active Rosters</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 block">{kpis?.activeStudents || 0}</span>
            <span className="text-[11px] text-stone-500 block font-medium">Currently training</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Average progress */}
        <div className="bg-white border border-stone-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Avg Progress</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 block">{kpis?.avgProgress || 0}%</span>
            <span className="text-[11px] text-stone-500 block font-medium">Completion rate</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Classroom Checklist Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/70 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-amber-600" />
            Classroom Delivery & Quality Checklist
          </h3>
          <p className="text-xs text-stone-600">Maintain active syllabus modules, review student project submissions weekly, and inspect progress metrics.</p>
        </div>
        <Link 
          to="/mentor/dashboard/courses"
          className="px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 hover:scale-[1.02] flex-shrink-0"
        >
          My Syllabus Courses <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Course Performance Lists */}
      <div className="bg-white border border-stone-200/80 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="font-display font-bold text-base text-stone-900">
            Courses Registry Stats
          </h3>
          <p className="text-xs text-stone-500">Student enrollment volume and syllabus progress per course</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-100 text-stone-500 font-semibold">
                <th className="px-6 py-4">Course Program</th>
                <th className="px-6 py-4 text-center">Classroom Size</th>
                <th className="px-6 py-4 text-center">Active Learners</th>
                <th className="px-6 py-4 text-center">Classroom Progress</th>
                <th className="px-6 py-4 text-center">Completion Rate</th>
                <th className="px-6 py-4 text-right">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {performances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400 italic font-medium">
                    You have not registered any syllabus courses on the platform yet.
                  </td>
                </tr>
              ) : (
                performances.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-stone-900 truncate max-w-[200px]">{c.name}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-amber-600">{c.totalEnrolled}</td>
                    <td className="px-6 py-4 text-center font-mono text-stone-500">{c.activeStudents}</td>
                    
                    {/* Progress bar */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="font-mono text-xs text-stone-700 font-semibold">{c.avgProgress}%</span>
                        <div className="w-24 bg-stone-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full transition-all duration-300" style={{ width: `${c.avgProgress}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center font-mono font-bold text-amber-600">{c.completionRate}%</td>
                    
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'available' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
