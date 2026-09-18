import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Guard components
import { ProtectedRoute, PublicRoute, AdminRoute, MentorRoute } from '../components/common/RouteGuards';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Lazy Loaded Pages to optimize bundle size
const Home = React.lazy(() => import('../pages/Home').then(module => ({ default: module.Home })));
const Courses = React.lazy(() => import('../pages/Courses').then(module => ({ default: module.Courses })));
const CourseDetails = React.lazy(() => import('../pages/CourseDetails').then(module => ({ default: module.CourseDetails })));
const About = React.lazy(() => import('../pages/About').then(module => ({ default: module.About })));
const Contact = React.lazy(() => import('../pages/Contact').then(module => ({ default: module.Contact })));
const Projects = React.lazy(() => import('../pages/Projects').then(module => ({ default: module.Projects })));

// Auth Pages
const Login = React.lazy(() => import('../pages/Login').then(module => ({ default: module.Login })));
const Register = React.lazy(() => import('../pages/Register').then(module => ({ default: module.Register })));
const ForgotPassword = React.lazy(() => import('../pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));

// Checkout & LMS Pages
const Checkout = React.lazy(() => import('../pages/Checkout').then(module => ({ default: module.Checkout })));
const Learning = React.lazy(() => import('../pages/Learning').then(module => ({ default: module.Learning })));

// Resource/Blogs Pages
const Resources = React.lazy(() => import('../pages/Blog').then(module => ({ default: module.Resources })));
const ResourceDetails = React.lazy(() => import('../pages/Blog').then(module => ({ default: module.ResourceDetails })));

// Dashboard Subviews
const Dashboard = React.lazy(() => import('../pages/Dashboard').then(module => ({ default: module.Dashboard })));
const MyCourses = React.lazy(() => import('../pages/Dashboard/DashboardViews').then(module => ({ default: module.MyCourses })));
const ProgressTracking = React.lazy(() => import('../pages/Dashboard/DashboardViews').then(module => ({ default: module.ProgressTracking })));
const Certificates = React.lazy(() => import('../pages/Dashboard/DashboardViews').then(module => ({ default: module.Certificates })));
const Settings = React.lazy(() => import('../pages/Dashboard/DashboardViews').then(module => ({ default: module.Settings })));

// New Public Pages
const PrivacyPolicy = React.lazy(() => import('../pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsConditions = React.lazy(() => import('../pages/TermsConditions').then(module => ({ default: module.TermsConditions })));
const RefundPolicy = React.lazy(() => import('../pages/RefundPolicy').then(module => ({ default: module.RefundPolicy })));
const Disclaimer = React.lazy(() => import('../pages/Disclaimer').then(module => ({ default: module.Disclaimer })));
const HireFromUs = React.lazy(() => import('../pages/HireFromUs').then(module => ({ default: module.HireFromUs })));
const BecomeInstructor = React.lazy(() => import('../pages/BecomeInstructor').then(module => ({ default: module.BecomeInstructor })));
const BecomePartner = React.lazy(() => import('../pages/BecomePartner').then(module => ({ default: module.BecomePartner })));
const LeadershipCouncil = React.lazy(() => import('../pages/LeadershipCouncil').then(module => ({ default: module.LeadershipCouncil })));
const Careers = React.lazy(() => import('../pages/Careers').then(module => ({ default: module.Careers })));
const CorporateTraining = React.lazy(() => import('../pages/CorporateTraining').then(module => ({ default: module.CorporateTraining })));
const IndustryCollaboration = React.lazy(() => import('../pages/IndustryCollaboration').then(module => ({ default: module.IndustryCollaboration })));
const StudentSuccess = React.lazy(() => import('../pages/StudentSuccess').then(module => ({ default: module.StudentSuccess })));

// Admin Dashboard Subviews (NEW)
const AdminOverview = React.lazy(() => import('../pages/Dashboard/Admin/AdminOverview').then(module => ({ default: module.AdminOverview })));
const AdminUsers = React.lazy(() => import('../pages/Dashboard/Admin/AdminUsers').then(module => ({ default: module.AdminUsers })));
const AdminMentors = React.lazy(() => import('../pages/Dashboard/Admin/AdminMentors').then(module => ({ default: module.AdminMentors })));
const AdminCourses = React.lazy(() => import('../pages/Dashboard/Admin/AdminCourses').then(module => ({ default: module.AdminCourses })));
const AdminEnrollments = React.lazy(() => import('../pages/Dashboard/Admin/AdminEnrollments').then(module => ({ default: module.AdminEnrollments })));
const AdminCertificates = React.lazy(() => import('../pages/Dashboard/Admin/AdminCertificates').then(module => ({ default: module.AdminCertificates })));
const AdminEnquiries = React.lazy(() => import('../pages/Dashboard/Admin/AdminEnquiries').then(module => ({ default: module.AdminEnquiries })));
const AdminLoginActivity = React.lazy(() => import('../pages/Dashboard/Admin/AdminLoginActivity').then(module => ({ default: module.AdminLoginActivity })));
const VerifyCertificate = React.lazy(() => import('../pages/VerifyCertificate').then(module => ({ default: module.VerifyCertificate })));

// Mentor Dashboard Subviews (NEW)
const MentorOverview = React.lazy(() => import('../pages/Dashboard/Mentor/MentorOverview').then(module => ({ default: module.MentorOverview })));
const MentorCourses = React.lazy(() => import('../pages/Dashboard/Mentor/MentorCourses').then(module => ({ default: module.MentorCourses })));
const MentorAddCourse = React.lazy(() => import('../pages/Dashboard/Mentor/MentorAddCourse').then(module => ({ default: module.MentorAddCourse })));
const MentorStudents = React.lazy(() => import('../pages/Dashboard/Mentor/MentorStudents').then(module => ({ default: module.MentorStudents })));
const MentorAnalytics = React.lazy(() => import('../pages/Dashboard/Mentor/MentorAnalytics').then(module => ({ default: module.MentorAnalytics })));
const MentorProfile = React.lazy(() => import('../pages/Dashboard/Mentor/MentorProfile').then(module => ({ default: module.MentorProfile })));
const MentorSubmissions = React.lazy(() => import('../pages/Dashboard/Mentor/MentorSubmissions').then(module => ({ default: module.MentorSubmissions })));
const MentorCertificates = React.lazy(() => import('../pages/Dashboard/Mentor/MentorCertificates').then(module => ({ default: module.MentorCertificates })));

// Reusable Loading Skeleton for Suspense Fallbacks
const SuspenseLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center">
    <Loader2 className="w-8 h-8 text-royal-blue-900 animate-spin mb-2" />
    <span className="text-xs text-slate-400 font-semibold uppercase">Loading Workspace...</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SuspenseLoader />}>
        <Routes>
          {/* Public Website routes (Header + Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetails />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:slug" element={<ResourceDetails />} />
            <Route path="/blog" element={<Resources />} />
            <Route path="/blog/:slug" element={<ResourceDetails />} />
            <Route path="/insights" element={<Resources />} />
            <Route path="/insights/:slug" element={<ResourceDetails />} />
            <Route path="/articles" element={<Resources />} />
            <Route path="/articles/:slug" element={<ResourceDetails />} />
            {/* Public Corporate, Institutional, Talent & Community Pages */}
            <Route path="/hire-from-us" element={<HireFromUs />} />
            <Route path="/become-an-instructor" element={<BecomeInstructor />} />
            <Route path="/become-a-partner" element={<BecomePartner />} />
            <Route path="/leadership-council" element={<LeadershipCouncil />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/corporate-training" element={<CorporateTraining />} />
            <Route path="/industry-collaboration" element={<IndustryCollaboration />} />
            <Route path="/student-success" element={<StudentSuccess />} />

            {/* Public Compliance & Policy Pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsConditions />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />

            {/* Public Credential & Certificate Verification Routes */}
            <Route path="/verify-certificate" element={<VerifyCertificate />} />
            <Route path="/verify-certificate/:certificateNumber" element={<VerifyCertificate />} />
            <Route path="/verify-credential" element={<VerifyCertificate />} />
            <Route path="/verify-credential/:certificateNumber" element={<VerifyCertificate />} />
            
            {/* Categories index page defaults back to Courses listings */}
            <Route path="/categories" element={<Navigate to="/courses" replace />} />
            
            {/* Guest Only Routes (Login/Register/Recovery) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Secure Route: Checkout checkout */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout/:courseId" element={<Checkout />} />
            </Route>
          </Route>

          {/* Secure LMS Dashboard Area (Student) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="progress" element={<ProgressTracking />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Standalone secure video learning page */}
            <Route path="/dashboard/learn/:courseId" element={<Learning />} />
            <Route path="/dashboard/learn/:courseId/:lessonId" element={<Learning />} />
          </Route>

          {/* Secure Admin Dashboard Area */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<DashboardLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="mentors" element={<AdminMentors />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
              <Route path="certificates" element={<AdminCertificates />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
              <Route path="login-activity" element={<AdminLoginActivity />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Secure Mentor Dashboard Area */}
          <Route element={<MentorRoute />}>
            <Route path="/mentor/dashboard" element={<DashboardLayout />}>
              <Route index element={<MentorOverview />} />
              <Route path="courses" element={<MentorCourses />} />
              <Route path="add-course" element={<MentorAddCourse />} />
              <Route path="students" element={<MentorStudents />} />
              <Route path="submissions" element={<MentorSubmissions />} />
              <Route path="certificates" element={<MentorCertificates />} />
              <Route path="analytics" element={<MentorAnalytics />} />
              <Route path="profile" element={<MentorProfile />} />
            </Route>
          </Route>

          {/* Global Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};
