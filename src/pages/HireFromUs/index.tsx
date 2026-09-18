import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  Briefcase, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Users, 
  Send, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  FileCheck,
  Code2,
  Terminal,
  Zap
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { enquiryService } from '../../services/enquiryService';

const hireFormSchema = zod.object({
  companyName: zod.string().min(2, { message: 'Company name is required.' }),
  contactPerson: zod.string().min(2, { message: 'Contact person name is required.' }),
  workEmail: zod.string().email({ message: 'Please enter a valid work email address.' }),
  phone: zod.string().min(6, { message: 'Phone number is required.' }),
  roleTitle: zod.string().min(2, { message: 'Role title / job designation is required.' }),
  openings: zod.string().min(1, { message: 'Number of openings is required.' }),
  requiredSkills: zod.string().min(2, { message: 'Please list primary required skills.' }),
  experienceLevel: zod.string().min(1, { message: 'Please select an experience tier.' }),
  jobLocation: zod.string().min(2, { message: 'Location is required.' }),
  workMode: zod.enum(['Remote', 'Hybrid', 'On-site', 'Flexible']),
  additionalRequirements: zod.string().optional()
});

type HireFormData = zod.infer<typeof hireFormSchema>;

export const HireFromUs: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<HireFormData>({
    resolver: zodResolver(hireFormSchema),
    defaultValues: {
      workMode: 'Remote'
    }
  });

  const onSubmit = async (data: HireFormData) => {
    try {
      setApiError(null);
      await enquiryService.submitEnquiry({
        type: 'hire',
        name: data.contactPerson,
        email: data.workEmail,
        phone: data.phone,
        company: data.companyName,
        role: data.roleTitle,
        subject: `Hiring Requirement: ${data.roleTitle} (${data.openings} openings)`,
        message: data.additionalRequirements || `Hiring for ${data.roleTitle} with required skills: ${data.requiredSkills}`,
        data: {
          openings: data.openings,
          requiredSkills: data.requiredSkills,
          experienceLevel: data.experienceLevel,
          jobLocation: data.jobLocation,
          workMode: data.workMode
        }
      });
      setSubmitted(true);
      reset();
      setTimeout(() => {
        setSubmitted(false);
      }, 7000);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit hiring requirement. Please try again.');
    }
  };

  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Hire Skilled Tech Talent" 
        description="Connect with pre-assessed, project-trained engineering and cybersecurity talent from Oxyfied. Zero agency fees for verified partner employers."
        canonical="/hire-from-us"
      />

      {/* Hero Header */}
      <section className="bg-warm-white py-16 sm:py-20 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,107,33,0.08),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Briefcase className="w-3.5 h-3.5" />
            Employer Talent Network
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            Hire Skilled Talent <span className="text-burnt-orange">From Oxyfied</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Gain direct access to pre-vetted engineers, SOC analysts, AI developers, and data practitioners who have built real capstone systems and undergone rigorous mentor code audits.
          </p>
          <div className="pt-2">
            <a
              href="#employer-form"
              className="btn-primary h-11 px-6 text-xs font-bold rounded-full shadow-md inline-flex items-center gap-2"
            >
              <span>Submit Hiring Requirement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Why Hire From Oxyfied Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
            Employer Advantage
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
            Why Technology Leaders Hire Our Graduates
          </h2>
          <p className="text-warm-gray text-xs sm:text-sm">
            We train for production reality, cutting onboarding cycles by up to 60%.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            {
              icon: Terminal,
              title: 'Practical Lab Experience',
              desc: 'Our candidates have hundreds of hours practicing in live terminal sandboxes, vulnerability labs, and real datasets.'
            },
            {
              icon: FileCheck,
              title: 'Verified Portfolios',
              desc: 'Inspect verifiable GitHub repositories, capstone architectures, and tamper-proof Oxyfied certificate records.'
            },
            {
              icon: Users,
              title: 'Mentor Audited Code',
              desc: 'Every submission is reviewed by lead architects for clean coding standards, documentation, and security best practices.'
            },
            {
              icon: Zap,
              title: 'Fast-Track Matching',
              desc: 'Share your job description and receive matched candidate profiles within 48 hours with zero hiring commission.'
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

      {/* Candidate Skill Areas */}
      <section className="bg-warm-white border-y border-light-taupe py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
              Skill Inventory
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
              Available Candidate Domains
            </h2>
            <p className="text-warm-gray text-xs sm:text-sm">
              Discover candidates specialized across high-demand technology disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-warm-ivory border border-light-taupe p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-deep-navy">Cybersecurity &amp; Blue Team</h3>
              </div>
              <ul className="space-y-2 text-xs text-warm-gray">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> SIEM &amp; Splunk SPL queries</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> Wireshark packet dissection</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> OWASP Top 10 web app testing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> Incident response playbooks</li>
              </ul>
            </div>

            <div className="bg-warm-ivory border border-light-taupe p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-600/10 text-purple-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-deep-navy">AI, LLMs &amp; Data Science</h3>
              </div>
              <ul className="space-y-2 text-xs text-warm-gray">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> PyTorch neural models &amp; fine-tuning</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> RAG pipelines &amp; vector search</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> MLflow model serving &amp; Docker</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> Advanced Pandas, NumPy, SQL analytics</li>
              </ul>
            </div>

            <div className="bg-warm-ivory border border-light-taupe p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-deep-navy">Cloud, DevOps &amp; Backend</h3>
              </div>
              <ul className="space-y-2 text-xs text-warm-gray">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> AWS IAM, VPC, and GuardDuty</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> Kubernetes &amp; Trivy container audits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> FastAPI &amp; Node microservices</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-burnt-orange" /> Automated CI/CD security scanning</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Employer Enquiry Form */}
      <section id="employer-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-warm-white border border-light-taupe rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-left">
          <div className="border-b border-light-taupe pb-4">
            <span className="text-[10px] font-bold text-burnt-orange uppercase tracking-widest block mb-1">
              Hire Talent
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy">
              Submit Your Hiring Requirement
            </h2>
            <p className="text-xs sm:text-sm text-warm-gray mt-1">
              Tell us about your open role. Our placement team will reach out with curated candidate profiles.
            </p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-deep-navy text-xs rounded-2xl flex items-start gap-3 font-medium animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-900">Hiring Requirement Submitted!</span>
                <span className="text-emerald-700">Our industry partnerships team has received your details and will share pre-screened candidate portfolios within 1-2 business days.</span>
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
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Cloud Corp"
                  {...register('companyName')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.companyName ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.companyName && <span className="text-[10px] text-red-600">{errors.companyName.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Contact Person *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins (Head of Talent)"
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
                  Work Email *
                </label>
                <input
                  type="email"
                  placeholder="e.g. hiring@acme.com"
                  {...register('workEmail')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.workEmail ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.workEmail && <span className="text-[10px] text-red-600">{errors.workEmail.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 019-2834"
                  {...register('phone')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.phone ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.phone && <span className="text-[10px] text-red-600">{errors.phone.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Role / Designation *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Junior SOC Analyst"
                  {...register('roleTitle')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.roleTitle ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.roleTitle && <span className="text-[10px] text-red-600">{errors.roleTitle.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Openings Count *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2 Openings"
                  {...register('openings')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.openings ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.openings && <span className="text-[10px] text-red-600">{errors.openings.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Work Mode *
                </label>
                <select
                  {...register('workMode')}
                  className="w-full px-3.5 py-2.5 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange focus:bg-white transition-all"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Required Primary Skills *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Splunk, Linux, Wireshark, Python"
                  {...register('requiredSkills')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.requiredSkills ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.requiredSkills && <span className="text-[10px] text-red-600">{errors.requiredSkills.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Target Experience Level *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Entry Level (0-2 Yrs) or Junior"
                  {...register('experienceLevel')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                    errors.experienceLevel ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.experienceLevel && <span className="text-[10px] text-red-600">{errors.experienceLevel.message}</span>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Job Location / City *
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA / Global Remote"
                {...register('jobLocation')}
                className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                  errors.jobLocation ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                }`}
              />
              {errors.jobLocation && <span className="text-[10px] text-red-600">{errors.jobLocation.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Additional Requirements / Job Link (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="Paste salary range, full job description link, or specific team interview timelines..."
                {...register('additionalRequirements')}
                className="w-full px-3.5 py-2.5 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-12 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Hiring Requirement...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Hiring Requirement</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
