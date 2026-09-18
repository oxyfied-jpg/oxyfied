import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, BookOpen, GraduationCap, 
  ShieldAlert, Loader2, BarChart3
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface KPIMetrics {
  totalCourses: number;
  totalEnrollments: number;
  activeStudents: number;
  avgProgress: number;
}

interface CourseStatPoint {
  name: string;
  students: number;
}

interface CoursePerfRecord {
  id: string;
  name: string;
  totalEnrolled: number;
  activeStudents: number;
  completionRate: number;
  avgProgress: number;
  status: string;
}

export const MentorAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States
  const [kpis, setKpis] = useState<KPIMetrics | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStatPoint[]>([]);
  const [performances, setPerformances] = useState<CoursePerfRecord[]>([]);

  // Hovered item for tooltip
  const [hoveredBar, setHoveredBar] = useState<{ idx: number; name: string; val: number } | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await courseService.getMentorAnalytics();
        setKpis(data.kpis);
        setCourseStats(data.courseEnrollmentStats);
        setPerformances(data.coursesPerformance);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to query classroom analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading && !kpis) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Generating Custom Visualizers...</span>
      </div>
    );
  }

  // Draw Responsive SVG Bar Chart
  const renderBarChart = () => {
    if (courseStats.length === 0) {
      return (
        <div className="h-56 flex flex-col items-center justify-center text-xs text-stone-400 font-medium">
          <BarChart3 className="w-8 h-8 text-stone-300 mb-2" />
          <span>Create program tracks to populate analytics charts.</span>
        </div>
      );
    }

    const width = 600;
    const height = 220;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 35;

    const maxVal = Math.max(...courseStats.map(c => c.students), 5);
    const barsCount = courseStats.length;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const barSpacing = chartWidth / barsCount;
    const barWidth = Math.max(12, Math.min(36, barSpacing * 0.55));

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-60 sm:h-72">
          <defs>
            <linearGradient id="mentorBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="mentorBarHoverGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>

          {/* Y Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * chartHeight;
            const valLabel = Math.round(maxVal * (1 - ratio));
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e7e5e4" strokeDasharray="4 4" />
                <text x={paddingLeft - 10} y={y + 3.5} fill="#a8a29e" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="end">{valLabel}</text>
              </g>
            );
          })}

          {/* Bar elements */}
          {courseStats.map((item, idx) => {
            const x = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;
            const barHeight = Math.max(4, (item.students / maxVal) * chartHeight);
            const y = height - paddingBottom - barHeight;

            const isHovered = hoveredBar?.idx === idx;

            return (
              <g key={idx} className="group">
                {/* Visual bar with gradient */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  fill={isHovered ? 'url(#mentorBarHoverGradient)' : 'url(#mentorBarGradient)'}
                  className="cursor-pointer transition-all duration-200 hover:opacity-90 filter hover:drop-shadow-[0_4px_8px_rgba(245,158,11,0.3)]"
                  onMouseEnter={() => setHoveredBar({ idx, name: item.name, val: item.students })}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                
                {/* Short truncated label underneath */}
                <text
                  x={x + barWidth / 2}
                  y={height - paddingBottom + 16}
                  fill={isHovered ? '#d97706' : '#78716c'}
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                  textAnchor="middle"
                  className="pointer-events-none transition-colors truncate max-w-[55px]"
                >
                  {item.name.length > 9 ? `${item.name.slice(0, 8)}…` : item.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredBar && (
          <div 
            className="absolute z-10 px-3.5 py-2 bg-stone-900 text-white rounded-xl shadow-xl pointer-events-none border border-stone-800 transition-all duration-150"
            style={{
              left: `${((paddingLeft + hoveredBar.idx * (chartWidth / barsCount) + (chartWidth / barsCount) / 2) / width) * 100}%`,
              top: '10%',
              transform: 'translateX(-50%)'
            }}
          >
            <span className="font-semibold text-xs block leading-tight text-white">{hoveredBar.name}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-amber-300 text-[11px] font-mono font-bold">{hoveredBar.val} enrolled students</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-stone-900 tracking-tight">Classroom Performance Analytics</h2>
          <p className="text-sm text-stone-500 mt-1">Visually inspect registration distributions, engagement velocity, and completion milestones.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-700">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-time Telemetry</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI: Courses */}
        <div className="bg-white/80 backdrop-blur-xl border border-stone-200/80 p-5 rounded-2xl shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="space-y-1 relative z-10">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Assigned Tracks</span>
            <span className="text-3xl font-display font-extrabold text-stone-900 block">{kpis?.totalCourses || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Total Enrollments */}
        <div className="bg-white/80 backdrop-blur-xl border border-stone-200/80 p-5 rounded-2xl shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="space-y-1 relative z-10">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Total Enrollments</span>
            <span className="text-3xl font-display font-extrabold text-stone-900 block">{kpis?.totalEnrollments || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Active Classroom */}
        <div className="bg-white/80 backdrop-blur-xl border border-stone-200/80 p-5 rounded-2xl shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="space-y-1 relative z-10">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Active Learners</span>
            <span className="text-3xl font-display font-extrabold text-stone-900 block">{kpis?.activeStudents || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Average progress */}
        <div className="bg-white/80 backdrop-blur-xl border border-stone-200/80 p-5 rounded-2xl shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="space-y-1 relative z-10">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Cohort Avg Progress</span>
            <span className="text-3xl font-display font-extrabold text-stone-900 block">{kpis?.avgProgress || 0}%</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid columns: Chart + Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Custom Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white/80 backdrop-blur-xl border border-stone-200/80 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-display font-bold text-base text-stone-900">
                Registration Distribution by Track
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">Enrolled student counts across your curricula</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-amber-500 to-orange-500" />
              <span>Enrollment Vol</span>
            </div>
          </div>
          {renderBarChart()}
        </div>

        {/* Table summary (5 cols) */}
        <div className="lg:col-span-5 bg-white/80 backdrop-blur-xl border border-stone-200/80 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="pb-3 border-b border-stone-100">
            <h3 className="font-display font-bold text-base text-stone-900">
              Syllabus Performance Breakdown
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Progress velocity and graduation metrics</p>
          </div>

          <div className="space-y-3 pt-1 max-h-80 overflow-y-auto pr-1">
            {performances.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 font-medium">
                No active track metrics available yet.
              </div>
            ) : (
              performances.map((perf, idx) => (
                <div key={idx} className="bg-stone-50/70 p-4 rounded-xl border border-stone-200/70 space-y-3 hover:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-stone-900 truncate">{perf.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-700 font-mono">
                      {perf.totalEnrolled} students
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">Cohort Progress</span>
                      <span className="font-mono text-stone-900 font-semibold">{perf.avgProgress}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full"
                        style={{ width: `${perf.avgProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/40">
                    <span>Active: <strong className="text-stone-800">{perf.activeStudents}</strong></span>
                    <span>Graduation Rate: <strong className="text-emerald-700">{perf.completionRate}%</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
