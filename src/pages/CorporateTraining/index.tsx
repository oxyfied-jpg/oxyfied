import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  Building2, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  BarChart3,
  Lock
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { enquiryService } from '../../services/enquiryService';

const corporateSchema = zod.object({
  companyName: zod.string().min(2, { message: 'Company name is required.' }),
  contactPerson: zod.string().min(2, { message: 'Contact person is required.' }),
  workEmail: zod.string().email({ message: 'Valid work email is required.' }),
  phone: zod.string().min(6, { message: 'Phone number is required.' }),
  teamSize: zod.enum(['5 - 15 Engineers', '15 - 50 Engineers', '50 - 150 Engineers', '150+ Enterprise Workforce']),
  trainingDomain: zod.enum(['Cybersecurity & Blue Team Operations', 'AI Agents, RAG & Data Science', 'Cloud Security, AWS & DevSecOps', 'Custom Multi-Track Curriculum']),
  preferredFormat: zod.enum(['Live Virtual Instructor Cohort', 'Dedicated Self-Paced LMS + Custom Labs', 'Executive Bootcamp & Intensive Workshops', 'Blended Hybrid Program']),
  timeline: zod.string().min(2, { message: 'Target timeline is required.' }),
  trainingGoals: zod.string().min(10, { message: 'Please describe your team upskilling goals.' })
});

type CorporateFormData = zod.infer<typeof corporateSchema>;

