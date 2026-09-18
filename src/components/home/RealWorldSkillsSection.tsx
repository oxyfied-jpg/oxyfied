import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Laptop,
  FolderGit2,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Star
} from 'lucide-react';

interface LearningPillar {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ElementType;
  image: string;
  badge: string;
  highlights: string[];
}

const PILLARS: LearningPillar[] = [
  {
    id: 'labs',
    step: '01',
    title: 'Hands-On Browser Labs',
    subtitle: 'Zero setup friction',
    desc: 'Practice in pre-configured cloud environments directly in your browser. Run Linux commands, analyze network packets, and train AI models with instant feedback.',
    icon: Laptop,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=900&auto=format&fit=crop',
    badge: '100% Practical Sandboxes',
    highlights: ['Browser-based terminals & notebooks', 'Instant feedback on syntax and logic', 'Pre-loaded datasets & dependencies']
  },
  {
    id: 'capstones',
    step: '02',
    title: 'Real-World Capstone Projects',
    subtitle: 'Enterprise-grade portfolios',
    desc: 'Work with authentic datasets, microservice architectures, and defensive security playbooks that replicate what engineering teams do in production.',
    icon: FolderGit2,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=900&auto=format&fit=crop',
    badge: 'Portfolio Ready',
    highlights: ['Production scale problem statements', 'Showcase-ready GitHub repositories', 'Real APIs, databases & logs']
  },
  {
    id: 'mentorship',
    step: '03',
    title: '1-on-1 Senior Code Reviews',
    subtitle: 'Learn from active tech leads',
    desc: 'Every project milestone is evaluated line-by-line by experienced industry mentors who provide constructive architectural feedback and code optimizations.',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=900&auto=format&fit=crop',
    badge: 'Personal Guidance',
    highlights: ['Line-by-line pull request audits', '1-on-1 Q&A and concept clearing', 'Resume audits & interview coaching']
  },
  {
    id: 'certification',
    step: '04',
    title: 'Industry-Mapped Certification',
    subtitle: 'Verified career credentials',
    desc: 'Earn verifiable digital certificates shareable on LinkedIn, backed by proof-of-work repositories that demonstrate your actual technical competence.',
    icon: Award,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=900&auto=format&fit=crop',
    badge: 'Recruiter Verified',
    highlights: ['Permanent verification URL & QR code', 'Skills mapped to active hiring specs', 'Lifetime access to course updates']
  }
];

