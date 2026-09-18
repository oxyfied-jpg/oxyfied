import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  Terminal,
  Code2,
  Sparkles,
  CheckCircle,
  Database
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { insightService } from '../../services/insightService';
import type { Course, BlogPost } from '../../types';
import { courses as fallbackCourses } from '../../data/courses';
import { blogPosts as fallbackBlogPosts } from '../../data/blog';

import { SEO } from '../../components/common/SEO';
import { HeroSlider } from '../../components/ui/HeroSlider';
import { MostPopularCoursesSection } from '../../components/home/MostPopularCoursesSection';
import { RealWorldSkillsSection } from '../../components/home/RealWorldSkillsSection';
import { WhyOxyfiedGrowthSection } from '../../components/home/WhyOxyfiedGrowthSection';
import { StudentProjectsShowcaseSection } from '../../components/home/StudentProjectsShowcaseSection';
import { CourseCard } from '../../components/common/CourseCard';

type CategoryFilter = 'All Categories' | 'Cybersecurity' | 'Data Science' | 'Coming Soon';

const CATEGORIES: { id: CategoryFilter; label: string; icon: React.ElementType }[] = [
  { id: 'All Categories', label: 'All Categories', icon: Layers },
  { id: 'Cybersecurity', label: 'Cybersecurity', icon: ShieldCheck },
  { id: 'Data Science', label: 'Data Science', icon: Database },
  { id: 'Coming Soon', label: 'Coming Soon', icon: Clock }
];

