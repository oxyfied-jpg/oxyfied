import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Search, 
  LogOut, 
  BookOpen, 
  Bell, 
  ChevronDown, 
  TrendingUp, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Settings, 
  GraduationCap, 
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';

// User initials helper
const getUserInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const Navbar: React.FC = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Desktop sliding liquid glass nav hover state
  const [navLens, setNavLens] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    opacity: number;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleNavMouseEnter = useCallback((e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    const target = e.currentTarget;
    setNavLens({
      left: target.offsetLeft,
      top: target.offsetTop,
      width: target.offsetWidth,
      height: target.offsetHeight,
      opacity: 1,
    });
  }, []);

  const handleNavMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleNavMouseLeave = useCallback(() => {
    setNavLens((prev) => ({
      ...prev,
      opacity: 0,
    }));
  }, []);

  const dashboardRoute =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'mentor'
        ? '/mentor/dashboard'
        : '/dashboard';

  // Automatically close any open menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Throttled scroll listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldScroll = window.scrollY > 12;
          setIsScrolled((prev) => (prev !== shouldScroll ? shouldScroll : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside listener & Escape / Cmd+K key handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsMobileMenuOpen(false);
      }
      // Global shortcut Cmd+K / Ctrl+K to search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/courses?search=${encodeURIComponent(query)}`);
    setSearchQuery('');
  }, [searchQuery, navigate]);

  return (
    <>
      <header className="fixed top-2.5 sm:top-3 lg:top-3 left-0 right-0 z-40 px-0 lg:px-6 transition-all duration-300 pointer-events-none">
        
        {/* ===============================================================
            1. DESKTOP FLOATING PILL NAVBAR (Screens >= lg)
        ================================================================ */}
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className={`hidden lg:flex max-w-[1450px] mx-auto items-center justify-between gap-2 lg:gap-3 xl:gap-4 px-4 xl:px-6 h-[56px] rounded-full transition-all duration-300 pointer-events-auto ${
            isScrolled ? 'ios-liquid-glass-pill-scrolled' : 'ios-liquid-glass-pill'
          }`}
        >
          {/* LEFT: LOGO */}
          <div className="flex items-center flex-shrink-0 pr-2">
            <Link
              to="/"
              className="flex items-center group"
              aria-label="Oxyfied Home"
            >
              <img
                src="/oxyfied.png"
                alt="Oxyfied Logo"
                className="h-7 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                loading="eager"
              />
              <span className="font-display font-extrabold text-xl tracking-tight text-deep-navy group-hover:text-burnt-orange transition-colors duration-300 ml-0.5">
                fied
              </span>
            </Link>
          </div>

          {/* CENTER: NAV LINKS WITH SLIDING LIQUID GLASS LENS */}
          <div
            className="relative flex items-center gap-1 xl:gap-2 flex-shrink-0"
            onMouseMove={handleNavMouseMove}
            onMouseLeave={handleNavMouseLeave}
          >
            {/* Ambient Refraction Glow following cursor */}
            <div
              className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-300"
              style={{
                opacity: navLens.opacity ? 0.6 : 0,
                background: `radial-gradient(100px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.22), transparent 70%)`,
              }}
            />

            {/* Shared Sliding Liquid Glass Highlight Layer */}
            <motion.div
              aria-hidden="true"
              initial={false}
              animate={{
                x: navLens.left,
                y: navLens.top,
                width: navLens.width,
                height: navLens.height,
                opacity: navLens.opacity,
              }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 30,
                mass: 0.8,
                opacity: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
              }}
              className="absolute top-0 left-0 pointer-events-none rounded-full ios-liquid-sliding-lens"
              style={{ zIndex: 0 }}
            >
              {/* Internal subtle specular highlight & reflection */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/85 to-transparent pointer-events-none" />
            </motion.div>

            {/* Desktop Dropdown: Programs */}
            <div className="relative group/navdropdown" onMouseEnter={handleNavMouseEnter} onFocus={handleNavMouseEnter}>
              <button
                type="button"
                className="relative z-10 px-3 py-1.5 rounded-full text-xs font-semibold text-deep-navy/85 hover:text-burnt-orange border border-transparent transition-colors duration-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Programs</span>
                <ChevronDown className="w-3 h-3 text-warm-gray group-hover/navdropdown:rotate-180 transition-transform duration-200" />
              </button>
              
              <div className="absolute top-full left-0 pt-2 hidden group-hover/navdropdown:block z-50">
                <div className="w-56 ios-liquid-panel shadow-[0_16px_36px_rgba(23,35,51,0.12)] p-2 rounded-2xl text-left">
                  <NavLink
                    to="/courses"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">All Programs</div>
                      <div className="text-[10px] text-warm-gray font-normal">Industry-aligned tracks</div>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/projects"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">Student Projects</div>
                      <div className="text-[10px] text-warm-gray font-normal">Live capstone showcases</div>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/resources"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">Resource Hub</div>
                      <div className="text-[10px] text-warm-gray font-normal">Articles, guides & insights</div>
                    </div>
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Desktop Dropdown: For Organizations */}
            <div className="relative group/navdropdown" onMouseEnter={handleNavMouseEnter} onFocus={handleNavMouseEnter}>
              <button
                type="button"
                className="relative z-10 px-3 py-1.5 rounded-full text-xs font-semibold text-deep-navy/85 hover:text-burnt-orange border border-transparent transition-colors duration-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Enterprise</span>
                <ChevronDown className="w-3 h-3 text-warm-gray group-hover/navdropdown:rotate-180 transition-transform duration-200" />
              </button>
              
              <div className="absolute top-full left-0 pt-2 hidden group-hover/navdropdown:block z-50">
                <div className="w-64 ios-liquid-panel shadow-[0_16px_36px_rgba(23,35,51,0.12)] p-2 rounded-2xl text-left">
                  <NavLink
                    to="/hire-from-us"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <Award className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">Hire From Us</div>
                      <div className="text-[10px] text-warm-gray font-normal">Pre-vetted engineering talent</div>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/corporate-training"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">Corporate Training</div>
                      <div className="text-[10px] text-warm-gray font-normal">Custom workforce upskilling</div>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/become-a-partner"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <Settings className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">Become a Partner</div>
                      <div className="text-[10px] text-warm-gray font-normal">Institutional & tech alliances</div>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/industry-collaboration"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">Industry Collaboration</div>
                      <div className="text-[10px] text-warm-gray font-normal">Curriculum & research hubs</div>
                    </div>
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Desktop Dropdown: About & Community */}
            <div className="relative group/navdropdown" onMouseEnter={handleNavMouseEnter} onFocus={handleNavMouseEnter}>
              <button
                type="button"
                className="relative z-10 px-3 py-1.5 rounded-full text-xs font-semibold text-deep-navy/85 hover:text-burnt-orange border border-transparent transition-colors duration-200 flex items-center gap-1 cursor-pointer"
              >
                <span>About</span>
                <ChevronDown className="w-3 h-3 text-warm-gray group-hover/navdropdown:rotate-180 transition-transform duration-200" />
              </button>
              
              <div className="absolute top-full left-0 pt-2 hidden group-hover/navdropdown:block z-50">
                <div className="w-60 ios-liquid-panel shadow-[0_16px_36px_rgba(23,35,51,0.12)] p-2 rounded-2xl text-left">
                  <NavLink
                    to="/about"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">About Oxyfied</div>
                      <div className="text-[10px] text-warm-gray font-normal">Our mission & team</div>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/student-success"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <Award className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">Student Success</div>
                      <div className="text-[10px] text-warm-gray font-normal">Alumni outcomes & placements</div>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/leadership-council"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">Leadership Council</div>
                      <div className="text-[10px] text-warm-gray font-normal">Executive advisory board</div>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/careers"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <Settings className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">Careers</div>
                      <div className="text-[10px] text-warm-gray font-normal">Join our growing team</div>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/become-an-instructor"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-deep-navy hover:bg-white/80 hover:text-burnt-orange transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-burnt-orange" />
                    <div>
                      <div className="leading-tight">Become an Instructor</div>
                      <div className="text-[10px] text-warm-gray font-normal">Mentor the next generation</div>
                    </div>
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Direct Link: Verify Credential */}
            <NavLink
              to="/verify-credential"
              onMouseEnter={handleNavMouseEnter}
              onFocus={handleNavMouseEnter}
              onBlur={handleNavMouseLeave}
              className={({ isActive }) =>
                `relative z-10 px-3 py-1.5 rounded-full text-xs transition-colors duration-200 select-none ${
                  isActive
                    ? 'text-burnt-orange font-bold bg-burnt-orange/12 border border-burnt-orange/25 shadow-2xs'
                    : 'font-semibold text-deep-navy/85 hover:text-burnt-orange border border-transparent'
                }`
              }
            >
              Verify
            </NavLink>

            {/* Direct Link: Contact */}
            <NavLink
              to="/contact"
              onMouseEnter={handleNavMouseEnter}
              onFocus={handleNavMouseEnter}
              onBlur={handleNavMouseLeave}
              className={({ isActive }) =>
                `relative z-10 px-3 py-1.5 rounded-full text-xs transition-colors duration-200 select-none ${
                  isActive
                    ? 'text-burnt-orange font-bold bg-burnt-orange/12 border border-burnt-orange/25 shadow-2xs'
                    : 'font-semibold text-deep-navy/85 hover:text-burnt-orange border border-transparent'
                }`
              }
            >
              Contact
            </NavLink>
          </div>

          {/* CENTER/RIGHT: SEARCH BAR (PILL + ⌘K) */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative group/search flex items-center flex-shrink-0"
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search programs, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 lg:w-52 xl:w-68 h-9 ios-liquid-search rounded-full pl-8 pr-12 text-xs focus:outline-none transition-all duration-300 text-deep-navy placeholder:text-warm-gray"
            />
            <Search className="w-3.5 h-3.5 text-warm-gray absolute left-2.5 top-1/2 -translate-y-1/2 group-focus-within/search:text-burnt-orange transition-colors pointer-events-none" />
            
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-gray hover:text-deep-navy cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono font-bold text-warm-gray bg-white/70 border border-white/60 rounded shadow-2xs pointer-events-none">
                ⌘K
              </span>
            )}
          </form>

          {/* RIGHT: NOTIFICATIONS + SIGN IN / GET STARTED OR PROFILE */}
          <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
            {/* Notifications Bell (if authenticated) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen((prev) => !prev)}
                  className={`w-9 h-9 rounded-full transition-all duration-200 relative border flex items-center justify-center cursor-pointer ${
                    isNotificationsOpen
                      ? 'bg-burnt-orange/15 text-burnt-orange border-burnt-orange/30 shadow-xs'
                      : 'ios-liquid-disc text-deep-navy hover:text-burnt-orange'
                  }`}
                  aria-label="View notifications"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-burnt-orange text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-xs">
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
            )}

            {/* Profile Menu or Sign In / CTA */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  aria-haspopup="true"
                  aria-expanded={isProfileMenuOpen}
                  className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all duration-200 cursor-pointer ${
                    isProfileMenuOpen
                      ? 'bg-white/90 border-burnt-orange/40 ring-2 ring-burnt-orange/20 shadow-xs'
                      : 'ios-liquid-disc hover:border-burnt-orange/30'
                  }`}
                >
                  {/* Avatar Circle */}
                  <div className="w-7 h-7 rounded-full bg-deep-navy text-warm-ivory flex items-center justify-center font-bold text-xs shadow-xs">
                    {getUserInitials(user?.name)}
                  </div>

                  {/* User Name */}
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-deep-navy leading-none truncate max-w-[100px]">
                      {user?.name?.split(' ')[0] || 'Member'}
                    </p>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-warm-gray transition-transform duration-200 ${
                      isProfileMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-60 ios-liquid-panel shadow-[0_16px_40px_rgba(23,35,51,0.12)] overflow-hidden z-50 text-left"
                    >
                      {/* User Identity Header */}
                      <div className="p-3.5 bg-warm-ivory/50 border-b border-white/50 backdrop-blur-sm">
                        <p className="text-xs font-bold text-deep-navy truncate">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-warm-gray truncate">
                          {user?.email}
                        </p>
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-burnt-orange/15 text-burnt-orange text-[10px] font-bold border border-burnt-orange/20">
                          <Sparkles className="w-3 h-3" />
                          {user?.role === 'admin'
                            ? 'Admin'
                            : user?.role === 'mentor'
                              ? 'Mentor'
                              : 'Learner'}
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="p-2 space-y-0.5 text-xs">
                        <Link
                          to={dashboardRoute}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-deep-navy hover:bg-white/60 hover:text-burnt-orange transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-burnt-orange" />
                          <span>
                            {user?.role === 'admin'
                              ? 'Admin Dashboard'
                              : user?.role === 'mentor'
                                ? 'Mentor Workspace'
                                : 'My Dashboard'}
                          </span>
                        </Link>

                        <Link
                          to="/dashboard/my-courses"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-deep-navy hover:bg-white/60 hover:text-burnt-orange transition-colors"
                        >
                          <GraduationCap className="w-4 h-4 text-sage-green" />
                          <span>Enrolled Programs</span>
                        </Link>

                        <Link
                          to="/dashboard/certificates"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-deep-navy hover:bg-white/60 hover:text-burnt-orange transition-colors"
                        >
                          <Award className="w-4 h-4 text-burnt-orange" />
                          <span>Certifications</span>
                        </Link>

                        <Link
                          to="/dashboard/settings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-deep-navy hover:bg-white/60 hover:text-burnt-orange transition-colors"
                        >
                          <Settings className="w-4 h-4 text-warm-gray" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      {/* Logout Section */}
                      <div className="p-2 border-t border-white/40 bg-warm-ivory/20">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-red-600 hover:bg-red-50/80 transition-colors text-xs text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 xl:gap-2.5">
                {/* Sign In Link */}
                <Link
                  to="/login"
                  className="text-xs font-bold text-deep-navy/85 hover:text-burnt-orange transition-all duration-150 px-2.5 py-1.5 rounded-full hover:bg-white/40"
                >
                  Sign In
                </Link>

                {/* Get Started CTA Button */}
                <Link
                  to="/register"
                  className="ios-liquid-orange-pill inline-flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-full text-white cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </nav>


        {/* ===============================================================
            2. MOBILE FLOATING LIQUID GLASS NAVBAR (Screens < lg)
        ================================================================ */}
        <nav
          role="navigation"
          aria-label="Mobile Navigation"
          className={`lg:hidden mx-3 sm:mx-4 h-[58px] sm:h-[60px] rounded-full px-3.5 sm:px-4 flex items-center justify-between transition-all duration-300 pointer-events-auto ${
            isScrolled ? 'ios-liquid-mobile-nav-scrolled' : 'ios-liquid-mobile-nav'
          }`}
        >
          {/* Mobile Logo */}
          <Link
            to="/"
            className="flex items-center group flex-shrink-0"
            aria-label="Oxyfied Home"
          >
            <img
              src="/oxyfied.png"
              alt="Oxyfied Logo"
              className="h-6.5 sm:h-7 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              loading="eager"
            />
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-deep-navy group-hover:text-burnt-orange transition-colors duration-200 ml-0.5">
              fied
            </span>
          </Link>

          {/* Mobile Actions ([Search] [Menu]) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-9.5 h-9.5 sm:w-10.5 sm:h-10.5 rounded-full ios-liquid-action-btn text-deep-navy hover:text-burnt-orange active:text-burnt-orange flex items-center justify-center transition-all cursor-pointer"
              aria-label="Search"
              title="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Mobile Hamburger / Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="w-9.5 h-9.5 sm:w-10.5 sm:h-10.5 rounded-full ios-liquid-action-btn text-deep-navy hover:text-burnt-orange active:text-burnt-orange flex items-center justify-center transition-all focus:outline-none cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              title="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-burnt-orange" />
              ) : (
                <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </nav>

      </header>

      {/* ===============================================================
          3. MOBILE MENU DRAWER (ANIMATED SLIDE OVERLAY)
      ================================================================ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-deep-navy/30 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-xs sm:max-w-sm bg-warm-white/95 backdrop-blur-2xl shadow-2xl flex flex-col pt-5 px-5 overflow-y-auto border-l border-white/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-light-taupe/50">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center"
                >
                  <img
                    src="/oxyfied.png"
                    alt="OX"
                    className="h-7 w-auto object-contain"
                  />
                  <span className="font-display font-extrabold text-2xl tracking-tight text-deep-navy ml-1">
                    fied
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl macos-glass-button text-deep-navy hover:text-burnt-orange cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <form
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setIsMobileMenuOpen(false);
                }}
                className="relative my-4"
              >
                <input
                  type="text"
                  placeholder="Search programs, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/70 border border-light-taupe/60 rounded-full py-2 pl-4 pr-10 text-xs focus:border-burnt-orange focus:bg-white focus:outline-none text-deep-navy placeholder-warm-gray shadow-xs backdrop-blur-md"
                />
                <button
                  type="submit"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-gray hover:text-burnt-orange cursor-pointer"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Track Shortcuts */}
              <div className="mb-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-warm-gray mb-2">
                  Popular Tracks
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/courses/cybersecurity-ethical-hacking"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 bg-white/60 backdrop-blur-md rounded-xl border border-white/70 hover:border-burnt-orange/50 transition-colors flex items-center gap-2 text-left"
                  >
                    <TrendingUp className="w-4 h-4 text-burnt-orange flex-shrink-0" />
                    <span className="text-[11px] font-bold text-deep-navy truncate">Cybersecurity</span>
                  </Link>
                  <Link
                    to="/courses/data-science-generative-ai"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 bg-white/60 backdrop-blur-md rounded-xl border border-white/70 hover:border-sage-green/50 transition-colors flex items-center gap-2 text-left"
                  >
                    <Database className="w-4 h-4 text-sage-green flex-shrink-0" />
                    <span className="text-[11px] font-bold text-deep-navy truncate">Data Science</span>
                  </Link>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-3 mb-6 text-left">
                {/* Main Links */}
                <div className="space-y-1">
                  <NavLink
                    to="/"
                    end
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        isActive ? 'bg-burnt-orange text-white shadow-xs' : 'text-deep-navy hover:bg-white/70'
                      }`
                    }
                  >
                    <span>Home</span>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-warm-gray" />
                  </NavLink>
                </div>

                {/* Programs Section */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-warm-gray mb-1 px-2">
                    Learning & Projects
                  </p>
                  <div className="space-y-1">
                    <NavLink
                      to="/courses"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>All Programs & Tracks</span>
                    </NavLink>
                    <NavLink
                      to="/projects"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>Student Projects</span>
                    </NavLink>
                    <NavLink
                      to="/resources"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>Resource Hub</span>
                    </NavLink>
                  </div>
                </div>

                {/* Enterprise Section */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-warm-gray mb-1 px-2">
                    Enterprise & Partners
                  </p>
                  <div className="space-y-1">
                    <NavLink
                      to="/hire-from-us"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>Hire From Us</span>
                    </NavLink>
                    <NavLink
                      to="/corporate-training"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>Corporate Training</span>
                    </NavLink>
                    <NavLink
                      to="/become-a-partner"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>Become a Partner</span>
                    </NavLink>
                    <NavLink
                      to="/industry-collaboration"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>Industry Collaboration</span>
                    </NavLink>
                  </div>
                </div>

                {/* About & Community Section */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-warm-gray mb-1 px-2">
                    Company & Community
                  </p>
                  <div className="space-y-1">
                    <NavLink
                      to="/about"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>About Oxyfied</span>
                    </NavLink>
                    <NavLink
                      to="/student-success"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>Student Success</span>
                    </NavLink>
                    <NavLink
                      to="/leadership-council"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>Leadership Council</span>
                    </NavLink>
                    <NavLink
                      to="/careers"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>Careers</span>
                    </NavLink>
                    <NavLink
                      to="/become-an-instructor"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isActive ? 'bg-burnt-orange/15 text-burnt-orange font-bold' : 'text-deep-navy hover:bg-white/70'
                        }`
                      }
                    >
                      <span>Become an Instructor</span>
                    </NavLink>
                  </div>
                </div>

                {/* Direct Links */}
                <div className="space-y-1 pt-1 border-t border-light-taupe/40">
                  <NavLink
                    to="/verify-credential"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        isActive ? 'bg-burnt-orange text-white shadow-xs' : 'text-deep-navy hover:bg-white/70'
                      }`
                    }
                  >
                    <span>Credential Registry</span>
                    <Award className="w-4 h-4 text-burnt-orange" />
                  </NavLink>
                  <NavLink
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        isActive ? 'bg-burnt-orange text-white shadow-xs' : 'text-deep-navy hover:bg-white/70'
                      }`
                    }
                  >
                    <span>Contact Us</span>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-warm-gray" />
                  </NavLink>
                </div>
              </div>

              {/* Mobile Auth Bottom Bar */}
              <div className="mt-auto border-t border-light-taupe/50 pt-4 pb-6 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="p-3 bg-white/60 backdrop-blur-md rounded-xl border border-white/70 flex items-center gap-3 mb-2 text-left">
                      <div className="w-8 h-8 rounded-full bg-deep-navy text-warm-ivory flex items-center justify-center font-bold text-xs">
                        {getUserInitials(user?.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-deep-navy truncate">{user?.name}</p>
                        <p className="text-[10px] text-burnt-orange font-semibold uppercase">{user?.role}</p>
                      </div>
                    </div>

                    <Link
                      to={dashboardRoute}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-2.5 bg-burnt-orange hover:bg-deep-orange text-white rounded-full text-center font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4" />
                      Open Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2 bg-white/70 border border-light-taupe/60 text-red-600 rounded-full text-center font-bold text-xs hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-2.5 bg-white/70 border border-deep-navy text-deep-navy rounded-full text-center font-bold text-xs block backdrop-blur-sm"
                    >
                      Sign In
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn-primary w-full py-2.5 rounded-full text-center font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

Navbar.displayName = 'Navbar';
