import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';
import { userService, type UpdateProfilePayload } from '../services/userService';
import { courseService } from '../services/courseService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void | Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<User>;
  updateUser: (user: User) => void;
  enrollInCourse: (courseId: string) => Promise<void>;
  isEnrolled: (courseId: string) => boolean;
  completeLesson: (courseId: string, lessonId: string) => Promise<void>;
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'Oxyfied_user';
const TOKEN_KEY = 'Oxyfied_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem(USER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          // Synchronize state with backend on mount to get latest progress/enrollments
          const profile = await userService.getProfile();
          setUser(profile);
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
        } catch (err) {
          console.warn('Session expired or backend unreachable, clearing token.');
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.token && res.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        localStorage.setItem(TOKEN_KEY, res.token);
        setUser(res.user);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.register(name, email, phone, password);
      if (res.success && res.token && res.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        localStorage.setItem(TOKEN_KEY, res.token);
        setUser(res.user);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        await authService.logout();
      } catch (err) {
        console.warn('Failed to call backend logout endpoint, proceeding with client-side cleanup', err);
      }
    }
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const updateProfile = async (data: UpdateProfilePayload): Promise<User> => {
    const updated = await userService.updateProfile(data);
    updateUser(updated);
    return updated;
  };

  const enrollInCourse = async (_courseId: string) => {
    if (!user) return;
    try {
      // Refresh state from database profile
      const profile = await userService.getProfile();
      setUser(profile);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to sync enrollment', err);
    }
  };

  const isEnrolled = (courseIdentifier: string) => {
    if (!user || !courseIdentifier) return false;
    const enrolled = user.enrolledCourses || [];
    return enrolled.includes(courseIdentifier);
  };

  const completeLesson = async (courseId: string, lessonId: string) => {
    if (!user) return;
    try {
      await courseService.trackProgress(courseId, lessonId);

      // Instantly update client progress state to prevent lag
      const currentProgress = user.progress[courseId] || [];
      if (currentProgress.includes(lessonId)) return;

      const updatedProgress = {
        ...user.progress,
        [courseId]: [...currentProgress, lessonId]
      };

      const updatedUser = {
        ...user,
        progress: updatedProgress
      };

      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error('Failed to update progress on backend', err);
    }
  };

  const isLessonCompleted = (courseId: string, lessonId: string) => {
    if (!user || !user.progress[courseId]) return false;
    return user.progress[courseId].includes(lessonId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updateUser,
        enrollInCourse,
        isEnrolled,
        completeLesson,
        isLessonCompleted
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
