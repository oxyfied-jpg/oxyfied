import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Code2, 
  GraduationCap,
  Terminal
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { studentProjects } from '../../data/projects';

const CATEGORIES = [
  'All Projects',
  'Cybersecurity',
  'AI / Machine Learning',
  'Data Science',
  'Cloud & DevSecOps'
];

export const Projects: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Projects');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return studentProjects.filter((project) => {
      const matchesCategory =
        selectedCategory === 'All Projects' || project.category === selectedCategory;
      
      const matchesQuery =
        searchQuery === '' ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tech.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        project.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const featuredProject = useMemo(() => {
    return studentProjects.find((p) => p.featured) || studentProjects[0];
  }, []);

  return (
    <div className="bg-warm-ivory min-h-screen text-deep-navy">
      <SEO
        title="Real-World Projects & Student Capstones | Oxyfied"
        description="Explore production-grade capstone projects engineered by Oxyfied learners in Cybersecurity, AI/ML, Data Science, and Cloud DevSecOps."
        canonical="/projects"
      />

      {/* =========================================================================
          1. HERO BANNER
      ========================================================================== */}
      <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-light-taupe/70 bg-gradient-to-b from-warm-white via-warm-ivory/80 to-warm-ivory">
        {/* Ambient Decorative Accents */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-10 left-1/4 w-80 h-80 bg-burnt-orange/8 rounded-full blur-3xl" />
          <div className="absolute bottom-5 right-1/4 w-96 h-96 bg-sage-green/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-burnt-orange/12 border border-burnt-orange/25 text-burnt-orange text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hands-On Capstone Directory</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-deep-navy leading-[1.12]">
            What You'll Actually Build at <span className="text-burnt-orange">Oxyfied</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-warm-gray max-w-2xl mx-auto leading-relaxed">
            Don't just collect completion certificates. Build battle-tested SIEM pipelines, multi-agent AI systems, and cloud infrastructure reviewed by industry mentors.
          </p>

          {/* Key Stats Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="bg-white/70 backdrop-blur-md border border-light-taupe/80 p-3 rounded-2xl shadow-2xs text-center">
              <p className="text-xl sm:text-2xl font-display font-extrabold text-burnt-orange">100%</p>
              <p className="text-[11px] font-semibold text-warm-gray mt-0.5">Code & Lab Verified</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-light-taupe/80 p-3 rounded-2xl shadow-2xs text-center">
              <p className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy">1-on-1</p>
              <p className="text-[11px] font-semibold text-warm-gray mt-0.5">Mentor Code Reviews</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-light-taupe/80 p-3 rounded-2xl shadow-2xs text-center">
              <p className="text-xl sm:text-2xl font-display font-extrabold text-burnt-orange">99/100</p>
              <p className="text-[11px] font-semibold text-warm-gray mt-0.5">Avg. Capstone Score</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-light-taupe/80 p-3 rounded-2xl shadow-2xs text-center">
              <p className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy">GitHub</p>
              <p className="text-[11px] font-semibold text-warm-gray mt-0.5">Ready Portfolios</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FEATURED SPOTLIGHT CAPSTONE
      ========================================================================== */}
      {featuredProject && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-burnt-orange" />
              <h2 className="text-lg sm:text-xl font-display font-bold text-deep-navy">
                Featured Spotlight Capstone
              </h2>
            </div>
            <span className="text-xs font-bold text-burnt-orange bg-burnt-orange/10 px-2.5 py-1 rounded-full border border-burnt-orange/20">
              Top Mentor Rating
            </span>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-burnt-orange/30 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Image Box */}
            <div className="lg:col-span-5 relative bg-deep-navy min-h-[260px] sm:min-h-[300px] overflow-hidden">
              <img
                src={featuredProject.image}
                alt={featuredProject.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-burnt-orange text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                  {featuredProject.category}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs text-white/80 font-medium">Engineered by</p>
                <p className="text-sm font-bold truncate">{featuredProject.author}</p>
              </div>
            </div>

            {/* Content Box */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-gradient-to-br from-white to-warm-white">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sage-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{featuredProject.score}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy leading-snug">
                  {featuredProject.title}
                </h3>

                <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">
                  {featuredProject.summary || 'A comprehensive, production-grade architectural capstone built with enterprise tooling and evaluated under real-world performance parameters.'}
                </p>

                {/* Tech Badges */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-deep-navy uppercase tracking-wider">Tech Stack & Frameworks:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {featuredProject.tech.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-warm-ivory text-deep-navy border border-light-taupe text-xs font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features Checkpoints */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {featuredProject.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-deep-navy">
                      <div className="w-4 h-4 rounded-full bg-burnt-orange/15 text-burnt-orange flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-light-taupe/60 flex flex-wrap items-center gap-3">
                {featuredProject.courseSlug && (
                  <Link
                    to={`/courses/${featuredProject.courseSlug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-burnt-orange hover:bg-burnt-orange-600 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200"
                  >
                    <span>Explore Associated Track</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-light-taupe hover:border-burnt-orange text-deep-navy hover:text-burnt-orange text-xs font-bold transition-colors"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>All Programs</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          3. FILTERABLE CAPSTONES DIRECTORY
      ========================================================================== */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Controls: Search & Category Pills */}
        <div className="bg-white border border-light-taupe p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs space-y-4 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search projects, technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-warm-ivory/60 border border-light-taupe rounded-full py-2 pl-9 pr-4 text-xs text-deep-navy placeholder:text-warm-gray focus:outline-none focus:border-burnt-orange focus:bg-white transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Total Results Count */}
            <div className="text-xs font-semibold text-warm-gray">
              Showing <span className="font-bold text-deep-navy">{filteredProjects.length}</span> project{filteredProjects.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-burnt-orange text-white shadow-2xs'
                    : 'bg-warm-ivory text-deep-navy hover:bg-light-taupe/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-light-taupe rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-burnt-orange/40 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Card Top: Image & Category Badge */}
                <div>
                  <div className="relative h-44 overflow-hidden bg-deep-navy">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 via-transparent to-transparent" />
                    
                    {/* Category */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-deep-navy/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                      {project.category}
                    </span>

                    {/* Score Badge */}
                    <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-burnt-orange" />
                      {project.score}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-base text-deep-navy group-hover:text-burnt-orange transition-colors leading-snug line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="text-[11px] text-warm-gray font-medium">
                        By {project.author}
                      </p>
                    </div>

                    {project.summary && (
                      <p className="text-xs text-warm-gray line-clamp-2 leading-relaxed">
                        {project.summary}
                      </p>
                    )}

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.tech.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-warm-ivory text-deep-navy border border-light-taupe/80 rounded text-[10px] font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Key Features Checklist */}
                    <div className="space-y-1 pt-2 border-t border-light-taupe/40">
                      {project.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-deep-navy">
                          <CheckCircle2 className="w-3 h-3 text-sage-green shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Action */}
                <div className="p-4 sm:p-5 pt-0">
                  {project.courseSlug ? (
                    <Link
                      to={`/courses/${project.courseSlug}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-warm-ivory hover:bg-burnt-orange text-deep-navy hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 border border-light-taupe/60 hover:border-burnt-orange group/btn"
                    >
                      <span>Explore Associated Track</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </Link>
                  ) : (
                    <Link
                      to="/courses"
                      className="w-full py-2.5 px-4 rounded-xl bg-warm-ivory hover:bg-burnt-orange text-deep-navy hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 border border-light-taupe/60 hover:border-burnt-orange group/btn"
                    >
                      <span>Explore Tracks</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-light-taupe rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
            <Code2 className="w-10 h-10 text-warm-gray mx-auto" />
            <h3 className="font-display font-bold text-lg text-deep-navy">No projects found</h3>
            <p className="text-xs text-warm-gray">
              We couldn't find any projects matching "{searchQuery}". Try selecting a different category or clearing your search.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All Projects');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-full bg-burnt-orange text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          4. WHY OXYFIED CAPSTONES STAND OUT
      ========================================================================== */}
      <section className="py-14 sm:py-16 bg-warm-white border-y border-light-taupe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-burnt-orange">
              Our Capstone Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
              How You Build at Oxyfied
            </h2>
            <p className="text-xs sm:text-sm text-warm-gray">
              We replace toy exercises with real-world technical problems that simulate enterprise engineering workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-warm-ivory/70 border border-light-taupe p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-burnt-orange/15 text-burnt-orange flex items-center justify-center font-bold">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-deep-navy">1. Production-Grade Toolchains</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                Work directly inside Splunk, Linux, Wireshark, Docker, Falco, and PyTorch rather than simplified browser simulators.
              </p>
            </div>

            <div className="bg-warm-ivory/70 border border-light-taupe p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sage-green/20 text-sage-green flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-deep-navy">2. Rigorous Mentor Code Review</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                Every project submission receives detailed line-by-line feedback on code architecture, security standards, and documentation.
              </p>
            </div>

            <div className="bg-warm-ivory/70 border border-light-taupe p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-burnt-orange/15 text-burnt-orange flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-deep-navy">3. Public GitHub Artifacts</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                Graduate with complete repositories, architecture diagrams, and live demos that you can immediately showcase to recruiters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. BOTTOM CALL TO ACTION
      ========================================================================== */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-deep-navy text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-lg space-y-5">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-burnt-orange/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sage-green/20 rounded-full blur-2xl pointer-events-none" />

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-burnt-orange text-xs font-bold uppercase tracking-wider border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
            Build What Matters
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight">
            Ready to Build Your Own Capstone Portfolio?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join Oxyfied's intensive programs and start building verifiable technology systems with 1-on-1 mentor guidance.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/courses"
              className="px-6 py-3 rounded-full bg-burnt-orange hover:bg-burnt-orange-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>Explore Programs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
