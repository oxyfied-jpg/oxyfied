import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  GraduationCap,
  ArrowRight,
  Play,
  Laptop,
  Award,
  ChevronRight,
  ChevronLeft,
  Shield,
  Bot,
  Star,
  X
} from 'lucide-react';
import type { Course } from '../../types';
import { courses as fallbackCourses } from '../../data/courses';
import { courseService } from '../../services/courseService';
import { CourseTechIcon } from '../common/CourseTechIcon';

interface PopularProgramItem {
  id: string;
  title: string;
  description: string;
  level: string;
  href: string;
  iconBg?: string;
  customIcon?: React.ReactNode;
  courseObj?: Course;
}

interface HeroSlideItem {
  id: string;
  badge: {
    icon: React.ElementType;
    text: string;
  };
  headline: {
    line1: string;
    line2: string;
    line3: string;
    highlightLine: 1 | 2 | 3;
  };
  subtitle: string;
  backgroundImage: string;
  mobileBackgroundImage?: string;
  backgroundAlt: string;
  objectPosition?: string;
  mobileObjectPosition?: string;
  popularProgramsTitle: string;
  popularPrograms: PopularProgramItem[];
}

const cleanCourseTitle = (title: string): string => {
  return title
    .replace(/^Master Program in /i, '')
    .replace(/^Master Program /i, '')
    .replace(/^Masterclass in /i, '')
    .replace(/ Specialist$/i, '')
    .trim();
};

const mapCourseToPopularProgram = (course: Course): PopularProgramItem => {
  return {
    id: course.id || course.slug,
    title: cleanCourseTitle(course.title),
    description:
      course.description ||
      (course.skills && course.skills.length > 0
        ? course.skills.slice(0, 3).join(', ')
        : 'Practical skills & real-world projects.'),
    level: course.level || 'Beginner - Advanced',
    href: `/courses/${course.slug || course.id}`,
    courseObj: course
  };
};

const getFallbackItem = (slug: string, customDesc?: string): PopularProgramItem => {
  const found = fallbackCourses.find((c) => c.slug === slug || c.id === slug);
  if (found) {
    const mapped = mapCourseToPopularProgram(found);
    if (customDesc) mapped.description = customDesc;
    return mapped;
  }
  return {
    id: slug,
    title: cleanCourseTitle(slug.replace(/-/g, ' ')),
    description: customDesc || 'Industry-ready practical curriculum',
    level: 'Beginner - Advanced',
    href: `/courses/${slug}`
  };
};

const HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'general-mastery',
    badge: {
      icon: GraduationCap,
      text: 'Learn • Build • Grow'
    },
    headline: {
      line1: 'Practical Skills.',
      line2: 'Real Projects.',
      line3: 'Better Future.',
      highlightLine: 3
    },
    subtitle:
      'Short, hands-on, industry-relevant courses to help you build in-demand skills, work on real projects, and get job-ready in today’s fast-evolving world.',
    backgroundImage: '/hero_boy.jpg',
    mobileBackgroundImage: '/images/hero/mobile/hero-1-mobile.jpg',
    backgroundAlt:
      'Student learning coding on laptop with tech textbooks',
    objectPosition: 'object-[54%_42%]',
    mobileObjectPosition: 'object-[center_35%]',
    popularProgramsTitle: 'Popular Programs',
    popularPrograms: [
      getFallbackItem('cybersecurity-ethical-hacking', 'Master ethical penetration testing & defenses.'),
      getFallbackItem('data-science-generative-ai', 'Python, predictive modeling, LLMs & deep learning.'),
      getFallbackItem('soc-analyst-threat-intelligence', 'Splunk SIEM, incident response & log triage.'),
      getFallbackItem('cloud-security-devsecops', 'Hardening AWS, Azure & Kubernetes clusters.'),
      getFallbackItem('machine-learning-mlops', 'Deploy scalable ML pipelines with MLflow & Docker.')
    ]
  },

  {
    id: 'cybersecurity-defense',
    badge: {
      icon: Shield,
      text: 'Defend • Protect • Master'
    },
    headline: {
      line1: 'Defend Systems.',
      line2: 'Mitigate Threats.',
      line3: 'Lead Cyber Security.',
      highlightLine: 3
    },
    subtitle:
      'Practice network packet captures, port auditing, firewall deployments, and defensive exploitation mitigations in isolated browser sandboxes.',
    backgroundImage: 'https://images.pexels.com/photos/6585967/pexels-photo-6585967.jpeg',
    mobileBackgroundImage: '/images/hero/mobile/hero-2-mobile.jpg',
    backgroundAlt:
      'Cybersecurity and software student working on laptop in modern studio',
    objectPosition: 'object-[52%_35%]',
    mobileObjectPosition: 'object-[center_30%]',
    popularProgramsTitle: 'Security Programs',
    popularPrograms: [
      getFallbackItem('cybersecurity-ethical-hacking', 'Master ethical penetration testing & defenses.'),
      getFallbackItem('soc-analyst-threat-intelligence', 'Splunk SIEM, incident response & log triage.'),
      getFallbackItem('cloud-security-devsecops', 'Hardening AWS, Azure & Kubernetes clusters.'),
      getFallbackItem('network-defense-incident-handling', 'Wireshark deep packet inspection & IDS.'),
      getFallbackItem('quantum-computing-cryptography', 'Quantum algorithms & post-quantum security.')
    ]
  },

  {
    id: 'ai-data-cloud',
    badge: {
      icon: Bot,
      text: 'AI Agents • Cloud • Data'
    },
    headline: {
      line1: 'Build AI Agents.',
      line2: 'Deploy Cloud.',
      line3: 'Scale What Matters.',
      highlightLine: 3
    },
    subtitle:
      'Architect autonomous LLM workflows, vector embeddings, high-throughput cloud microservices, and predictive machine learning models.',
    backgroundImage:
      'https://images.pexels.com/photos/5046280/pexels-photo-5046280.jpeg',
    mobileBackgroundImage: '/images/hero/mobile/hero-3-mobile.jpg',
    backgroundAlt:
      'Data science and AI students training models collaboratively',
    objectPosition: 'object-[50%_35%]',
    mobileObjectPosition: 'object-[center_30%]',
    popularProgramsTitle: 'AI & Data Programs',
    popularPrograms: [
      getFallbackItem('data-science-generative-ai', 'Python, predictive modeling, LLMs & deep learning.'),
      getFallbackItem('autonomous-ai-agents', 'LangGraph, AutoGen, multi-agent swarms & tool use.'),
      getFallbackItem('machine-learning-mlops', 'Deploy scalable ML pipelines with MLflow & Docker.'),
      getFallbackItem('data-analytics-power-bi', 'DAX modeling, executive KPI dashboards & ETL.'),
      getFallbackItem('python-sql-data-engineering', 'High-throughput data pipelines & Snowflake.')
    ]
  }
];

interface HeroSliderProps {
  courses?: Course[];
}

const isCyberCourse = (c: Course): boolean => {
  const text = [c.title, c.category, c.slug, ...(c.skills || [])]
    .join(' ')
    .toLowerCase();
  return (
    c.category?.toLowerCase().includes('cyber') ||
    c.category?.toLowerCase().includes('security') ||
    text.includes('cyber') ||
    text.includes('security') ||
    text.includes('hacking') ||
    text.includes('penetration') ||
    text.includes('soc') ||
    text.includes('threat') ||
    text.includes('incident') ||
    text.includes('network') ||
    text.includes('wireshark') ||
    text.includes('defense') ||
    text.includes('owasp')
  );
};

const isAiDataCloudCourse = (c: Course): boolean => {
  const text = [c.title, c.category, c.slug, ...(c.skills || [])]
    .join(' ')
    .toLowerCase();
  return (
    c.category?.toLowerCase().includes('data') ||
    c.category?.toLowerCase().includes('ai') ||
    c.category?.toLowerCase().includes('cloud') ||
    text.includes('data') ||
    text.includes('ai') ||
    text.includes('machine learning') ||
    text.includes('deep learning') ||
    text.includes('python') ||
    text.includes('aws') ||
    text.includes('cloud') ||
    text.includes('power bi') ||
    text.includes('agent') ||
    text.includes('llm') ||
    text.includes('analytics') ||
    text.includes('full stack')
  );
};

