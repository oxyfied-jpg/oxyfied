import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  Briefcase, 
  Code2, 
  ArrowRight,
  Users,
  FileCheck
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';

interface ProjectHighlight {
  id: string;
  title: string;
  category: string;
  studentRole: string;
  description: string;
  skills: string[];
  metrics: string;
  href: string;
}

const PROJECT_HIGHLIGHTS: ProjectHighlight[] = [
  {
    id: 'sh-1',
    title: 'Enterprise SIEM Log Triage & Automated Playbook Engine',
    category: 'Cybersecurity & SOC',
    studentRole: 'SOC Analyst Track',
    description: 'Constructed an automated threat triage pipeline ingesting live syslog feeds, parsing Zeek/Suricata alerts, and executing automated containment via Python APIs.',
    skills: ['Splunk SPL', 'Wireshark', 'Python', 'MITRE ATT&CK', 'Linux'],
    metrics: '99.4% Alert Triage Accuracy in Sandbox Simulation',
    href: '/projects'
  },
  {
    id: 'sh-2',
    title: 'Multi-Agent Autonomous Research & Retrieval System (RAG)',
    category: 'Data Science & AI',
    studentRole: 'AI & Data Science Track',
    description: 'Developed a hierarchical multi-agent research swarm using LangGraph, FAISS vector indexing, and self-reflection loops to audit financial SEC 10-K filings.',
    skills: ['LangGraph', 'PyTorch', 'FAISS', 'FastAPI', 'Docker'],
    metrics: 'Sub-300ms Vector Retrieval across 100k Token Documents',
    href: '/projects'
  },
  {
    id: 'sh-3',
    title: 'Zero-Trust Cloud Infrastructure & Automated DevSecOps Gate',
    category: 'Cloud Security',
    studentRole: 'Cloud Security & DevSecOps Track',
    description: 'Implemented automated Trivy container image scanning, Terraform IaC compliance checks, and Kubernetes admission controllers on AWS EKS.',
    skills: ['AWS IAM', 'Kubernetes', 'Trivy', 'Terraform', 'GitHub Actions'],
    metrics: 'Zero High-Severity Vulnerabilities Allowed in Production Image Registry',
    href: '/projects'
  }
];

export const StudentSuccess: React.FC = () => {
  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Student Success & Capstone Projects" 
        description="Discover how Oxyfied learners build demonstrable technical competencies, complete verified capstone projects, and prepare for industry engineering careers."
        canonical="/student-success"
      />

      {/* Hero Header */}
      <section className="bg-warm-white py-16 sm:py-20 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5" />
            Verified Capabilities
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            Proof Over Promises. <span className="text-burnt-orange">Student Success.</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            We measure success through verified competencies: production-grade code repositories, defended cloud architectures, and verifiable credentials audited by lead industry mentors.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/projects"
              className="btn-primary h-10 px-5 text-xs font-bold rounded-full shadow-md inline-flex items-center gap-2"
            >
              <span>Explore Capstone Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/verify-credential"
              className="h-10 px-5 text-xs font-bold rounded-full bg-white border border-light-taupe text-deep-navy hover:border-burnt-orange/40 hover:text-burnt-orange transition-all inline-flex items-center gap-2"
            >
              <span>Verify a Credential</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Verified Metrics Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-warm-white border border-light-taupe rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-light-taupe">
            <div className="space-y-1">
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-deep-navy block">
                100%
              </span>
              <span className="text-xs font-bold text-burnt-orange uppercase tracking-wider block">
                Project-Based Labs
              </span>
              <p className="text-[11px] text-warm-gray">Every module culminates in actionable code</p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-deep-navy block">
                4.9 / 5.0
              </span>
              <span className="text-xs font-bold text-burnt-orange uppercase tracking-wider block">
                Mentor Audit Score
              </span>
              <p className="text-[11px] text-warm-gray">Qualitative line-by-line project feedback</p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-deep-navy block">
                50+
              </span>
              <span className="text-xs font-bold text-burnt-orange uppercase tracking-wider block">
                Virtual Sandboxes
              </span>
              <p className="text-[11px] text-warm-gray">Live terminal &amp; notebook environments</p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-deep-navy block">
                100%
              </span>
              <span className="text-xs font-bold text-burnt-orange uppercase tracking-wider block">
                Verifiable Hashes
              </span>
              <p className="text-[11px] text-warm-gray">Tamper-evident public registry records</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Student Capstones */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
            Portfolio Showcase
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
            Real Student Capstone Highlights
          </h2>
          <p className="text-warm-gray text-xs sm:text-sm">
            Exemplary production systems engineered and defended by Oxyfied learners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {PROJECT_HIGHLIGHTS.map((proj) => (
            <div
              key={proj.id}
              className="bg-warm-white border border-light-taupe rounded-3xl p-6 sm:p-7 space-y-4 hover:border-burnt-orange/30 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-burnt-orange/10 text-burnt-orange border border-burnt-orange/20">
                    {proj.category}
                  </span>
                  <span className="text-[10px] font-medium text-warm-gray">
                    {proj.studentRole}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-base text-deep-navy leading-snug">
                  {proj.title}
                </h3>

                <p className="text-xs text-warm-gray leading-relaxed">
                  {proj.description}
                </p>

                <div className="bg-warm-ivory p-2.5 rounded-xl border border-light-taupe text-[11px] font-bold text-deep-navy flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{proj.metrics}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-light-taupe/80">
                <div className="flex flex-wrap gap-1.5">
                  {proj.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-warm-ivory border border-light-taupe text-deep-navy"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <Link
                  to={proj.href}
                  className="text-xs font-bold text-burnt-orange hover:text-deep-orange flex items-center gap-1 transition-colors"
                >
                  <span>View Project Showcase</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Career & Interview Preparation Methodology */}
      <section className="bg-warm-white border-y border-light-taupe py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
              Readiness Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
              How We Prepare You for Technical Loops
            </h2>
            <p className="text-warm-gray text-xs sm:text-sm">
              Comprehensive support from repository audits to system design mock interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                icon: Code2,
                title: 'Clean Code Audits',
                desc: 'Mentors evaluate your commit history, modular architecture, docstrings, and test coverage.'
              },
              {
                icon: FileCheck,
                title: 'Portfolio Structuring',
                desc: 'Learn how to present complex architectural trade-offs clearly in README files and system diagrams.'
              },
              {
                icon: Users,
                title: 'Mock Technical Loops',
                desc: 'Practice explaining protocol decisions, incident containment, or vector search latencies in live mock calls.'
              },
              {
                icon: Briefcase,
                title: 'Direct Partner Introductions',
                desc: 'Qualified graduates are introduced to verified partner employers actively searching for Day-1 talent.'
              }
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-warm-ivory border border-light-taupe p-6 rounded-2xl space-y-3 hover:border-burnt-orange/30 transition-all shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-deep-navy">{pillar.title}</h3>
                  <p className="text-xs text-warm-gray leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-deep-navy text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(242,107,33,0.15),transparent_40%)] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/15 border border-burnt-orange/30 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Build Your Track Record
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white">
            Start Your Capstone Journey Today
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Enroll in hands-on programs and create verifiable projects that stand out to technology hiring teams.
          </p>
          <div className="pt-2">
            <Link to="/courses" className="btn-primary px-8 py-3 text-xs sm:text-sm font-bold rounded-full shadow-lg inline-flex items-center gap-2">
              <span>Explore Programs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
