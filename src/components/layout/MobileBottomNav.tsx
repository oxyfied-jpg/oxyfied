import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Layers, 
  Sparkles, 
  User 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const profileRoute = isAuthenticated
    ? user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'mentor'
        ? '/mentor/dashboard'
        : '/dashboard'
    : '/login';

  const navItems = [
    {
      label: 'Home',
      to: '/',
      icon: Home,
      exact: true
    },
    {
      label: 'Programs',
      to: '/courses',
      icon: BookOpen,
      exact: false
    },
    {
      label: 'Curriculum',
      to: '/courses',
      icon: Layers,
      exact: false
    },
    {
      label: 'Resources',
      to: '/blog',
      icon: Sparkles,
      exact: false
    },
    {
      label: isAuthenticated ? 'Dashboard' : 'Profile',
      to: profileRoute,
      icon: User,
      exact: false
    }
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-light-taupe/80 shadow-[0_-4px_20px_rgba(23,35,51,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          // Determine active status
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to) && item.to !== '/';

          return (
            <NavLink
              key={idx}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 group ${
                isActive ? 'text-burnt-orange font-bold' : 'text-warm-gray hover:text-deep-navy font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'group-hover:scale-105 stroke-[1.8]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-burnt-orange" />
                )}
              </div>
              <span className="text-[10px] leading-tight mt-1 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
