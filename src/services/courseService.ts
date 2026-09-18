import axios from 'axios';
import api from './api';
import type { Course } from '../types';
import { courses as fallbackCourses } from '../data/courses';

const normalizeCourse = (c: any): Course => {
  const categoryName = typeof c.category === 'object' && c.category?.name ? c.category.name : (c.category || 'Cybersecurity');
  
  let totalLessons = typeof c.lessons === 'number' && c.lessons > 0 ? c.lessons : 0;
  if (Array.isArray(c.modules) && totalLessons === 0) {
    totalLessons = c.modules.reduce((acc: number, m: any) => acc + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0);
  }
  if (!totalLessons) totalLessons = 50;

  return {
    id: c.id,
    slug: c.slug || c.id,
    title: c.title,
    category: categoryName,
    description: c.description || c.shortDescription || '',
    image: c.image || c.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    price: typeof c.price === 'number' ? c.price : parseFloat(c.price || 0),
    originalPrice: typeof c.originalPrice === 'number' ? c.originalPrice : (c.discountPrice ? parseFloat(c.discountPrice) : c.price),
    duration: c.duration || '6 Months',
    lessons: totalLessons,
    level: c.level || 'Beginner to Advanced',
    rating: typeof c.rating === 'number' ? c.rating : 4.9,
    students: typeof c.students === 'number' ? c.students : (c.status === 'coming-soon' ? 0 : 1500),
    status: c.status === 'coming-soon' ? 'coming-soon' : 'available',
    featured: Boolean(c.featured ?? c.isFeatured),
    skills: Array.isArray(c.skills) ? c.skills : [],
    requirements: Array.isArray(c.requirements) ? c.requirements : [],
    whoIsItFor: Array.isArray(c.whoIsItFor) ? c.whoIsItFor : [],
    instructor: c.instructor || (c.mentor ? {
      id: c.mentor.id,
      name: c.mentor.name,
      role: c.mentor.designation || 'Lead Mentor',
      image: c.mentor.profileImage,
      bio: c.mentor.bio || '',
      expertise: c.mentor.expertise || []
    } : undefined),
    modules: Array.isArray(c.modules) ? c.modules : [],
    previewVideoUrl: (typeof c.previewVideoUrl === 'string' && c.previewVideoUrl.trim().length > 0) ? c.previewVideoUrl.trim() : undefined
  };
};

