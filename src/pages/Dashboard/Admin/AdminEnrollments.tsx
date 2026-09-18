import React, { useState, useEffect } from 'react';
import { 
  Trash2, ShieldAlert, Loader2, X, Check, Search, 
  UserPlus, CheckCircle, Clock
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface EnrollmentObject {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed';
  progress: number;
  createdAt: string;
  completionDate?: string | null;
  user: {
    name: string;
    email: string;
  };
  course: {
    title: string;
  };
}

interface CourseOption {
  id: string;
  title: string;
}

export const AdminEnrollments: React.FC = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentObject[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manual enrollment form modal states
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState(0);
  const [editingStatus, setEditingStatus] = useState<'active' | 'completed'>('active');

  // Search filter
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollData, courseData] = await Promise.all([
        courseService.getAdminEnrollments(),
        courseService.getAdminCourses()
      ]);
      setEnrollments(enrollData);
      setCourses(courseData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch enrollments database index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEnrollModal = () => {
    setEnrollEmail('');
    setEnrollCourseId(courses[0]?.id || '');
    setIsEnrollModalOpen(true);
  };

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollEmail || !enrollCourseId) {
      setError('Please fill in user email and select a target course.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        email: enrollEmail.trim(),
        courseId: enrollCourseId
      };
      await courseService.createEnrollment(payload);
      setSuccess(`Student "${enrollEmail}" successfully registered and enrolled.`);
      setIsEnrollModalOpen(false);
      setError(null);
      // Reload timeline
      await fetchData();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to enroll student. Verify email exists in users registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (enrollment: EnrollmentObject) => {
    setEditingId(enrollment.id);
    setEditingProgress(enrollment.progress);
    setEditingStatus(enrollment.status);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setLoading(true);
      const payload = {
        status: editingStatus,
        progress: editingProgress
      };
      const updated = await courseService.updateEnrollment(id, payload);
      setEnrollments(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
      setEditingId(null);
      setSuccess('Enrollment tracking profile successfully updated.');
      setTimeout(() => setSuccess(null), 4000);
      setError(null);
    } catch (err) {
      setError('Failed to update student enrollment details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEnrollment = async (enroll: EnrollmentObject) => {
    const confirmMsg = `Remove enrollment record of "${enroll.user.name}" from course "${enroll.course.title}"? The student will lose tracking access to this syllabus.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await courseService.deleteEnrollment(enroll.id);
      setEnrollments(prev => prev.filter(e => e.id !== enroll.id));
      setSuccess('Enrollment record removed.');
      setTimeout(() => setSuccess(null), 4000);
      setError(null);
    } catch (err) {
      setError('Failed to delete enrollment.');
    } finally {
      setLoading(false);
    }
  };

  // Local filter for search
  const filteredEnrollments = enrollments.filter(e => 
    e.user.name.toLowerCase().includes(search.toLowerCase()) ||
    e.user.email.toLowerCase().includes(search.toLowerCase()) ||
    e.course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-stone-900">Enrollment Hub</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Track student progress profiles, inspect syllabus completions, or register manual overrides.</p>
        </div>
        <button 
          onClick={openEnrollModal}
          className="px-5 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 hover:scale-[1.02] cursor-pointer self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4" />
          Enroll Student Manually
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200/80 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input bar */}
      <div className="relative max-w-md bg-white border border-stone-200/80 p-1.5 rounded-2xl shadow-sm">
        <input
          type="text"
          placeholder="Filter by student name, email, or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Enrollments directory Table */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm overflow-hidden">
        {loading && enrollments.length === 0 ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Syncing enrollments...</span>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs font-medium">
            No registrations found in the current directory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-100 text-stone-500 font-semibold">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Program Track</th>
                  <th className="px-6 py-4">Enrolled Date</th>
                  <th className="px-6 py-4 text-center">Track Progress</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredEnrollments.map(e => {
                  const isEditing = editingId === e.id;
                  
                  return (
                    <tr key={e.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* User metadata */}
                      <td className="px-6 py-4 font-semibold text-stone-900">
                        <div className="flex flex-col">
                          <span>{e.user.name}</span>
                          <span className="text-[11px] text-stone-400 font-mono">{e.user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-stone-700">{e.course.title}</td>
                      <td className="px-6 py-4 font-mono text-stone-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                      
                      {/* Track progress */}
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editingProgress}
                              onChange={(el) => setEditingProgress(parseInt(el.target.value) || 0)}
                              className="w-16 px-2 py-1 bg-stone-50 border border-stone-200 text-stone-900 rounded-lg text-center text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <span className="text-xs text-stone-500 font-bold">%</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="font-mono text-amber-600 font-bold">{e.progress}%</span>
                            <div className="w-24 bg-stone-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full transition-all duration-300" style={{ width: `${e.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <select
                            value={editingStatus}
                            onChange={(el) => setEditingStatus(el.target.value as any)}
                            className="bg-stone-50 border border-stone-200 text-xs text-stone-900 px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                          >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            e.status === 'completed' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}>
                            {e.status === 'completed' ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-stone-500" />}
                            {e.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-1.5">
                        {isEditing ? (
                          <>
                            <button 
                              onClick={() => handleSaveEdit(e.id)}
                              className="px-3 py-1 bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 bg-white border border-stone-200 hover:bg-stone-100 text-xs font-semibold rounded-lg text-stone-700 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleStartEdit(e)}
                              className="px-3 py-1 bg-stone-50 border border-stone-200 hover:bg-stone-100 text-xs font-semibold rounded-lg text-stone-700 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteEnrollment(e)}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all inline-block cursor-pointer"
                              title="Delete Enrollment Override"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Enrollment Form Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <form 
            onSubmit={handleManualEnroll}
            className="bg-white border border-stone-200/80 rounded-3xl max-w-sm w-full p-6 text-left shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-display font-bold text-base text-stone-900">Manual Enroll Bypass</h3>
              <button 
                type="button" onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-xs text-stone-800">
              <label className="font-bold text-stone-800 block">Student Registered Email</label>
              <input
                type="email"
                required
                value={enrollEmail}
                onChange={(e) => setEnrollEmail(e.target.value)}
                placeholder="e.g. aswin@email.com"
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            {/* Course select */}
            <div className="space-y-1.5 text-xs text-stone-800">
              <label className="font-bold text-stone-800 block">Select Target Course</label>
              <select
                value={enrollCourseId}
                onChange={(e) => setEnrollCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
              >
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div className="text-right space-x-2 pt-3 border-t border-stone-100">
              <button 
                type="button" onClick={() => setIsEnrollModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={loading}
                className="px-5 py-2 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer"
              >
                Enroll Student
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
