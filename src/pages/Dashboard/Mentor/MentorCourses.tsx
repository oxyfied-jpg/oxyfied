import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, ShieldAlert, Loader2, X, Check, 
  Folder, GraduationCap, Video, Layers, Upload, CheckCircle2, AlertCircle, Play, Download,
  Clock, BookOpen, ChevronDown, Cloud
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { courseService } from '../../../services/courseService';
import { VideoPlayer } from '../../../components/ui/VideoPlayer';

interface CategoryObject {
  id: string;
  name: string;
}

interface CourseObject {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  status: 'draft' | 'available';
  category: string;
  studentsCount: number;
  createdAt: string;
  previewVideoUrl?: string | null;
}

interface LessonObject {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  videoType: 'bunny' | 'youtube' | 'vimeo' | 'custom';
  videoUrl?: string;
  youtubeVideoId?: string;
  duration: string;
  sortOrder: number;
  isPreview: boolean;
  isActive: boolean;
}

interface ModuleObject {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  lessons: LessonObject[];
}

export const MentorCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseObject[]>([]);
  const [categories, setCategories] = useState<CategoryObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Video Preview Player state for mentor video reference
  const [previewLesson, setPreviewLesson] = useState<{
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    duration?: string;
  } | null>(null);

  // Edit Course Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseObject | null>(null);
  
  // Edit Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [status, setStatus] = useState<'draft' | 'available'>('draft');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');

  // Syllabus Editor States
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [syllabusCourse, setSyllabusCourse] = useState<CourseObject | null>(null);
  const [modules, setModules] = useState<ModuleObject[]>([]);
  
  // Syllabus Modals
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [moduleModalType, setModuleModalType] = useState<'add' | 'edit'>('add');
  const [selectedModule, setSelectedModule] = useState<ModuleObject | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [moduleSort, setModuleSort] = useState('0');

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonModalType, setLessonModalType] = useState<'add' | 'edit'>('add');
  const [selectedLesson, setSelectedLesson] = useState<LessonObject | null>(null);
  const [lessonParentModuleId, setLessonParentModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonVideoType, setLessonVideoType] = useState<'bunny' | 'youtube' | 'vimeo' | 'custom'>('bunny');
  const [lessonVideoId, setLessonVideoId] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonSort, setLessonSort] = useState('0');
  const [lessonIsPreview, setLessonIsPreview] = useState(false);

  // Bunny Stream Video Upload States
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [videoUploadSuccess, setVideoUploadSuccess] = useState<string | null>(null);

  // Helper to format video duration
  const formatSecondsToMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVideoFileSelect = async (file: File) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v'];
    if (!ext || !allowed.includes(ext)) {
      setVideoUploadError('Supported video formats: MP4, MOV, MKV, WebM, AVI.');
      return;
    }

    setVideoUploadError(null);
    setVideoUploadSuccess(null);
    setIsUploadingVideo(true);
    setVideoUploadProgress(0);

    // Auto-detect duration from file
    try {
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoEl.src);
        if (videoEl.duration && (!lessonDuration || lessonDuration === '10:00')) {
          setLessonDuration(formatSecondsToMinutes(videoEl.duration));
        }
      };
      videoEl.src = URL.createObjectURL(file);
    } catch (e) {
      console.warn('Could not read video metadata:', e);
    }

    // Auto-populate lesson title if empty
    if (!lessonTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setLessonTitle(cleanName);
    }

    try {
      const uploadTitle = lessonTitle || file.name;
      const res = await courseService.uploadBunnyVideo(file, uploadTitle, (progress) => {
        setVideoUploadProgress(progress);
      });

      setLessonVideoType('bunny');
      setLessonVideoId(res.videoId);
      setLessonVideoUrl(res.videoId);
      setVideoUploadSuccess(`Video uploaded successfully! Bunny GUID: ${res.videoId}`);
    } catch (err: any) {
      console.error('Video upload error:', err);
      const rawError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to upload video to Bunny Stream. Please ensure Bunny Stream is properly configured.';
      setVideoUploadError(typeof rawError === 'string' ? rawError : JSON.stringify(rawError));
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Lesson Resource Manager States
  const [isResourceManagerOpen, setIsResourceManagerOpen] = useState(false);
  const [resourceLessonId, setResourceLessonId] = useState('');
  const [resourceLessonTitle, setResourceLessonTitle] = useState('');
  const [lessonResources, setLessonResources] = useState<any[]>([]);
  const [isResourceUploading, setIsResourceUploading] = useState(false);
  const [resourceUploadError, setResourceUploadError] = useState<string | null>(null);
  const [uploadFileType, setUploadFileType] = useState<'resource' | 'note'>('resource');
  const [uploadProgress, setUploadProgress] = useState<{ percent: number; loaded: number; total: number; status: string } | null>(null);
  const [googleDriveStatus, setGoogleDriveStatus] = useState<{ isConnected: boolean; needsReauth?: boolean; email?: string | null; isConfigured: boolean; message?: string }>({ isConnected: false, isConfigured: true });
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);

  const fetchMentorData = async () => {
    try {
      setLoading(true);
      const [courseData, catData, gdStatus] = await Promise.all([
        courseService.getMentorCourses(),
        courseService.getAdminCategories(),
        courseService.getGoogleDriveStatus().catch(() => ({ isConnected: false, isConfigured: true }))
      ]);
      setCourses(courseData);
      setCategories(catData);
      if (gdStatus) setGoogleDriveStatus(gdStatus);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your assigned program tracks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, []);

  const handleConnectGoogleDrive = async () => {
    try {
      setIsConnectingDrive(true);
      const data = await courseService.getGoogleDriveAuthUrl();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initialize Google Drive connection.');
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const handleDisconnectGoogleDrive = async () => {
    if (!window.confirm('Disconnect your Google Drive account from Oxyfied?')) return;
    try {
      await courseService.disconnectGoogleDrive();
      setGoogleDriveStatus({ isConnected: false, email: null, isConfigured: true });
    } catch (err: any) {
      alert('Failed to disconnect Google Drive.');
    }
  };

  const openEditCourse = (course: CourseObject) => {
    setSelectedCourse(course);
    setTitle(course.title);
    setSlug(course.slug);
    setShortDesc(course.description);
    setFullDesc('');
    setThumbnail(course.image);
    setPrice(course.price.toString());
    setDuration(course.duration);
    setStatus(course.status);
    setPreviewVideoUrl(course.previewVideoUrl || '');
    
    // Find category ID matches name
    const matchingCat = categories.find(c => c.name === course.category);
    setCategoryId(matchingCat?.id || categories[0]?.id || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const payload = {
      title,
      slug,
      shortDescription: shortDesc,
      description: fullDesc || shortDesc,
      thumbnail,
      categoryId,
      price: parseFloat(price),
      duration,
      level,
      status,
      previewVideoUrl: previewVideoUrl.trim() || null
    };

    try {
      setLoading(true);
      await courseService.updateMentorCourse(selectedCourse.id, payload);
      setSuccess(`Course "${title}" updated successfully.`);
      setIsEditModalOpen(false);
      await fetchMentorData();
      setTimeout(() => setSuccess(null), 4000);
      setError(null);
    } catch (err) {
      setError('Failed to update course details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (course: CourseObject) => {
    if (!window.confirm(`Delete course "${course.title}"? This will erase the track permanently from the database.`)) return;
    try {
      setLoading(true);
      await courseService.deleteMentorCourse(course.id);
      setCourses(prev => prev.filter(c => c.id !== course.id));
      setSuccess(`Successfully deleted course "${course.title}".`);
      setTimeout(() => setSuccess(null), 4000);
      setError(null);
    } catch (err) {
      setError('Deletion unauthorized or database constraints failed.');
    } finally {
      setLoading(false);
    }
  };

  const openResourceManager = async (lessonId: string, lessonTitle: string) => {
    setResourceLessonId(lessonId);
    setResourceLessonTitle(lessonTitle);
    setResourceUploadError(null);
    setIsResourceManagerOpen(true);
    try {
      setLoading(true);
      const [data, gdStatus] = await Promise.all([
        courseService.getLessonResources(lessonId),
        courseService.getGoogleDriveStatus().catch(() => ({ isConnected: false, email: null, isConfigured: true }))
      ]);
      setLessonResources(data);
      if (gdStatus) setGoogleDriveStatus(gdStatus);
    } catch (err) {
      setError('Failed to load lesson resources.');
    } finally {
      setLoading(false);
    }
  };

  // --- Curriculum Actions ---
  const openCurriculum = async (course: CourseObject) => {
    setSyllabusCourse(course);
    setIsSyllabusOpen(true);
    try {
      setLoading(true);
      const data = await courseService.getMentorCourseSyllabus(course.id);
      setModules(data);
    } catch (err) {
      setError('Failed to load course syllabus.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModule = () => {
    setModuleModalType('add');
    setSelectedModule(null);
    setModuleTitle('');
    setModuleDesc('');
    setModuleSort('0');
    setIsModuleModalOpen(true);
  };

  const openEditModule = (mod: ModuleObject) => {
    setModuleModalType('edit');
    setSelectedModule(mod);
    setModuleTitle(mod.title);
    setModuleDesc(mod.description || '');
    setModuleSort(mod.sortOrder.toString());
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusCourse || !moduleTitle) return;

    const payload = {
      title: moduleTitle,
      description: moduleDesc,
      sortOrder: parseInt(moduleSort) || 0
    };

    try {
      setLoading(true);
      if (moduleModalType === 'add') {
        const created = await courseService.createMentorModule(syllabusCourse.id, payload);
        setModules(prev => [...prev, { ...created, lessons: [] }].sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        if (!selectedModule) return;
        const updated = await courseService.updateMentorModule(selectedModule.id, payload);
        setModules(prev => prev.map(m => m.id === selectedModule.id ? { ...m, ...updated } : m).sort((a, b) => a.sortOrder - b.sortOrder));
      }
      setIsModuleModalOpen(false);
    } catch (err) {
      setError('Failed to save module.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (modId: string) => {
    if (!window.confirm('Delete this module? All nested lessons inside will be deleted.')) return;
    try {
      setLoading(true);
      await courseService.deleteMentorModule(modId);
      setModules(prev => prev.filter(m => m.id !== modId));
    } catch (err) {
      setError('Failed to delete module.');
    } finally {
      setLoading(false);
    }
  };

  const openAddLesson = (moduleId: string) => {
    setLessonModalType('add');
    setSelectedLesson(null);
    setLessonParentModuleId(moduleId);
    setLessonTitle('');
    setLessonDesc('');
    setLessonVideoType('bunny');
    setLessonVideoId('');
    setLessonVideoUrl('');
    setLessonDuration('10:00');
    setLessonSort('0');
    setLessonIsPreview(false);
    setVideoUploadError(null);
    setVideoUploadSuccess(null);
    setVideoUploadProgress(0);
    setIsUploadingVideo(false);
    setIsLessonModalOpen(true);
  };

  const openEditLesson = (lesson: LessonObject) => {
    setLessonModalType('edit');
    setSelectedLesson(lesson);
    setLessonParentModuleId(lesson.moduleId);
    setLessonTitle(lesson.title);
    setLessonDesc(lesson.description || '');
    setLessonVideoType(lesson.videoType || 'bunny');
    setLessonVideoId(lesson.youtubeVideoId || '');
    setLessonVideoUrl(lesson.videoUrl || '');
    setLessonDuration(lesson.duration);
    setLessonSort(lesson.sortOrder.toString());
    setLessonIsPreview(lesson.isPreview);
    setVideoUploadError(null);
    setVideoUploadSuccess(null);
    setVideoUploadProgress(0);
    setIsUploadingVideo(false);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusCourse || !lessonTitle || !lessonDuration) return;

    const payload = {
      title: lessonTitle,
      description: lessonDesc,
      videoType: lessonVideoType,
      youtubeVideoId: lessonVideoId,
      videoUrl: lessonVideoUrl,
      duration: lessonDuration,
      sortOrder: parseInt(lessonSort) || 0,
      isPreview: lessonIsPreview
    };

    try {
      setLoading(true);
      if (lessonModalType === 'add') {
        const created = await courseService.createMentorLesson(syllabusCourse.id, lessonParentModuleId, payload);
        setModules(prev => prev.map(m => {
          if (m.id === lessonParentModuleId) {
            return { ...m, lessons: [...m.lessons, created].sort((a, b) => a.sortOrder - b.sortOrder) };
          }
          return m;
        }));
      } else {
        if (!selectedLesson) return;
        const updated = await courseService.updateMentorLesson(selectedLesson.id, payload);
        setModules(prev => prev.map(m => {
          if (m.id === lessonParentModuleId) {
            return {
              ...m,
              lessons: m.lessons.map(l => l.id === selectedLesson.id ? updated : l).sort((a, b) => a.sortOrder - b.sortOrder)
            };
          }
          return m;
        }));
      }
      setIsLessonModalOpen(false);
    } catch (err) {
      setError('Failed to save lesson.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      setLoading(true);
      await courseService.deleteMentorLesson(lessonId);
      setModules(prev => prev.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
      }));
    } catch (err) {
      setError('Failed to delete lesson.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-stone-900 tracking-tight">Assigned Course Tracks</h2>
          <p className="text-sm text-stone-500 mt-1">Design curricula modules, manage adaptive video streams, or edit course metadata.</p>
        </div>
        <Link 
          to="/mentor/dashboard/add-course"
          className="inline-flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl shadow-sm shadow-amber-500/20 hover:shadow-md transition-all active:scale-95 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Author Program Track</span>
        </Link>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && courses.length === 0 ? (
          <div className="col-span-full p-16 text-center">
            <Loader2 className="w-9 h-9 text-amber-500 animate-spin mx-auto mb-3" />
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Syncing program tracks...</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white/80 backdrop-blur-xl border border-stone-200/80 rounded-2xl">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-700">No program tracks authoring yet</p>
            <p className="text-xs text-stone-400 mt-1">Click "Author Program Track" above to create your first technical syllabus.</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="bg-white/80 backdrop-blur-xl border border-stone-200/80 rounded-2xl overflow-hidden flex flex-col shadow-xs hover:shadow-md hover:border-amber-500/30 transition-all group">
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                <img
                  src={course.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                
                <span className={`absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md border ${
                  course.status === 'available' 
                    ? 'bg-emerald-500/90 text-white border-emerald-400/30' 
                    : 'bg-stone-800/80 text-stone-200 border-white/10'
                }`}>
                  {course.status === 'available' ? 'Live Public' : 'Draft Track'}
                </span>

                <span className="absolute bottom-3 right-3 text-xs font-mono font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10">
                  ₹{course.price}
                </span>
              </div>

              {/* Info body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                      <Folder className="w-3.5 h-3.5" />
                      {course.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                  </div>
                  <h3 className="text-base font-display font-bold text-stone-900 leading-snug group-hover:text-amber-600 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="space-y-3.5 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-600 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span>Cohort Size:</span>
                      <strong className="text-stone-900 font-mono">{course.studentsCount}</strong>
                    </span>
                  </div>

                  {/* Settings Actions row */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openCurriculum(course)}
                      className="flex-1 px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/20 transition-all cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Curriculum</span>
                    </button>
                    <button 
                      onClick={() => navigate(`/dashboard/learn/${course.id}`)}
                      className="p-2 text-stone-600 hover:text-amber-600 hover:bg-amber-50 border border-stone-200 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                      title="Watch / Reference in Classroom"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button 
                      onClick={() => openEditCourse(course)}
                      className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all cursor-pointer"
                      title="Edit Track Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course)}
                      className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 rounded-xl transition-all cursor-pointer"
                      title="Delete Track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Course Meta Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md">
          <form 
            onSubmit={handleUpdateCourse}
            className="bg-white border border-stone-200 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col text-left shadow-2xl"
          >
            <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <h3 className="font-display font-extrabold text-base text-stone-900">Edit Program Track Info</h3>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
              {/* Title */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700">Course Title</label>
                <input
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">URL Route Slug</label>
                <input
                  type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Domain Category</label>
                <div className="relative">
                  <select
                    value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none cursor-pointer"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Duration</label>
                <input
                  type="text" required value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Price (₹ INR)</label>
                <input
                  type="number" required value={price} onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Skill Level</label>
                <div className="relative">
                  <select
                    value={level} onChange={(e) => setLevel(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Visibility Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Visibility Status</label>
                <div className="relative">
                  <select
                    value={status} onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none cursor-pointer"
                  >
                    <option value="draft">Draft (Hidden)</option>
                    <option value="available">Available (Public)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700">Thumbnail Cover URL</label>
                <input
                  type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Preview Video URL */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700">Course Preview Video URL (Public Trailer)</label>
                <input
                  type="url" value={previewVideoUrl} onChange={(e) => setPreviewVideoUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=... or MP4/Bunny stream URL"
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <p className="text-[10px] text-stone-400">
                  Publicly visible video displayed in the Course Details "Preview" tab. No student login required.
                </p>
              </div>

              {/* Short Summary */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700">Short Summary Headline</label>
                <input
                  type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/70 flex justify-end gap-3">
              <button 
                type="button" onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={loading}
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl shadow-sm transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Hierarchical Syllabus / Curriculum Editor Modal --- */}
      {isSyllabusOpen && syllabusCourse && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-stone-950/60 backdrop-blur-md">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col text-left shadow-2xl">
            {/* Header */}
            <div className="px-4 py-3.5 sm:px-6 sm:py-4.5 border-b border-stone-100 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between sm:block">
                  <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">Curriculum Manager</span>
                  <button 
                    onClick={() => setIsSyllabusOpen(false)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors sm:hidden cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-stone-900 break-words mt-0.5 leading-snug">
                  {syllabusCourse.title}
                </h3>
              </div>
              <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                <button 
                  onClick={() => navigate(`/dashboard/learn/${syllabusCourse.id}`)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/20 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                  title="Open full interactive classroom view for this course"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-amber-600 flex-shrink-0" />
                  <span>Classroom View</span>
                </button>
                <button 
                  onClick={openAddModule}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-white text-[11px] font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Add Module</span>
                </button>
                <button 
                  onClick={() => setIsSyllabusOpen(false)}
                  className="hidden sm:inline-flex p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modules list scroll body */}
            <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
              {modules.length === 0 ? (
                <div className="p-10 sm:p-16 text-center text-stone-400 text-xs font-medium border border-dashed border-stone-300 rounded-2xl bg-stone-50/50 flex flex-col items-center justify-center">
                  <Layers className="w-8 h-8 text-stone-300 mb-2" />
                  <p className="font-semibold text-stone-700 text-sm">No modules authored yet</p>
                  <p className="mt-1">Click "Add Module" to start structuring the course topics.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((mod, modIdx) => (
                    <div key={mod.id} className="bg-stone-50/70 border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs">
                      {/* Module header row */}
                      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-white border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
                        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold text-xs flex-shrink-0 mt-0.5 sm:mt-0">
                            {modIdx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-stone-900 break-words leading-snug">{mod.title}</h4>
                            {mod.description && <p className="text-[11px] text-stone-500 mt-0.5 break-words">{mod.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                          <button 
                            onClick={() => openAddLesson(mod.id)}
                            className="text-[10px] font-bold text-amber-700 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Lesson</span>
                          </button>
                          <button 
                            onClick={() => openEditModule(mod)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Module"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Module"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Lessons inside Module */}
                      <div className="p-2.5 sm:p-3 space-y-2">
                        {mod.lessons.length === 0 ? (
                          <p className="text-[11px] text-stone-400 italic px-3 py-2">No lecture units populated under this module yet.</p>
                        ) : (
                          mod.lessons.map((lesson, lesIdx) => (
                            <div key={lesson.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-xl border border-stone-200/60 hover:border-amber-500/30 transition-all shadow-xs group">
                              {/* Left Info: Icon, title, duration */}
                              <div className="flex items-start md:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 group-hover:text-amber-600 group-hover:bg-amber-50 transition-colors flex-shrink-0 mt-0.5 md:mt-0">
                                  <Video className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-semibold text-stone-800 group-hover:text-amber-600 transition-colors break-words block leading-snug">
                                    {lesIdx + 1}. {lesson.title}
                                  </span>
                                  <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono mt-1">
                                    <span>{lesson.duration}</span>
                                    {lesson.isPreview && (
                                      <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-sans font-semibold">
                                        Free Preview
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right Action buttons: Responsive wrap / stack */}
                              <div className="flex items-center gap-1.5 pt-2 md:pt-0 border-t border-stone-100 md:border-t-0 flex-wrap sm:flex-nowrap justify-between md:justify-end">
                                <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                                  <button 
                                    onClick={() => setPreviewLesson({
                                      courseId: syllabusCourse.id,
                                      courseTitle: syllabusCourse.title,
                                      lessonId: lesson.id,
                                      lessonTitle: lesson.title,
                                      duration: lesson.duration
                                    })}
                                    className="flex-1 sm:flex-initial text-[10px] font-semibold text-amber-700 hover:bg-amber-500/20 px-2.5 py-1.5 sm:py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    title="Watch / Reference Lesson Video"
                                  >
                                    <Play className="w-3 h-3 fill-current text-amber-600 flex-shrink-0" />
                                    <span>Watch</span>
                                  </button>
                                  <button 
                                    onClick={() => openResourceManager(lesson.id, lesson.title)}
                                    className="flex-1 sm:flex-initial text-[10px] font-bold text-amber-800 hover:text-amber-900 hover:bg-amber-100/80 px-2.5 py-1.5 sm:py-1 rounded-lg bg-amber-50 border border-amber-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                    title="Add & Manage Lesson Resources, Notes, ZIPs, PDFs (Google Drive)"
                                  >
                                    <Folder className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                    <span className="text-center">Resources & Notes</span>
                                  </button>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button 
                                    onClick={() => openEditLesson(lesson)}
                                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Lesson"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-stone-100 bg-stone-50/70 flex justify-end">
              <button 
                onClick={() => setIsSyllabusOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer text-center"
              >
                Close Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Add/Edit Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-md">
          <form 
            onSubmit={handleSaveModule}
            className="bg-white border border-stone-200 rounded-2xl max-w-sm w-full p-4 sm:p-6 text-left shadow-2xl space-y-4"
          >
            <h3 className="font-display font-extrabold text-sm text-stone-900">
              {moduleModalType === 'add' ? 'Add Syllabus Module' : 'Edit Module Details'}
            </h3>
            
            <div className="space-y-1.5 text-xs">
              <label className="text-xs font-semibold text-stone-700 block">Module Title</label>
              <input
                type="text" required value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g. Memory Management Essentials"
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-xs font-semibold text-stone-700 block">Summary Description</label>
              <input
                type="text" value={moduleDesc} onChange={(e) => setModuleDesc(e.target.value)}
                placeholder="e.g. Introduction to kernel pool page structures"
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-xs font-semibold text-stone-700 block">Sort Order Index</label>
              <input
                type="number" required value={moduleSort} onChange={(e) => setModuleSort(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button 
                type="button" onClick={() => setIsModuleModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Save Module
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lesson Add/Edit Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-md">
          <form 
            onSubmit={handleSaveLesson}
            className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-4 sm:p-6 text-left shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-display font-extrabold text-sm text-stone-900">
                {lessonModalType === 'add' ? 'Populate Module Lesson' : 'Edit Lesson Details'}
              </h3>
              {lessonModalType === 'edit' && selectedLesson && (
                <button
                  type="button"
                  onClick={() => {
                    setIsLessonModalOpen(false);
                    openResourceManager(selectedLesson.id, selectedLesson.title);
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  title="Attach or Manage Google Drive Resources & Notes"
                >
                  <Folder className="w-3 h-3 text-amber-600" />
                  <span>Resources & Notes</span>
                </button>
              )}
            </div>

            <div className="space-y-3.5 text-xs text-stone-800 max-h-[65vh] sm:max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Lesson Title</label>
                <input
                  type="text" required value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Inspecting Pool Allocations via WinDbg"
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Lesson Notes / Description</label>
                <textarea
                  rows={2} value={lessonDesc} onChange={(e) => setLessonDesc(e.target.value)}
                  placeholder="Summary details or lesson notes for students..."
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Video Duration</label>
                  <input
                    type="text" required value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="e.g. 15:30"
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Sort Order</label>
                  <input
                    type="number" required value={lessonSort} onChange={(e) => setLessonSort(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Video Stream Host</label>
                <div className="relative">
                  <select
                    value={lessonVideoType} onChange={(e) => setLessonVideoType(e.target.value as any)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="bunny">Bunny Stream (Recommended)</option>
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="custom">Custom HLS / MP4 Stream</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {lessonVideoType === 'bunny' ? (
                <div className="space-y-3 p-3.5 sm:p-4 bg-stone-50/70 border border-stone-200 rounded-2xl">
                  {/* File Upload Dropzone */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700">
                      <span>Upload Video File (Bunny Auto-Transcode)</span>
                      {isUploadingVideo && (
                        <span className="text-amber-600 font-mono font-bold">
                          {videoUploadProgress}%
                        </span>
                      )}
                    </div>

                    <label className={`flex flex-col items-center justify-center p-4 sm:p-5 bg-white border border-dashed border-stone-300 hover:border-amber-500/60 rounded-xl cursor-pointer transition-all duration-200 group ${
                      isUploadingVideo 
                        ? 'bg-amber-50/50 cursor-wait' 
                        : 'hover:bg-amber-50/20'
                    }`}>
                      <div className="flex flex-col items-center justify-center space-y-1 text-center">
                        {isUploadingVideo ? (
                          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-xs font-semibold text-stone-900">
                          {isUploadingVideo ? 'Uploading stream to Bunny CDN...' : 'Drop Video (.mp4, .mov, .mkv, .webm)'}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          Auto-transcoded into 1080p, 720p, 480p, 360p adaptive HLS
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/*,.mp4,.mov,.mkv,.webm,.avi"
                        disabled={isUploadingVideo}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoFileSelect(file);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Progress bar */}
                    {isUploadingVideo && (
                      <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300 rounded-full" 
                          style={{ width: `${videoUploadProgress}%` }}
                        />
                      </div>
                    )}

                    {videoUploadSuccess && (
                      <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                        <span className="truncate font-medium">{videoUploadSuccess}</span>
                      </div>
                    )}

                    {videoUploadError && (
                      <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200/80 p-2.5 rounded-xl">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                        <span className="font-medium">{videoUploadError}</span>
                      </div>
                    )}
                  </div>

                  {/* Manual ID / URL fallback */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-200">
                    <label className="text-[11px] font-semibold text-stone-700 block">
                      Bunny Video GUID or Stream URL (Auto-filled)
                    </label>
                    <input
                      type="text" 
                      required 
                      value={lessonVideoUrl || lessonVideoId} 
                      onChange={(e) => {
                        setLessonVideoUrl(e.target.value);
                        setLessonVideoId(e.target.value);
                      }}
                      placeholder="e.g. 3a1f8c12-9b23-4d33-912a-89a74b4b21c2"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono text-xs"
                    />
                  </div>
                </div>
              ) : lessonVideoType === 'youtube' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">YouTube Video ID</label>
                  <input
                    type="text" required value={lessonVideoId} onChange={(e) => setLessonVideoId(e.target.value)}
                    placeholder="e.g. dQw4w9WgXcQ"
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Direct Stream URL</label>
                  <input
                    type="text" required value={lessonVideoUrl} onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="e.g. https://domain.com/video.mp4"
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-none"
                  />
                </div>
              )}

              {/* Preview Toggle Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox" id="isPreview" checked={lessonIsPreview} onChange={(e) => setLessonIsPreview(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="isPreview" className="text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  Enable Free Sample Preview
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button 
                type="button" onClick={() => setIsLessonModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Save Lesson
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Lesson Resource Manager Modal */}
      {isResourceManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-md p-2.5 sm:p-4">
          <div className="bg-white border border-stone-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[92vh] sm:max-h-[90vh]">
            <div className="px-4 py-3.5 sm:px-6 sm:py-4.5 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
              <div className="max-w-[85%] min-w-0">
                <h3 className="text-sm sm:text-base font-display font-extrabold text-stone-900 flex items-center gap-2 break-words">
                  <Folder className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>Lesson Resource Materials</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 break-words">Lesson: <strong className="text-stone-900 font-semibold">{resourceLessonTitle}</strong></p>
              </div>
              <button 
                onClick={() => setIsResourceManagerOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 text-xs text-stone-800">
              {/* Google Drive OAuth Connection Banner */}
              <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                googleDriveStatus.isConnected
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                  : googleDriveStatus.needsReauth
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : !googleDriveStatus.isConfigured
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                      : 'bg-stone-50/80 border-stone-200/80 text-stone-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      googleDriveStatus.isConnected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : googleDriveStatus.needsReauth
                          ? 'bg-amber-500 text-white shadow-xs'
                          : !googleDriveStatus.isConfigured
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-stone-200 text-stone-600'
                    }`}>
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold font-display text-stone-900">
                          Google Drive Storage
                        </span>
                        {googleDriveStatus.isConnected ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Connected
                          </span>
                        ) : googleDriveStatus.needsReauth ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 flex items-center gap-1">
                            Permission Renewal Required
                          </span>
                        ) : !googleDriveStatus.isConfigured ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 flex items-center gap-1">
                            Setup Required in .env
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-stone-200 text-stone-600">
                            Not Connected
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 mt-0.5 break-words">
                        {googleDriveStatus.isConnected 
                          ? `Connected account: ${googleDriveStatus.email || 'mentor@google.com'}`
                          : googleDriveStatus.needsReauth
                            ? 'Google Drive permission needs to be renewed. Please disconnect and reconnect Google Drive to grant the required permissions.'
                            : !googleDriveStatus.isConfigured
                              ? 'GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET are not set in .env yet.'
                              : 'Connect your personal or workspace Google Drive to store large files directly.'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    {googleDriveStatus.needsReauth && (
                      <button
                        type="button"
                        onClick={handleDisconnectGoogleDrive}
                        className="px-2.5 py-1.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer"
                      >
                        Disconnect
                      </button>
                    )}
                    {googleDriveStatus.isConnected ? (
                      <button
                        type="button"
                        onClick={handleDisconnectGoogleDrive}
                        className="px-3 py-1.5 text-[10px] font-semibold text-stone-600 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 rounded-xl transition-all cursor-pointer"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectGoogleDrive}
                        disabled={isConnectingDrive}
                        className="px-3.5 py-2 text-[10px] font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isConnectingDrive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
                        {googleDriveStatus.needsReauth ? 'Reconnect Google Drive' : 'Connect Google Drive'}
                      </button>
                    )}
                  </div>
                </div>

                {!googleDriveStatus.isConnected && !googleDriveStatus.isConfigured && (
                  <div className="mt-3 pt-3 border-t border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                    <p className="font-semibold">Quick Setup Steps (2 minutes):</p>
                    <ol className="list-decimal pl-4 space-y-0.5 text-stone-600 text-[10px]">
                      <li>Create an <strong>OAuth 2.0 Client ID (Web Application)</strong> in <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-amber-700 underline font-semibold">Google Cloud Console</a>.</li>
                      <li>Add Authorized redirect URI: <code className="bg-amber-100/80 px-1 py-0.5 rounded text-stone-800 font-mono">{typeof window !== 'undefined' ? `${window.location.origin}/api/auth/google-drive/callback` : 'http://localhost:5000/api/auth/google-drive/callback'}</code></li>
                      <li>Add <code className="bg-amber-100/80 px-1 py-0.5 rounded text-stone-800 font-mono">GOOGLE_CLIENT_ID</code> and <code className="bg-amber-100/80 px-1 py-0.5 rounded text-stone-800 font-mono">GOOGLE_CLIENT_SECRET</code> to your <code className="bg-amber-100/80 px-1 py-0.5 rounded text-stone-800 font-mono">.env</code> file.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Upload Form Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold text-stone-700 block">Upload Material or Notes</span>
                  <div className="flex items-center gap-1 bg-stone-200/60 p-0.5 rounded-lg text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setUploadFileType('resource')}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${uploadFileType === 'resource' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                    >
                      Resource File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadFileType('note')}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${uploadFileType === 'note' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                    >
                      Lesson Notes
                    </button>
                  </div>
                </div>

                <label className={`flex flex-col items-center justify-center p-4 sm:p-6 bg-stone-50/70 border border-dashed rounded-2xl cursor-pointer transition-all ${isResourceUploading ? 'border-amber-500/80 bg-amber-50/30 cursor-not-allowed' : 'border-stone-300 hover:border-amber-500/60'}`}>
                  <div className="flex flex-col items-center justify-center space-y-2 text-center w-full max-w-sm">
                    <Upload className={`w-7 h-7 ${isResourceUploading ? 'animate-bounce text-amber-600' : 'text-stone-400'}`} />
                    <span className="text-xs font-semibold text-stone-900">
                      {isResourceUploading ? 'Uploading file directly to Google Drive...' : `Click to select ${uploadFileType === 'note' ? 'note file' : 'resource archive / document'}`}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Supports large files (1GB+): .zip, .pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx, .csv, .txt
                    </span>

                    {/* Progress Bar & Status */}
                    {isResourceUploading && uploadProgress && (
                      <div className="w-full space-y-1.5 mt-3 pt-3 border-t border-amber-200/60">
                        <div className="flex items-center justify-between text-[11px] font-medium text-stone-600">
                          <span>
                            {uploadProgress.status === 'initializing' && 'Initializing upload session...'}
                            {uploadProgress.status === 'uploading' && 'Uploading directly to Google Drive...'}
                            {uploadProgress.status === 'verifying' && 'Verifying upload with Google Drive...'}
                          </span>
                          <span className="font-mono font-bold text-amber-700">{uploadProgress.percent}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress.percent}%` }}
                          />
                        </div>
                        {uploadProgress.total > 0 && (
                          <div className="text-[10px] text-stone-400 text-right font-mono">
                            {(uploadProgress.loaded / (1024 * 1024)).toFixed(1)} MB / {(uploadProgress.total / (1024 * 1024)).toFixed(1)} MB
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".zip,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt"
                    disabled={isResourceUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Check Google Drive connection
                      if (!googleDriveStatus.isConnected) {
                        setResourceUploadError('Please click "Connect Google Drive" above to authorize your Drive before uploading.');
                        return;
                      }

                      // Validation checks
                      const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
                      const allowedExts = ['.zip', '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.csv', '.txt'];
                      if (!allowedExts.includes(ext)) {
                        setResourceUploadError(`Format ${ext} is not supported. Supported: ${allowedExts.join(', ')}`);
                        return;
                      }

                      setResourceUploadError(null);
                      setIsResourceUploading(true);
                      setUploadProgress({ percent: 0, loaded: 0, total: file.size, status: 'initializing' });

                      try {
                        await courseService.uploadLessonResourceResumable(
                          resourceLessonId,
                          file,
                          uploadFileType,
                          (progress) => {
                            setUploadProgress(progress);
                          }
                        );
                        const updated = await courseService.getLessonResources(resourceLessonId);
                        setLessonResources(updated);
                      } catch (err: any) {
                        setResourceUploadError(err.response?.data?.error || err.message || 'Failed to upload resource.');
                      } finally {
                        setIsResourceUploading(false);
                        setUploadProgress(null);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {resourceUploadError && (
                  <span className="text-xs text-rose-600 font-medium block">
                    {resourceUploadError}
                  </span>
                )}
              </div>

              {/* Uploaded Materials List */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-stone-700 block">Current Materials & Notes</span>
                {lessonResources.length === 0 ? (
                  <div className="p-6 bg-stone-50/70 border border-stone-200/60 rounded-2xl text-center text-xs text-stone-400 font-medium">
                    No resource attachments uploaded for this lesson yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lessonResources.map((res) => {
                      const isGoogleDrive = res.storageType === 'google_drive' || !!res.googleDriveFileId;

                      return (
                        <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-xl hover:border-amber-500/30 transition-all">
                          <div className="flex flex-col space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-stone-900 text-xs break-words">
                                {res.fileName}
                              </span>
                              {isGoogleDrive ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex-shrink-0">
                                  Google Drive
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 flex-shrink-0">
                                  Local
                                </span>
                              )}
                              {res.fileType === 'note' && (
                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60 flex-shrink-0">
                                  Notes
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {res.fileSize} • {new Date(res.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                            <a
                              href={`/api/resources/${res.id}/download`}
                              download={res.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-stone-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-stone-200 transition-colors flex items-center gap-1 text-xs font-semibold"
                              title="Download / View Resource File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button 
                              onClick={async () => {
                                if (!window.confirm(`Delete file "${res.fileName}"? This will remove the file from storage.`)) return;
                                try {
                                  await courseService.deleteLessonResource(res.id);
                                  setLessonResources(prev => prev.filter(r => r.id !== res.id));
                                } catch {
                                  alert('Failed to delete resource.');
                                }
                              }}
                              className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 border border-stone-200 transition-colors"
                              title="Delete Resource File"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-stone-100 bg-stone-50/70 flex justify-end">
              <button 
                onClick={() => setIsResourceManagerOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer text-center"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Video Preview Modal for Mentor Reference --- */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-4xl w-full overflow-hidden flex flex-col text-left shadow-2xl text-white max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/80">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    Mentor Video Stream
                  </span>
                  {previewLesson.duration && (
                    <span className="text-[10px] text-stone-400 font-mono">
                      Duration: {previewLesson.duration}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-white break-words mt-1">
                  {previewLesson.lessonTitle}
                </h3>
                <p className="text-xs text-stone-400 break-words">{previewLesson.courseTitle}</p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                <button
                  onClick={() => {
                    const cId = previewLesson.courseId;
                    const lId = previewLesson.lessonId;
                    setPreviewLesson(null);
                    navigate(`/dashboard/learn/${cId}/${lId}`);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-white border border-stone-700 transition-colors cursor-pointer"
                  title="Open in full interactive classroom player"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>Classroom View</span>
                </button>
                <button
                  onClick={() => setPreviewLesson(null)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player Box */}
            <div className="bg-black aspect-video w-full flex items-center justify-center">
              <VideoPlayer
                courseId={previewLesson.courseId}
                lessonId={previewLesson.lessonId}
                lessonTitle={previewLesson.lessonTitle}
              />
            </div>

            {/* Footer */}
            <div className="px-4 py-3 sm:px-6 sm:py-3 border-t border-stone-800 bg-stone-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-400">
              <span>Review lecture material, adaptive video stream, and timestamps.</span>
              <button
                onClick={() => setPreviewLesson(null)}
                className="w-full sm:w-auto px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl cursor-pointer text-center"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
