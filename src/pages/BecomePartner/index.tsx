import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  Handshake, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Cpu, 
  Users, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Globe
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { enquiryService } from '../../services/enquiryService';

const partnerSchema = zod.object({
  organizationName: zod.string().min(2, { message: 'Organization name is required.' }),
  contactPerson: zod.string().min(2, { message: 'Contact person name is required.' }),
  workEmail: zod.string().email({ message: 'Valid work email is required.' }),
  phone: zod.string().min(6, { message: 'Phone number is required.' }),
  organizationType: zod.enum(['University / College', 'Enterprise Corporation', 'Growth Tech Startup', 'Government / Public Body', 'Industry Association']),
  partnershipType: zod.enum(['Academic & Curriculum Partnership', 'Direct Hiring Partnership', 'Corporate Training & Upskilling', 'Technology / Tool Sandbox Integration', 'Student Hackathon & Challenge Sponsor']),
  websiteUrl: zod.string().url({ message: 'Valid website URL is required.' }),
  scopeRequirements: zod.string().min(10, { message: 'Please outline your partnership scope or objectives.' }),
  message: zod.string().optional()
});

type PartnerFormData = zod.infer<typeof partnerSchema>;

export const BecomePartner: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      organizationType: 'Enterprise Corporation',
      partnershipType: 'Academic & Curriculum Partnership'
    }
  });

  const onSubmit = async (data: PartnerFormData) => {
    try {
      setApiError(null);
      await enquiryService.submitEnquiry({
        type: 'partner',
        name: data.contactPerson,
        email: data.workEmail,
        phone: data.phone,
        company: data.organizationName,
        role: data.organizationType,
        subject: `Partnership Proposal: ${data.organizationName} (${data.partnershipType})`,
        message: data.scopeRequirements + (data.message ? `\n\nAdditional notes: ${data.message}` : ''),
        data: {
          organizationType: data.organizationType,
          partnershipType: data.partnershipType,
          websiteUrl: data.websiteUrl
        }
      });
      setSubmitted(true);
      reset();
      setTimeout(() => {
        setSubmitted(false);
      }, 7000);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit partnership request. Please try again.');
    }
  };

  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Become a Partner" 
        description="Partner with Oxyfied across academic integration, corporate workforce upskilling, technology tool sandboxes, and student talent pipelines."
        canonical="/become-a-partner"
      />

      {/* Hero Header */}
      <section className="bg-warm-white py-16 sm:py-20 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Handshake className="w-3.5 h-3.5" />
            Strategic Alliances
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            Partner With <span className="text-burnt-orange">Oxyfied</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Collaborate with our technology learning ecosystem. We partner with universities, global tech enterprises, tooling providers, and industry bodies to accelerate applied technical capability.
          </p>
          <div className="pt-2">
            <a
              href="#partner-form"
              className="btn-primary h-11 px-6 text-xs font-bold rounded-full shadow-md inline-flex items-center gap-2"
            >
              <span>Explore Partnership Options</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Partnership Opportunities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
            Collaboration Tracks
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
            How Organizations Partner With Us
          </h2>
          <p className="text-warm-gray text-xs sm:text-sm">
            Flexible collaboration structures aligned with your strategic institutional goals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: GraduationCap,
              title: 'Academic Partnerships',
              desc: 'Integrate Oxyfied browser lab sandboxes and practical capstones into university computer science and cybersecurity curricula.'
            },
            {
              icon: Briefcase,
              title: 'Hiring Partnerships',
              desc: 'Gain dedicated pipeline access to pre-screened, mentor-audited engineering graduates across full-stack, data, and security tracks.'
            },
            {
              icon: Building2,
              title: 'Corporate Training',
              desc: 'Deploy custom technical upskilling cohorts for internal engineering teams with private progress tracking and custom labs.'
            },
            {
              icon: Cpu,
              title: 'Technology & Tooling Alliances',
              desc: 'Feature your developer tooling, cloud platforms, or SIEM software directly within our hands-on course exercises.'
            },
            {
              icon: Users,
              title: 'Hackathons & Challenges',
              desc: 'Co-host enterprise cybersecurity CTF challenges and AI hackathons with top engineering talent across our community.'
            },
            {
              icon: Globe,
              title: 'Community Initiatives',
              desc: 'Support subsidized scholarships and digital skills access initiatives for underrepresented technologists globally.'
            }
          ].map((track, idx) => {
            const Icon = track.icon;
            return (
              <div
                key={idx}
                className="bg-warm-white border border-light-taupe p-6 rounded-2xl space-y-3 hover:border-burnt-orange/30 transition-all shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-deep-navy">{track.title}</h3>
                <p className="text-xs text-warm-gray leading-relaxed">{track.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Partner Application Form */}
      <section id="partner-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-warm-white border border-light-taupe rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-left">
          <div className="border-b border-light-taupe pb-4">
            <span className="text-[10px] font-bold text-burnt-orange uppercase tracking-widest block mb-1">
              Start Collaboration
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy">
              Partner Enquiry Form
            </h2>
            <p className="text-xs sm:text-sm text-warm-gray mt-1">
              Submit your organization details to connect with our strategic partnerships director.
            </p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-deep-navy text-xs rounded-2xl flex items-start gap-3 font-medium animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-900">Partnership Request Received!</span>
                <span className="text-emerald-700">Thank you for your interest in collaborating with Oxyfied. Our institutional alliances team will reach out within 24-48 business hours to schedule a discussion.</span>
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
                  Organization / University Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stanford Technology Institute"
                  {...register('organizationName')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.organizationName ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.organizationName && <span className="text-[10px] text-red-600">{errors.organizationName.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Contact Person *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Michael Ross (Dean / Director)"
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
                  Work / Institutional Email *
                </label>
                <input
                  type="email"
                  placeholder="e.g. m.ross@institution.edu"
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
                  placeholder="e.g. +1 (555) 342-9182"
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
                  Organization Type *
                </label>
                <select
                  {...register('organizationType')}
                  className="w-full px-3.5 py-2.5 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange focus:bg-white transition-all"
                >
                  <option value="University / College">University / College</option>
                  <option value="Enterprise Corporation">Enterprise Corporation</option>
                  <option value="Growth Tech Startup">Growth Tech Startup</option>
                  <option value="Government / Public Body">Government / Public Body</option>
                  <option value="Industry Association">Industry Association</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Primary Partnership Type *
                </label>
                <select
                  {...register('partnershipType')}
                  className="w-full px-3.5 py-2.5 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange focus:bg-white transition-all"
                >
                  <option value="Academic & Curriculum Partnership">Academic &amp; Curriculum Partnership</option>
                  <option value="Direct Hiring Partnership">Direct Hiring Partnership</option>
                  <option value="Corporate Training & Upskilling">Corporate Training &amp; Upskilling</option>
                  <option value="Technology / Tool Sandbox Integration">Technology / Tool Sandbox Integration</option>
                  <option value="Student Hackathon & Challenge Sponsor">Student Hackathon &amp; Challenge Sponsor</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Official Website URL *
              </label>
              <input
                type="url"
                placeholder="https://yourinstitution.com"
                {...register('websiteUrl')}
                className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                  errors.websiteUrl ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                }`}
              />
              {errors.websiteUrl && <span className="text-[10px] text-red-600">{errors.websiteUrl.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Scope &amp; Collaboration Objectives *
              </label>
              <textarea
                rows={4}
                placeholder="Describe your intended student numbers, curriculum requirements, or technology integration goals..."
                {...register('scopeRequirements')}
                className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                  errors.scopeRequirements ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                }`}
              />
              {errors.scopeRequirements && <span className="text-[10px] text-red-600">{errors.scopeRequirements.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-12 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Partnership Enquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Become a Partner</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
