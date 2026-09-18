import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Users,
  Flame,
  User
} from 'lucide-react';
import type { Course } from '../../types';
import { CourseTechIcon } from '../common/CourseTechIcon';

export type ProgramCategoryFilter =
  | 'All'
  | 'Development'
  | 'AI & Data'
  | 'Cloud'
  | 'Cybersecurity'
  | 'Business'
  | 'Design';

interface CategoryTab {
  id: ProgramCategoryFilter;
  label: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: 'All', label: 'All' },
  { id: 'Development', label: 'Development' },
  { id: 'AI & Data', label: 'AI & Data' },
  { id: 'Cloud', label: 'Cloud' },
  { id: 'Cybersecurity', label: 'Cybersecurity' },
  { id: 'Business', label: 'Business' },
  { id: 'Design', label: 'Design' }
];

interface MostPopularCoursesSectionProps {
  courses: Course[];
  isLoading?: boolean;
}

/**
 * Status badges for small cards
 */
const getCourseBadge = (course: Course, index: number) => {
  if (course.status === 'coming-soon') {
    return {
      label: 'NEW',
      icon: Sparkles,
      style: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
  }

  const presets = [
    { label: 'TRENDING', icon: Flame, style: 'bg-orange-50 text-burnt-orange border-orange-200' },
    { label: 'TOP RATED', icon: Star, style: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'FAST GROWING', icon: Zap, style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'MOST ENROLLED', icon: Users, style: 'bg-blue-50 text-blue-700 border-blue-200' }
  ];

  if (course.students && course.students >= 1800) {
    return { label: 'MOST ENROLLED', icon: Users, style: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
  if (course.rating && course.rating >= 4.9) {
    return { label: 'TOP RATED', icon: Star, style: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (course.featured) {
    return { label: 'TRENDING', icon: Flame, style: 'bg-orange-50 text-burnt-orange border-orange-200' };
  }

  return presets[index % presets.length];
};

/**
 * Format student count into review string e.g. 1850 -> "2.4k"
 */
const formatStudentCount = (count?: number): string => {
  if (!count || count <= 0) return '1.2k';
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.0', '')}k`;
  }
  return `${count}`;
};

/**
 * Format compact duration e.g. "8 Months" -> "8m" or "8w"
 */
const formatCompactDuration = (duration?: string): string => {
  if (!duration) return '8w';
  const lower = duration.toLowerCase();
  if (lower.includes('month')) {
    const num = duration.replace(/[^0-9]/g, '');
    return num ? `${num}m` : '6m';
  }
  if (lower.includes('week')) {
    const num = duration.replace(/[^0-9]/g, '');
    return num ? `${num}w` : '8w';
  }
  return duration;
};

export const MostPopularCoursesSection: React.FC<MostPopularCoursesSectionProps> = ({
  courses,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ProgramCategoryFilter>('All');

  // Filter courses based on active category
  const filteredCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    if (activeCategory === 'All') {
      return courses;
    }

    return courses.filter((course) => {
      const searchBlob = [
        course.title || '',
        course.category || '',
        course.description || '',
        course.slug || '',
        ...(course.skills || [])
      ].join(' ').toLowerCase();

      switch (activeCategory) {
        case 'Cybersecurity':
          return (
            course.category === 'Cybersecurity' ||
            searchBlob.includes('cyber') ||
            searchBlob.includes('security') ||
            searchBlob.includes('hacking') ||
            searchBlob.includes('soc') ||
            searchBlob.includes('defense') ||
            searchBlob.includes('penetration') ||
            searchBlob.includes('threat')
          );
        case 'AI & Data':
          return (
            course.category === 'Data Science' ||
            searchBlob.includes('data') ||
            searchBlob.includes('ai') ||
            searchBlob.includes('machine learning') ||
            searchBlob.includes('deep learning') ||
            searchBlob.includes('python') ||
            searchBlob.includes('power bi') ||
            searchBlob.includes('analytics') ||
            searchBlob.includes('generative') ||
            searchBlob.includes('agent') ||
            searchBlob.includes('llm') ||
            searchBlob.includes('pytorch')
          );
        case 'Cloud':
          return (
            searchBlob.includes('cloud') ||
            searchBlob.includes('aws') ||
            searchBlob.includes('devsecops') ||
            searchBlob.includes('devops') ||
            searchBlob.includes('kubernetes') ||
            searchBlob.includes('docker') ||
            searchBlob.includes('ci/cd')
          );
        case 'Development':
          return (
            searchBlob.includes('development') ||
            searchBlob.includes('engineering') ||
            searchBlob.includes('python') ||
            searchBlob.includes('sql') ||
            searchBlob.includes('web') ||
            searchBlob.includes('code') ||
            searchBlob.includes('react') ||
            searchBlob.includes('blockchain') ||
            searchBlob.includes('programming')
          );
        case 'Business':
          return (
            searchBlob.includes('business') ||
            searchBlob.includes('analytics') ||
            searchBlob.includes('power bi') ||
            searchBlob.includes('odoo') ||
            searchBlob.includes('bi') ||
            searchBlob.includes('intelligence') ||
            searchBlob.includes('executive')
          );
        case 'Design':
          return (
            searchBlob.includes('design') ||
            searchBlob.includes('ui') ||
            searchBlob.includes('ux') ||
            searchBlob.includes('figma') ||
            searchBlob.includes('web app') ||
            searchBlob.includes('vision')
          );
        default:
          return true;
      }
    });
  }, [courses, activeCategory]);

  // Select 1 Large Featured Course + 4 Small Course Cards
  const { featuredCourse, compactCourses } = useMemo(() => {
    if (!filteredCourses || filteredCourses.length === 0) {
      const fallbackFeatured = courses.find((c) => c.featured) || courses[0];
      const fallbackCompact = courses.filter((c) => c.id !== fallbackFeatured?.id).slice(0, 4);
      return { featuredCourse: fallbackFeatured, compactCourses: fallbackCompact };
    }

    let feat = filteredCourses.find((c) => c.featured) || filteredCourses[0];
    let compact = filteredCourses.filter((c) => c.id !== feat.id).slice(0, 4);

    // If fewer than 4 compact courses exist in this category, fill remaining from all courses
    if (compact.length < 4 && courses.length > 0) {
      const remainingNeeded = 4 - compact.length;
      const existingIds = new Set([feat.id, ...compact.map((c) => c.id)]);
      const fillers = courses.filter((c) => !existingIds.has(c.id)).slice(0, remainingNeeded);
      compact = [...compact, ...fillers];
    }

    return { featuredCourse: feat, compactCourses: compact };
  }, [filteredCourses, courses]);

  return (
    <section
      id="most-popular-courses"
      className="py-7 sm:py-8 bg-[#FAF7F2] border-b border-light-taupe/60 relative"
      aria-label="Most Popular Courses Showcase"
    >
      {/* Max-width container */}
      <div className="max-w-[1380px] w-[calc(100%-32px)] sm:w-[calc(100%-48px)] lg:w-[calc(100%-64px)] xl:w-[calc(100%-80px)] mx-auto space-y-4">
        
        {/* ===============================================================
            A. MOBILE POPULAR COURSES (< 768px / md:hidden) - MATCHES REFERENCE
        ================================================================ */}
        <div className="md:hidden space-y-3">
          {/* Mobile Header with View All on Right */}
          <div className="flex items-end justify-between">
            <div className="text-left space-y-0.5">
              <span className="text-burnt-orange text-[10px] font-extrabold tracking-widest uppercase block">
                POPULAR PROGRAMS
              </span>
              <h2 className="text-2xl font-display font-extrabold text-deep-navy tracking-tight leading-tight">
                Most Popular Courses
              </h2>
              <p className="text-warm-gray text-xs leading-snug">
                Gain in-demand skills with our industry-focused programs.
              </p>
            </div>

            <Link
              to="/courses"
              className="text-xs font-bold text-burnt-orange hover:text-deep-orange flex items-center gap-0.5 shrink-0 mb-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'bg-burnt-orange text-white border border-burnt-orange shadow-xs'
                      : 'bg-white text-deep-navy border border-light-taupe'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Vertical List of Compact Horizontal Cards */}
          <div className="space-y-2.5">
            {isLoading ? (
              <div className="space-y-2.5 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-white border border-light-taupe/80 rounded-2xl p-2 flex gap-3" />
                ))}
              </div>
            ) : (
              [featuredCourse, ...compactCourses].filter(Boolean).slice(0, 5).map((course) => {
                const compactDur = formatCompactDuration(course.duration);
                return (
                  <Link
                    key={`mobile-${course.id}`}
                    to={`/courses/${course.slug}`}
                    className="bg-white border border-light-taupe hover:border-burnt-orange/60 rounded-2xl p-2.5 flex items-center gap-3 shadow-2xs hover:shadow-sm transition-all text-left group"
                  >
                    {/* Left: Thumbnail Image (approx 36% width) */}
                    <div className="w-[36%] h-[84px] rounded-xl overflow-hidden bg-deep-navy shrink-0 relative">
                      <img
                        src={course.image}
                        alt={course.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.2 bg-deep-navy/90 text-white text-[7.5px] font-bold rounded uppercase tracking-wider">
                        {course.category}
                      </span>
                    </div>

                    {/* Right: Icon + Title + Level + Duration + Desc + Arrow */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-[84px] py-0.5">
                      {/* Top: Icon + Title */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-warm-ivory border border-light-taupe flex items-center justify-center shrink-0 overflow-hidden">
                          <CourseTechIcon course={course} size={15} />
                        </div>
                        <h3 className="font-display font-bold text-[13px] text-deep-navy group-hover:text-burnt-orange transition-colors truncate leading-tight flex-1">
                          {course.title}
                        </h3>
                      </div>

                      {/* Middle: Level & Duration Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded-full text-[8.5px] font-semibold bg-[#FEF5EE] text-burnt-orange border border-burnt-orange/20 whitespace-nowrap leading-none">
                          {course.level || 'Beginner - Advanced'}
                        </span>
                        <span className="text-[9px] text-warm-gray flex items-center gap-0.5 font-medium">
                          <Clock className="w-2.5 h-2.5 text-burnt-orange" />
                          <span>{compactDur}</span>
                        </span>
                      </div>

                      {/* Bottom: Short Description + Arrow Link */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-warm-gray truncate leading-tight flex-1">
                          {course.description}
                        </p>
                        <div className="w-6 h-6 rounded-full bg-warm-ivory group-hover:bg-burnt-orange group-hover:text-white text-burnt-orange flex items-center justify-center shrink-0 transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* ===============================================================
            B. DESKTOP POPULAR COURSES (≥ 768px / hidden md:block) - UNCHANGED
        ================================================================ */}
        <div className="hidden md:block space-y-4">
          
          {/* Desktop Header + Category Filter Pills */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div className="space-y-0.5 text-left max-w-xl">
              <span className="text-burnt-orange text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase block">
                OUR PROGRAMS
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[30px] font-display font-extrabold text-deep-navy tracking-tight leading-tight">
                Most Popular Courses
              </h2>
              <p className="text-warm-gray text-[11.5px] sm:text-[12.5px] font-normal leading-normal">
                Gain in-demand skills with our industry-focused programs.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none flex-nowrap lg:flex-wrap lg:justify-end">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCategory(tab.id)}
                      className={`px-3 py-1 text-[11px] sm:text-[11.5px] font-semibold rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                        isActive
                          ? 'bg-burnt-orange text-white border border-burnt-orange shadow-xs'
                          : 'bg-white text-deep-navy border border-light-taupe hover:border-burnt-orange/50 hover:bg-warm-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}

                <Link
                  to="/courses"
                  className="px-3 py-1 text-[11px] sm:text-[11.5px] font-semibold rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 flex items-center gap-1 bg-white text-deep-navy border border-light-taupe hover:border-burnt-orange hover:text-burnt-orange"
                  title="View all filters in catalog"
                >
                  <SlidersHorizontal className="w-3 h-3 text-burnt-orange" />
                  <span>More Filters</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Showcase Row: 1 Featured + 4 Small Cards */}
          {isLoading || !featuredCourse ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_1fr_1fr] gap-3 items-stretch animate-pulse">
              <div className="bg-[#0B1220] rounded-2xl p-4 min-h-[260px]" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-light-taupe/70 rounded-2xl p-3 min-h-[260px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_1fr_1fr] gap-3 items-stretch">
              
              {/* Featured Course Card */}
              <motion.div
                layout
                key={`featured-${featuredCourse.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => navigate(`/courses/${featuredCourse.slug}`)}
                className="relative rounded-2xl overflow-hidden border border-slate-700/80 hover:border-burnt-orange/80 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 group text-left min-h-[265px] h-full"
              >
                <img
                  src={featuredCourse.image}
                  alt={featuredCourse.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#080E1A] via-[#091120]/90 to-[#0A1224]/75 pointer-events-none" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-burnt-orange/15 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-burnt-orange text-white shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      FEATURED PROGRAM
                    </span>
                    
                    <span className="text-[10px] font-semibold text-gray-200 flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-burnt-orange" />
                      {featuredCourse.duration || '8 Weeks'}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-[17px] sm:text-[19px] !text-white group-hover:!text-burnt-orange transition-colors leading-tight line-clamp-2 pt-1">
                    <Link
                      to={`/courses/${featuredCourse.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="!text-white hover:underline"
                    >
                      {featuredCourse.title}
                    </Link>
                  </h3>

                  <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                    {featuredCourse.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {featuredCourse.skills?.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-white/10 text-gray-200 backdrop-blur-xs border border-white/10"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between gap-2 mt-4">
                  <div className="text-left">
                    <span className="text-[9.5px] text-gray-300 block uppercase font-bold tracking-wider">
                      Specialist Program
                    </span>
                    <span className="text-xs font-bold text-white">
                      {featuredCourse.lessons || 95} Lessons • Verified Certificate
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-burnt-orange hover:bg-burnt-orange-dark text-white text-xs font-bold shadow-md transition-all group-hover:translate-x-0.5">
                    <span>Explore Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>

              {/* 4 Small Cards */}
              <AnimatePresence mode="popLayout">
                {compactCourses.map((course, idx) => {
                  const badge = getCourseBadge(course, idx);
                  const BadgeIcon = badge.icon;
                  const isComingSoon = course.status === 'coming-soon';
                  const compactDur = formatCompactDuration(course.duration);

                  return (
                    <motion.div
                      layout
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      onClick={() => navigate(`/courses/${course.slug}`)}
                      className="bg-white border border-light-taupe hover:border-burnt-orange/60 rounded-2xl p-3 shadow-2xs hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between group text-left relative min-h-[265px] h-full"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-extrabold border uppercase tracking-wider ${badge.style}`}
                          >
                            <BadgeIcon className="w-2.5 h-2.5" />
                            <span>{badge.label}</span>
                          </span>

                          <span className="text-[10px] font-semibold text-warm-gray flex items-center gap-0.5 bg-warm-ivory px-1.5 py-0.5 rounded">
                            <span>◷ {compactDur}</span>
                          </span>
                        </div>

                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-warm-ivory border border-light-taupe/40 mb-2 flex-shrink-0">
                          <img
                            src={course.image}
                            alt={course.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop';
                            }}
                          />
                        </div>

                        <div className="flex items-start gap-1.5 mb-1">
                          <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-warm-ivory border border-light-taupe/80 flex items-center justify-center overflow-hidden shadow-2xs">
                            <CourseTechIcon course={course} size={18} />
                          </div>
                          <h4 className="font-display font-bold text-[12px] sm:text-[12.5px] !text-deep-navy group-hover:!text-burnt-orange transition-colors leading-snug line-clamp-2 flex-1">
                            <Link
                              to={`/courses/${course.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="!text-deep-navy hover:underline"
                            >
                              {course.title}
                            </Link>
                          </h4>
                        </div>

                        <p className="text-warm-gray text-[10px] leading-relaxed line-clamp-2 mb-1.5">
                          {course.description}
                        </p>
                      </div>

                      <div className="space-y-1 pt-1.5 border-t border-light-taupe/60 mt-auto">
                        <div className="text-[9.5px] text-warm-gray font-medium flex items-center gap-1 truncate">
                          <User className="w-2.5 h-2.5 text-sage-green flex-shrink-0" />
                          <span className="truncate">
                            {course.instructor?.name || 'Lead Instructor'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 text-[10px]">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                            <span className="font-bold !text-deep-navy">
                              {course.rating ? course.rating.toFixed(1) : '4.8'}
                            </span>
                            <span className="text-warm-gray text-[9px]">
                              ({formatStudentCount(course.students)})
                            </span>
                          </div>

                          <Link
                            to={`/courses/${course.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="group/link inline-flex items-center gap-0.5 text-[10px] font-bold text-burnt-orange hover:text-burnt-orange-dark transition-colors"
                          >
                            <span>{isComingSoon ? 'View Details' : 'View Course'}</span>
                            <ArrowRight className="w-2.5 h-2.5 group-hover/link:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

            </div>
          )}
        </div>

      </div>
    </section>
  );
};
