import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, ArrowRight, Mail } from 'lucide-react';
import { SEO } from '../../components/common/SEO';

export const Disclaimer: React.FC = () => {
  const lastUpdated = 'September 18, 2026';

  const sections = [
    {
      id: 'educational-purpose',
      title: '1. Educational Purpose & Scope',
      content: (
        <p>
          All courses, instructional videos, code demonstrations, interactive sandbox labs, and resources provided on Oxyfied (oxyfied.com) are designed solely for educational, technical upskilling, and professional development purposes. The information is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied.
        </p>
      )
    },
    {
      id: 'career-outcomes',
      title: '2. Career Outcomes & Non-Guarantee Statement',
      content: (
        <>
          <p className="font-semibold text-deep-navy">
            Important Notice on Employment and Compensation:
          </p>
          <p className="mt-1">
            Oxyfied provides practical, project-focused curricula intended to help learners build in-demand technology capabilities. However, Oxyfied does <strong className="text-deep-navy font-bold">NOT</strong> guarantee job placement, employment, interview selection, salary increases, or specific career promotions as a result of enrolling in, participating in, or completing any course track or receiving a certificate.
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-xs leading-relaxed text-warm-gray pl-1">
            <li>Individual career outcomes depend entirely on individual effort, prior background, market conditions, regional demand, interview performance, and independent hiring decisions by third-party employers.</li>
            <li>Testimonials, student project showcases, and alumni case studies presented on the platform represent individual experiences and do not constitute a promise or representation of average or expected results for all learners.</li>
          </ul>
        </>
      )
    },
    {
      id: 'cybersecurity-tools',
      title: '3. Defensive Security Tools & Ethical Hacking Labs',
      content: (
        <p>
          Courses covering cybersecurity, ethical hacking, network auditing, and vulnerability scanning are intended strictly for defensive security operations, system hardening, and authorized penetration testing within isolated sandbox environments. Any unauthorized use of technical tools, exploits, or techniques demonstrated in course materials against networks, servers, or applications without explicit written permission from the asset owner is illegal and strictly prohibited.
        </p>
      )
    },
    {
      id: 'technology-content',
      title: '4. AI-Assisted Content & Technological Evolution',
      content: (
        <p>
          Portions of code examples, documentation aids, and automated learning suggestions may utilize generative AI models and automated analysis engines. While Oxyfied mentors rigorously audit all syllabus materials, technology standards, software libraries, and framework versions evolve rapidly. We encourage learners to cross-reference official documentation when deploying production enterprise systems.
        </p>
      )
    },
    {
      id: 'external-links',
      title: '5. Third-Party Content & External Links',
      content: (
        <p>
          Our platform may contain links to external websites, open-source repositories, cloud providers, and third-party tools that are not operated or controlled by Oxyfied. We do not endorse, guarantee, or assume responsibility for the accuracy, reliability, privacy practices, or availability of third-party websites or services.
        </p>
      )
    },
    {
      id: 'accuracy',
      title: '6. Accuracy of Information & Content Updates',
      content: (
        <p>
          While we make continuous efforts to maintain current and precise educational content, Oxyfied makes no warranties regarding the absolute completeness, accuracy, or timeliness of all materials. Oxyfied reserves the right to modify, replace, or discontinue course modules, lab specifications, pricing, and platform features at any time without prior notice.
        </p>
      )
    },
    {
      id: 'contact',
      title: '7. Questions Regarding This Disclaimer',
      content: (
        <div className="bg-warm-ivory p-4 rounded-xl border border-light-taupe space-y-2 text-xs">
          <p className="text-deep-navy font-semibold">For academic clarification or questions regarding institutional disclosures:</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-warm-gray pt-1">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-burnt-orange" />
              compliance@oxyfied.com
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-burnt-orange" />
              Oxyfied Academic Compliance Board
            </span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Disclaimer" 
        description="Review Oxyfied's Disclaimer outlining the educational nature of our courses, career outcomes non-guarantee disclosures, and technical usage boundaries."
        canonical="/disclaimer"
      />

      {/* Header */}
      <section className="bg-warm-white py-14 sm:py-18 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <AlertTriangle className="w-3.5 h-3.5" />
            Institutional Disclosures
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-deep-navy tracking-tight">
            Platform Disclaimer
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm max-w-xl mx-auto">
            Last updated: {lastUpdated}. Important disclosures regarding our educational scope, career outcomes, and technical lab usage.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-warm-white rounded-2xl border border-light-taupe shadow-xs p-6 sm:p-10 space-y-10 text-left">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24 space-y-2.5">
              <h2 className="text-base sm:text-lg font-display font-bold text-deep-navy border-b border-light-taupe/80 pb-2">
                {section.title}
              </h2>
              <div className="text-xs sm:text-sm text-warm-gray leading-relaxed space-y-2">
                {section.content}
              </div>
            </div>
          ))}

          <div className="border-t border-light-taupe pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-warm-gray">
            <span>Explore our hands-on engineering programs:</span>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 font-bold text-burnt-orange hover:text-deep-orange transition-colors"
            >
              <span>Browse All Learning Tracks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