export const courseService = {
  // Public APIs
  getCourses: async (): Promise<Course[]> => {
    try {
      const response = await api.get('/courses');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(normalizeCourse);
      }
      return fallbackCourses.map(normalizeCourse);
    } catch (err) {
      return fallbackCourses.map(normalizeCourse);
    }
  },

  getCourseBySlug: async (slug: string): Promise<Course | null> => {
    try {
      const response = await api.get(`/courses/${slug}`);
      if (response.data && response.data.id) {
        return normalizeCourse(response.data);
      }
      const found = fallbackCourses.find(c => c.slug === slug || c.id === slug);
      return found ? normalizeCourse(found) : null;
    } catch (error) {
      const found = fallbackCourses.find(c => c.slug === slug || c.id === slug);
      return found ? normalizeCourse(found) : null;
    }
  },

  getCoursePreview: async (courseIdOrSlug: string): Promise<{
    courseId: string;
    slug: string;
    title: string;
    description: string;
    previewVideoUrl: string | null;
    thumbnail: string;
  } | null> => {
    try {
      const response = await api.get(`/courses/${courseIdOrSlug}/preview`);
      return response.data;
    } catch (err) {
      const found = fallbackCourses.find(c => c.slug === courseIdOrSlug || c.id === courseIdOrSlug);
      if (found) {
        return {
          courseId: found.id,
          slug: found.slug,
          title: found.title,
          description: found.description,
          previewVideoUrl: found.previewVideoUrl || null,
          thumbnail: found.image
        };
      }
      return null;
    }
  },

  getInstructors: async (): Promise<any[]> => {
    const response = await api.get('/instructors');
    return response.data;
  },

  trackProgress: async (courseId: string, lessonId: string): Promise<boolean> => {
    const response = await api.post(`/progress/complete`, { courseId, lessonId });
    return response.data.success;
  },

  // Admin Panel APIs
  getAdminStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAdminCourses: async () => {
    const response = await api.get('/admin/courses');
    return response.data;
  },

  createCourse: async (data: any) => {
    const response = await api.post('/admin/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: any) => {
    const response = await api.put(`/admin/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await api.delete(`/admin/courses/${id}`);
    return response.data;
  },

  // Categories CRUD
  getAdminCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  createCategory: async (data: any) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: any) => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Instructors/Mentors CRUD (backward compat)
  getAdminInstructors: async () => {
    const response = await api.get('/admin/instructors');
    return response.data;
  },

  createInstructor: async (data: any) => {
    const response = await api.post('/admin/instructors', data);
    return response.data;
  },

  updateInstructor: async (id: string, data: any) => {
    const response = await api.put(`/admin/instructors/${id}`, data);
    return response.data;
  },

  deleteInstructor: async (id: string) => {
    const response = await api.delete(`/admin/instructors/${id}`);
    return response.data;
  },

  // Mentors CRUD (New)
  getAdminMentors: async () => {
    const response = await api.get('/admin/mentors');
    return response.data;
  },

  createMentor: async (data: any) => {
    const response = await api.post('/admin/mentors', data);
    return response.data;
  },

  updateMentor: async (id: string, data: any) => {
    const response = await api.put(`/admin/mentors/${id}`, data);
    return response.data;
  },

  deleteMentor: async (id: string) => {
    const response = await api.delete(`/admin/mentors/${id}`);
    return response.data;
  },

  resetMentorPassword: async (id: string, password?: string) => {
    const response = await api.post(`/admin/mentors/${id}/reset-password`, { password });
    return response.data;
  },

  // Users CRUD (New)
  getUsers: async (params: any) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  revokeUserSession: async (id: string) => {
    const response = await api.post(`/admin/users/${id}/revoke-session`);
    return response.data;
  },

  // Enrollments CRUD (New)
  getAdminEnrollments: async () => {
    const response = await api.get('/admin/enrollments');
    return response.data;
  },

  createEnrollment: async (data: any) => {
    const response = await api.post('/admin/enrollments', data);
    return response.data;
  },

  updateEnrollment: async (id: string, data: any) => {
    const response = await api.put(`/admin/enrollments/${id}`, data);
    return response.data;
  },

  deleteEnrollment: async (id: string) => {
    const response = await api.delete(`/admin/enrollments/${id}`);
    return response.data;
  },

  // Admin Analytics (New)
  getAdminAnalytics: async (range?: string) => {
    const response = await api.get('/admin/analytics', { params: { range } });
    return response.data;
  },

  // Modules CRUD
  createModule: async (data: any) => {
    const response = await api.post('/admin/modules', data);
    return response.data;
  },

  updateModule: async (id: string, data: any) => {
    const response = await api.put(`/admin/modules/${id}`, data);
    return response.data;
  },

  deleteModule: async (id: string) => {
    const response = await api.delete(`/admin/modules/${id}`);
    return response.data;
  },

  // Lessons CRUD
  createLesson: async (data: any) => {
    const response = await api.post('/admin/lessons', data);
    return response.data;
  },

  updateLesson: async (id: string, data: any) => {
    const response = await api.put(`/admin/lessons/${id}`, data);
    return response.data;
  },

  deleteLesson: async (id: string) => {
    const response = await api.delete(`/admin/lessons/${id}`);
    return response.data;
  },

  // Mentor Dashboards APIs (New)
  getMentorCourses: async () => {
    const response = await api.get('/mentor/courses');
    return response.data;
  },

  createMentorCourse: async (data: any) => {
    const response = await api.post('/mentor/courses', data);
    return response.data;
  },

  updateMentorCourse: async (id: string, data: any) => {
    const response = await api.put(`/mentor/courses/${id}`, data);
    return response.data;
  },

  deleteMentorCourse: async (id: string) => {
    const response = await api.delete(`/mentor/courses/${id}`);
    return response.data;
  },

  getMentorCourseSyllabus: async (courseId: string) => {
    const response = await api.get(`/mentor/courses/${courseId}/lessons`);
    return response.data;
  },

  createMentorModule: async (courseId: string, data: any) => {
    const response = await api.post(`/mentor/courses/${courseId}/modules`, data);
    return response.data;
  },

  updateMentorModule: async (id: string, data: any) => {
    const response = await api.put(`/mentor/modules/${id}`, data);
    return response.data;
  },

  deleteMentorModule: async (id: string) => {
    const response = await api.delete(`/mentor/modules/${id}`);
    return response.data;
  },

  createMentorLesson: async (courseId: string, moduleId: string, data: any) => {
    const response = await api.post(`/mentor/courses/${courseId}/modules/${moduleId}/lessons`, data);
    return response.data;
  },

  updateMentorLesson: async (id: string, data: any) => {
    const response = await api.put(`/mentor/lessons/${id}`, data);
    return response.data;
  },

  deleteMentorLesson: async (id: string) => {
    const response = await api.delete(`/mentor/lessons/${id}`);
    return response.data;
  },

  getMentorCourseStudents: async (courseId: string) => {
    const response = await api.get(`/mentor/courses/${courseId}/students`);
    return response.data;
  },

  getMentorAnalytics: async () => {
    const response = await api.get('/mentor/analytics');
    return response.data;
  },

  getMentorProfile: async () => {
    const response = await api.get('/mentor/profile');
    return response.data;
  },

  updateMentorProfile: async (data: any) => {
    const response = await api.put('/mentor/profile', data);
    return response.data;
  },

  submitProjectDriveLink: async (courseId: string, lessonId: string, googleDriveUrl: string) => {
    const response = await api.post('/submissions/drive-link', {
      courseId,
      lessonId,
      googleDriveUrl
    });
    return response.data;
  },

  uploadProjectSubmission: async (courseId: string, lessonId: string, file: File) => {
    const formData = new FormData();
    formData.append('projectFile', file);
    formData.append('courseId', courseId);
    formData.append('lessonId', lessonId);
    const response = await api.post('/submissions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getProjectSubmissions: async (courseId: string, lessonId: string) => {
    const response = await api.get(`/submissions/${courseId}/${lessonId}`);
    return response.data;
  },

  deleteProjectSubmission: async (id: string) => {
    const response = await api.delete(`/submissions/${id}`);
    return response.data;
  },

  // Google Drive Direct / Resumable Resource Upload (Large files travel directly from browser to Google Drive)
  uploadLessonResourceResumable: async (
    lessonId: string,
    file: File,
    fileType: 'resource' | 'note' = 'resource',
    onProgress?: (progress: { percent: number; loaded: number; total: number; status: string }) => void
  ) => {
    const formatSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    if (onProgress) {
      onProgress({ percent: 0, loaded: 0, total: file.size, status: 'initializing' });
    }

    // 1. Ask backend to initiate upload session (<1KB JSON request)
    const initRes = await api.post(`/mentor/lessons/${lessonId}/resources/create-upload`, {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      fileType
    });

    const { provider, uploadUrl } = initRes.data;

    // 2. Direct upload to Google Drive if provider is google_drive
    if (provider === 'google_drive' && uploadUrl) {
      if (onProgress) {
        onProgress({ percent: 2, loaded: 0, total: file.size, status: 'uploading' });
      }

      try {
        // Stream file bytes directly from browser to Google Drive
        const gdResponse = await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type || 'application/octet-stream'
          },
          transformRequest: [(data) => data],
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress({
                percent: Math.min(percent, 99),
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                status: 'uploading'
              });
            }
          }
        });

        const googleDriveFileId = gdResponse.data?.id;
        if (!googleDriveFileId) {
          throw new Error('Google Drive did not return a valid file ID upon completion.');
        }

        if (onProgress) {
          onProgress({ percent: 100, loaded: file.size, total: file.size, status: 'verifying' });
        }

        // 3. Confirm completion with backend to record metadata in database
        const completeRes = await api.post(`/mentor/lessons/${lessonId}/resources/complete-upload`, {
          googleDriveFileId,
          fileName: file.name,
          fileSize: formatSize(file.size),
          mimeType: file.type || 'application/octet-stream',
          fileType
        });

        return completeRes.data;
      } catch (uploadErr: any) {
        console.warn('Direct upload to Google Drive failed or blocked by browser CORS, falling back to server upload:', uploadErr);
        // Fallback to server-mediated upload if direct upload is blocked by browser CORS/extensions
        const formData = new FormData();
        formData.append('resourceFile', file);
        formData.append('fileType', fileType);

        const response = await api.post(`/mentor/lessons/${lessonId}/resources`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress({
                percent,
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                status: 'uploading'
              });
            }
          }
        });
        return response.data;
      }
    }

    // Fallback: Local storage upload
    const formData = new FormData();
    formData.append('resourceFile', file);
    formData.append('fileType', fileType);

    const response = await api.post(`/mentor/lessons/${lessonId}/resources`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            percent,
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            status: 'uploading'
          });
        }
      }
    });
    return response.data;
  },

  uploadLessonResource: async (
    lessonId: string,
    file: File,
    onProgress?: (progress: { percent: number; loaded: number; total: number; status: string }) => void
  ) => {
    return courseService.uploadLessonResourceResumable(lessonId, file, 'resource', onProgress);
  },

  getLessonResources: async (lessonId: string) => {
    const response = await api.get(`/lessons/${lessonId}/resources`);
    return response.data;
  },

  getResourceDownloadUrl: async (id: string) => {
    const response = await api.get(`/resources/${id}/download-url`);
    return response.data;
  },

  deleteLessonResource: async (id: string) => {
    const response = await api.delete(`/mentor/resources/${id}`);
    return response.data;
  },

  migrateResourcesToDrive: async () => {
    const response = await api.post('/admin/migrate-resources-to-drive');
    return response.data;
  },

  // Google Drive OAuth 2.0 Management
  getGoogleDriveStatus: async () => {
    const response = await api.get('/auth/google-drive/status');
    return response.data as { isConnected: boolean; needsReauth?: boolean; email?: string | null; isConfigured: boolean; message?: string };
  },

  getGoogleDriveAuthUrl: async (returnUrl?: string) => {
    const response = await api.get('/auth/google-drive/url', {
      params: { returnUrl: returnUrl || window.location.href }
    });
    return response.data as { url: string };
  },

  disconnectGoogleDrive: async () => {
    const response = await api.post('/auth/google-drive/disconnect');
    return response.data;
  },

  getMentorSubmissions: async () => {
    const response = await api.get('/mentor/submissions');
    return response.data;
  },

  // Bunny Stream Video Upload API (Direct upload from browser to Bunny CDN edge to bypass serverless 4.5MB limits)
  uploadBunnyVideo: async (file: File, title?: string, onProgress?: (percent: number) => void) => {
    const videoTitle = title || file.name.replace(/\.[^/.]+$/, '');

    // 1. Ask backend to create the video object in Bunny Stream (lightweight JSON payload < 1KB)
    const initRes = await api.post('/videos/create-bunny-upload', {
      title: videoTitle
    });

    const { videoId, libraryId, apiKey, hlsUrl, embedUrl, directUrl } = initRes.data;

    if (!videoId || !libraryId || !apiKey) {
      throw new Error('Failed to initialize Bunny Stream upload credentials.');
    }

    // 2. Stream video file directly from the browser to Bunny CDN
    await axios.put(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      file,
      {
        headers: {
          AccessKey: apiKey,
          'Content-Type': 'application/octet-stream'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      }
    );

    return {
      success: true,
      videoId,
      libraryId,
      title: videoTitle,
      hlsUrl,
      embedUrl,
      directUrl
    };
  }
};

