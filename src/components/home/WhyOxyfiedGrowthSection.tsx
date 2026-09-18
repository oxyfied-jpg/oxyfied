import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  BookOpen,
  Target,
  ArrowRight,
  Settings,
  Code2,
  Rocket
} from 'lucide-react';

interface ValuePoint {
  icon: React.ElementType;
  title: string;
  desc: string;
}

const VALUE_POINTS: ValuePoint[] = [
  {
    icon: Users,
    title: 'Expert Mentors',
    desc: 'Learn from industry professionals'
  },
  {
    icon: Briefcase,
    title: 'Real Projects',
    desc: 'Build portfolio-worthy projects'
  },
  {
    icon: BookOpen,
    title: 'Industry Curriculum',
    desc: 'Stay relevant with in-demand skills'
  },
  {
    icon: Target,
    title: 'Career Support',
    desc: 'Get guidance for your dream job'
  }
];

interface JourneyStage {
  id: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  borderColor: string;
}

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'learn',
    title: 'Learn',
    icon: BookOpen,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    borderColor: 'hover:border-orange-300'
  },
  {
    id: 'skills',
    title: 'Skills',
    icon: Settings,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    borderColor: 'hover:border-emerald-300'
  },
  {
    id: 'project',
    title: 'Project',
    icon: Code2,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    borderColor: 'hover:border-indigo-300'
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    icon: Briefcase,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    borderColor: 'hover:border-amber-300'
  },
  {
    id: 'career',
    title: 'Career',
    icon: Rocket,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-100',
    borderColor: 'hover:border-rose-300'
  }
];

