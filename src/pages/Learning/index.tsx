import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Play, CheckCircle2, Circle, 
  Download, FileText, ShieldAlert, Trash2, FolderGit2,
  ExternalLink, Link2, Loader2, Award 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import api from '../../services/api';
import type { Lesson, Course } from '../../types';

export const Learning: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  
  const { user, isEnrolled, completeLesson, isLessonCompleted, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'desc' | 'resources' | 'notes' | 'project'>('desc');
  const [noteInput, setNoteInput] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [lessonResources, setLessonResources] = useState<any[]>([]);
  
  // Google Drive project link submission state
  const [driveLinkInput, setDriveLinkInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Dynamic course state
  const [course, setCourse] = useState<Course | null>(null);
  const [isCourseLoading, setIsCourseLoading] = useState(true);

  // Load course details on mount / courseId change
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setIsCourseLoading(true);
        const data = await courseService.getCourseBySlug(courseId);
        setCourse(data);
      } catch (err) {
        console.error('Failed to load learning course catalog:', err);
      } finally {
        setIsCourseLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);
  
  // Flatten syllabus to map paginate listings
  const allLessons: Lesson[] = [];
  course?.modules?.forEach((mod) => {
    mod.lessons.forEach((l) => {
      allLessons.push(l);
    });
  });

  const activeLessonIndex = lessonId 
    ? allLessons.findIndex((l) => l.id === lessonId)
    : 0;
  const activeLesson = allLessons[activeLessonIndex >= 0 ? activeLessonIndex : 0];

  // Redirect to correct URL with active lesson ID if it's missing from the path
  useEffect(() => {
    if (course && !lessonId && activeLesson) {
      navigate(`/dashboard/learn/${course.id}/${activeLesson.id}`, { replace: true });
    }
  }, [course, lessonId, activeLesson, navigate]);

  // Fetch submissions and resources when active lesson changes
  useEffect(() => {
    const fetchSubsAndResources = async () => {
      if (!course?.id || !activeLesson?.id) return;
      try {
        const [subsData, resourcesData] = await Promise.all([
          courseService.getProjectSubmissions(course.id, activeLesson.id),
          courseService.getLessonResources(activeLesson.id)
        ]);
        setSubmissions(subsData);
        setLessonResources(resourcesData);
      } catch (err) {
        console.error('Failed to load project submissions/resources:', err);
      }
    };
    fetchSubsAndResources();
  }, [course?.id, activeLesson?.id]);

  // Security guard logic: checking enrollment using resolved database course ID, course slug, or role (mentors and admins have full access)
  const userHasAccess = Boolean(
    user?.role === 'mentor' ||
    user?.role === 'admin' ||
    (course && isEnrolled(course.id)) ||
    (course && isEnrolled(course.slug)) ||
    (courseId && isEnrolled(courseId))
  );

  // Safe development debug logging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('=== CLASSROOM ACCESS DEBUG ===', {
        loggedInUser: {
          id: user?.id,
          role: user?.role
        },
        classroomUrlParam: courseId,
        loadedCourse: course ? {
          id: course.id,
          slug: course.slug,
          title: course.title
        } : null,
        enrollmentCheck: {
          checkedIds: [course?.id, course?.slug, courseId].filter(Boolean),
          userEnrolledCourses: user?.enrolledCourses || [],
          isEnrolledResult: Boolean(
            (course && isEnrolled(course.id)) ||
            (course && isEnrolled(course.slug)) ||
            (courseId && isEnrolled(courseId))
          ),
          userHasAccess
        },
        loadingState: {
          isAuthLoading,
          isCourseLoading
        }
      });
    }
  }, [user, course, courseId, userHasAccess, isAuthLoading, isCourseLoading, isEnrolled]);

  // Google Drive link validator
  const isValidGoogleDriveLink = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    try {
      const parsed = new URL(url.trim());
      const host = parsed.hostname.toLowerCase();
      if (host !== 'drive.google.com' && host !== 'docs.google.com') {
        return false;
      }
      const path = parsed.pathname;
      const search = parsed.searchParams;
      if (
        path.includes('/file/d/') ||
        path.includes('/drive/folders/') ||
        path.includes('/drive/u/') ||
        path.includes('/folders/') ||
        path.includes('/document/d/') ||
        path.includes('/spreadsheets/d/') ||
        path.includes('/presentation/d/') ||
        path.includes('/forms/d/') ||
        (path.startsWith('/open') && search.has('id')) ||
        (path.startsWith('/file') && search.has('id'))
      ) {
        return true;
      }
      return path.length > 5 || search.toString().length > 3;
    } catch {
      return false;
    }
  };

  // Handle Google Drive project link submission
  const handleSubmitDriveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course?.id || !activeLesson?.id) return;
    
    const trimmed = driveLinkInput.trim();
    if (!trimmed || !isValidGoogleDriveLink(trimmed)) {
      setSubmitError('Please enter a valid Google Drive link.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await courseService.submitProjectDriveLink(course.id, activeLesson.id, trimmed);
      const updated = await courseService.getProjectSubmissions(course.id, activeLesson.id);
      setSubmissions(updated);
      setSubmitSuccess('Project link submitted successfully.');
      setDriveLinkInput('');
      setTimeout(() => setSubmitSuccess(null), 4000);
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Failed to submit Google Drive project link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isCourseLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Loading Classroom...</span>
      </div>
    );
  }

  if (!course || !activeLesson) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900 font-display">Lesson Not Found</h2>
        <Link to="/dashboard" className="px-5 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 hover:scale-[1.02]">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Handle unauthorized view error screen
  if (!userHasAccess) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white border border-rose-200/80 p-8 rounded-3xl shadow-sm text-center space-y-6">
          <ShieldAlert className="w-16 h-16 text-rose-600 mx-auto animate-bounce" />
          <div className="space-y-2">
            <h2 className="text-xl font-display font-extrabold text-stone-900">Access Denied</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              The frontend has detected that you do not hold active enrollment status for: <strong>{course.title}</strong>. 
              All lesson URLs are authorized on the server before streams are generated.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link to={`/courses/${course.slug}`} className="px-6 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 hover:scale-[1.02]">
              View Pricing & Enroll
            </Link>
            <Link to="/dashboard" className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-stone-50 hover:bg-amber-500 hover:text-slate-950 text-stone-800 border border-stone-200 transition-all duration-200 shadow-xs">
              Back to Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle checking completion
  const handleToggleCompletion = async () => {
    await completeLesson(course.id, activeLesson.id);
  };

  // Pagination triggers
  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      const prev = allLessons[activeLessonIndex - 1];
      navigate(`/dashboard/learn/${course.id}/${prev.id}`);
    }
  };

  const handleNextLesson = async () => {
    // Automatically complete current lesson on Next click
    await completeLesson(course.id, activeLesson.id);
    
    if (activeLessonIndex < allLessons.length - 1) {
      const next = allLessons[activeLessonIndex + 1];
      navigate(`/dashboard/learn/${course.id}/${next.id}`);
    }
  };

  // Handle saving private note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    setSavedNotes((prev) => [...prev, noteInput]);
    setNoteInput('');
  };


  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 antialiased font-sans p-3 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start text-left max-w-7xl mx-auto w-full">
        
        {/* Left panel: Video, Tabs & Pagination (8 cols) */}
        <main className="lg:col-span-8 space-y-6 w-full min-w-0">
          
          {/* Breadcrumb back navigation */}
          <div className="flex items-center justify-between">
            <Link 
              to={user?.role === 'mentor' ? '/mentor/dashboard/courses' : user?.role === 'admin' ? '/admin/dashboard/courses' : '/dashboard/my-courses'} 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {user?.role === 'mentor' ? 'Back to Mentor Courses' : user?.role === 'admin' ? 'Back to Admin Courses' : 'Back to My Courses'}
            </Link>
            {(user?.role === 'mentor' || user?.role === 'admin') && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-bold uppercase tracking-wider">
                {user?.role === 'mentor' ? 'Mentor Video Reference' : 'Admin Preview View'}
              </span>
            )}
          </div>

          {/* 100% Completion Notification & Apply for Certificate Action */}
          {allLessons.length > 0 && allLessons.every((l) => isLessonCompleted(course.id, l.id)) && user?.role === 'student' && (
            <div className="p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-stone-900 text-sm">
                    Course Syllabus 100% Completed!
                  </h4>
                  <p className="text-xs text-stone-600">
                    Verify all required capstone projects are submitted, then apply for your official certificate.
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard/certificates"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1.5 flex-shrink-0 transition-all hover:scale-[1.02]"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Apply for Certificate</span>
              </Link>
            </div>
          )}

          {/* SECURE VIDEO PLAYER */}
          <VideoPlayer
            courseId={course.id}
            lessonId={activeLesson.id}
            lessonTitle={activeLesson.title}
            onEnded={handleToggleCompletion}
          />

          {/* Classroom pagination controls */}
          <div className="flex items-center justify-between border-y border-stone-200/80 py-4 px-1 sm:px-2 gap-2">
            <button
              onClick={handlePrevLesson}
              disabled={activeLessonIndex === 0}
              className="px-3 sm:px-4 py-2 text-xs font-bold rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900 shadow-xs transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleToggleCompletion}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isLessonCompleted(course.id, activeLesson.id)
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{isLessonCompleted(course.id, activeLesson.id) ? 'Completed' : 'Mark as Complete'}</span>
              <span className="sm:hidden">{isLessonCompleted(course.id, activeLesson.id) ? 'Done' : 'Complete'}</span>
            </button>

            <button
              onClick={handleNextLesson}
              disabled={activeLessonIndex === allLessons.length - 1}
              className="px-3 sm:px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>

          {/* Tab options menu */}
          <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm overflow-hidden w-full">
            <div className="w-full overflow-x-auto no-scrollbar border-b border-stone-200 bg-stone-50/50">
              <div className="flex w-full min-w-full text-xs font-bold">
                {[
                  { id: 'desc', label: 'Lesson Description' },
                  { id: 'resources', label: 'Resources & Downloads' },
                  { id: 'notes', label: 'My Notes' },
                  { id: 'project', label: 'Submit Project' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[70px] sm:min-w-0 px-2 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4 border-b-2 text-[11px] sm:text-xs leading-tight text-center flex items-center justify-center transition-colors cursor-pointer select-none ${
                      activeTab === tab.id
                        ? 'border-amber-500 text-amber-700 bg-white font-bold'
                        : 'border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-100/60'
                    }`}
                  >
                    <span className="block max-w-full break-words text-center">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content viewer */}
            <div className="p-4 sm:p-6 text-stone-600 text-xs sm:text-sm leading-relaxed bg-white">
              
              {/* Tab: Description */}
              {activeTab === 'desc' && (
                <div className="space-y-4 text-left">
                  <h3 className="font-display font-bold text-base text-stone-900">{activeLesson.title}</h3>
                  <div className="text-stone-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {activeLesson.description || (
                      <span className="text-stone-400 italic">No notes or description defined for this lesson yet.</span>
                    )}
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 flex items-start gap-2.5 font-medium text-xs mt-4 shadow-xs">
                    <ShieldAlert className="w-4.5 h-4.5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900 block">Sandbox Policy Notice</span>
                      <span>All hacking exercises must be run inside offline local machines (Kali VMs) targeting local Sandboxes only. Do not perform operations outside authorized guidelines.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Resources */}
              {activeTab === 'resources' && (
                <div className="space-y-4 text-left">
                  <h4 className="font-display font-bold text-base text-stone-900">Download Materials</h4>
                  {lessonResources.filter(r => r.fileType !== 'note').length === 0 ? (
                    <div className="p-6 bg-stone-50/80 border border-stone-200/80 rounded-xl text-center text-xs text-stone-500 italic">
                      No resource materials uploaded for this lesson.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {lessonResources.filter(r => r.fileType !== 'note').map((res) => {
                        const baseApi = api.defaults.baseURL ? api.defaults.baseURL : '/api';
                        const fileUrl = `${baseApi}/resources/${res.id}/download`;

                        return (
                          <div key={res.id} className="flex items-center justify-between p-3.5 bg-stone-50/60 border border-stone-200/80 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-colors">
                            <span className="flex items-center gap-2 font-medium text-stone-800 text-xs truncate max-w-[70%]">
                              <FileText className="w-4 h-4 text-amber-600" />
                              {res.fileName}
                            </span>
                            <a 
                              href={fileUrl}
                              download={res.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download ({res.fileSize})
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-5 text-left max-w-3xl">
                  {/* Mentor-provided Lesson Notes if available */}
                  {lessonResources.filter(r => r.fileType === 'note').length > 0 && (
                    <div className="space-y-2.5 mb-6">
                      <h5 className="font-display font-bold text-amber-700 text-xs uppercase tracking-wider">
                        Instructor Lesson Notes & Handouts
                      </h5>
                      <div className="space-y-2">
                        {lessonResources.filter(r => r.fileType === 'note').map((res) => {
                          const token = localStorage.getItem('token');
                          const fileUrl = `${api.defaults.baseURL ? api.defaults.baseURL : '/api'}/resources/${res.id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;

                          return (
                            <div key={res.id} className="flex items-center justify-between p-3.5 bg-stone-50/60 border border-stone-200/80 rounded-xl hover:bg-stone-50 hover:border-amber-300/80 transition-colors">
                              <span className="flex items-center gap-2 font-medium text-stone-800 text-xs truncate max-w-[70%]">
                                <FileText className="w-4 h-4 text-amber-600" />
                                {res.fileName}
                              </span>
                              <a 
                                href={fileUrl}
                                download={res.fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download ({res.fileSize})
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <h4 className="font-display font-bold text-stone-900 text-base">Personal Lesson Notebook</h4>
                  <p className="text-xs text-stone-500 leading-relaxed mb-4">
                    Write down private notes or reminders for this lesson. They are saved to your local workspace session.
                  </p>
                  
                  {savedNotes.length > 0 && (
                    <div className="space-y-2.5 mb-4">
                      {savedNotes.map((note, idx) => (
                        <div key={idx} className="p-3.5 bg-stone-50/80 border border-stone-200/80 rounded-xl text-xs leading-relaxed text-stone-700 shadow-xs">
                          {note}
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSaveNote} className="space-y-3">
                    <textarea
                      rows={4}
                      placeholder="Capture key concepts, questions or commands..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50/60 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-[10px] font-bold rounded-xl shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                    >
                      Save Note
                    </button>
                  </form>
                </div>
              )}

              {/* Tab: Project Submission (Google Drive Link Submission) */}
              {activeTab === 'project' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Column: Link Submission Form & Instructions */}
                  <div className="space-y-4 text-left">
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-stone-900 text-base flex items-center gap-2">
                        <FolderGit2 className="w-5 h-5 text-amber-600" />
                        Submit Lesson Project
                      </h4>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Upload your completed project to Google Drive and submit the sharing link below.
                      </p>
                    </div>

                    {/* Google Drive Link Submission Form */}
                    <form onSubmit={handleSubmitDriveLink} className="space-y-3">
                      <div className="space-y-1.5">
                        <label htmlFor="drive-link-input" className="text-xs font-bold text-stone-800 block">
                          Google Drive Project Link
                        </label>
                        <div className="relative">
                          <input
                            id="drive-link-input"
                            type="url"
                            required
                            placeholder="https://drive.google.com/drive/folders/..."
                            value={driveLinkInput}
                            onChange={(e) => {
                              setDriveLinkInput(e.target.value);
                              if (submitError) setSubmitError(null);
                            }}
                            className="w-full pl-9 pr-4 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          />
                          <Link2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-[11px] text-stone-500 leading-relaxed">
                          Upload your project to Google Drive, make sure the file/folder is accessible to your mentor, then paste the Google Drive sharing link here.
                        </p>
                      </div>

                      {submitError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                          <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span>{submitError}</span>
                        </div>
                      )}

                      {submitSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{submitSuccess}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                      >
                        {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>{isSubmitting ? 'Submitting...' : 'Submit Project'}</span>
                      </button>
                    </form>

                    {/* How to get the link instructions */}
                    <div className="p-4 bg-stone-50/80 border border-stone-200/80 rounded-2xl space-y-2 text-xs">
                      <span className="font-bold text-stone-800 block">How to get the link:</span>
                      <ol className="list-decimal list-inside space-y-1 text-stone-600 text-[11px] leading-relaxed">
                        <li>Upload your project to Google Drive.</li>
                        <li>Right-click the project file/folder.</li>
                        <li>Select <strong>Share</strong>.</li>
                        <li>Set the required access permission.</li>
                        <li>Copy the link.</li>
                        <li>Paste it here.</li>
                      </ol>
                    </div>

                    {/* Mentor Access Warning */}
                    <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 flex items-start gap-2.5 text-xs">
                      <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">
                        Make sure your Google Drive file or folder is shared with your mentor. Otherwise, the mentor may not be able to open it.
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Submitted Project Display */}
                  <div className="space-y-4 text-left md:border-l border-stone-200 md:pl-8 pt-6 md:pt-0">
                    <h5 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest leading-none">
                      Submitted Project
                    </h5>
                    {submissions.length === 0 ? (
                      <div className="p-6 bg-stone-50/80 border border-stone-200/80 rounded-xl text-center text-xs text-stone-500 italic">
                        No project link submitted yet for this lesson.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {submissions.map((sub) => {
                          const baseHost = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : (typeof window !== 'undefined' ? window.location.origin : '');
                          const projectUrl = sub.googleDriveUrl || (sub.filePath?.startsWith('http') ? sub.filePath : `${baseHost}${sub.filePath}`);

                          return (
                            <div key={sub.id} className="p-4 bg-stone-50/60 border border-stone-200/80 rounded-2xl hover:bg-stone-50 hover:border-stone-300 transition-colors space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 flex-shrink-0">
                                    <FolderGit2 className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-stone-900 text-xs block truncate">
                                      {sub.googleDriveUrl ? 'Google Drive Project' : (sub.fileName || 'Project File')}
                                    </span>
                                    <span className="text-[10px] text-stone-400 font-mono block truncate">
                                      Submitted: {new Date(sub.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                  </div>
                                </div>
                                <button 
                                  onClick={async () => {
                                    if (!window.confirm('Delete this project submission?')) return;
                                    try {
                                      await courseService.deleteProjectSubmission(sub.id);
                                      setSubmissions(prev => prev.filter(s => s.id !== sub.id));
                                    } catch (err) {
                                      alert('Failed to delete project submission.');
                                    }
                                  }}
                                  className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors hover:bg-rose-50 rounded-lg cursor-pointer flex-shrink-0"
                                  title="Delete Submission"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="pt-1">
                                <a 
                                  href={projectUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                                >
                                  <span>Open Submitted Project</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>

        </main>

        {/* Right panel: Course syllabus list / checklist (4 cols) */}
        <aside className="lg:col-span-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-140px)] flex flex-col sticky top-24">
          <div className="p-4 border-b border-stone-200 bg-stone-50/80 text-left">
            <h3 className="font-display font-bold text-sm text-stone-900 leading-none">Course Curriculum</h3>
            <span className="text-[10px] text-stone-500 font-semibold block mt-1 uppercase">Track Progression</span>
          </div>

          {/* Accordions listing */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {(course.modules || []).map((mod) => (
              <div key={mod.id} className="space-y-2 text-left">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                  {mod.title}
                </span>
                
                <div className="space-y-1.5 pl-1.5">
                  {mod.lessons.map((l) => {
                    const isActive = l.id === lessonId;
                    const completed = isLessonCompleted(course.id, l.id);

                    return (
                      <button
                        key={l.id}
                        onClick={() => navigate(`/dashboard/learn/${course.id}/${l.id}`)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                            : 'hover:bg-stone-100 text-stone-700 hover:text-stone-900 font-medium'
                        }`}
                      >
                        <span className="flex items-center gap-2 flex-1 pr-2 line-clamp-1">
                          <Play className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-stone-400'}`} />
                          <span>{l.title}</span>
                        </span>
                        {completed ? (
                          <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-emerald-600'} flex-shrink-0`} />
                        ) : (
                          <Circle className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-stone-300'} flex-shrink-0`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
};
