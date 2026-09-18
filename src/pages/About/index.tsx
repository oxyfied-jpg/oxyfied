import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Target, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Terminal, 
  ArrowRight,
  Cpu
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';

export const About: React.FC = () => {
  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="About Us" 
        description="Learn about Oxyfied's mission, learning philosophy, industry-aligned tech curriculum, mentor network, and leadership council."
        canonical="/about"
      />

      {/* Hero Header */}
      <section className="bg-warm-white py-16 sm:py-20 text-center relative overflow-hidden border-b border-light-taupe">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,107,33,0.08),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            About Oxyfied
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            Practical Skills. Real Projects. <span className="text-burnt-orange">Better Careers.</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Oxyfied was founded to close the widening gap between traditional academic theory and modern enterprise tech requirements. We empower learners worldwide with hands-on, verifiable capabilities across Cybersecurity, AI, Cloud, and Software Engineering.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/courses"
              className="btn-primary h-10 px-5 text-xs font-bold rounded-full shadow-md inline-flex items-center gap-2"
            >
              <span>Explore Programs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/leadership-council"
              className="h-10 px-5 text-xs font-bold rounded-full bg-white border border-light-taupe text-deep-navy hover:border-burnt-orange/40 hover:text-burnt-orange transition-all inline-flex items-center gap-2"
            >
              <span>Meet Leadership Council</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {/* Mission */}
        <div className="bg-warm-white border border-light-taupe p-8 rounded-3xl shadow-xs space-y-4 hover:border-burnt-orange/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-extrabold text-deep-navy">Our Mission</h2>
          <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">
            To provide aspiring technology builders, career transitioners, and engineering teams with project-driven, verified learning pathways that produce demonstrable competencies. We replace passive slide lectures with interactive terminal sandboxes, real production datasets, and live defensive configurations.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-deep-navy">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>100% Practical Competency Framework</span>
          </div>
        </div>

        {/* Vision */}
        <div className="bg-warm-white border border-light-taupe p-8 rounded-3xl shadow-xs space-y-4 hover:border-burnt-orange/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-extrabold text-deep-navy">Our Vision</h2>
          <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">
            To be the most reliable, trusted destination for hands-on technology education globally—recognized by enterprise leaders, hiring managers, and academic institutions for producing day-one job-ready engineering talent.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-deep-navy">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verifiable Academic &amp; Industry Trust</span>
          </div>
        </div>
      </section>

      {/* What We Provide */}
      <section className="bg-warm-white border-y border-light-taupe py-16 sm:py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
              Core Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
              What Oxyfied Delivers
            </h2>
            <p className="text-warm-gray text-xs sm:text-sm max-w-xl mx-auto">
              Every track on our platform is architected around actionable competencies, rigorous mentor reviews, and verified portfolios.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                icon: Terminal,
                title: 'Browser Lab Sandboxes',
                desc: 'Execute real network captures, Python pipelines, and Docker containers directly in isolated cloud environments.',
                badge: 'Hands-On'
              },
              {
                icon: Briefcase,
                title: 'Portfolio Capstones',
                desc: 'Build industry-grade projects that demonstrate end-to-end architectural mastery to hiring managers.',
                badge: 'Real-World'
              },
              {
                icon: Users,
                title: 'Lead Mentor Reviews',
                desc: 'Receive qualitative, line-by-line feedback and architectural guidance from verified industry practitioners.',
                badge: '1-on-1'
              },
              {
                icon: Award,
                title: 'Verifiable Registry',
                desc: 'Every Certificate of Completion is anchored on our public registry with tamper-evident digital verification hashes.',
                badge: 'Verifiable'
              }
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-warm-ivory border border-light-taupe p-6 rounded-2xl space-y-3 hover:border-burnt-orange/30 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white border border-light-taupe text-warm-gray">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-deep-navy">{pillar.title}</h3>
                  <p className="text-xs text-warm-gray leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Methodology */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
            Pedagogy
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
            Our 3-Phase Learning Loop
          </h2>
          <p className="text-warm-gray text-xs sm:text-sm">
            How we take students from foundational concepts to production-grade system implementation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-warm-white border border-light-taupe p-7 rounded-3xl shadow-xs space-y-4">
            <span className="w-8 h-8 rounded-xl bg-burnt-orange text-white font-display font-bold text-xs flex items-center justify-center">
              01
            </span>
            <h3 className="font-display font-bold text-base text-deep-navy">Foundation &amp; Micro-Labs</h3>
            <p className="text-xs text-warm-gray leading-relaxed">
              Bite-sized technical lectures followed immediately by hands-on terminal tasks to cement core syntax, protocol mechanics, or data operations.
            </p>
          </div>

          <div className="bg-warm-white border border-light-taupe p-7 rounded-3xl shadow-xs space-y-4">
            <span className="w-8 h-8 rounded-xl bg-deep-navy text-white font-display font-bold text-xs flex items-center justify-center">
              02
            </span>
            <h3 className="font-display font-bold text-base text-deep-navy">Production System Construction</h3>
            <p className="text-xs text-warm-gray leading-relaxed">
              Synthesize concepts across full modules to build real-world defenses, data pipelines, automated models, or cloud infrastructure configurations.
            </p>
          </div>

          <div className="bg-warm-white border border-light-taupe p-7 rounded-3xl shadow-xs space-y-4">
            <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-display font-bold text-xs flex items-center justify-center">
              03
            </span>
            <h3 className="font-display font-bold text-base text-deep-navy">Mentor Audit &amp; Credentialing</h3>
            <p className="text-xs text-warm-gray leading-relaxed">
              Submit capstone deliverables for official mentor evaluation, resolve feedback items, and receive a verified, tamper-proof digital credential.
            </p>
          </div>
        </div>
      </section>

      {/* Collaboration and Ecosystem Banner */}
      <section className="bg-warm-white border-y border-light-taupe py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-warm-ivory border border-light-taupe p-6 rounded-2xl space-y-3">
              <Building2 className="w-6 h-6 text-burnt-orange" />
              <h3 className="font-display font-bold text-base text-deep-navy">For Employers</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                Discover pre-assessed, project-tested talent ready to contribute immediately to software and security teams.
              </p>
              <Link to="/hire-from-us" className="text-xs font-bold text-burnt-orange inline-flex items-center gap-1 hover:underline">
                <span>Hire From Us</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-warm-ivory border border-light-taupe p-6 rounded-2xl space-y-3">
              <GraduationCap className="w-6 h-6 text-deep-navy" />
              <h3 className="font-display font-bold text-base text-deep-navy">For Experts</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                Join our elite mentor network to author cutting-edge curriculum tracks and guide the next generation of engineers.
              </p>
              <Link to="/become-an-instructor" className="text-xs font-bold text-deep-navy inline-flex items-center gap-1 hover:underline">
                <span>Become an Instructor</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-warm-ivory border border-light-taupe p-6 rounded-2xl space-y-3">
              <Cpu className="w-6 h-6 text-emerald-700" />
              <h3 className="font-display font-bold text-base text-deep-navy">For Enterprises</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                Upskill your technology workforce with tailored lab sandboxes, AI engineering cohorts, and defensive bootcamps.
              </p>
              <Link to="/corporate-training" className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1 hover:underline">
                <span>Corporate Training</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-deep-navy text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(242,107,33,0.15),transparent_40%)] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/15 border border-burnt-orange/30 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Build Practical Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white">
            Ready to Accelerate Your Tech Career?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Join thousands of active students building verified competencies in Cybersecurity, Data Science, and AI.
          </p>
          <div className="pt-2">
            <Link to="/courses" className="btn-primary px-8 py-3 text-xs sm:text-sm font-bold rounded-full shadow-lg inline-flex items-center gap-2">
              <span>View All Programs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
