import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  GraduationCap, 
  CheckCircle2, 
  DollarSign, 
  Globe, 
  Award, 
  Send, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Video
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { enquiryService } from '../../services/enquiryService';

const instructorSchema = zod.object({
  fullName: zod.string().min(2, { message: 'Full name is required.' }),
  email: zod.string().email({ message: 'Valid email address is required.' }),
  phone: zod.string().min(6, { message: 'Phone number is required.' }),
  professionalTitle: zod.string().min(2, { message: 'Current designation/title is required.' }),
  currentOrganization: zod.string().min(2, { message: 'Current company/institution is required.' }),
  experienceYears: zod.string().min(1, { message: 'Years of industry experience is required.' }),
  expertiseAreas: zod.string().min(2, { message: 'Primary technical domain is required.' }),
  linkedInUrl: zod.string().url({ message: 'Please enter a valid LinkedIn URL.' }),
  portfolioUrl: zod.string().optional(),
  resumeUrl: zod.string().url({ message: 'Please provide a valid link to your Resume / CV (Google Drive or Dropbox).' }),
  teachingExperience: zod.string().min(1, { message: 'Please specify your teaching background.' }),
  coursePitch: zod.string().min(10, { message: 'Please describe the course topic or workshop you would like to lead.' })
});

type InstructorFormData = zod.infer<typeof instructorSchema>;