export const RealWorldSkillsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const currentPillar = PILLARS[activeTab];

  return (
    <section className="bg-warm-ivory border-b border-light-taupe/80 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 lg:space-y-16">
        
        {/* ===============================================================
            HEADER
        ================================================================ */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Learning Excellence
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-deep-navy tracking-tight">
            Built for Real-World Engineering Skills
          </h2>
          <p className="text-warm-gray text-xs sm:text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            We replaced passive video watching with active, hands-on engineering. Here is how our practical curriculum prepares you for real technical roles.
          </p>
        </div>

        {/* ===============================================================
            SPLIT INTERACTIVE STORYBOARD (LEFT: VISUAL CARD, RIGHT: PILLARS)
        ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: DYNAMIC VISUAL SHOWCASE WITH FLOATING BADGES (5 COLS) */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden border border-light-taupe shadow-md bg-white">
              
              {/* Main Feature Image */}
              <div className="aspect-[4/3] sm:aspect-[16/11] overflow-hidden relative">
                <img
                  src={currentPillar.image}
                  alt={currentPillar.title}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/70 via-transparent to-transparent" />
                
                {/* Image Top Tag */}
                <span className="absolute top-4 left-4 px-3 py-1 bg-deep-navy/90 text-white text-xs font-bold rounded-lg uppercase tracking-wider backdrop-blur-xs">
                  {currentPillar.badge}
                </span>

                {/* Bottom Overlay Info inside Image */}
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-burnt-orange-300 font-bold block">
                    Pillar {currentPillar.step} of 04
                  </span>
                  <h4 className="font-display font-bold text-base sm:text-lg leading-tight">
                    {currentPillar.title}
                  </h4>
                </div>
              </div>

              {/* Card Footer with Highlights */}
              <div className="p-5 sm:p-6 bg-white space-y-3 text-left">
                <p className="text-xs text-warm-gray leading-relaxed">
                  {currentPillar.desc}
                </p>
                <div className="space-y-2 pt-2 border-t border-light-taupe/60">
                  {currentPillar.highlights.map((hl, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2 text-xs font-semibold text-deep-navy">
                      <CheckCircle className="w-4 h-4 text-sage-green flex-shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Floating Trust Badge */}
            <div className="hidden sm:flex absolute -bottom-5 -right-4 bg-white border border-light-taupe rounded-2xl p-3 shadow-md items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-burnt-orange/10 flex items-center justify-center text-burnt-orange">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left pr-2">
                <span className="font-display font-bold text-xs text-deep-navy block">4.9/5 Student Rating</span>
                <span className="text-[10px] text-warm-gray">From 10,000+ graduates</span>
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE 4-STEP PILLAR LIST (7 COLS) */}
          <div className="lg:col-span-7 space-y-3.5 order-1 lg:order-2">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                    isActive
                      ? 'bg-white border-burnt-orange shadow-sm scale-[1.01]'
                      : 'bg-white/60 border-light-taupe hover:bg-white hover:border-light-taupe hover:shadow-2xs'
                  }`}
                >
                  {/* Step Number / Icon */}
                  <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-burnt-orange text-white shadow-2xs'
                      : 'bg-warm-ivory text-deep-navy border border-light-taupe'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-display font-bold text-sm sm:text-base transition-colors ${
                        isActive ? 'text-burnt-orange' : 'text-deep-navy'
                      }`}>
                        {pillar.title}
                      </h3>
                      <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded ${
                        isActive
                          ? 'bg-burnt-orange/10 text-burnt-orange'
                          : 'text-warm-gray bg-warm-ivory'
                      }`}>
                        {pillar.step}
                      </span>
                    </div>

                    <p className="text-xs text-warm-gray leading-relaxed line-clamp-2">
                      {pillar.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* ===============================================================
            CLEAN BOTTOM COMPARISON STRIP
        ================================================================ */}
        <div className="bg-white border border-light-taupe rounded-2xl p-6 sm:p-8 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left divide-y md:divide-y-0 md:divide-x divide-light-taupe/70">
            
            <div className="space-y-1.5 md:pr-4">
              <span className="text-[11px] font-bold text-burnt-orange uppercase tracking-wider block">
                01 • Active Practice
              </span>
              <h4 className="font-display font-bold text-sm text-deep-navy">
                Zero Passive Memorization
              </h4>
              <p className="text-xs text-warm-gray leading-relaxed">
                Every concept is backed by live coding sandboxes, terminal exercises, and interactive quizzes.
              </p>
            </div>

            <div className="space-y-1.5 pt-4 md:pt-0 md:px-4">
              <span className="text-[11px] font-bold text-sage-green uppercase tracking-wider block">
                02 • Senior Guidance
              </span>
              <h4 className="font-display font-bold text-sm text-deep-navy">
                Actionable Mentor Reviews
              </h4>
              <p className="text-xs text-warm-gray leading-relaxed">
                Receive personalized line-by-line feedback on every capstone to write production-standard code.
              </p>
            </div>

            <div className="space-y-1.5 pt-4 md:pt-0 md:pl-4">
              <span className="text-[11px] font-bold text-deep-navy uppercase tracking-wider block">
                03 • Career Ready
              </span>
              <h4 className="font-display font-bold text-sm text-deep-navy">
                Proof-of-Work Repositories
              </h4>
              <p className="text-xs text-warm-gray leading-relaxed">
                Graduate with public GitHub repositories and shareable credentials verified for hiring teams.
              </p>
            </div>

          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <Link
            to="/courses"
            className="btn-primary px-7 py-3 text-xs sm:text-sm font-bold rounded-full inline-flex items-center gap-2 shadow-sm"
          >
            <span>Explore All Career Programs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
