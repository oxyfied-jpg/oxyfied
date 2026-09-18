export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoType?: 'bunny' | 'youtube' | 'hls' | 'vimeo' | 'custom' | string;
  videoUrl?: string; // Protected token-based or direct URL
  youtubeVideoId?: string;
  bunnyVideoId?: string;
  isPreview?: boolean;
  content?: string;
  description?: string; // Mentor's notes
  resources?: Array<{ id: string; fileName: string; filePath: string; fileSize: string }>;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  duration: string;
  lessons: number;
  level: string;
  rating: number;
  students: number;
  status: 'available' | 'coming-soon';
  featured: boolean;
  skills: string[];
  modules?: Module[];
  requirements?: string[];
  whoIsItFor?: string[];
  instructor?: Instructor;
  previewVideoUrl?: string;
}

export interface Mentor {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  designation?: string;
  role?: string; // maps designation for backward compatibility
  bio: string;
  profileImage?: string;
  image?: string; // maps profileImage for backward compatibility
  linkedin?: string;
  expertise?: string[];
  status?: 'active' | 'inactive';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  courses?: Course[];
}

export type Instructor = Mentor;

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  courseName: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[];
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  icon: string;
}

export interface CartItem {
  courseId: string;
  title: string;
  price: number;
  image: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: 'student' | 'admin' | 'mentor';
  status?: 'active' | 'inactive';
  enrolledCourses: string[]; // Course IDs
  progress: Record<string, string[]>; // courseId -> array of completed lessonIds
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'course' | 'submission' | 'enrollment';
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: AppNotification[];
  unreadCount: number;
}
