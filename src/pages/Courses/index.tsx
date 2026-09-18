import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, AlertCircle, Layers } from 'lucide-react';
import { courseService } from '../../services/courseService';
import type { Course } from '../../types';
import { SEO } from '../../components/common/SEO';
import { CourseCard } from '../../components/common/CourseCard';

export const Courses: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Dynamic courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronize URL search params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setSearchTerm(urlSearch);
    }
    const urlCat = searchParams.get('category');
    if (urlCat !== null) {
      setSelectedCategory(urlCat);
    }
  }, [searchParams]);

  // Fetch courses on mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
        setError('Unable to load programs at this moment. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Handle clearing all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSelectedPrice('all');
    setSortBy('popular');
    setSearchParams({});
  };

  // Filter & Sort core courses array
  const filteredCourses = courses.filter((course) => {
    // 1. Search filter
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Category filter
    let matchesCategory = true;
    if (selectedCategory === 'Coming Soon') {
      matchesCategory = course.status === 'coming-soon' || course.category === 'Coming Soon';
    } else if (selectedCategory === 'Cybersecurity') {
      matchesCategory =
        (course.status !== 'coming-soon' && course.category !== 'Coming Soon') &&
        (course.category === 'Cybersecurity' ||
          course.category.toLowerCase().includes('cyber') ||
          course.category.toLowerCase().includes('security') ||
          course.slug.includes('cyber') ||
          course.slug.includes('security'));
    } else if (selectedCategory === 'Data Science') {
      matchesCategory =
        (course.status !== 'coming-soon' && course.category !== 'Coming Soon') &&
        (course.category === 'Data Science' ||
          course.category.toLowerCase().includes('data') ||
          course.slug.includes('data-science') ||
          course.slug.includes('data-analytics') ||
          course.slug.includes('machine-learning') ||
          course.slug.includes('power-bi'));
    } else if (selectedCategory !== 'all') {
      matchesCategory = course.category.toLowerCase() === selectedCategory.toLowerCase();
    }

    // 3. Level filter
    const matchesLevel =
      selectedLevel === 'all' ||
      course.level.toLowerCase().includes(selectedLevel.toLowerCase());

    // 4. Price filter
    let matchesPrice = true;
    if (selectedPrice === 'under-10k') {
      matchesPrice = course.price < 10000;
    } else if (selectedPrice === 'master-level') {
      matchesPrice = course.price >= 10000;
    }

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  }).sort((a, b) => {
    // Sorting algorithms
    if (sortBy === 'popular') {
      return b.students - a.students;
    }
    if (sortBy === 'price-low') {
      return a.price - b.price;
    }
    if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0;
  });

  const cyberCount = courses.filter(c => c.category === 'Cybersecurity' || c.category.toLowerCase().includes('cyber') || c.category.toLowerCase().includes('security')).length;
  const dataScienceCount = courses.filter(c => c.category === 'Data Science' || c.category.toLowerCase().includes('data')).length;
  const comingSoonCount = courses.filter(c => c.status === 'coming-soon' || c.category === 'Coming Soon').length;

  return (
    <div className="bg-warm-ivory text-deep-navy min-h-screen py-12">
      <SEO 
        title="Curriculum & Programs | Oxyfied Technology Learning" 
        description="Explore live hybrid master programs and hands-on tracks in Cybersecurity, Data Science, AI, and cutting-edge engineering technologies."
        canonical="/courses"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" />
            Curriculum Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-deep-navy">
            Specialized Technology Tracks
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm max-w-3xl leading-relaxed">
            Acquire specialized technical abilities in Cybersecurity and Data Science through hands-on labs, real-world project builds, expert mentorship, and industry-recognized certifications.
          </p>
        </div>

        {/* Top Quick Category Switcher Tabs */}
        <div className="flex flex-wrap gap-2.5 border-b border-light-taupe pb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-burnt-orange text-white border-burnt-orange shadow-md'
                : 'bg-warm-white text-deep-navy border-light-taupe hover:border-burnt-orange hover:bg-soft-beige'
            }`}
          >
            <span>All Programs</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-soft-beige text-deep-navy'
            }`}>
              {courses.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('Cybersecurity')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
              selectedCategory === 'Cybersecurity'
                ? 'bg-burnt-orange text-white border-burnt-orange shadow-md'
                : 'bg-warm-white text-deep-navy border-light-taupe hover:border-burnt-orange hover:bg-soft-beige'
            }`}
          >
            <span>Cybersecurity</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              selectedCategory === 'Cybersecurity' ? 'bg-white/20 text-white' : 'bg-soft-beige text-deep-navy'
            }`}>
              {cyberCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('Data Science')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
              selectedCategory === 'Data Science'
                ? 'bg-burnt-orange text-white border-burnt-orange shadow-md'
                : 'bg-warm-white text-deep-navy border-light-taupe hover:border-burnt-orange hover:bg-soft-beige'
            }`}
          >
            <span>Data Science</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              selectedCategory === 'Data Science' ? 'bg-white/20 text-white' : 'bg-soft-beige text-deep-navy'
            }`}>
              {dataScienceCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('Coming Soon')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
              selectedCategory === 'Coming Soon'
                ? 'bg-burnt-orange text-white border-burnt-orange shadow-md'
                : 'bg-warm-white text-deep-navy border-light-taupe hover:border-burnt-orange hover:bg-soft-beige'
            }`}
          >
            <span>Coming Soon</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              selectedCategory === 'Coming Soon' ? 'bg-white/20 text-white' : 'bg-soft-beige text-deep-navy'
            }`}>
              {comingSoonCount}
            </span>
          </button>
        </div>

        {/* Filters and List panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Filters (3 columns on large screens) */}
          <aside className="lg:col-span-3 bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-md h-fit space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-light-taupe pb-3">
              <h3 className="font-display font-bold text-sm text-deep-navy">Filter Programs</h3>
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-bold text-burnt-orange hover:text-deep-orange transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Clear All
              </button>
            </div>

            {/* Filter: Search input */}
            <div className="space-y-2">
              <label htmlFor="course-search" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Search Keywords
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="course-search"
                  placeholder="e.g. Python, SQL, AI, Hacking..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-warm-ivory border border-light-taupe text-xs text-deep-navy rounded-lg focus:outline-none focus:border-burnt-orange transition-all placeholder-warm-gray"
                />
                <Search className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Filter: Category */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block text-left">
                Program Category
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'all', label: 'All Programs', count: courses.length },
                  { value: 'Cybersecurity', label: 'Cybersecurity', count: cyberCount },
                  { value: 'Data Science', label: 'Data Science', count: dataScienceCount },
                  { value: 'Coming Soon', label: 'Coming Soon', count: comingSoonCount },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedCategory(opt.value)}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all border flex justify-between items-center cursor-pointer ${
                      selectedCategory === opt.value
                        ? 'bg-burnt-orange text-white border-burnt-orange shadow-sm font-bold'
                        : 'bg-warm-ivory text-deep-navy border-light-taupe hover:border-burnt-orange'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === opt.value ? 'bg-white/20 text-white' : 'bg-soft-beige text-deep-navy'
                    }`}>
                      {opt.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: Experience Level */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block text-left">
                Experience Level
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'All Levels' },
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedLevel(opt.value)}
                    className={`px-2 py-2 text-[10px] font-semibold rounded-lg text-center transition-all border cursor-pointer ${
                      selectedLevel === opt.value
                        ? 'bg-burnt-orange text-white border-burnt-orange shadow-sm font-bold'
                        : 'bg-warm-ivory text-deep-navy border-light-taupe hover:border-burnt-orange'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: Program Tier */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block text-left">
                Program Tier
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'all', label: 'All Tiers' },
                  { value: 'master-level', label: 'Master Programs (Comprehensive)' },
                  { value: 'under-10k', label: 'Executive Upskills (24–36 Hours)' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedPrice(opt.value)}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all border flex justify-between items-center cursor-pointer ${
                      selectedPrice === opt.value
                        ? 'bg-burnt-orange text-white border-burnt-orange shadow-sm font-bold'
                        : 'bg-warm-ivory text-deep-navy border-light-taupe hover:border-burnt-orange'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: Sort parameters */}
            <div className="space-y-2">
              <label htmlFor="sort-select" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Sort By
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-warm-ivory border border-light-taupe text-xs text-deep-navy rounded-lg focus:outline-none focus:border-burnt-orange transition-all"
              >
                <option value="popular">Most Enrolled (Popular)</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </aside>

          {/* Right panel: Course listing grids (9 columns) */}
          <main className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between text-xs text-warm-gray font-semibold border-b border-light-taupe pb-3 text-left">
              <span>Showing <strong className="text-deep-navy">{filteredCourses.length}</strong> programs</span>
              {searchTerm && <span>Search: "{searchTerm}"</span>}
            </div>

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
            ) : error ? (
              <div className="bg-warm-white border border-light-taupe p-12 rounded-2xl shadow-md text-center max-w-lg mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="font-display font-bold text-deep-navy text-base">Error Loading Programs</h3>
                <p className="text-xs text-warm-gray leading-relaxed">{error}</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-warm-white border border-light-taupe p-12 rounded-2xl shadow-md text-center max-w-lg mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-warm-gray mx-auto" />
                <h3 className="font-display font-bold text-deep-navy text-base">No programs found</h3>
                <p className="text-xs text-warm-gray leading-relaxed">
                  Try adjusting your filters, clearing the search input, or selecting a broader category choice.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="btn-primary px-4 py-2 text-xs font-bold rounded-lg shadow-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