export const Home: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All Categories');
  const [activeLabTab, setActiveLabTab] = useState<'terminal' | 'notebook' | 'mentorship' | 'certificate'>('terminal');

  // Dynamic homepage states - initialize with real fallback courses immediately
  const [courses, setCourses] = useState<Course[]>(fallbackCourses);
  const [insights, setInsights] = useState<BlogPost[]>(fallbackBlogPosts.slice(0, 3));
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Homepage and Course records on mount
  useEffect(() => {
    let isMounted = true;
    const fetchHomepageData = async () => {
      try {
        setIsLoading(true);
        // Load live courses and insights concurrently
        const [activeCourses, latestInsights] = await Promise.all([
          courseService.getCourses().catch(() => fallbackCourses),
          insightService.getInsights().catch(() => fallbackBlogPosts)
        ]);

        if (isMounted) {
          if (activeCourses && activeCourses.length > 0) {
            setCourses(activeCourses);
          }
          if (latestInsights && latestInsights.length > 0) {
            setInsights(latestInsights.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load homepage database elements:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHomepageData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to filter courses based on category
  const checkCourseMatchesCategory = (course: Course, cat: CategoryFilter): boolean => {
    if (cat === 'All Categories') return true;
    if (cat === 'Coming Soon') {
      return course.status === 'coming-soon' || course.category === 'Coming Soon';
    }
    // If course is coming soon, do not include in Cybersecurity or Data Science active tabs
    if (course.status === 'coming-soon' || course.category === 'Coming Soon') {
      return false;
    }
    if (cat === 'Cybersecurity') {
      return (
        course.category === 'Cybersecurity' ||
        (Boolean(course.category) && (course.category.toLowerCase().includes('cyber') || course.category.toLowerCase().includes('security'))) ||
        (Boolean(course.slug) && (course.slug.includes('cyber') || course.slug.includes('security') || course.slug.includes('penetration') || course.slug.includes('threat') || course.slug.includes('network-defense'))) ||
        (Boolean(course.title) && (course.title.toLowerCase().includes('cyber') || course.title.toLowerCase().includes('security') || course.title.toLowerCase().includes('hacking') || course.title.toLowerCase().includes('soc')))
      );
    }
    if (cat === 'Data Science') {
      return (
        course.category === 'Data Science' ||
        (Boolean(course.category) && course.category.toLowerCase().includes('data')) ||
        (Boolean(course.slug) && (course.slug.includes('data-science') || course.slug.includes('data-analytics') || course.slug.includes('machine-learning') || course.slug.includes('power-bi') || course.slug.includes('data-engineering') || course.slug.includes('deep-learning'))) ||
        (Boolean(course.title) && (course.title.toLowerCase().includes('data') || course.title.toLowerCase().includes('machine learning') || course.title.toLowerCase().includes('analytics') || course.title.toLowerCase().includes('power bi') || course.title.toLowerCase().includes('deep learning')))
      );
    }
    return true;
  };

  const getCategoryCount = (cat: CategoryFilter) => {
    return courses.filter((c) => checkCourseMatchesCategory(c, cat)).length;
  };

  // Filter courses based on active categories
  const filteredCourses = courses.filter((course) => checkCourseMatchesCategory(course, activeCategory));

  return (
    <div className="space-y-0 bg-warm-ivory text-deep-navy overflow-x-clip">
      <SEO 
        title="Learn Technology. Build What Matters." 
        description="Learn in-demand technology and AI skills through practical, industry-focused courses designed to help you build real-world knowledge and become career ready."
        canonical="/"
      />

      {/* ===============================================================
          1. HERO SECTION (WITH BOY IMAGE & STATS STRIP)
      ================================================================ */}
      <HeroSlider courses={courses} />

      {/* ===============================================================
          2. NEW SECTION: MOST POPULAR COURSES (DIRECTLY BELOW HERO SLIDER)
      ================================================================ */}
      <MostPopularCoursesSection courses={courses} isLoading={isLoading} />

      {/* ===============================================================
          3. REAL-WORLD ENGINEERING SKILLS SHOWCASE & SANDBOX RUNNER
      ================================================================ */}
      <RealWorldSkillsSection />

      {/* ===============================================================
          4. NEW SECTION: WHY OXYFIED? / YOUR GROWTH PATH JOURNEY
      ================================================================ */}
      <WhyOxyfiedGrowthSection />

      {/* ===============================================================
          4. PROGRAM CATALOG / FEATURED PROGRAM TRACKS & COURSES
      ================================================================ */}
      <section id="programs" className="section-padding bg-white border-b border-light-taupe/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* SECTION HEADER */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-burnt-orange text-xs font-extrabold tracking-widest uppercase block">
              EXPLORE CURRICULUM
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-deep-navy">
              Featured Program Tracks & Courses
            </h2>
            <p className="text-warm-gray text-xs sm:text-sm leading-relaxed">
              Explore specialized program tracks in <strong>Cybersecurity</strong>, <strong>Data Science</strong>, and upcoming programs.
            </p>
          </div>

          {/* 2-Column Grid: Left Category Sidebar + Right Course Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Category Sidebar (Desktop - Sticky) */}
            <aside className="hidden lg:block lg:col-span-3 bg-white border border-light-taupe rounded-2xl p-3 shadow-2xs sticky top-[84px] sm:top-24 self-start">
              <div className="px-3 py-2 border-b border-light-taupe/80 mb-2">
                <span className="text-[11px] font-extrabold text-deep-navy uppercase tracking-wider block">
                  Program Tracks
                </span>
              </div>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const IconComponent = cat.icon;
                  const isActive = activeCategory === cat.id;
                  const count = getCategoryCount(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-burnt-orange text-white shadow-sm'
                          : 'text-deep-navy hover:bg-warm-ivory/80 hover:text-burnt-orange'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-burnt-orange'}`} />
                        <span>{cat.label}</span>
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold transition-colors ${
                        isActive ? 'bg-white/20 text-white' : 'bg-warm-ivory border border-light-taupe/80 text-warm-gray'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sidebar Info Card */}
              <div className="mt-4 p-3 bg-burnt-orange/5 border border-burnt-orange/20 rounded-xl space-y-1.5 text-left">
                
                <p className="text-[11px] text-warm-gray leading-relaxed">
                  Industry-focused learning, practical projects, and career preparation.
                </p>
              </div>
            </aside>

            {/* Horizontal scrollable pills filter (Mobile / Tablet) */}
            <div className="lg:hidden w-full overflow-x-auto pb-2 scrollbar-none flex gap-2 mb-2">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = activeCategory === cat.id;
                const count = getCategoryCount(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap border flex-shrink-0 flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-burnt-orange text-white border-burnt-orange shadow-sm'
                        : 'bg-white text-deep-navy border-light-taupe hover:bg-warm-ivory/60'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-warm-ivory text-warm-gray'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Courses Cards Grid */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Header / Results counter */}
              <div className="flex items-center justify-between border-b border-light-taupe/80 pb-3">
                <span className="text-xs font-bold text-warm-gray">
                  Showing <strong className="text-deep-navy">{filteredCourses.length}</strong> Programs in{' '}
                  <span className="text-burnt-orange font-extrabold">
                    {activeCategory}
                  </span>
                </span>
                <Link
                  to="/courses"
                  className="text-xs font-bold text-burnt-orange hover:text-burnt-orange-dark inline-flex items-center gap-1 group"
                >
                  <span>View Full Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Grid / Skeletons / Empty State */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="bg-white border border-light-taupe/70 rounded-2xl p-4 space-y-3.5 animate-pulse shadow-2xs">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-soft-beige rounded-full w-24" />
                        <div className="h-4 bg-soft-beige rounded w-16" />
                      </div>
                      <div className="aspect-[16/10] bg-soft-beige rounded-xl" />
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 bg-soft-beige rounded-xl flex-shrink-0" />
                        <div className="h-4 bg-soft-beige rounded w-3/4" />
                      </div>
                      <div className="h-3 bg-soft-beige rounded w-1/2" />
                      <div className="flex gap-1.5">
                        <div className="h-4 bg-soft-beige rounded-full w-14" />
                        <div className="h-4 bg-soft-beige rounded-full w-14" />
                      </div>
                      <div className="pt-2 border-t border-light-taupe/50 flex justify-between items-center">
                        <div className="h-4 bg-soft-beige rounded w-16" />
                        <div className="h-6 bg-soft-beige rounded-full w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="bg-white border border-light-taupe rounded-3xl p-10 sm:p-12 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 mx-auto rounded-full bg-burnt-orange/10 flex items-center justify-center text-burnt-orange">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-deep-navy">
                    No programs available in this track yet.
                  </h3>
                  <p className="text-xs text-warm-gray max-w-sm mx-auto">
                    We are regularly adding new tracks. Explore all programs or view our complete catalog.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveCategory('All Categories')}
                      className="btn-secondary px-4 py-2 text-xs font-bold rounded-full cursor-pointer"
                    >
                      View All Categories
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredCourses.map((course) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25 }}
                        key={course.id}
                      >
                        <CourseCard course={course} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

          </div>

        </div>
      </section>



       

      {/* ===============================================================
          5. INTERACTIVE "INSIDE THE CLASSROOM" SHOWCASE
      ================================================================ */}
      <section id="classroom-experience" className="section-padding bg-warm-ivory border-b border-light-taupe/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              The Oxyfied Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-deep-navy tracking-tight">
              Inside the Oxyfied Classroom
            </h2>
            <p className="text-warm-gray text-xs sm:text-sm leading-relaxed">
              We replaced passive lectures with active engineering. Explore how interactive sandboxes, live datasets, and 1-on-1 code reviews accelerate mastery.
            </p>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {[
              { id: 'terminal', label: '1. Live Linux Sandbox', icon: Terminal },
              { id: 'notebook', label: '2. Interactive Data Notebooks', icon: Code2 },
              { id: 'mentorship', label: '3. 1-on-1 Mentor Audits', icon: Users },
              { id: 'certificate', label: '4. Verifiable Credentials', icon: Award }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeLabTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveLabTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-deep-navy text-white border-deep-navy shadow-sm'
                      : 'bg-warm-white text-deep-navy border-light-taupe hover:border-burnt-orange hover:bg-soft-beige/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-burnt-orange' : 'text-warm-gray'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Dynamic Interactive Tab Content Showcase */}
          <div className="bg-warm-white border border-light-taupe rounded-3xl p-6 sm:p-10 shadow-sm">
            <AnimatePresence mode="wait">
              {activeLabTab === 'terminal' && (
                <motion.div
                  key="terminal"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left"
                >
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-burnt-orange block">
                      Hands-On Security Simulator
                    </span>
                    <h3 className="text-2xl font-display font-extrabold text-deep-navy">
                      Execute Commands in a Production Linux Sandbox
                    </h3>
                    <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">
                      Practice network packet captures, port auditing, firewall deployments, and directory privilege hardening right from your browser without complex local setups.
                    </p>
                    <ul className="space-y-2.5 text-xs font-semibold text-deep-navy pt-2">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Pre-configured virtual containers with Wireshark, Snort, and Nmap</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Instant feedback on command syntax errors and permission audits</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Real exploit mitigation capstones mapped to NIST standards</span>
                      </li>
                    </ul>
                    <div className="pt-2">
                      <Link to="/courses" className="btn-primary px-6 py-2 text-xs font-bold rounded-full inline-flex items-center gap-2">
                        Explore Sandboxes <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-light-taupe shadow-sm bg-warm-white">
                    <img 
                      src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=900&auto=format&fit=crop" 
                      alt="Cybersecurity student analyzing network packets in terminal" 
                      className="w-full aspect-[16/10] object-cover"
                    />
                  </div>
                </motion.div>
              )}

              {activeLabTab === 'notebook' && (
                <motion.div
                  key="notebook"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left"
                >
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-sage-green block">
                      Data & Machine Learning Environment
                    </span>
                    <h3 className="text-2xl font-display font-extrabold text-deep-navy">
                      Interactive Python Notebooks & Predictive Models
                    </h3>
                    <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">
                      Clean real-world messy datasets, build multi-variable regressions, and visualize correlations with Seaborn and Pandas inside guided Jupyter notebooks.
                    </p>
                    <ul className="space-y-2.5 text-xs font-semibold text-deep-navy pt-2">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Live statistical dataset imports (customer churn, credit fraud, sales trends)</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Scikit-Learn classification algorithms with hyperparameter tuning</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Deploy interactive web dashboards using Streamlit</span>
                      </li>
                    </ul>
                    <div className="pt-2">
                      <Link to="/courses/master-program-data-science-ai" className="btn-primary px-6 py-2 text-xs font-bold rounded-full inline-flex items-center gap-2">
                        Explore Data Labs <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-light-taupe shadow-sm bg-warm-white">
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=900&auto=format&fit=crop" 
                      alt="Data analytics workspace with predictive models and charts" 
                      className="w-full aspect-[16/10] object-cover"
                    />
                  </div>
                </motion.div>
              )}

              {activeLabTab === 'mentorship' && (
                <motion.div
                  key="mentorship"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left"
                >
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-burnt-orange block">
                      Practitioner Guidance
                    </span>
                    <h3 className="text-2xl font-display font-extrabold text-deep-navy">
                      Detailed Code Reviews & Capstone Evaluation
                    </h3>
                    <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">
                      Every capstone project you submit is audited by senior practitioners who provide actionable line-by-line architecture and vulnerability feedback.
                    </p>
                    <ul className="space-y-2.5 text-xs font-semibold text-deep-navy pt-2">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Constructive architectural improvements and vulnerability reviews</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Advice on crafting resume-ready Github repositories</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Dedicated Q&A support channels for fast unblocking</span>
                      </li>
                    </ul>
                    <div className="pt-2">
                      <Link to="/about" className="btn-secondary px-6 py-2 text-xs font-bold rounded-full inline-flex items-center gap-2">
                        Meet Our Instructors <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-light-taupe shadow-sm bg-warm-white">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=900&auto=format&fit=crop" 
                      alt="Student and technical mentor collaborating on project feedback" 
                      className="w-full aspect-[16/10] object-cover"
                    />
                  </div>
                </motion.div>
              )}

              {activeLabTab === 'certificate' && (
                <motion.div
                  key="certificate"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left"
                >
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-sage-green block">
                      Career Verification
                    </span>
                    <h3 className="text-2xl font-display font-extrabold text-deep-navy">
                      Earn Industry-Recognized Verifiable Certifications
                    </h3>
                    <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">
                      Complete all module labs and the final capstone audit to unlock a cryptographic, recruiter-verifiable credential shareable to LinkedIn.
                    </p>
                    <ul className="space-y-2.5 text-xs font-semibold text-deep-navy pt-2">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Unique verification URL & QR code for recruiter background checks</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Direct 1-click addition to your LinkedIn Licenses & Certifications</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                        <span>Lifetime verification status backed by Oxyfied</span>
                      </li>
                    </ul>
                    <div className="pt-2">
                      <Link to="/courses" className="btn-primary px-6 py-2 text-xs font-bold rounded-full inline-flex items-center gap-2">
                        Start Earning Today <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-light-taupe shadow-sm bg-warm-white p-6 relative">
                    <div className="border-2 border-dashed border-light-taupe p-6 rounded-xl text-center space-y-3 bg-warm-white">
                      <div className="w-12 h-12 mx-auto rounded-full bg-burnt-orange/10 border border-burnt-orange/30 flex items-center justify-center text-burnt-orange">
                        <Award className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-warm-gray block">
                        Official Certificate of Competency
                      </span>
                      <h4 className="font-display font-extrabold text-lg text-deep-navy">
                        Alex Johnson
                      </h4>
                      <p className="text-xs text-warm-gray max-w-xs mx-auto">
                        Has successfully defended capstone requirements for the <strong className="text-deep-navy">Data Science & AI Specialist Track</strong>.
                      </p>
                      <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-warm-gray border-t border-light-taupe">
                        <span>ID: CERT-OXYFIED-849201</span>
                        <span className="text-sage-green font-bold uppercase">✓ Verified</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* ===============================================================
          6. TRACK SPOTLIGHT: CYBERSECURITY & SYSTEM DEFENSE
      ================================================================ */}
      <section className="bg-warm-white py-16 lg:py-20 border-b border-light-taupe/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-5 text-left">
            <span className="inline-block px-3 py-1 bg-burnt-orange/10 border border-burnt-orange/20 text-burnt-orange text-xs font-bold rounded-full uppercase tracking-wider">
              Specialist Track // Live Cohorts Available
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-deep-navy tracking-tight leading-tight">
              Master Cybersecurity Through <br className="hidden sm:inline" />
              <span className="text-burnt-orange">Practical Defensive Hardening</span>
            </h2>
            <p className="text-warm-gray text-xs sm:text-sm leading-relaxed max-w-2xl">
              Gain intermediate to production defensive capabilities. Oxyfied is structured around defensive configurations, pen-testing scans, network packet captures, and auditing report methodologies.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
              {[
                'Ethical Hacking Scanning & Recon',
                'Wireshark Live Packet Captures',
                'Web Application Security & OWASP',
                'Linux Command Line Hardening',
                'Vulnerability Assessments & CVEs',
                'Firewalls & Snort IDS Setup',
                'Splunk SIEM Log Ingestion',
                'Incident Response Playbooks'
              ].map((skill) => (
                <div key={skill} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-burnt-orange mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-bold text-deep-navy">{skill}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link to="/courses" className="btn-primary px-6 py-2.5 text-xs font-bold rounded-full flex items-center gap-2 shadow-xs">
                Explore Security Programs
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-warm-gray font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sage-green" />
                Includes 3 Hands-On Labs & Capstone Audit
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl border border-light-taupe bg-warm-ivory p-5 sm:p-6 shadow-sm text-left space-y-4">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-light-taupe mb-4">
              <img 
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop" 
                alt="Security operations monitoring dashboard"
                className="w-full h-full object-cover"
              />
            </div>
            
            <h3 className="font-display font-bold text-xs text-deep-navy uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-burnt-orange animate-ping" />
              Syllabus Structure
            </h3>
            
            <div className="space-y-2 text-xs">
              {[
                { module: 'Module 1-3', title: 'Linux, Networking & Security Fundamentals' },
                { module: 'Module 4-6', title: 'Ethical Hacking, Web & Network Exploits' },
                { module: 'Module 7-8', title: 'Vulnerability Analysis & SIEM Operations' },
                { module: 'Module 9-10', title: 'Defensive Labs & Capstone Audit Project' }
              ].map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-warm-white rounded-xl border border-light-taupe hover:border-burnt-orange transition-colors">
                  <div className="text-left">
                    <span className="text-[10px] text-burnt-orange font-bold block">{step.module}</span>
                    <span className="font-bold text-deep-navy mt-0.5 block text-xs">{step.title}</span>
                  </div>
                  <span className="text-[9px] font-bold text-sage-green uppercase bg-sage-green/15 px-2 py-0.5 rounded border border-sage-green/30">Verified</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ===============================================================
          7. STUDENT CAPSTONE PROJECT SHOWCASE ("What You'll Actually Build")
      ================================================================ */}
      <StudentProjectsShowcaseSection />

      {/* ===============================================================
          8. WHY OXYFIED (SIMPLE CLEAN EDUCATIONAL DESIGN)
      ================================================================ */}
      <section className="bg-white border-b border-light-taupe/80 py-14 sm:py-18 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              The Oxyfied Difference
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-deep-navy tracking-tight">
              Why Learn With Oxyfied?
            </h2>
            <p className="text-warm-gray text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              We prioritize building practical, job-ready technical competence through active engineering rather than passive video lectures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 text-left">
            {[
              { 
                title: 'Practical Hands-On Learning', 
                icon: Layers, 
                desc: 'Practice directly inside browser-based coding sandboxes, terminals, and live labs with zero configuration friction.',
                tag: '100% Practical'
              },
              { 
                title: 'Industry-Relevant Curriculum', 
                icon: ShieldCheck, 
                desc: 'Every syllabus is designed around modern production requirements and active hiring specifications across top tech teams.',
                tag: 'Updated for 2026'
              },
              { 
                title: 'Real-World Capstone Projects', 
                icon: Award, 
                desc: 'Build enterprise-grade projects with authentic datasets to create a verifiable GitHub portfolio that impresses recruiters.',
                tag: 'Portfolio Ready'
              },
              { 
                title: '1-on-1 Expert Mentorship', 
                icon: Users, 
                desc: 'Receive personalized line-by-line feedback on your code and project architectures from experienced industry practitioners.',
                tag: 'Line-by-Line Audits'
              },
              { 
                title: 'Flexible Learning Pace', 
                icon: Clock, 
                desc: 'Learn on your own schedule with lifetime access to session recordings, lab sandboxes, study materials, and community forums.',
                tag: 'Lifetime Access'
              },
              { 
                title: 'Career-Focused Outcomes', 
                icon: TrendingUp, 
                desc: 'Gain verified certifications and technical skills mapped directly to high-growth engineering and cybersecurity career roles.',
                tag: 'Verified Skills'
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-warm-ivory/60 border border-light-taupe rounded-2xl p-5 sm:p-6 shadow-2xs hover:bg-white hover:border-burnt-orange/60 hover:shadow-xs transition-all duration-200 flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-burnt-orange bg-burnt-orange/10 px-2 py-0.5 rounded-md border border-burnt-orange/20">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-deep-navy group-hover:text-burnt-orange transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-warm-gray leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===============================================================
          9. STATISTICS WITH IMPACT NUMBERS
      ================================================================ */}
      

      {/* ===============================================================
          10. HOW IT WORKS (4-STEP TIMELINE)
      ================================================================ */}
      

      {/* ===============================================================
          11. TESTIMONIALS & GRADUATE SUCCESS
      ================================================================ */}
     

      

      {/* ===============================================================
          13. RESOURCES (Blog Highlights)
      ================================================================ */}
      <section className="bg-warm-ivory border-b border-light-taupe/80 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4 text-left">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold text-burnt-orange bg-[#FEF5EE] border border-burnt-orange/25 uppercase tracking-wider shadow-2xs">
                  <Sparkles className="w-3 h-3 text-burnt-orange" />
                  Knowledge & Guides
                </span>
              </div>
              <h2 className="text-3xl font-display font-extrabold text-deep-navy tracking-tight">
                Latest Insights & Resources
              </h2>
              <p className="text-warm-gray text-xs sm:text-sm mt-1 leading-relaxed max-w-xl">
                Stay updated on security compliance, python libraries, and AI engineering methodologies.
              </p>
            </div>
            <Link 
              to="/resources" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-deep-navy bg-warm-white border border-light-taupe hover:border-burnt-orange hover:text-burnt-orange hover:bg-white transition-all shadow-2xs group"
            >
              <span>Explore All Resources</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {insights.length === 0 ? (
            <div className="p-8 text-center bg-warm-white border border-light-taupe rounded-2xl">
              <p className="text-warm-gray text-sm font-medium">No insights available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {insights.slice(0, 3).map((post) => (
                <Link
                  key={post.id || post.slug}
                  to={`/resources/${post.slug}`}
                  className="bg-warm-white border border-light-taupe rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs hover:border-burnt-orange hover:shadow-md transition-all duration-300 group cursor-pointer"
                  aria-label={`Read ${post.title}`}
                >
                  <div className="aspect-[16/10] overflow-hidden bg-warm-ivory relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-deep-navy/90 text-warm-white backdrop-blur-xs uppercase tracking-wider shadow-2xs">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-base text-deep-navy group-hover:text-burnt-orange transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-warm-gray text-xs leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-warm-gray font-semibold pt-3 border-t border-light-taupe/70">
                      <div className="flex items-center gap-2">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-burnt-orange group-hover:translate-x-0.5 transition-transform">
                        Read Article
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===============================================================
          14. FINAL CTA BANNER
      ================================================================ */}
      {/* <section className="bg-deep-navy text-warm-white py-16 lg:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(242,107,33,0.18),transparent_50%)] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/15 border border-burnt-orange/30 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Join the Next Cohort
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight">
            Ready to Build Real Capabilities?
          </h2>
          <p className="text-warm-white/80 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
            Start learning practical technology skills with Oxyfied. Join our live programs today and prepare for enterprise engineering roles.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/courses" className="btn-primary px-7 py-3 text-xs font-bold rounded-full shadow-lg">
              Explore Programs
            </Link>
            <Link to="/register" className="btn-secondary px-7 py-3 text-xs font-bold rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20">
              Create Account
            </Link>
          </div>
        </div>
      </section> */}
    </div>
  );
};
