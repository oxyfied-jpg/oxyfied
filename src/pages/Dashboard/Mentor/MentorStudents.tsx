import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Clock, CheckCircle2, ShieldAlert, Loader2, Users, GraduationCap, ChevronDown
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface CourseOption {
  id: string;
  title: string;
  category: string;
}

interface StudentEnrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  enrollmentDate: string;
  status: 'active' | 'completed';
  progress: number;
}

export const MentorStudents: React.FC = () => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selector & Search filters
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [search, setSearch] = useState('');

  // 1. Fetch mentor's courses first
  useEffect(() => {
    const fetchMentorCourses = async () => {
      try {
        setLoading(true);
        const data = await courseService.getMentorCourses();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch assigned program tracks.');
      } finally {
        setLoading(false);
      }
    };
    fetchMentorCourses();
  }, []);

  // 2. Fetch student roster when course selector changes
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchClassroom = async () => {
      try {
        setLoadingStudents(true);
        const roster = await courseService.getMentorCourseStudents(selectedCourseId);
        setStudents(roster);
        setError(null);
      } catch (err) {
        setError('Failed to load student roster for selected course.');
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchClassroom();
  }, [selectedCourseId]);

  // Local filter for searches
  const filteredStudents = students.filter(s => 
    s.studentName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentEmail.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Loading Classroom Rosters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-stone-900 tracking-tight">Student Roster</h2>
          <p className="text-sm text-stone-500 mt-1">Review learning milestones across classroom cohorts and coordinate student guidance.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-700">
            <Users className="w-3.5 h-3.5" />
            <span>{students.length} Enrolled in Track</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/80 backdrop-blur-xl border border-stone-200/80 p-4 rounded-2xl shadow-xs">
        {/* Course dropdown */}
        <div className="relative">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none cursor-pointer transition-all hover:border-stone-300"
          >
            {courses.length === 0 ? (
              <option value="">No Active Courses</option>
            ) : (
              courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)
            )}
          </select>
          <BookOpen className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Search by name/email */}
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Search student by full name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={!selectedCourseId}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-40 transition-all hover:border-stone-300"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-stone-200/80 rounded-2xl shadow-xs overflow-hidden">
        {loadingStudents ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Syncing cohort roster...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-700">No students found</p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm">
              {selectedCourseId ? 'No students enrolled matching the query in this track.' : 'Please select an active course track above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-4">Student Profile</th>
                  <th className="px-6 py-4">Enrollment Date</th>
                  <th className="px-6 py-4 text-center">Progress Meter</th>
                  <th className="px-6 py-4 text-right">Completion Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredStudents.map(student => {
                  const initials = student.studentName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                  
                  return (
                    <tr key={student.id} className="hover:bg-amber-50/30 transition-colors group">
                      {/* Student profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center text-amber-700 font-bold text-xs">
                            {initials || 'ST'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">{student.studentName}</span>
                            <span className="text-[11px] text-stone-400 font-mono">{student.studentEmail}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-stone-600 font-mono text-xs">
                        {new Date(student.enrollmentDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      
                      {/* Classroom progress */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5 max-w-[140px] mx-auto">
                          <div className="flex items-center justify-between w-full text-[11px]">
                            <span className="text-stone-400 font-medium">Completed</span>
                            <span className="font-mono text-stone-900 font-bold">{student.progress}%</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                          student.status === 'completed' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                            : 'bg-amber-50 text-amber-700 border-amber-200/60'
                        }`}>
                          {student.status === 'completed' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Graduated</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>In Progress</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
