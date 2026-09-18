import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Building2, 
  ExternalLink, 
  ArrowRight,
  Scale,
  Compass
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';

interface CouncilMember {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  bio: string;
  image: string;
  expertise: string[];
  linkedInUrl?: string;
  isAdvisoryPlaceholder?: boolean;
}

const COUNCIL_MEMBERS: CouncilMember[] = [
  {
    id: 'lc-1',
    name: 'Dr. Evelyn Vance',
    role: 'Chair of Cybersecurity & Defensive Architecture',
    affiliation: 'Oxyfied Academic Board',
    bio: 'Former enterprise security architect leading research into threat intelligence, SIEM automations, and practical vulnerability auditing frameworks.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    expertise: ['Threat Intelligence', 'DefSecOps', 'Applied Cryptography'],
    linkedInUrl: 'https://linkedin.com'
  },
  {
    id: 'lc-2',
    name: 'Marcus Sterling',
    role: 'Principal Advisor, Cloud & Distributed Systems',
    affiliation: 'Cloud Infrastructure Council',
    bio: 'Directs cloud infrastructure modernization strategies, focusing on container isolation, zero-trust network boundaries, and high-throughput microservice engineering.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    expertise: ['Kubernetes', 'Multi-Cloud Architecture', 'CI/CD Pipelines'],
    linkedInUrl: 'https://linkedin.com'
  },
  {
    id: 'lc-3',
    name: 'Elena Rostova',
    role: 'Lead Advisor, Applied Artificial Intelligence & MLOps',
    affiliation: 'AI & Data Science Governance',
    bio: 'Specializes in large language model fine-tuning architectures, agentic pipelines, vector embedding retrieval, and enterprise model drift monitoring.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    expertise: ['Generative AI', 'PyTorch', 'Agentic Workflows'],
    linkedInUrl: 'https://linkedin.com'
  },
  {
    id: 'lc-4',
    name: 'Advisory Council Seat [Enterprise Strategy]',
    role: 'Industry & Workforce Alignment Lead',
    affiliation: 'Global Enterprise Advisory Panel',
    bio: 'Advises on corporate skill shifts, hiring trends, and syllabus adaptation to guarantee graduates possess relevant competencies across Fortune 500 tech teams.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    expertise: ['Curriculum Alignment', 'Technical Hiring', 'Workforce Strategy'],
    isAdvisoryPlaceholder: true
  }
];

export const LeadershipCouncil: React.FC = () => {
  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Leadership Council" 
        description="Meet the Oxyfied Leadership Council: industry leaders, security architects, and academic advisors steering curriculum quality and student outcomes."
        canonical="/leadership-council"
      />

      {/* Hero Header */}
      <section className="bg-warm-white py-16 sm:py-20 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Governance &amp; Strategy
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            The Oxyfied <span className="text-burnt-orange">Leadership Council</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Our advisory board brings together senior practitioners, academic directors, and security researchers to ensure Oxyfied tracks meet rigorous engineering standards and reflect active enterprise architectures.
          </p>
        </div>
      </section>

      {/* Purpose & Mandate */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-warm-white border border-light-taupe p-7 rounded-3xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-deep-navy">Curriculum Oversight</h3>
            <p className="text-xs text-warm-gray leading-relaxed">
              Conducts continuous reviews of course modules to eliminate outdated legacy content and introduce production tooling (FastAPI, LangGraph, Splunk SPL, eBPF).
            </p>
          </div>

          <div className="bg-warm-white border border-light-taupe p-7 rounded-3xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-deep-navy/10 border border-deep-navy/20 flex items-center justify-center text-deep-navy">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-deep-navy">Credential Integrity</h3>
            <p className="text-xs text-warm-gray leading-relaxed">
              Establishes the qualification standards for certificate granting, verifying that capstone projects undergo strict plagiarism auditing and rubric grading.
            </p>
          </div>

          <div className="bg-warm-white border border-light-taupe p-7 rounded-3xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-deep-navy">Industry-Academia Bridge</h3>
            <p className="text-xs text-warm-gray leading-relaxed">
              Facilitates partnerships with Fortune 500 tech employers and academic bodies to keep student capstones mapped to real hiring rubrics.
            </p>
          </div>
        </div>
      </section>

      {/* Council Members Directory */}
      <section className="bg-warm-white border-y border-light-taupe py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
              Council Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
              Advisors &amp; Subject Matter Chairs
            </h2>
            <p className="text-warm-gray text-xs sm:text-sm">
              Distinguished practitioners guiding our specialized technical tracks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {COUNCIL_MEMBERS.map((member) => (
              <div
                key={member.id}
                className="bg-warm-ivory border border-light-taupe p-6 sm:p-7 rounded-3xl flex flex-col sm:flex-row gap-5 items-start hover:border-burnt-orange/30 transition-all shadow-xs"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover flex-shrink-0 border border-light-taupe shadow-2xs"
                />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-extrabold text-base text-deep-navy">
                        {member.name}
                      </h3>
                      <p className="text-xs font-bold text-burnt-orange leading-tight mt-0.5">
                        {member.role}
                      </p>
                      <span className="text-[10px] text-warm-gray font-medium block">
                        {member.affiliation}
                      </span>
                    </div>
                    {member.linkedInUrl && (
                      <a
                        href={member.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white border border-light-taupe text-warm-gray hover:text-burnt-orange transition-colors"
                        aria-label={`LinkedIn Profile of ${member.name}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-warm-gray leading-relaxed pt-1">
                    {member.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {member.expertise.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-light-taupe text-deep-navy"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory Nominations & Inquiries */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy">
          Interested in Contributing to Our Academic Board?
        </h2>
        <p className="text-xs sm:text-sm text-warm-gray max-w-xl mx-auto leading-relaxed">
          We welcome senior engineering directors, CISOs, and university department chairs who wish to provide strategic guidance on technical curriculum standards.
        </p>
        <div className="pt-2">
          <Link
            to="/become-a-partner"
            className="btn-primary h-11 px-6 text-xs font-bold rounded-full shadow-md inline-flex items-center gap-2"
          >
            <span>Nominate an Advisor / Connect With Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
