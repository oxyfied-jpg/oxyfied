import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Star, 
  ArrowRight, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Zap, 
  Award
} from 'lucide-react';
import type { Course } from '../../types';
import { CourseTechIcon } from './CourseTechIcon';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  className?: string;
}

/**
 * Helper to determine the top badge label, icon, and color theme
 */
const getBadgeConfig = (course: Course) => {
  if (course.status === 'coming-soon') {
    return {
      label: 'COMING SOON',
      icon: Clock,
      style: 'bg-warm-ivory text-warm-gray border-light-taupe/80'
    };
  }

  if (course.students && course.students >= 1500) {
    return {
      label: 'MOST ENROLLED',
      icon: TrendingUp,
      style: 'bg-burnt-orange/10 text-burnt-orange border-burnt-orange/20'
    };
  }

  if (course.rating && course.rating >= 4.9) {
    return {
      label: 'TOP RATED',
      icon: Star,
      style: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    };
  }

  if (course.featured) {
    return {
      label: 'TRENDING',
      icon: Zap,
      style: 'bg-deep-navy/5 text-deep-navy border-deep-navy/15'
    };
  }

  if (course.level && course.level.toLowerCase().includes('beginner')) {
    return {
      label: 'BEGINNER',
      icon: Sparkles,
      style: 'bg-sage-green/10 text-sage-green border-sage-green/20'
    };
  }

  if (course.category.toLowerCase().includes('cyber')) {
    return {
      label: 'CYBERSECURITY',
      icon: ShieldCheck,
      style: 'bg-deep-navy/10 text-deep-navy border-deep-navy/20'
    };
  }

  if (course.category.toLowerCase().includes('data')) {
    return {
      label: 'DATA SCIENCE',
      icon: Database,
      style: 'bg-burnt-orange/10 text-burnt-orange border-burnt-orange/20'
    };
  }

  return {
    label: course.category.toUpperCase(),
    icon: Award,
    style: 'bg-warm-ivory text-deep-navy border-light-taupe'
  };
};

/**
 * Format student count into compact review string e.g. 1850 -> "1.8k"
 */
const formatStudentCount = (count: number): string => {
  if (!count || count <= 0) return '';
  if (count >= 1000) {
    const formatted = (count / 1000).toFixed(1).replace('.0', '');
    return `(${formatted}k)`;
  }
  return `(${count})`;
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, className = '' }) => {
  const navigate = useNavigate();
  const isComingSoon = course.status === 'coming-soon';

  const badgeConfig = getBadgeConfig(course);
  const BadgeIcon = badgeConfig.icon;

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/courses/${course.slug}`);
    }
  };

  const isPopular = Boolean(
    course.featured ||
    (course.students && course.students >= 1400) ||
    badgeConfig.label === 'MOST ENROLLED' ||
    badgeConfig.label === 'TRENDING' ||
    badgeConfig.label === 'TOP RATED'
  );

  const borderStyles = isPopular
    ? 'border-amber-400/90 ring-1 ring-amber-400/30 hover:border-amber-500 hover:ring-1.5 hover:ring-amber-500 hover:shadow-lg hover:shadow-amber-500/15'
    : 'border-light-taupe/80 hover:border-burnt-orange hover:ring-1.5 hover:ring-burnt-orange hover:shadow-lg hover:shadow-burnt-orange/15';

  const reviewCountStr = formatStudentCount(course.students);
  const displayedSkills = course.skills?.slice(0, 3) || [];
  const remainingSkillsCount = Math.max(0, (course.skills?.length || 0) - 3);

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white border ${borderStyles} rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs hover:-translate-y-1 transition-all duration-250 cursor-pointer overflow-hidden text-left ${className}`}
    >
      {/* 1. TOP METADATA AREA: Badge (Left) + Duration (Right) */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Status / Category Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${badgeConfig.style}`}
        >
          <BadgeIcon className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-[130px]">{badgeConfig.label}</span>
        </span>

        {/* Duration */}
        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-warm-gray flex-shrink-0">
          <Clock className="w-3 h-3 text-burnt-orange/80" />
          <span>{course.duration || '6 Weeks'}</span>
        </div>
      </div>

      {/* 2. COURSE THUMBNAIL */}
      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-warm-ivory border border-light-taupe/50 mb-3.5 flex-shrink-0">
        <img
          src={course.image}
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          onError={(e) => {
            // Safe fallback image if network fails
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop';
          }}
        />
      </div>

      {/* 3. COURSE INFORMATION (Icon + Title & Description) */}
      <div className="space-y-2 mb-3.5 flex-1 flex flex-col">
        {/* Title row with Tech Icon */}
        <div className="flex items-center gap-2.5">
          <CourseTechIcon course={course} size={36} />
          <h3 className="font-display font-bold text-[14.5px] sm:text-[15.5px] text-deep-navy group-hover:text-burnt-orange transition-colors line-clamp-2 leading-snug flex-1">
            <Link
              to={`/courses/${course.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
            >
              {course.title}
            </Link>
          </h3>
        </div>

        {/* Short description */}
        <p className="text-warm-gray text-[12px] leading-relaxed line-clamp-2">
          {course.description}
        </p>
      </div>

      {/* 4. TECHNOLOGY / SKILL TAGS */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 pt-1">
        {displayedSkills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-medium bg-warm-ivory/80 text-deep-navy/90 border border-light-taupe/60"
          >
            {skill}
          </span>
        ))}
        {remainingSkillsCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-warm-ivory text-warm-gray border border-light-taupe/60">
            +{remainingSkillsCount}
          </span>
        )}
      </div>

      {/* 5. FOOTER: RATING & CTA BUTTON */}
      <div className="pt-3 border-t border-light-taupe/60 flex items-center justify-between gap-2 mt-auto">
        {/* Left: Rating and Review Count */}
        <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
            <span className="font-bold text-deep-navy text-xs">
              {course.rating ? course.rating.toFixed(1) : '4.9'}
            </span>
          </div>
          {reviewCountStr && (
            <span className="text-[10.5px] text-warm-gray font-normal">
              {reviewCountStr}
            </span>
          )}
        </div>

        {/* Right: View Course CTA Button */}
        <Link
          to={`/courses/${course.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="group/btn inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-warm-ivory/80 hover:bg-burnt-orange text-deep-navy hover:text-white border border-light-taupe/80 hover:border-burnt-orange transition-all duration-200 shadow-2xs"
        >
          <span>{isComingSoon ? 'View Details' : 'View Course'}</span>
          <ArrowRight className="w-3 h-3 text-burnt-orange group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all duration-200" />
        </Link>
      </div>
    </div>
  );
};