export const WhyOxyfiedGrowthSection: React.FC = () => {
  return (
    <section
      id="why-oxyfied-journey"
      className="py-6 sm:py-8 bg-warm-ivory border-b border-light-taupe/60 relative"
      aria-label="Why Oxyfied Learning Journey"
    >
      {/* Centered Wide Banner Container */}
      <div className="max-w-[1380px] w-[calc(100%-32px)] sm:w-[calc(100%-48px)] xl:w-[calc(100%-70px)] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-burnt-orange/25 hover:border-burnt-orange/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          {/* Subtle Background Aesthetic Gradients & Dots */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-burnt-orange/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-sage-green/5 rounded-full blur-2xl pointer-events-none" />

          {/* 2-Column Desktop Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
            
            {/* ===============================================================
                LEFT COLUMN: WHY OXYFIED CONTENT (42% width)
            ================================================================ */}
            <div className="lg:col-span-5 space-y-4 text-left">
              {/* Eyebrow */}
              <div className="space-y-1">
                <span className="text-burnt-orange text-[9.5px] sm:text-[10.5px] font-extrabold tracking-widest uppercase block">
                  WHY OXYFIED?
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-[28px] lg:text-[30px] !text-deep-navy leading-[1.15] tracking-tight">
                  Learning should lead <br className="hidden sm:inline" />
                  somewhere.
                </h3>
              </div>

              {/* Subtitle / Quote */}
              <p className="text-[11.5px] sm:text-[12px] text-warm-gray leading-relaxed max-w-md">
                We don't just teach you what to learn. <br className="hidden sm:inline" />
                We help you turn knowledge into something real.
              </p>

              {/* 4 Value Points: 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {VALUE_POINTS.map((pt, idx) => {
                  const Icon = pt.icon;
                  return (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                        <Icon className="w-3.5 h-3.5 text-burnt-orange" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-display font-bold text-[11.5px] sm:text-[12px] !text-deep-navy leading-tight">
                          {pt.title}
                        </h4>
                        <p className="text-[10px] sm:text-[10.5px] text-warm-gray leading-tight">
                          {pt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <Link
                  to="/courses"
                  className="btn-primary px-4 py-2 text-xs font-bold rounded-full inline-flex items-center gap-2 shadow-xs group"
                >
                  <span>Explore Learning Journey</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* ===============================================================
                CENTER / SUBTLE DIVIDER WITH BOTANICAL ACCENT
            ================================================================ */}
            <div className="hidden lg:flex lg:col-span-1 justify-center items-center h-full">
              <div className="h-36 w-px bg-gradient-to-b from-transparent via-light-taupe/80 to-transparent relative">
                {/* Botanical leaf icon accent */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF6F0] border border-light-taupe flex items-center justify-center shadow-2xs">
                  <span className="text-[12px] leading-none select-none">🌿</span>
                </div>
              </div>
            </div>

            {/* ===============================================================
                RIGHT COLUMN: YOUR GROWTH PATH JOURNEY (58% width)
            ================================================================ */}
            <div className="lg:col-span-6 space-y-4 text-center lg:text-left relative">
              
              {/* Heading with Handwritten Style */}
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <span className="font-handwriting text-2xl sm:text-3xl text-deep-navy font-bold rotate-[-3deg] inline-block tracking-wide">
                  Your Growth Path
                </span>
                {/* Decorative swoosh arrow pointing to the nodes */}
                <svg className="w-8 h-6 text-burnt-orange" viewBox="0 0 40 24" fill="none">
                  <path
                    d="M4 6 C 14 2, 28 4, 34 16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="2 2"
                  />
                  <path
                    d="M30 16 L35 17 L36 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Connected 5 Growth Nodes in a Horizontal Sequence */}
              <div className="relative pt-2 pb-1">
                
                {/* Connecting Curved Background Path on Desktop */}
                <div className="hidden sm:block absolute top-[44px] left-[35px] right-[35px] h-10 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 420 30" fill="none" preserveAspectRatio="none">
                    <path
                      d="M 10 15 C 60 5, 100 25, 150 15 C 200 5, 250 25, 300 15 C 350 5, 390 25, 410 15"
                      stroke="#F26B21"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      strokeOpacity="0.45"
                    />
                  </svg>
                </div>

                {/* Mobile-Only Vertical Growth Flow (< sm: / sm:hidden) */}
                <div className="flex sm:hidden flex-col items-center space-y-1.5 py-1">
                  {JOURNEY_STAGES.map((stage, idx) => {
                    const Icon = stage.icon;
                    return (
                      <React.Fragment key={`mobile-stage-${stage.id}`}>
                        <div className="flex items-center gap-3 w-full max-w-[260px] bg-white border border-light-taupe/90 rounded-2xl p-2.5 shadow-2xs">
                          <div className={`w-8 h-8 rounded-xl ${stage.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                            <Icon className={`w-4 h-4 ${stage.iconColor}`} />
                          </div>
                          <div className="text-left">
                            <span className="font-display font-bold text-xs text-deep-navy block">
                              {stage.title}
                            </span>
                            <span className="text-[9.5px] text-warm-gray block">
                              Stage 0{idx + 1}
                            </span>
                          </div>
                        </div>
                        {idx < JOURNEY_STAGES.length - 1 && (
                          <div className="text-burnt-orange font-bold text-sm leading-none">
                            ↓
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Desktop Horizontal Sequence (≥ sm: / hidden sm:grid) - UNCHANGED */}
                <div className="hidden sm:grid grid-cols-5 gap-2 relative z-10">
                  {JOURNEY_STAGES.map((stage) => {
                    const Icon = stage.icon;
                    return (
                      <div key={stage.id} className="flex flex-col items-center group relative">
                        {/* Node Card */}
                        <motion.div
                          whileHover={{ y: -3, scale: 1.04 }}
                          transition={{ duration: 0.2 }}
                          className={`w-full max-w-[84px] aspect-square rounded-2xl bg-white border border-light-taupe/90 shadow-2xs hover:shadow-md ${stage.borderColor} transition-all duration-200 flex flex-col items-center justify-center p-2 text-center space-y-1`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl ${stage.iconBg} flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform`}
                          >
                            <Icon className={`w-4 h-4 ${stage.iconColor}`} />
                          </div>
                          <span className="font-display font-bold text-[10.5px] sm:text-[11px] !text-deep-navy group-hover:!text-burnt-orange transition-colors">
                            {stage.title}
                          </span>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Supporting Progress Footnote */}
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-[10px] font-medium text-warm-gray pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-green" />
                <span>Structured 5-Stage Transformation Architecture</span>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};
