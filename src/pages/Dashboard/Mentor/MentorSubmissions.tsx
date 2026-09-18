import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, ShieldAlert, Loader2, Download, FolderGit2, ChevronDown, ExternalLink
} from 'lucide-react';
import { courseService } from '../../../services/courseService';
import api from '../../../services/api';

interface CourseOption {
  id: string;
  title: string;
  category: string;
}

interface ProjectSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  lessonTitle: string;
  googleDriveUrl?: string;
  fileName: string;
  filePath: string;
  fileSize: string;
  createdAt: string;
  updatedAt?: string;
}

export const MentorSubmissions: React.FC = () => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSubmissionsData = async () => {
      try {
        setLoading(true);
        // Fetch mentor's courses for the filter dropdown
        const coursesData = await courseService.getMentorCourses();
        setCourses(coursesData);

        // Fetch all student project submissions for mentor's courses
        const subsData = await courseService.getMentorSubmissions();
        setSubmissions(subsData);
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch student project submissions.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissionsData();
  }, []);

  // Filter project submissions based on selection & search string
  const filteredSubmissions = submissions.filter(s => {
    // Filter by selected course
    const courseMatches = selectedCourseId === 'all' || s.courseTitle.toLowerCase() === courses.find(c => c.id === selectedCourseId)?.title.toLowerCase();
    
    // Filter by student search query (name or email or lesson title or url)
    const searchMatches = 
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.lessonTitle.toLowerCase().includes(search.toLowerCase()) ||
      (s.googleDriveUrl && s.googleDriveUrl.toLowerCase().includes(search.toLowerCase())) ||
      s.fileName.toLowerCase().includes(search.toLowerCase());

    return courseMatches && searchMatches;
  });

  if (loading && submissions.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Loading Student Submissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-stone-900 tracking-tight">Project Submissions</h2>
          <p className="text-sm text-stone-500 mt-1">Review student project submissions and inspect submitted Google Drive projects across your tracks.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-700">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>{filteredSubmissions.length} Submissions</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/80 backdrop-blur-xl border border-stone-200/80 p-4 rounded-2xl shadow-xs">
        {/* Course Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none cursor-pointer transition-all hover:border-stone-300"
          >
            <option value="all">All Assigned Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <BookOpen className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Text Search Bar */}
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Search by student name, email, lesson module, or link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all hover:border-stone-300"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Submissions List Container */}
      <div className="bg-white/80 backdrop-blur-xl border border-stone-200/80 rounded-2xl shadow-xs overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-700">No project submissions found</p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm">
              No student submissions have been submitted matching your active search and course filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course Program & Lesson</th>
                  <th className="px-6 py-4">Submitted Project</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredSubmissions.map((sub) => {
                  const baseURL = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : (typeof window !== 'undefined' ? window.location.origin : '');
                  const fileUrl = `${baseURL}${sub.filePath}`;
                  const initials = sub.studentName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

                  return (
                    <tr key={sub.id} className="hover:bg-amber-50/30 transition-colors group">
                      {/* Student Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center text-amber-700 font-bold text-xs">
                            {initials || 'ST'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">{sub.studentName}</span>
                            <span className="text-[11px] text-stone-400 font-mono">{sub.studentEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Course / Lesson details */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-stone-900">{sub.courseTitle}</span>
                          <span className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {sub.lessonTitle}
                          </span>
                        </div>
                      </td>

                      {/* File / Link Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5 max-w-[240px]">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 flex-shrink-0">
                            <FolderGit2 className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col truncate">
                            {sub.googleDriveUrl ? (
                              <>
                                <a 
                                  href={sub.googleDriveUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="font-semibold text-stone-800 hover:text-amber-600 transition-colors truncate flex items-center gap-1"
                                >
                                  <span className="truncate">Google Drive Project</span>
                                  <ExternalLink className="w-3 h-3 text-amber-600 flex-shrink-0" />
                                </a>
                                <span className="text-[10px] text-emerald-600 font-medium">Google Drive Link</span>
                              </>
                            ) : (
                              <>
                                <a 
                                  href={fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="font-semibold text-stone-800 hover:text-amber-600 transition-colors truncate"
                                >
                                  {sub.fileName || 'Project File'}
                                </a>
                                <span className="text-[10px] text-stone-400 font-mono mt-0.5">{sub.fileSize}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date Submitted */}
                      <td className="px-6 py-4 text-stone-600 font-mono text-xs">
                        {new Date(sub.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        {sub.googleDriveUrl ? (
                          <a 
                            href={sub.googleDriveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 border border-amber-500 hover:border-amber-400 px-3.5 py-2 rounded-xl transition-all shadow-xs group/btn cursor-pointer"
                          >
                            <span>Open Google Drive Project</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                          </a>
                        ) : (
                          <a 
                            href={fileUrl} 
                            download
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-amber-500 hover:text-white border border-stone-200 hover:border-amber-600 px-3.5 py-2 rounded-xl transition-all shadow-xs group/btn"
                          >
                            <Download className="w-3.5 h-3.5 text-stone-500 group-hover/btn:text-white transition-colors" />
                            <span>Download</span>
                          </a>
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
    </div>
  );
};