export const CorporateTraining: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CorporateFormData>({
    resolver: zodResolver(corporateSchema),
    defaultValues: {
      teamSize: '15 - 50 Engineers',
      trainingDomain: 'Cybersecurity & Blue Team Operations',
      preferredFormat: 'Live Virtual Instructor Cohort'
    }
  });

  const onSubmit = async (data: CorporateFormData) => {
    try {
      setApiError(null);
      await enquiryService.submitEnquiry({
        type: 'corporate',
        name: data.contactPerson,
        email: data.workEmail,
        phone: data.phone,
        company: data.companyName,
        role: `Corporate Lead (${data.teamSize})`,
        subject: `Corporate Training Request: ${data.companyName} - ${data.trainingDomain}`,
        message: data.trainingGoals,
        data: {
          teamSize: data.teamSize,
          trainingDomain: data.trainingDomain,
          preferredFormat: data.preferredFormat,
          timeline: data.timeline
        }
      });
      setSubmitted(true);
      reset();
      setTimeout(() => {
        setSubmitted(false);
      }, 7000);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit corporate enquiry. Please try again.');
    }
  };

  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Corporate Tech Training & Upskilling" 
        description="Upskill your technology workforce with Oxyfied's enterprise training: custom cloud sandboxes, AI engineering cohorts, and defensive cybersecurity bootcamps."
        canonical="/corporate-training"
      />

      {/* Hero Header */}
      <section className="bg-warm-white py-16 sm:py-20 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,107,33,0.08),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5" />
            Enterprise Workforce Solutions
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            Upskill Your Tech Teams <span className="text-burnt-orange">at Scale</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Move beyond passive video libraries. Empower your engineering, security, and data teams with hands-on cloud sandboxes, customized capstone scenarios, and lead mentor instruction.
          </p>
          <div className="pt-2">
            <a
              href="#corporate-form"
              className="btn-primary h-11 px-6 text-xs font-bold rounded-full shadow-md inline-flex items-center gap-2"
            >
              <span>Request Custom Corporate Proposal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Corporate Tracks Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
            Specialized Enterprise Tracks
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
            Customized Technical Upskilling Pathways
          </h2>
          <p className="text-warm-gray text-xs sm:text-sm">
            Curriculum blueprints tailored to your organization&apos;s active tech stack and compliance mandates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            {
              icon: Lock,
              title: 'Defensive Security & SOC',
              desc: 'Incident response playbooks, Splunk SIEM querying, packet dissection, and real-time red/blue attack mitigation.'
            },
            {
              icon: Cpu,
              title: 'Applied AI & LLM Engineering',
              desc: 'Vector embeddings, agentic LangGraph workflows, RAG pipeline evaluation, and secure enterprise LLM integrations.'
            },
            {
              icon: ShieldCheck,
              title: 'Cloud Security & DevSecOps',
              desc: 'Automated CI/CD security scanning, Kubernetes pod hardening, Terraform drift audits, and AWS IAM governance.'
            },
            {
              icon: BarChart3,
              title: 'Executive Data & BI Analytics',
              desc: 'Advanced SQL modeling, DAX performance optimization, Power BI executive dashboards, and automated ETL pipelines.'
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

      {/* Delivery Formats */}
      <section className="bg-warm-white border-y border-light-taupe py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
              Flexible Formats
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
              Designed Around Your Team&apos;s Workflow
            </h2>
            <p className="text-warm-gray text-xs sm:text-sm">
              Deliver training with minimal disruption to active sprint cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-warm-ivory border border-light-taupe p-7 rounded-3xl space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-burnt-orange/10 text-burnt-orange border border-burnt-orange/20">
                Live Cohorts
              </span>
              <h3 className="font-display font-bold text-base text-deep-navy">Virtual Live Bootcamps</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                4-to-12 week structured cohort programs with weekly interactive lab sessions led by verified enterprise architects.
              </p>
            </div>

            <div className="bg-warm-ivory border border-light-taupe p-7 rounded-3xl space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-deep-navy/10 text-deep-navy border border-deep-navy/20">
                Self-Paced + Sandbox
              </span>
              <h3 className="font-display font-bold text-base text-deep-navy">Dedicated Cloud LMS Track</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                Asynchronous access to lab sandboxes with manager dashboards tracking employee module progress and assessment scores.
              </p>
            </div>

            <div className="bg-warm-ivory border border-light-taupe p-7 rounded-3xl space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700/10 text-emerald-700 border border-emerald-700/20">
                Intensives
              </span>
              <h3 className="font-display font-bold text-base text-deep-navy">Executive 2-Day Masterclasses</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                High-impact, condensed architectural deep-dives on deploying generative AI agents or threat hunting architectures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Enquiry Form */}
      <section id="corporate-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-warm-white border border-light-taupe rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-left">
          <div className="border-b border-light-taupe pb-4">
            <span className="text-[10px] font-bold text-burnt-orange uppercase tracking-widest block mb-1">
              Custom Proposal
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy">
              Corporate Training Enquiry Form
            </h2>
            <p className="text-xs sm:text-sm text-warm-gray mt-1">
              Share your team&apos;s training requirements. Our enterprise solutions lead will prepare a tailored proposal within 24 hours.
            </p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-deep-navy text-xs rounded-2xl flex items-start gap-3 font-medium animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-900">Corporate Proposal Request Received!</span>
                <span className="text-emerald-700">Our enterprise technical director will review your requirements and follow up via email with a custom syllabus proposal and pricing options.</span>
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
                  Organization / Company Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Technologies"
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
                  placeholder="e.g. Daniel Wright (VP of Engineering)"
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
                  Corporate Work Email *
                </label>
                <input
                  type="email"
                  placeholder="e.g. daniel.wright@apex.com"
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
                  placeholder="e.g. +1 (555) 912-3841"
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
                  Target Team Size *
                </label>
                <select
                  {...register('teamSize')}
                  className="w-full px-3.5 py-2.5 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange focus:bg-white transition-all"
                >
                  <option value="5 - 15 Engineers">5 - 15 Engineers</option>
                  <option value="15 - 50 Engineers">15 - 50 Engineers</option>
                  <option value="50 - 150 Engineers">50 - 150 Engineers</option>
                  <option value="150+ Enterprise Workforce">150+ Enterprise Workforce</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Training Domain *
                </label>
                <select
                  {...register('trainingDomain')}
                  className="w-full px-3.5 py-2.5 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange focus:bg-white transition-all"
                >
                  <option value="Cybersecurity & Blue Team Operations">Cybersecurity &amp; Blue Team Operations</option>
                  <option value="AI Agents, RAG & Data Science">AI Agents, RAG &amp; Data Science</option>
                  <option value="Cloud Security, AWS & DevSecOps">Cloud Security, AWS &amp; DevSecOps</option>
                  <option value="Custom Multi-Track Curriculum">Custom Multi-Track Curriculum</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Delivery Format *
                </label>
                <select
                  {...register('preferredFormat')}
                  className="w-full px-3.5 py-2.5 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange focus:bg-white transition-all"
                >
                  <option value="Live Virtual Instructor Cohort">Live Virtual Instructor Cohort</option>
                  <option value="Dedicated Self-Paced LMS + Custom Labs">Dedicated Self-Paced LMS + Custom Labs</option>
                  <option value="Executive Bootcamp & Intensive Workshops">Executive Bootcamp &amp; Intensive Workshops</option>
                  <option value="Blended Hybrid Program">Blended Hybrid Program</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Target Timeline / Start Date *
              </label>
              <input
                type="text"
                placeholder="e.g. Within next 30 days / Q3 2026"
                {...register('timeline')}
                className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                  errors.timeline ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                }`}
              />
              {errors.timeline && <span className="text-[10px] text-red-600">{errors.timeline.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Workforce Goals &amp; Lab Customization Scope *
              </label>
              <textarea
                rows={4}
                placeholder="Detail specific tools, cloud providers, or technical skill deficiencies your organization is aiming to address..."
                {...register('trainingGoals')}
                className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-white transition-all ${
                  errors.trainingGoals ? 'border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                }`}
              />
              {errors.trainingGoals && <span className="text-[10px] text-red-600">{errors.trainingGoals.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-12 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Corporate Proposal...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Request Custom Corporate Proposal</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
