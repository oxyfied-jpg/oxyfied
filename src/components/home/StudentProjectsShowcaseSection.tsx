import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { studentProjects, type StudentProject } from '../../data/projects';

interface StudentProjectsShowcaseSectionProps {
  projects?: StudentProject[];
}

export const StudentProjectsShowcaseSection: React.FC<StudentProjectsShowcaseSectionProps> = ({
  projects = studentProjects
}) => {
  // Dynamically select the featured project (first marked featured, or first project)
  const featuredProject = projects.find((p) => p.featured) || projects[0];
  // Select up to 4 remaining projects for the "More Projects" showcase
  const remainingProjects = projects
    .filter((p) => p.id !== featuredProject?.id)
    .slice(0, 4);

  return (
    <section 
      aria-labelledby="capstone-showcase-heading"
      className="py-6 sm:py-8 lg:py-9 bg-warm-ivory/60 border-b border-light-taupe/80 relative overflow-hidden"
    >
      {/* Subtle decorative background accents */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-burnt-orange/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-burnt-orange/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Single Wide Horizontal Showcase Container */}
        <div className="bg-warm-white/95 border border-light-taupe/90 rounded-2xl sm:rounded-[22px] p-4 sm:p-5 lg:p-6 shadow-xs hover:shadow-sm transition-all duration-300">
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 lg:gap-6">
            
            {/* =========================================================
                1. SECTION HEADER — LEFT (≈ 20-22%)
            ========================================================== */}
            <div className="w-full lg:w-[22%] lg:max-w-[280px] shrink-0 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-burnt-orange flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-burnt-orange" />
                  OUR PROJECTS
                </span>
                <h2 
                  id="capstone-showcase-heading"
                  className="text-2xl sm:text-[26px] lg:text-[28px] font-display font-extrabold text-deep-navy tracking-tight leading-[1.15]"
                >
                  What You'll Actually Build
                </h2>
                <p className="text-xs text-warm-gray leading-snug">
                  Don't just watch tutorials. Build things.
                </p>
              </div>

              <div>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-burnt-orange hover:bg-burnt-orange-600 text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all duration-200 group"
                  aria-label="View all student capstone projects"
                >
                  <span>View All Projects</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* =========================================================
                2. FEATURED PROJECT — CENTER (≈ 30-32%)
            ========================================================== */}
            {featuredProject && (
              <div className="w-full lg:w-[32%] lg:min-w-[310px] lg:max-w-[360px] shrink-0">
                <div className="bg-white border border-burnt-orange/25 hover:border-burnt-orange/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-row h-full min-h-[140px] sm:min-h-[148px]">
                  
                  {/* Left: Thumbnail Image (40-45%) */}
                  <div className="w-[42%] relative overflow-hidden bg-deep-navy shrink-0">
                    <img
                      src={featuredProject.image}
                      alt={featuredProject.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-deep-navy/90 text-white text-[8.5px] font-bold rounded tracking-wider uppercase backdrop-blur-xs">
                      {featuredProject.category}
                    </span>
                  </div>

                  {/* Right: Content, Tech Pills, Features & CTA */}
                  <div className="w-[58%] p-3 sm:p-3.5 flex flex-col justify-between bg-white">
                    <div className="space-y-1">
                      <h3 
                        className="font-display font-bold text-xs sm:text-[13px] text-deep-navy leading-snug line-clamp-1"
                        title={featuredProject.title}
                      >
                        {featuredProject.title}
                      </h3>

                      {/* Tech Pills */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {featuredProject.tech.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 bg-warm-ivory border border-light-taupe text-deep-navy text-[9px] font-bold rounded leading-none"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Feature Checklist */}
                      <div className="space-y-0.5 pt-1">
                        {featuredProject.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-[9.5px] text-warm-gray leading-tight">
                            <Check className="w-2.5 h-2.5 text-sage-green shrink-0 stroke-[2.5]" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* View Project CTA */}
                    <div className="pt-2">
                      <Link
                        to={featuredProject.courseSlug ? `/courses/${featuredProject.courseSlug}` : '/courses'}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-burnt-orange hover:bg-burnt-orange-600 text-white text-[10px] font-bold shadow-2xs hover:shadow-xs transition-colors group"
                      >
                        <span>View Project</span>
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* =========================================================
                3. MORE PROJECTS — RIGHT (≈ 45-48%)
            ========================================================== */}
            <div className="w-full lg:w-[46%] shrink-0 flex flex-col justify-between space-y-2">
              
              {/* Eyebrow */}
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-burnt-orange uppercase tracking-wider">
                  More Projects
                </span>
                <span className="text-[10px] text-warm-gray font-medium hidden sm:inline">
                  Portfolio Capstones
                </span>
              </div>

              {/* 4 Compact Project Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {remainingProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={project.courseSlug ? `/courses/${project.courseSlug}` : '/courses'}
                    className="bg-white border border-light-taupe hover:border-burnt-orange/60 rounded-xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between group min-h-[130px] sm:min-h-[142px]"
                  >
                    {/* Top: Image (approx 45-50% height) */}
                    <div className="h-[54px] sm:h-[60px] w-full relative overflow-hidden bg-deep-navy shrink-0">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-1 left-1 px-1 py-0.2 bg-deep-navy/85 text-white text-[7.5px] font-bold rounded uppercase tracking-wider">
                        {project.category}
                      </span>
                    </div>

                    {/* Middle: Title */}
                    <div className="p-2 flex-1 flex flex-col justify-between">
                      <h4 
                        className="text-[10.5px] font-bold text-deep-navy leading-tight line-clamp-2 group-hover:text-burnt-orange transition-colors"
                        title={project.title}
                      >
                        {project.title}
                      </h4>

                      {/* Bottom: Technology Info */}
                      <div className="pt-1.5 mt-auto border-t border-light-taupe/40">
                        <span className="text-[9px] font-semibold text-warm-gray truncate block">
                          {project.techSummary || project.tech.slice(0, 2).join(' • ')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
