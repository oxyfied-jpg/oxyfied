import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Globe, 
  Heart, 
  Coffee, 
  ArrowRight, 
  X, 
  Send, 
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { enquiryService } from '../../services/enquiryService';

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: string;
  employmentType: string;
  experience: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
}

const OPEN_POSITIONS: JobPosition[] = [
  {
    id: 'sec-curriculum-lead',
    title: 'Lead Cybersecurity Curriculum Engineer',
    department: 'Instructional Design & Labs',
    location: 'Remote (Global)',
    workMode: 'Remote',
    employmentType: 'Full-Time',
    experience: '4+ Years',
    skills: ['Splunk', 'Wireshark', 'Burp Suite', 'Linux', 'Sandbox Orchestration'],
    description: 'Lead the architecture of practical, browser-isolated ethical hacking and SOC analyst sandbox environments for thousands of active learners.',
    responsibilities: [
      'Design hands-on red/blue team attack and defense scenarios.',
      'Configure automated scoring and containerized lab environments.',
      'Review student capstone project submissions and mentor instructional assistants.'
    ],
    requirements: [
      'Deep background in offensive security, penetration testing, or SOC tier-2/tier-3 operations.',
      'Proficiency with Docker, Linux networking, and web application security auditing.'
    ]
  },
  {
    id: 'ai-mlops-instructor',
    title: 'Senior AI & MLOps Course Architect',
    department: 'AI & Data Engineering',
    location: 'Remote (US/EU/Asia)',
    workMode: 'Remote',
    employmentType: 'Full-Time',
    experience: '3+ Years',
    skills: ['PyTorch', 'MLflow', 'FastAPI', 'LangGraph', 'Docker', 'PostgreSQL'],
    description: 'Author cutting-edge generative AI, RAG pipeline, and scalable machine learning operations curricula for modern software engineers.',
    responsibilities: [
      'Build end-to-end multi-agent AI capstones with tool-calling capabilities.',
      'Develop interactive Jupyter notebook micro-labs with production datasets.',
      'Host weekly live architectural office hours and masterclasses.'
    ],
    requirements: [
      'Production experience deploying machine learning models and vector databases.',
      'Strong communication and pedagogical breakdown skills.'
    ]
  },
  {
    id: 'fullstack-platform-eng',
    title: 'Senior Full Stack LMS Platform Engineer',
    department: 'Core Engineering',
    location: 'Remote / Hybrid',
    workMode: 'Remote',
    employmentType: 'Full-Time',
    experience: '3+ Years',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'TailwindCSS'],
    description: 'Scale our core learning management platform, interactive video player, real-time code editor, and digital credential verification engine.',
    responsibilities: [
      'Architect resilient student workspaces, progress tracking, and certificate registries.',
      'Optimize API response latencies and database query performance.',
      'Collaborate with designers to deliver accessible, fluid user interfaces.'
    ],
    requirements: [
      'Strong mastery of modern TypeScript, React ecosystem, and relational databases.',
      'Passionate about crafting intuitive, fast educational web applications.'
    ]
  },
  {
    id: 'student-success-mentor',
    title: 'Technical Student Success Mentor (Cyber & Data)',
    department: 'Student Experience',
    location: 'Remote',
    workMode: 'Remote',
    employmentType: 'Full-Time / Part-Time',
    experience: '2+ Years',
    skills: ['Code Review', 'Python', 'SQL', 'Technical Tutoring', 'Incident Triage'],
    description: 'Provide daily technical mentorship, asynchronous code audits, and capstone guidance to students working through core programs.',
    responsibilities: [
      'Audit student capstone project submissions with constructive feedback.',
      'Resolve technical blockers on lab exercises and code syntax.',
      'Conduct portfolio review sessions to prepare students for technical interviews.'
    ],
    requirements: [
      'Strong technical troubleshooting skills in Python, SQL, or network security.',
      'Empathetic mentor mindset committed to student learning growth.'
    ]
  }
];