export const BecomeInstructor: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<InstructorFormData>({
    resolver: zodResolver(instructorSchema)
  });

  const onSubmit = async (data: InstructorFormData) => {
    try {
      setApiError(null);
      await enquiryService.submitEnquiry({
        type: 'instructor',
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.currentOrganization,
        role: data.professionalTitle,
        subject: `Instructor Application: ${data.fullName} (${data.expertiseAreas})`,
        message: data.coursePitch,
        data: {
          experienceYears: data.experienceYears,
          expertiseAreas: data.expertiseAreas,
          linkedInUrl: data.linkedInUrl,
          portfolioUrl: data.portfolioUrl,
          resumeUrl: data.resumeUrl,
          teachingExperience: data.teachingExperience
        }
      });
      setSubmitted(true);
      reset();
      setTimeout(() => {
        setSubmitted(false);
      }, 7000);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit instructor application. Please try again.');
    }
  };

  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Become an Instructor" 
        description="Share your engineering and cybersecurity expertise with global learners. Author practical courses and earn competitive compensation with Oxyfied."
        canonical="/become-an-instructor"
      />

      {/* Hero Header */}
      <section className="bg-warm-white py-16 sm:py-20 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,107,33,0.08),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <GraduationCap className="w-3.5 h-3.5" />
            Lead Mentor Community
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            Teach What You Build. <span className="text-burnt-orange">Inspire Future Engineers.</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Join Oxyfied&apos;s network of industry practitioners. Design project-based technical masterclasses, conduct virtual office hours, and get rewarded for shaping career-ready talent.
          </p>
          <div className="pt-2">
            <a
              href="#instructor-form"
              className="btn-primary h-11 px-6 text-xs font-bold rounded-full shadow-md inline-flex items-center gap-2"
            >
              <span>Apply as an Instructor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
            Mentor Advantages
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
            Why Lead Technical Courses at Oxyfied
          </h2>
          <p className="text-warm-gray text-xs sm:text-sm">
            We handle infrastructure, student support, and marketing so you can focus on building exceptional curriculum.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            {
              icon: DollarSign,
              title: 'Revenue Sharing & Grants',
              desc: 'Earn competitive upfront course development grants plus ongoing monthly revenue shares from enrolled cohorts.'
            },
            {
              icon: Globe,
              title: 'Global Engineering Reach',
              desc: 'Deliver your real-world system insights to thousands of motivated international students and tech professionals.'
            },
            {
              icon: Video,
              title: 'Full Production Assistance',
              desc: 'Our instructional design team helps structure module blueprints, virtual lab environments, and video post-production.'
            },
            {
              icon: Award,
              title: 'Industry Brand Recognition',
              desc: 'Establish yourself as a recognized subject matter authority with featured mentor profiles and speaking opportunities.'
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

      {/* Who Can Apply & Process */}
      <section className="bg-warm-white border-y border-light-taupe py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-left">
          <div className="space-y-4">
            <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
              Qualifications
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
              Who We Look For
            </h2>
            <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">
              We look for passionate practitioners with deep production experience who believe in project-driven mastery rather than academic slide reading.
            </p>
            <ul className="space-y-3 text-xs text-deep-navy font-medium pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>3+ years of production experience in Cybersecurity, Cloud, AI, Data Science, or DevOps.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Experience configuring real enterprise architectures, writing clean code, or responding to security incidents.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Ability to break down complex technical topics into actionable, step-by-step practical micro-labs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Dedication to mentoring students through written code audits and constructive feedback.</span>
              </li>
            </ul>
          </div>

          <div className="bg-warm-ivory border border-light-taupe p-7 rounded-3xl space-y-6">
            <h3 className="font-display font-bold text-base text-deep-navy border-b border-light-taupe pb-3">
              Application &amp; Onboarding Workflow
            </h3>
            <div className="space-y-4 text-xs text-warm-gray">
              <div className="flex gap-3.5">
                <span className="w-6 h-6 rounded-full bg-burnt-orange text-white font-bold text-xs flex items-center justify-center flex-shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-deep-navy">Submit Application</h4>
                  <p className="mt-0.5">Share your resume, technical background, and proposed course topic.</p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <span className="w-6 h-6 rounded-full bg-deep-navy text-white font-bold text-xs flex items-center justify-center flex-shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-deep-navy">Curriculum Review &amp; Tech Screen</h4>
                  <p className="mt-0.5">Meet with our academic leads to outline your syllabus and lab sandbox architecture.</p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-deep-navy">Module Production &amp; Launch</h4>
                  <p className="mt-0.5">Record lessons with our equipment support, deploy labs, and publish to thousands of learners.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Application Form */}
      <section id="instructor-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-warm-white border border-light-taupe rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-left">
          <div className="border-b border-light-taupe pb-4">
            <span className="text-[10px] font-bold text-burnt-orange uppercase tracking-widest block mb-1">
              Apply Now
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy">
              Instructor Application Form
            </h2>
            <p className="text-xs sm:text-sm text-warm-gray mt-1">
              Complete the details below. Our academic director will review your background and respond within 3 business days.
            </p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-deep-navy text-xs rounded-2xl flex items-start gap-3 font-medium animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-900">Application Submitted Successfully!</span>
                <span className="text-emerald-700">Thank you for your interest in joining Oxyfied as an instructor. Our curriculum board will review your profile and reach out via email for an introductory discussion.</span>
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
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alex Mercer"
                  {...register('fullName')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.fullName ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.fullName && <span className="text-[10px] text-red-600">{errors.fullName.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. alex.mercer@gmail.com"
                  {...register('email')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.email ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.email && <span className="text-[10px] text-red-600">{errors.email.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 555-0192"
                  {...register('phone')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.phone ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.phone && <span className="text-[10px] text-red-600">{errors.phone.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Current Designation *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Principal Cloud Security Architect"
                  {...register('professionalTitle')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.professionalTitle ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.professionalTitle && <span className="text-[10px] text-red-600">{errors.professionalTitle.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Current Company *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sentinel Labs / Independent"
                  {...register('currentOrganization')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.currentOrganization ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.currentOrganization && <span className="text-[10px] text-red-600">{errors.currentOrganization.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Years of Industry Experience *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7+ Years"
                  {...register('experienceYears')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.experienceYears ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.experienceYears && <span className="text-[10px] text-red-600">{errors.experienceYears.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Areas of Technical Expertise *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cloud Security, DevSecOps, Kubernetes"
                  {...register('expertiseAreas')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.expertiseAreas ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.expertiseAreas && <span className="text-[10px] text-red-600">{errors.expertiseAreas.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  LinkedIn Profile URL *
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  {...register('linkedInUrl')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.linkedInUrl ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.linkedInUrl && <span className="text-[10px] text-red-600">{errors.linkedInUrl.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Resume / CV Cloud Link * (Google Drive, Dropbox, PDF)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  {...register('resumeUrl')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.resumeUrl ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.resumeUrl && <span className="text-[10px] text-red-600">{errors.resumeUrl.message}</span>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Prior Teaching or Mentorship Experience *
              </label>
              <input
                type="text"
                placeholder="e.g. Conducted internal tech workshops at company / University guest lectures"
                {...register('teachingExperience')}
                className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                  errors.teachingExperience ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                }`}
              />
              {errors.teachingExperience && <span className="text-[10px] text-red-600">{errors.teachingExperience.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Proposed Course Topic / Syllabus Pitch *
              </label>
              <textarea
                rows={4}
                placeholder="Describe the real-world skills and hands-on capstone project you would like to teach on Oxyfied..."
                {...register('coursePitch')}
                className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                  errors.coursePitch ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                }`}
              />
              {errors.coursePitch && <span className="text-[10px] text-red-600">{errors.coursePitch.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-12 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Instructor Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Apply as Instructor</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
