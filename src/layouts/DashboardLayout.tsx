import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Home,
  ShieldCheck,
  Users,
  FileText,
  Laptop,
  Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdminPath = location.pathname.startsWith('/admin');
  const isMentorPath = location.pathname.startsWith('/mentor');

  let navItems: Array<{ to: string; label: string; icon: any }> = [];
  let dashboardHeading = 'Student Workspace';

  if (isAdminPath) {
    dashboardHeading = 'Admin Workspace';
    navItems = [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/dashboard/users', label: 'Users', icon: Users },
      { to: '/admin/dashboard/mentors', label: 'Mentors', icon: ShieldCheck },
      { to: '/admin/dashboard/courses', label: 'Courses', icon: BookOpen },
      { to: '/admin/dashboard/enrollments', label: 'Enrollments', icon: Trophy },
      { to: '/admin/dashboard/certificates', label: 'Certificates', icon: Award },
      { to: '/admin/dashboard/enquiries', label: 'Enquiries', icon: Inbox },
      { to: '/admin/dashboard/login-activity', label: 'Login Activity', icon: Laptop },
      { to: '/admin/dashboard/settings', label: 'Settings', icon: Settings }
    ];
  } else if (isMentorPath) {
    dashboardHeading = 'Mentor Workspace';
    navItems = [
      { to: '/mentor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/mentor/dashboard/courses', label: 'My Courses', icon: BookOpen },
      { to: '/mentor/dashboard/add-course', label: 'Add Course', icon: ShieldCheck },
      { to: '/mentor/dashboard/students', label: 'Students', icon: Users },
      { to: '/mentor/dashboard/submissions', label: 'Project Submissions', icon: FileText },
      { to: '/mentor/dashboard/certificates', label: 'Certificate Requests', icon: Award },
      { to: '/mentor/dashboard/analytics', label: 'Analytics', icon: Trophy },
      { to: '/mentor/dashboard/profile', label: 'Profile', icon: Settings }
    ];
  } else {
    dashboardHeading = 'Student Workspace';
    navItems = [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/dashboard/my-courses', label: 'My Courses', icon: BookOpen },
      { to: '/dashboard/progress', label: 'Progress Tracking', icon: Trophy },
      { to: '/dashboard/certificates', label: 'Certificates', icon: Award },
      { to: '/dashboard/settings', label: 'Settings', icon: Settings }
    ];
  }

  return (
    <div className="flex h-screen bg-[#FBF9F5] overflow-hidden text-stone-900 antialiased font-sans">
      {/* Mobile Sidebar Overlay Drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0B1120] text-slate-200 border-r border-slate-800/80 transition-transform duration-300 transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header Branding */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60 bg-[#0B1120]">
          <Link to="/" className="flex items-center gap-3 group">
            
            <div>
              <span className="font-display font-extrabold text-base text-white tracking-tight block leading-none">
                Oxyfied LMS
              </span>
              <span className="text-[10px] font-semibold text-amber-400/90 uppercase tracking-widest block mt-1">
                {isAdminPath ? 'Admin Portal' : isMentorPath ? 'Mentor Hub' : 'Student LMS'}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden cursor-pointer transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard' || item.to === '/admin/dashboard' || item.to === '/mentor/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User controls */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090D17]/80 space-y-1.5">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Public Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FBF9F5]">
        {/* Dashboard Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-stone-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 lg:hidden cursor-pointer transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-stone-900 font-display tracking-tight">{dashboardHeading}</h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                  {user?.role?.toUpperCase() || 'STUDENT'}
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">Welcome back, <span className="font-medium text-stone-700">{user?.name || 'Learner'}</span></p>
            </div>
          </div>

          {/* User profile actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className={`p-2 rounded-xl transition-all relative cursor-pointer ${
                  isNotificationsOpen 
                    ? 'bg-amber-100/80 text-amber-800 shadow-xs ring-2 ring-amber-500/20' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
                aria-label="View notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                onUnreadChange={(count) => setUnreadCount(count)}
              />
            </div>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-stone-200">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-stone-200/80 shadow-xs"
              />
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-stone-900 block leading-tight">{user?.name}</span>
                <span className="text-[11px] text-stone-500 block leading-none mt-0.5 truncate max-w-[140px]">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Viewer */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FBF9F5]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
