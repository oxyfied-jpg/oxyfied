import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  Building2, 
  Lightbulb, 
  Code2, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Presentation,
  Rocket
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { enquiryService } from '../../services/enquiryService';

const collabSchema = zod.object({
  companyName: zod.string().min(2, { message: 'Organization name is required.' }),
  contactPerson: zod.string().min(2, { message: 'Contact person is required.' }),
  workEmail: zod.string().email({ message: 'Valid work email is required.' }),
  phone: zod.string().min(6, { message: 'Phone number is required.' }),
  collabType: zod.enum([
    'Capstone Project Sponsorship',
    'Industry Guest Masterclass',
    'Curriculum Co-Design & Tooling',
    'Student Internship / Apprenticeship Pipeline',
    'Applied Research & Case Study Collaboration'
  ]),
  timeline: zod.string().min(2, { message: 'Target timeline is required.' }),
  proposalScope: zod.string().min(10, { message: 'Please describe your collaboration scope or project idea.' })
});

type CollabFormData = zod.infer<typeof collabSchema>;

export const IndustryCollaboration: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CollabFormData>({
    resolver: zodResolver(collabSchema),
    defaultValues: {
      collabType: 'Capstone Project Sponsorship'
    }
  });

  const onSubmit = async (data: CollabFormData) => {
    try {
      setApiError(null);
      await enquiryService.submitEnquiry({
        type: 'collaboration',
        name: data.contactPerson,
        email: data.workEmail,
        phone: data.phone,
        company: data.companyName,
        role: `Industry Partner`,
        subject: `Industry Collaboration: ${data.companyName} - ${data.collabType}`,
        message: data.proposalScope,
        data: {
          collabType: data.collabType,
          timeline: data.timeline
        }
      });
      setSubmitted(true);
      reset();
      setTimeout(() => {
        setSubmitted(false);
      }, 7000);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit collaboration request. Please try again.');
    }
  };

  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Industry Collaboration" 
        description="Collaborate with Oxyfied on student capstone sponsorship, guest engineering masterclasses, and real-world tech curriculum co-design."
        canonical="/industry-collaboration"
      />

      {/* Hero Header */}
      <section className="bg-warm-white py-16 sm:py-20 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Rocket className="w-3.5 h-3.5" />
            Applied Innovation
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            Industry Collaboration <span className="text-burnt-orange">&amp; Innovation</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Bridge academic theory and production systems. Partner with Oxyfied to sponsor student capstone challenges, lead guest masterclasses, and co-design curricula that reflects active industry needs.
          </p>
          <div className="pt-2">
            <a
              href="#collab-form"
              className="btn-primary h-11 px-6 text-xs font-bold rounded-full shadow-md inline-flex items-center gap-2"
            >
              <span>Collaborate With Oxyfied</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Collaboration Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
            Co-Creation
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
            Pillars of Industry Engagement
          </h2>
          <p className="text-warm-gray text-xs sm:text-sm">
            Multiple avenues to engage with top engineering cohorts and showcase your company&apos;s technological vision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: Lightbulb,
              title: 'Capstone Sponsorship',
              desc: 'Provide real enterprise challenge prompts or sanitized datasets for students to solve in their final multi-week capstones.'
            },
            {
              icon: Presentation,
              title: 'Guest Masterclasses',
              desc: 'Host interactive technical webinars and architectural teardowns with your lead principal engineers and CISOs.'
            },
            {
              icon: Code2,
              title: 'Curriculum Co-Design',
              desc: 'Influence course syllabi by defining target skill requirements and tooling benchmarks directly with our academic board.'
            },
            {
              icon: Briefcase,
              title: 'Internship Pipelines',
              desc: 'Evaluate top-performing learners through real project deliverables and streamline technical interview loops.'
            },
            {
              icon: Building2,
              title: 'Hackathons & CTFs',
              desc: 'Sponsor offensive/defensive security CTFs or AI model optimization sprints with our global community.'
            },
            {
              icon: Users,
              title: 'Research & Case Studies',
              desc: 'Co-publish architectural whitepapers and real-world system migration case studies with Oxyfied mentors.'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-warm-white border border-light-taupe p-6 rounded-2xl space-y-3 hover:border-burnt-orange/30 transition-all shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-deep-navy">{item.title}</h3>
                <p className="text-xs text-warm-gray leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Collaboration Form */}
      <section id="collab-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-warm-white border border-light-taupe rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-left">
          <div className="border-b border-light-taupe pb-4">
            <span className="text-[10px] font-bold text-burnt-orange uppercase tracking-widest block mb-1">
              Let&apos;s Connect
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy">
              Industry Collaboration Proposal
            </h2>
            <p className="text-xs sm:text-sm text-warm-gray mt-1">
              Submit your collaboration concept. Our academic alliances director will review and schedule an introductory session.
            </p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-deep-navy text-xs rounded-2xl flex items-start gap-3 font-medium animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-900">Collaboration Proposal Submitted!</span>
                <span className="text-emerald-700">Thank you for your proposal. Our industry initiatives lead will review your submission and reach out within 24-48 business hours.</span>
              </div>
            </div>
          )}

          {apiError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2.5 font-medium animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CyberDefense Matrix Corp"
                  {...register('companyName')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.companyName ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.companyName && <span className="text-[10px] text-red-600">{errors.companyName.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Lead Contact Person *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rachel Torres (Director of Engineering)"
                  {...register('contactPerson')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.contactPerson ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.contactPerson && <span className="text-[10px] text-red-600">{errors.contactPerson.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. rachel.torres@cybermatrix.io"
                  {...register('workEmail')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.workEmail ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.workEmail && <span className="text-[10px] text-red-600">{errors.workEmail.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 234-5678"
                  {...register('phone')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.phone ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.phone && <span className="text-[10px] text-red-600">{errors.phone.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Collaboration Track *
                </label>
                <select
                  {...register('collabType')}
                  className="w-full px-3.5 py-2.5 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange focus:bg-white transition-all"
                >
                  <option value="Capstone Project Sponsorship">Capstone Project Sponsorship</option>
                  <option value="Industry Guest Masterclass">Industry Guest Masterclass</option>
                  <option value="Curriculum Co-Design & Tooling">Curriculum Co-Design &amp; Tooling</option>
                  <option value="Student Internship / Apprenticeship Pipeline">Student Internship / Apprenticeship Pipeline</option>
                  <option value="Applied Research & Case Study Collaboration">Applied Research &amp; Case Study Collaboration</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Target Timeline *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next upcoming student cohort / Q4 2026"
                  {...register('timeline')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.timeline ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.timeline && <span className="text-[10px] text-red-600">{errors.timeline.message}</span>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Project Proposal &amp; Collaboration Scope *
              </label>
              <textarea
                rows={4}
                placeholder="Outline the specific problem statement, guest lecture topic, or tool integration you would like to explore..."
                {...register('proposalScope')}
                className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                  errors.proposalScope ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                }`}
              />
              {errors.proposalScope && <span className="text-[10px] text-red-600">{errors.proposalScope.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-12 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Proposal...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Collaborate With Oxyfied</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