export const HeroSlider: React.FC<HeroSliderProps> = ({ courses = [] }) => {
  const [loadedCourses, setLoadedCourses] = useState<Course[]>(
    courses && courses.length > 0 ? courses : fallbackCourses
  );

  useEffect(() => {
    if (courses && courses.length > 0) {
      setLoadedCourses(courses);
    } else {
      courseService
        .getCourses()
        .then((res) => {
          if (res && res.length > 0) {
            setLoadedCourses(res);
          } else {
            setLoadedCourses(fallbackCourses);
          }
        })
        .catch((err) => {
          console.error('Failed to load courses for hero slider:', err);
          setLoadedCourses(fallbackCourses);
        });
    }
  }, [courses]);

  const [[currentSlideIndex, direction], setSlide] =
    useState<[number, number]>([0, 0]);

  const [isVideoModalOpen, setIsVideoModalOpen] =
    useState(false);

  const [isHovered, setIsHovered] = useState(false);

  // Mobile touch gesture tracking for swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const paginate = useCallback((newDirection: number) => {
    setSlide(([prevPage]) => {
      const nextPage =
        (prevPage + newDirection + HERO_SLIDES.length) %
        HERO_SLIDES.length;

      return [nextPage, newDirection];
    });
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHovered(true);
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsHovered(false);
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Horizontal swipe threshold of 40px, ensure horizontal intent
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      if (diffX > 0) {
        paginate(1);
      } else {
        paginate(-1);
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const goToSlide = useCallback((newIndex: number) => {
    setSlide(([prevPage]) => {
      if (newIndex === prevPage) {
        return [prevPage, 0];
      }

      const newDir = newIndex > prevPage ? 1 : -1;

      return [newIndex, newDir];
    });
  }, []);

  const nextSlide = useCallback(
    () => paginate(1),
    [paginate]
  );

  const prevSlide = useCallback(
    () => paginate(-1),
    [paginate]
  );

  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.backgroundImage;
      if (slide.mobileBackgroundImage) {
        const mImg = new Image();
        mImg.src = slide.mobileBackgroundImage;
      }
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVideoModalOpen) return;

      if (e.key === 'ArrowLeft') {
        paginate(-1);
      } else if (e.key === 'ArrowRight') {
        paginate(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () =>
      window.removeEventListener('keydown', handleKeyDown);
  }, [isVideoModalOpen, paginate]);

  useEffect(() => {
    if (isVideoModalOpen || isHovered) return;

    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, [isVideoModalOpen, isHovered, paginate]);

  const slide = HERO_SLIDES[currentSlideIndex];
  const BadgeIcon = slide.badge.icon;

  const effectiveCourses = useMemo(() => {
    if (loadedCourses && loadedCourses.length > 0) {
      return loadedCourses;
    }
    return fallbackCourses;
  }, [loadedCourses]);

  const slidePopularPrograms = useMemo(() => {
    if (slide.id === 'cybersecurity-defense') {
      const cyberCourses = effectiveCourses.filter(isCyberCourse);
      const sorted = [...cyberCourses].sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          (b.students || 0) - (a.students || 0) ||
          (b.rating || 0) - (a.rating || 0)
      );
      const mapped = sorted.slice(0, 5).map(mapCourseToPopularProgram);
      if (mapped.length < 5) {
        const existingIds = new Set(mapped.map((m) => m.id));
        const fillers = effectiveCourses
          .filter((c) => !existingIds.has(c.id) && !existingIds.has(c.slug))
          .sort(
            (a, b) =>
              Number(b.featured) - Number(a.featured) ||
              (b.students || 0) - (a.students || 0)
          )
          .slice(0, 5 - mapped.length)
          .map(mapCourseToPopularProgram);
        return [...mapped, ...fillers];
      }
      return mapped;
    }

    if (slide.id === 'ai-data-cloud') {
      const aiCourses = effectiveCourses.filter(isAiDataCloudCourse);
      const sorted = [...aiCourses].sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          (b.students || 0) - (a.students || 0) ||
          (b.rating || 0) - (a.rating || 0)
      );
      const mapped = sorted.slice(0, 5).map(mapCourseToPopularProgram);
      if (mapped.length < 5) {
        const existingIds = new Set(mapped.map((m) => m.id));
        const fillers = effectiveCourses
          .filter((c) => !existingIds.has(c.id) && !existingIds.has(c.slug))
          .sort(
            (a, b) =>
              Number(b.featured) - Number(a.featured) ||
              (b.students || 0) - (a.students || 0)
          )
          .slice(0, 5 - mapped.length)
          .map(mapCourseToPopularProgram);
        return [...mapped, ...fillers];
      }
      return mapped;
    }

    // Default: 'general-mastery' (Top enrolled & featured programs across all tracks)
    const sorted = [...effectiveCourses].sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        (b.students || 0) - (a.students || 0) ||
        (b.rating || 0) - (a.rating || 0)
    );
    return sorted.slice(0, 5).map(mapCourseToPopularProgram);
  }, [slide, effectiveCourses]);
 
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : dir < 0 ? -40 : 0,
      opacity: 0,
      filter: 'blur(3px)',
      scale: 0.99
    }),

    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        x: {
          type: 'spring',
          stiffness: 280,
          damping: 30,
          mass: 0.8
        },
        scale: {
          duration: 0.45,
          ease: 'easeOut'
        },
        opacity: {
          duration: 0.45,
          ease: 'easeOut'
        },
        filter: {
          duration: 0.35,
          ease: 'easeOut'
        }
      }
    },

    exit: (dir: number) => ({
      zIndex: 0,
      x: dir > 0 ? -40 : dir < 0 ? 40 : 0,
      opacity: 0,
      filter: 'blur(3px)',
      scale: 0.99,
      transition: {
        x: {
          type: 'spring',
          stiffness: 280,
          damping: 30,
          mass: 0.8
        },
        scale: {
          duration: 0.3,
          ease: 'easeIn'
        },
        opacity: {
          duration: 0.3,
          ease: 'easeIn'
        },
        filter: {
          duration: 0.25,
          ease: 'easeIn'
        }
      }
    })
  };

  return (
    <>
      <section
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full overflow-hidden bg-warm-ivory border-b border-light-taupe/70 flex flex-col justify-between pt-2 sm:pt-4 pb-0 select-none group mobile-hero-first-view"
      >
        {/* HERO BACKGROUND */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="relative w-full h-full max-w-[1680px] flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.picture
                key={slide.id}
                initial={{
                  opacity: 0,
                  scale: 1.05
                }}
                animate={{
                  opacity: 0.95,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98
                }}
                transition={{
                  opacity: {
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1]
                  },
                  scale: {
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1]
                  }
                }}
                className="absolute inset-0 w-full h-full block"
              >
                {slide.mobileBackgroundImage && (
                  <source
                    media="(max-width: 767px)"
                    srcSet={slide.mobileBackgroundImage}
                  />
                )}
                <img
                  src={slide.backgroundImage}
                  alt={slide.backgroundAlt}
                  className={`w-full h-full object-cover ${
                    slide.objectPosition || 'object-center'
                  } ${
                    slide.mobileObjectPosition
                      ? `max-md:${slide.mobileObjectPosition}`
                      : ''
                  }`}
                  style={{
                    maskImage:
                      'radial-gradient(ellipse 75% 70% at 53% 45%, black 45%, rgba(0,0,0,0.85) 65%, transparent 92%)',
                    WebkitMaskImage:
                      'radial-gradient(ellipse 75% 70% at 53% 45%, black 45%, rgba(0,0,0,0.85) 65%, transparent 92%)'
                  }}
                />
              </motion.picture>
            </AnimatePresence>

            {/* LEFT / RIGHT GRADIENT */}
            <div
              className="absolute inset-0 pointer-events-none z-1"
              style={{
                background:
                  'linear-gradient(to right, #F8F3EA 0%, rgba(248, 243, 234, 0.98) 28%, rgba(248, 243, 234, 0.55) 42%, transparent 52%, rgba(248, 243, 234, 0.2) 64%, rgba(248, 243, 234, 0.88) 84%, #F8F3EA 100%)'
              }}
            />

            {/* TOP / BOTTOM GRADIENT */}
            <div
              className="absolute inset-0 pointer-events-none z-1"
              style={{
                background:
                  'linear-gradient(to bottom, #F8F3EA 0%, rgba(248, 243, 234, 0.3) 8%, transparent 20%, transparent 75%, rgba(248, 243, 234, 0.9) 95%, #F8F3EA 100%)'
              }}
            />
          </div>
        </div>

        {/* AMBIENT LIGHT */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-burnt-orange/[0.04] rounded-full blur-3xl pointer-events-none z-0" />

        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none z-0" />

        {/* LEFT NAVIGATION */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="hidden md:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/85 hover:bg-white border border-light-taupe/90 shadow-md items-center justify-center text-deep-navy hover:text-burnt-orange transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100 focus:outline-hidden"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* RIGHT NAVIGATION */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="hidden md:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/85 hover:bg-white border border-light-taupe/90 shadow-md items-center justify-center text-deep-navy hover:text-burnt-orange transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100 focus:outline-hidden"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* MAIN CONTENT */}
        <div className="relative z-10 w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex-1 flex flex-col justify-between md:justify-center py-2 sm:py-3 lg:py-4 min-h-0">

          {/* MOBILE */}
          <div className="md:hidden flex-1 flex flex-col justify-between min-h-0 py-1 relative z-10">
            {/* TOP: BADGE + HEADLINE + SUBTITLE */}
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={slide.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col justify-start text-left space-y-2 pt-1"
              >
                {/* BADGE */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF5EE] border border-burnt-orange/25 text-burnt-orange font-extrabold text-[11px] tracking-wide shadow-2xs">
                    <BadgeIcon className="w-3.5 h-3.5 text-burnt-orange" />
                    <span>{slide.badge.text}</span>
                  </span>
                </div>

                {/* HEADLINE */}
                <div className="relative">
                  <h1 className="font-display font-extrabold text-[27px] xs:text-[31px] sm:text-[35px] leading-[1.08] text-deep-navy tracking-tight relative z-1 max-w-[290px]">
                    <span
                      className={`block ${
                        slide.headline.highlightLine === 1 ? 'text-burnt-orange' : ''
                      }`}
                    >
                      {slide.headline.line1}
                    </span>
                    <span
                      className={`block mt-0.5 ${
                        slide.headline.highlightLine === 2 ? 'text-burnt-orange' : ''
                      }`}
                    >
                      {slide.headline.line2}
                    </span>
                    <span
                      className={`block mt-0.5 ${
                        slide.headline.highlightLine === 3 ? 'text-burnt-orange' : ''
                      }`}
                    >
                      {slide.headline.line3}
                    </span>
                  </h1>

                  <p className="text-warm-gray text-[12px] sm:text-[13px] leading-relaxed font-normal pt-1.5 max-w-[290px] relative z-1 line-clamp-3">
                    {slide.subtitle}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* BOTTOM: CTA BUTTONS GROUP */}
            <div className="flex flex-col gap-2 pt-2 pb-1 mt-auto z-10">
              <Link
                to="/courses"
                className="btn-primary h-11 sm:h-11.5 w-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-full shadow-md shadow-burnt-orange/25 active:scale-[0.99]"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="h-10 sm:h-10.5 w-full text-xs font-bold flex items-center justify-center gap-2 rounded-full bg-white/95 border border-light-taupe text-deep-navy shadow-2xs active:scale-[0.99] cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-burnt-orange/15 flex items-center justify-center text-burnt-orange">
                  <Play className="w-2.5 h-2.5 fill-burnt-orange text-burnt-orange translate-x-0.5" />
                </div>
                <span>Watch How It Works</span>
              </button>
            </div>
          </div>

          {/* DESKTOP */}
          <div className="hidden md:block">
            <AnimatePresence
              mode="wait"
              initial={false}
              custom={direction}
            >
              <motion.div
                key={slide.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_e, { offset, velocity }) => {
                  const swipe =
                    Math.abs(offset.x) * velocity.x;

                  if (
                    swipe < -80 ||
                    offset.x < -60
                  ) {
                    paginate(1);
                  } else if (
                    swipe > 80 ||
                    offset.x > 60
                  ) {
                    paginate(-1);
                  }
                }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 xl:gap-8 items-center cursor-grab active:cursor-grabbing"
              >

                {/* LEFT CONTENT — EXPANDED */}
                <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center text-left space-y-3 sm:space-y-3.5 lg:space-y-4">

                  {/* BADGE */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#FEF5EE] border border-burnt-orange/25 text-burnt-orange font-bold text-xs sm:text-sm tracking-wide shadow-2xs">
                      <BadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-burnt-orange" />
                      <span>{slide.badge.text}</span>
                    </span>
                  </div>

                  {/* HEADLINE */}
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-[36px] lg:text-[44px] xl:text-[50px] 2xl:text-[54px] leading-[1.08] text-deep-navy tracking-tight max-w-3xl">
                    <span
                      className={`block transition-colors duration-300 ${
                        slide.headline.highlightLine === 1
                          ? 'text-burnt-orange'
                          : ''
                      }`}
                    >
                      {slide.headline.line1}
                    </span>

                    <span
                      className={`block mt-0.5 transition-colors duration-300 ${
                        slide.headline.highlightLine === 2
                          ? 'text-burnt-orange'
                          : ''
                      }`}
                    >
                      {slide.headline.line2}
                    </span>

                    <span
                      className={`block mt-0.5 transition-colors duration-300 ${
                        slide.headline.highlightLine === 3
                          ? 'text-burnt-orange'
                          : ''
                      }`}
                    >
                      {slide.headline.line3}
                    </span>
                  </h1>

                  {/* SUBTITLE */}
                  <p className="text-warm-gray text-xs sm:text-[13px] lg:text-[14px] xl:text-[15px] leading-relaxed font-normal max-w-2xl">
                    {slide.subtitle}
                  </p>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 sm:pt-2">

                    <Link
                      to="/courses"
                      className="btn-primary h-11 sm:h-11.5 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-full shadow-md shadow-burnt-orange/25 hover:shadow-lg hover:shadow-burnt-orange/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span>Explore Courses</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setIsVideoModalOpen(true)}
                      className="h-11 sm:h-11.5 px-5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 rounded-full bg-warm-white/95 hover:bg-white border border-light-taupe hover:border-deep-navy/40 text-deep-navy shadow-2xs transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <div className="w-5.5 h-5.5 rounded-full bg-burnt-orange/15 flex items-center justify-center text-burnt-orange">
                        <Play className="w-3 h-3 fill-burnt-orange text-burnt-orange translate-x-0.5" />
                      </div>
                      <span>Watch How It Works</span>
                    </button>

                  </div>
                </div>

                {/* RIGHT — POPULAR PROGRAMS */}
                <div className="lg:col-span-5 xl:col-span-5 relative flex flex-col items-center lg:items-end justify-center">

                  {/* POPULAR PROGRAMS CARD */}
                  <div className="w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 shadow-2xl shadow-amber-500/10 border-2 border-amber-400/90 ring-1 ring-amber-400/30 space-y-2 relative z-10">

                    {/* CARD HEADER */}
                    <div className="flex items-center justify-between border-b border-amber-400/25 pb-2">
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-deep-navy">
                        {slide.popularProgramsTitle}
                      </h3>

                      <Link
                        to="/courses"
                        className="text-[11px] sm:text-xs font-bold text-burnt-orange hover:text-deep-orange flex items-center gap-0.5 transition-colors"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* PROGRAM LIST */}
                    <div className="space-y-1">
                      {slidePopularPrograms.map((program) => (
                        <Link
                          key={program.id}
                          to={program.href}
                          className="p-1.5 sm:p-2 rounded-2xl hover:bg-warm-ivory/90 border border-transparent hover:border-light-taupe/80 transition-all flex items-center justify-between gap-2 group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {program.courseObj ? (
                              <CourseTechIcon
                                course={program.courseObj}
                                size={30}
                                className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex-shrink-0"
                              />
                            ) : (
                              <div
                                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full ${
                                  program.iconBg || 'bg-burnt-orange'
                                } flex items-center justify-center flex-shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105`}
                              >
                                {program.customIcon}
                              </div>
                            )}

                            <div className="min-w-0 flex-1 text-left">
                              <h4 className="text-xs font-bold text-deep-navy group-hover:text-burnt-orange transition-colors truncate">
                                {program.title}
                              </h4>

                              <p className="text-[10px] text-warm-gray truncate leading-tight mt-0.5">
                                {program.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-semibold bg-[#FEF5EE] text-burnt-orange border border-burnt-orange/20 whitespace-nowrap">
                              {program.level}
                            </span>

                            <ChevronRight className="w-3.5 h-3.5 text-warm-gray group-hover:text-burnt-orange group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      ))}
                    </div>

                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* SLIDER DOTS */}
          <div className="flex items-center justify-center gap-2 pt-1 pb-2 sm:pt-4 sm:pb-2 z-20">
            {HERO_SLIDES.map((s, idx) => {
              const isActive =
                currentSlideIndex === idx;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="group/dot relative py-2 px-1 flex items-center cursor-pointer focus:outline-hidden"
                >
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ease-out relative ${
                      isActive
                        ? 'w-9 bg-burnt-orange shadow-xs'
                        : 'w-2.5 bg-light-taupe hover:bg-burnt-orange/50 hover:w-3.5'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* DESKTOP BOTTOM TRUST STRIP (KEPT INSIDE HERO FOR >= md) */}
        <div className="hidden md:block relative z-10 w-full bg-warm-white/95 border-t border-light-taupe/80 py-3 sm:py-3.5 flex-shrink-0 shadow-2xs mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center justify-between">

              {/* STUDENTS */}
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                  <GraduationCap className="w-5 h-5 text-burnt-orange" />
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-deep-navy">
                    10,000+
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-warm-gray font-medium">
                    Students Enrolled
                  </p>
                </div>
              </div>

              {/* RATING */}
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                  <Star className="w-5 h-5 fill-burnt-orange text-burnt-orange" />
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-deep-navy">
                    4.9/5
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-warm-gray font-medium">
                    Average Rating
                  </p>
                </div>
              </div>

              {/* PRACTICAL */}
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                  <Laptop className="w-5 h-5 text-burnt-orange" />
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-deep-navy">
                    100%
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-warm-gray font-medium">
                    Practical, Project-Based Learning
                  </p>
                </div>
              </div>

              {/* MENTOR */}
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                  <Award className="w-5 h-5 text-burnt-orange" />
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-deep-navy">
                    1-on-1
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-warm-gray font-medium">
                    Mentor Support
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* VIDEO MODAL */}
        <AnimatePresence>
          {isVideoModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-deep-navy/70 backdrop-blur-md">

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95
                }}
                transition={{
                  duration: 0.2
                }}
                className="relative w-full max-w-3xl bg-warm-white border border-light-taupe rounded-3xl overflow-hidden shadow-2xl text-left"
              >

                {/* MODAL HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-light-taupe/80 bg-warm-ivory">

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-burnt-orange/10 flex items-center justify-center text-burnt-orange">
                      <Play className="w-3.5 h-3.5 fill-burnt-orange" />
                    </div>

                    <div>
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-deep-navy">
                        How Oxyfied Learning Works
                      </h3>

                      <p className="text-[11px] text-warm-gray">
                        Interactive sandbox labs, real-world projects & 1-on-1 mentor guidance
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setIsVideoModalOpen(false)
                    }
                    className="p-1.5 rounded-full hover:bg-light-taupe/50 text-deep-navy transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>

                </div>

                {/* MODAL BODY */}
                <div className="p-6 space-y-5">

                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-deep-navy shadow-inner flex items-center justify-center">

                    <img
                      src="https://images.unsplash.com/photo-1603575448878-868a20723f5d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Classroom preview"
                      className="w-full h-full object-cover opacity-80"
                    />

                    <div className="absolute inset-0 bg-deep-navy/40 flex flex-col items-center justify-center text-center p-4">
                      <a
                        href="#classroom-experience"
                        onClick={() =>
                          setIsVideoModalOpen(false)
                        }
                        className="w-16 h-16 rounded-full bg-burnt-orange hover:bg-deep-orange text-white flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Play className="w-7 h-7 fill-current translate-x-0.5" />
                      </a>

                      <span className="mt-3 text-xs sm:text-sm font-bold text-white drop-shadow">
                        Experience Live Sandbox Classroom
                      </span>
                    </div>

                  </div>

                  {/* STEPS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <div className="p-3 rounded-xl bg-warm-ivory border border-light-taupe">
                      <span className="text-[10px] font-extrabold text-burnt-orange uppercase">
                        Step 01
                      </span>
                      <h5 className="text-xs font-bold text-deep-navy mt-0.5">
                        Live Interactive Cohort
                      </h5>
                      <p className="text-[10px] text-warm-gray mt-1">
                        Live weekly coding labs with industry mentors.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-warm-ivory border border-light-taupe">
                      <span className="text-[10px] font-extrabold text-sage-green uppercase">
                        Step 02
                      </span>
                      <h5 className="text-xs font-bold text-deep-navy mt-0.5">
                        Real-World Projects
                      </h5>
                      <p className="text-[10px] text-warm-gray mt-1">
                        Production codebases & real enterprise datasets.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-warm-ivory border border-light-taupe">
                      <span className="text-[10px] font-extrabold text-burnt-orange uppercase">
                        Step 03
                      </span>
                      <h5 className="text-xs font-bold text-deep-navy mt-0.5">
                        Career & Job Readiness
                      </h5>
                      <p className="text-[10px] text-warm-gray mt-1">
                        Resume audits, portfolio building & referrals.
                      </p>
                    </div>

                  </div>
                </div>

                {/* MODAL FOOTER */}
                <div className="px-6 py-3.5 bg-warm-ivory border-t border-light-taupe/80 flex items-center justify-between">

                  <span className="text-xs text-warm-gray font-medium">
                    Ready to master in-demand skills?
                  </span>

                  <Link
                    to="/courses"
                    onClick={() =>
                      setIsVideoModalOpen(false)
                    }
                    className="btn-primary px-4 py-2 text-xs font-bold rounded-xl"
                  >
                    Explore All Programs
                  </Link>

                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* MOBILE ONLY: STATS TRUST BAR (POSITIONED DIRECTLY BELOW HERO IN NORMAL FLOW) */}
      <div className="md:hidden relative z-10 w-full bg-warm-white/95 border-b border-light-taupe/80 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 items-center justify-between">

            {/* STUDENTS */}
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8.5 h-8.5 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                <GraduationCap className="w-4.5 h-4.5 text-burnt-orange" />
              </div>

              <div>
                <p className="text-xs font-extrabold text-deep-navy">
                  10,000+
                </p>
                <p className="text-[10px] text-warm-gray font-medium">
                  Students Enrolled
                </p>
              </div>
            </div>

            {/* RATING */}
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8.5 h-8.5 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                <Star className="w-4.5 h-4.5 fill-burnt-orange text-burnt-orange" />
              </div>

              <div>
                <p className="text-xs font-extrabold text-deep-navy">
                  4.9/5
                </p>
                <p className="text-[10px] text-warm-gray font-medium">
                  Average Rating
                </p>
              </div>
            </div>

            {/* PRACTICAL */}
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8.5 h-8.5 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                <Laptop className="w-4.5 h-4.5 text-burnt-orange" />
              </div>

              <div>
                <p className="text-xs font-extrabold text-deep-navy">
                  100%
                </p>
                <p className="text-[10px] text-warm-gray font-medium">
                  Practical, Project-Based
                </p>
              </div>
            </div>

            {/* MENTOR */}
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8.5 h-8.5 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                <Award className="w-4.5 h-4.5 text-burnt-orange" />
              </div>

              <div>
                <p className="text-xs font-extrabold text-deep-navy">
                  1-on-1
                </p>
                <p className="text-[10px] text-warm-gray font-medium">
                  Mentor Support
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