const careerApplicationSchema = zod.object({
  fullName: zod.string().min(2, { message: 'Full name is required.' }),
  email: zod.string().email({ message: 'Valid email is required.' }),
  phone: zod.string().min(6, { message: 'Phone number is required.' }),
  linkedInUrl: zod.string().url({ message: 'Valid LinkedIn URL is required.' }),
  portfolioUrl: zod.string().optional(),
  resumeUrl: zod.string().url({ message: 'Please provide a valid Resume link (Google Drive / Dropbox).' }),
  coverNote: zod.string().min(10, { message: 'Please introduce yourself and explain why you want to join Oxyfied.' })
});

type CareerApplicationData = zod.infer<typeof careerApplicationSchema>;

export const Careers: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CareerApplicationData>({
    resolver: zodResolver(careerApplicationSchema)
  });

  const handleOpenModal = (job: JobPosition) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setSubmitted(false);
    setApiError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    reset();
  };

  const onSubmit = async (data: CareerApplicationData) => {
    if (!selectedJob) return;
    try {
      setApiError(null);
      await enquiryService.submitEnquiry({
        type: 'career',
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        role: selectedJob.title,
        subject: `Job Application: ${selectedJob.title} - ${data.fullName}`,
        message: data.coverNote,
        data: {
          jobId: selectedJob.id,
          department: selectedJob.department,
          linkedInUrl: data.linkedInUrl,
          portfolioUrl: data.portfolioUrl,
          resumeUrl: data.resumeUrl
        }
      });
      setSubmitted(true);
      reset();
      setTimeout(() => {
        handleCloseModal();
      }, 4000);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Careers & Open Positions" 
        description="Join the Oxyfied team. We are hiring passionate curriculum engineers, mentors, and platform developers to build the future of practical tech learning."
        canonical="/careers"
      />

      {/* Hero Header */}
      <section className="bg-warm-white py-16 sm:py-20 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,107,33,0.08),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            We&apos;re Hiring
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            Build the Future of <span className="text-burnt-orange">Tech Education</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Help us empower the next generation of engineers, security analysts, and AI practitioners. We operate as a distributed, mission-driven team obsessed with practical capability.
          </p>
          <div className="pt-2">
            <a
              href="#openings"
              className="btn-primary h-11 px-6 text-xs font-bold rounded-full shadow-md inline-flex items-center gap-2"
            >
              <span>View Open Positions ({OPEN_POSITIONS.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Culture & Perks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
            Work Culture
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
            Why You&apos;ll Love Working at Oxyfied
          </h2>
          <p className="text-warm-gray text-xs sm:text-sm">
            We value ownership, deep technical curiosity, and work-life balance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            {
              icon: Globe,
              title: '100% Remote-First',
              desc: 'Work from anywhere in the world. Flexible hours designed around asynchronous collaboration and deep focus.'
            },
            {
              icon: Sparkles,
              title: 'Learning & Tooling Stipend',
              desc: 'Annual budgets for tech books, certifications, conference tickets, and home office workstation hardware.'
            },
            {
              icon: Heart,
              title: 'Comprehensive Health Care',
              desc: 'Premium health, dental, and wellness coverage for full-time team members and their families.'
            },
            {
              icon: Coffee,
              title: 'Meaningful Impact',
              desc: 'Directly transform student careers and empower thousands of global builders to achieve economic mobility.'
            }
          ].map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className="bg-warm-white border border-light-taupe p-6 rounded-2xl space-y-3 hover:border-burnt-orange/30 transition-all shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-deep-navy">{perk.title}</h3>
                <p className="text-xs text-warm-gray leading-relaxed">{perk.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Open Positions List */}
      <section id="openings" className="bg-warm-white border-y border-light-taupe py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
              Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
              Current Open Positions
            </h2>
            <p className="text-warm-gray text-xs sm:text-sm">
              Discover active roles across engineering, instructional design, and student experience.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {OPEN_POSITIONS.map((job) => (
              <div
                key={job.id}
                className="bg-warm-ivory border border-light-taupe p-6 rounded-2xl hover:border-burnt-orange/30 hover:bg-white transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-burnt-orange/10 text-burnt-orange border border-burnt-orange/20">
                      {job.department}
                    </span>
                    <span className="text-xs font-semibold text-warm-gray flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                    <span className="text-xs font-semibold text-warm-gray flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {job.employmentType}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-base sm:text-lg text-deep-navy">
                    {job.title}
                  </h3>

                  <p className="text-xs text-warm-gray leading-relaxed max-w-3xl line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white border border-light-taupe text-deep-navy"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenModal(job)}
                  className="btn-primary h-10 px-5 text-xs font-bold rounded-full shadow-sm flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <span>View &amp; Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Detail & Application Modal */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-warm-white border border-light-taupe rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar text-left">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-2 rounded-full bg-warm-ivory hover:bg-light-taupe text-warm-gray hover:text-deep-navy transition-colors cursor-pointer"
              aria-label="Close application modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-burnt-orange/10 text-burnt-orange border border-burnt-orange/20">
                {selectedJob.department}
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy mt-1.5">
                {selectedJob.title}
              </h2>
              <div className="flex flex-wrap gap-3 text-xs text-warm-gray mt-1">
                <span>{selectedJob.location}</span>
                <span>•</span>
                <span>{selectedJob.employmentType}</span>
                <span>•</span>
                <span>Exp: {selectedJob.experience}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-warm-gray border-y border-light-taupe py-4">
              <div>
                <h4 className="font-bold text-deep-navy text-xs uppercase tracking-wider mb-1">About the Role</h4>
                <p className="leading-relaxed">{selectedJob.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-deep-navy text-xs uppercase tracking-wider mb-1">Key Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 pl-1 leading-relaxed">
                  {selectedJob.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-deep-navy text-xs uppercase tracking-wider mb-1">Requirements</h4>
                <ul className="list-disc list-inside space-y-1 pl-1 leading-relaxed">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Application Form */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-deep-navy">
                Apply for this Position
              </h3>

              {submitted && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-deep-navy text-xs rounded-xl flex items-start gap-2.5 font-medium animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-emerald-900">Application Submitted!</span>
                    <span className="text-emerald-700">We have received your application for {selectedJob.title}. Our talent team will review your resume and reach out if there is a mutual fit.</span>
                  </div>
                </div>
              )}

              {apiError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5 font-medium animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      {...register('fullName')}
                      className="w-full px-3 py-2 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange"
                    />
                    {errors.fullName && <span className="text-[10px] text-red-600">{errors.fullName.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">Email Address *</label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      {...register('email')}
                      className="w-full px-3 py-2 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange"
                    />
                    {errors.email && <span className="text-[10px] text-red-600">{errors.email.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 0192"
                      {...register('phone')}
                      className="w-full px-3 py-2 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange"
                    />
                    {errors.phone && <span className="text-[10px] text-red-600">{errors.phone.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">LinkedIn Profile URL *</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      {...register('linkedInUrl')}
                      className="w-full px-3 py-2 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange"
                    />
                    {errors.linkedInUrl && <span className="text-[10px] text-red-600">{errors.linkedInUrl.message}</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">Resume / CV Link * (Google Drive / Dropbox)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    {...register('resumeUrl')}
                    className="w-full px-3 py-2 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange"
                  />
                  {errors.resumeUrl && <span className="text-[10px] text-red-600">{errors.resumeUrl.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">Why Oxyfied? (Cover Note) *</label>
                  <textarea
                    rows={3}
                    placeholder="Share brief background on your relevant projects and why this role excites you..."
                    {...register('coverNote')}
                    className="w-full px-3 py-2 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:border-burnt-orange"
                  />
                  {errors.coverNote && <span className="text-[10px] text-red-600">{errors.coverNote.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full h-11 text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application for {selectedJob.title}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
