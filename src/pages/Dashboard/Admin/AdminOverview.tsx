import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, GraduationCap, TrendingUp, 
  Award, ShieldAlert, Loader2, ArrowUpRight, Activity 
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface KPIObject {
  totalUsers: number;
  newUsers: number;
  totalMentors: number;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  enrollmentsThisMonth: number;
  mostPopularCourse: string;
}

interface RegistrationPoint {
  date: string;
  registrations: number;
}

interface CourseEnrollmentPoint {
  name: string;
  students: number;
}

interface CoursePerfItem {
  id: string;
  name: string;
  mentor: string;
  totalEnrolled: number;
  activeStudents: number;
  completionRate: number;
  avgProgress: number;
  status: string;
}

interface MentorPerfItem {
  id: string;
  name: string;
  coursesCount: number;
  totalEnrollments: number;
  mostPopularCourse: string;
}

interface ActivityLogItem {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

export const AdminOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State from Analytics Endpoint
  const [kpis, setKpis] = useState<KPIObject | null>(null);
  const [registrationTimeline, setRegistrationTimeline] = useState<RegistrationPoint[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollmentPoint[]>([]);
  const [coursePerformance, setCoursePerformance] = useState<CoursePerfItem[]>([]);
  const [mentorPerformance, setMentorPerformance] = useState<MentorPerfItem[]>([]);
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);

