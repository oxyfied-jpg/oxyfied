import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, Award, Play, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';
import type { Course } from '../../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dynamic courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch courses from Neon on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses for dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter courses user has purchased/enrolled
  const enrolledCourses = courses.filter((c) => (user?.enrolledCourses || []).includes(c.id));
  const recommendedCourses = courses.filter((c) => c.status === 'available' && !(user?.enrolledCourses || []).includes(c.id));

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Loading Dashboard...</span>
      </div>
    );
  }

  // Calculate metrics
  const totalEnrolled = enrolledCourses.length;
  let totalCompletedLessons = 0;
  if (user?.progress) {
    Object.values(user.progress).forEach((lessonList) => {
      totalCompletedLessons += lessonList.length;
    });
  }

  // Helper: Get progress percentage for a course
  const getCourseProgress = (courseId: string, totalLessons: number) => {
    if (!user?.progress || !user.progress[courseId]) return 0;
    const completed = user.progress[courseId].length;
    return Math.min(100, Math.round((completed / totalLessons) * 100));
  };

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Welcome banner / User hero card */}
      <div className="bg-white/95 backdrop-blur-xl text-stone-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 text-center md:text-left relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-semibold rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Active Learning Workspace
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 tracking-tight">
            Welcome back, {user?.name || 'Learner'}!
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm max-w-xl leading-relaxed">
            Resume building industry skills. Track your syllabus milestones across practical hands-on labs and technical modules.
          </p>
        </div>
        
        {/* Continue action button */}
        {enrolledCourses.length > 0 && (
          <button
            onClick={() => {
              const active = enrolledCourses[0];
              const firstLessonId = active.modules?.[0]?.lessons?.[0]?.id || '';
              navigate(`/dashboard/learn/${active.id}/${firstLessonId}`);
            }}
            className="px-6 py-3.5 text-xs font-bold rounded-xl flex items-center gap-2.5 shadow-md shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white relative z-10 flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Continue Learning</span>
            <Play className="w-4 h-4 fill-current" />
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric: Enrolled */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Enrolled Tracks</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 block mt-0.5">{totalEnrolled}</span>
          </div>
        </div>

        {/* Metric: Progress */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Completed Lessons</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 block mt-0.5">{totalCompletedLessons}</span>
          </div>
        </div>

        {/* Metric: Certs */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Certificates Earned</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 block mt-0.5">
              {enrolledCourses.filter(c => getCourseProgress(c.id, c.lessons) === 100).length}
            </span>
          </div>
        </div>
      </div>

      {/* Main dashboard columns: Current Courses (8) vs Suggestions (4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active Enrolled Courses (8 cols) */}
        <section className="lg:col-span-8 space-y-5 w-full min-w-0">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 className="font-display font-bold text-lg text-stone-900">
              My Enrolled Tracks
            </h3>
            <span className="text-xs text-stone-500 font-medium">{enrolledCourses.length} active programs</span>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="bg-white border border-stone-200/80 p-12 rounded-3xl text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-stone-900 text-lg">No courses enrolled yet</h4>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-sm mx-auto">
                Explore our Cybersecurity or Data Science programs to unlock interactive labs, sandbox simulators, and verified credentials.
              </p>
              <div className="pt-2">
                <Link
                  to="/courses"
                  className="px-6 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 hover:scale-[1.02]"
                >
                  Explore Core Tracks
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {enrolledCourses.map((course) => {
                const progressPercentage = getCourseProgress(course.id, course.lessons);
                const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id || '';
                
                return (
                  <div
                    key={course.id}
                    className="w-full box-border bg-white border border-stone-200/80 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-300/80 transition-all duration-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 min-w-0"
                  >
                    <div className="flex gap-4 items-center flex-1 min-w-0 w-full">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-20 h-16 rounded-xl object-cover ring-1 ring-stone-200 hidden sm:block shrink-0"
                      />
                      <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0 text-left">
                        <span className="inline-block text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                          {course.category}
                        </span>
                        <h4 className="font-display font-bold text-base text-stone-900 leading-snug break-words">
                          {course.title}
                        </h4>
                        
                        {/* Progress Bar container */}
                        <div className="flex items-center gap-3 pt-0.5 w-full max-w-xs">
                          <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden min-w-0">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-stone-600 font-bold font-mono shrink-0">{progressPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                      {progressPercentage === 100 && (
                        <Link
                          to="/dashboard/certificates"
                          className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-1.5 hover:scale-[1.02] shrink-0"
                        >
                          <Award className="w-3.5 h-3.5 shrink-0" />
                          <span>Apply for Certificate</span>
                        </Link>
                      )}
                      <button
                        onClick={() => navigate(`/dashboard/learn/${course.id}/${firstLessonId}`)}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap bg-stone-900 hover:bg-amber-500 hover:text-slate-950 text-white transition-all duration-200 cursor-pointer shadow-xs flex items-center justify-center shrink-0"
                      >
                        Enter Classroom
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recommended Tracks (4 cols) */}
        <aside className="lg:col-span-4 bg-white border border-stone-200/80 p-6 rounded-3xl shadow-sm space-y-5 text-left">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="font-display font-bold text-base text-stone-900">
              Recommended Tracks
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Explore featured programs</p>
          </div>

          {recommendedCourses.length === 0 ? (
            <p className="text-xs text-stone-500 text-center py-6 font-medium">You're enrolled in all available tracks!</p>
          ) : (
            <div className="space-y-4">
              {recommendedCourses.map((c) => (
                <div key={c.id} className="space-y-2.5 border-b border-stone-100 last:border-0 pb-4 last:pb-0">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                      {c.category}
                    </span>
                    <h4 className="font-display font-bold text-sm text-stone-900 block leading-snug">
                      {c.title}
                    </h4>
                    <span className="text-[11px] text-stone-500 font-medium block">{c.duration} duration</span>
                  </div>
                  <Link
                    to={`/courses/${c.slug}`}
                    className="w-full py-2 text-xs font-semibold rounded-xl text-center block bg-stone-50 hover:bg-amber-500 hover:text-slate-950 text-stone-800 border border-stone-200 hover:border-transparent transition-all duration-200 shadow-xs"
                  >
                    View Curriculum
                  </Link>
                </div>
              ))}
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};