  // Range filters
  const [timelineRange, setTimelineRange] = useState<'today' | '7days' | '30days' | '3months' | 'thisyear'>('30days');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; val: number } | null>(null);

  const fetchAnalytics = async (range: typeof timelineRange) => {
    try {
      setLoading(true);
      const data = await courseService.getAdminAnalytics(range);
      setKpis(data.kpis);
      setRegistrationTimeline(data.userRegistrationTimeline);
      setCourseEnrollments(data.courseEnrollmentStats);
      setCoursePerformance(data.coursePerformance);
      setMentorPerformance(data.mentorPerformance);
      setActivities(data.recentActivity);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load platform analytics details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timelineRange);
  }, [timelineRange]);

  if (loading && !kpis) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Compiling Analytics...</span>
      </div>
    );
  }

  // Draw Line Chart helpers
  const renderLineChart = () => {
    if (registrationTimeline.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-xs text-stone-400">
          No registration data in this period.
        </div>
      );
    }

    const width = 600;
    const height = 180;
    const padding = 25;

    const maxVal = Math.max(...registrationTimeline.map(d => d.registrations), 5);
    const pointsCount = registrationTimeline.length;

    // Calculate coordinates
    const coords = registrationTimeline.map((item, idx) => {
      const x = padding + (idx / (pointsCount - 1 || 1)) * (width - padding * 2);
      const y = height - padding - (item.registrations / maxVal) * (height - padding * 2);
      return { x, y, label: item.date, val: item.registrations };
    });

    let pathD = '';
    let areaD = `M ${coords[0].x} ${height - padding}`;
    
    coords.forEach((c, idx) => {
      if (idx === 0) {
        pathD += `M ${c.x} ${c.y}`;
        areaD += ` L ${c.x} ${c.y}`;
      } else {
        pathD += ` L ${c.x} ${c.y}`;
        areaD += ` L ${c.x} ${c.y}`;
      }
    });
    areaD += ` L ${coords[coords.length - 1].x} ${height - padding} Z`;

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 sm:h-56">
          <defs>
            <linearGradient id="adminAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + ratio * (height - padding * 2);
            const valLabel = Math.round(maxVal * (1 - ratio));
            return (
              <g key={idx}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                <text x={padding - 6} y={y + 3.5} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="sans-serif">{valLabel}</text>
              </g>
            );
          })}

          {/* Area under the line */}
          <path d={areaD} fill="url(#adminAreaGrad)" />
          
          {/* Main stroke line */}
          <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive dots */}
          {coords.map((c, idx) => (
            <circle
              key={idx}
              cx={c.x}
              cy={c.y}
              r={hoveredPoint?.label === c.label ? 6 : 3.5}
              fill={hoveredPoint?.label === c.label ? '#f59e0b' : '#ffffff'}
              stroke="#d97706"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredPoint(c)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute z-10 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-white rounded-xl shadow-lg whitespace-nowrap pointer-events-none text-left border border-slate-700"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 12}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <span className="font-bold text-amber-400 text-xs block">{hoveredPoint.val} Registrations</span>
            <span className="text-slate-300 text-[10px] block">{hoveredPoint.label}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-stone-900 tracking-tight">Platform Analytics</h2>
          <p className="text-xs text-stone-500 mt-0.5">Platform growth, syllabus completions, and administrative operation telemetry.</p>
        </div>

        {/* Time filters */}
        <div className="flex bg-white border border-stone-200 p-1 rounded-xl self-start shadow-xs">
          {(['7days', '30days', '3months', 'thisyear'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimelineRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timelineRange === range 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {range === '7days' && '7 Days'}
              {range === '30days' && '30 Days'}
              {range === '3months' && '3 Months'}
              {range === 'thisyear' && 'This Year'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200/80 text-rose-800 text-xs rounded-2xl flex items-center gap-3 font-medium shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI: Total Users */}
        <div className="bg-white border border-stone-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Total Users</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 block">{kpis?.totalUsers || 0}</span>
            <span className="text-[11px] text-stone-500 block font-medium">
              <span className="text-amber-600 font-bold">+{kpis?.newUsers || 0}</span> in 30d
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Total Mentors */}
        <div className="bg-white border border-stone-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Total Mentors</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 block">{kpis?.totalMentors || 0}</span>
            <span className="text-[11px] text-stone-500 block font-medium">Instructors & Guides</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Courses */}
        <div className="bg-white border border-stone-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Total Programs</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 block">{kpis?.totalCourses || 0}</span>
            <span className="text-[11px] text-stone-500 block font-medium">
              <span className="text-emerald-600 font-bold">{kpis?.activeCourses || 0}</span> published tracks
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Total Enrollments */}
        <div className="bg-white border border-stone-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Enrollments</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 block">{kpis?.totalEnrollments || 0}</span>
            <span className="text-[11px] text-stone-500 block font-medium">
              <span className="text-amber-600 font-bold">+{kpis?.enrollmentsThisMonth || 0}</span> this month
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* KPI Popular course highlight bar */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/70 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Top Enrolled Track</span>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 block mt-0.5">{kpis?.mostPopularCourse || 'N/A'}</h4>
          </div>
        </div>
        <div className="text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300/60 shadow-xs">
          Highest Student Volume
        </div>
      </div>

      {/* Graphs columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registration Line Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-stone-200/80 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-stone-900">User Registration Trajectory</h3>
              <p className="text-xs text-stone-500">Student and mentor signups across time</p>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-mono font-bold border border-emerald-200/60">Live DB</span>
          </div>
          {renderLineChart()}
        </div>

        {/* Enrollment Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-stone-200/80 p-6 rounded-3xl shadow-sm space-y-4 text-left">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-display font-bold text-base text-stone-900">Course Distribution</h3>
            <p className="text-xs text-stone-500">Share of total student enrollments</p>
          </div>
          
          <div className="space-y-4 pt-1">
            {courseEnrollments.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8">No courses loaded yet.</p>
            ) : (
              courseEnrollments.map((c, idx) => {
                const total = kpis?.totalEnrollments || 1;
                const percent = Math.round((c.students / total) * 100);
                
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-stone-800">
                      <span className="truncate pr-4">{c.name}</span>
                      <span className="font-mono text-amber-600 font-bold">{c.students} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Lists grids: Courses vs Mentors */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Course Performance */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-display font-bold text-base text-stone-900">Course Performance</h3>
            <p className="text-xs text-stone-500">Completion rates and active students per course</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-semibold">
                  <th className="py-3 px-2">Course Name</th>
                  <th className="py-3 px-2">Mentor</th>
                  <th className="py-3 px-2 text-right">Students</th>
                  <th className="py-3 px-2 text-right">Completion</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {coursePerformance.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-2 font-semibold text-stone-900 truncate max-w-[150px]">{c.name}</td>
                    <td className="py-3.5 px-2 text-stone-500">{c.mentor}</td>
                    <td className="py-3.5 px-2 text-right font-mono font-bold">{c.totalEnrolled}</td>
                    <td className="py-3.5 px-2 text-right font-mono text-amber-600 font-bold">{c.completionRate}%</td>
                    <td className="py-3.5 px-2 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mentor Performance */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-display font-bold text-base text-stone-900">Mentor Registry Stats</h3>
            <p className="text-xs text-stone-500">Instructor load and student registrations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-semibold">
                  <th className="py-3 px-2">Mentor Name</th>
                  <th className="py-3 px-2 text-center">Courses</th>
                  <th className="py-3 px-2 text-right">Total Enrollments</th>
                  <th className="py-3 px-2 text-right">Top Program</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {mentorPerformance.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-2 font-semibold text-stone-900">{m.name}</td>
                    <td className="py-3.5 px-2 text-center font-mono font-bold">{m.coursesCount}</td>
                    <td className="py-3.5 px-2 text-right font-mono text-amber-600 font-bold">{m.totalEnrollments}</td>
                    <td className="py-3.5 px-2 text-right truncate max-w-[150px] text-stone-500">{m.mostPopularCourse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white border border-stone-200/80 p-6 rounded-3xl shadow-sm space-y-4 text-left">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              Recent System Activity
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Real-time platform events and audits</p>
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
            Live Stream
          </span>
        </div>

        <div className="space-y-3.5 pt-1 max-h-72 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-6">No records registered yet.</p>
          ) : (
            activities.map((log) => (
              <div key={log.id} className="flex gap-3.5 border-b border-stone-100 pb-3.5 last:border-0 last:pb-0 items-start">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <span className="text-xs font-semibold text-stone-900 block">{log.details}</span>
                  <span className="text-[11px] text-stone-400 block font-mono">
                    {new Date(log.createdAt).toLocaleString()} • Action: {log.action}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
