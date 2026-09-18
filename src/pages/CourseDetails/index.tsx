import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, BookOpen, Star, CheckCircle2, 
  ChevronRight, Award, ArrowRight, User, Loader2,
  Sparkles
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import type { Course } from '../../types';
import { Accordion } from '../../components/ui/Accordion';
import { CoursePreviewPlayer } from '../../components/common/CoursePreviewPlayer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SEO } from '../../components/common/SEO';

export const CourseDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isEnrolled } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'faqs' | 'preview'>('overview');

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await courseService.getCourseBySlug(slug);
        if (data) {
          setCourse(data);
        } else {
          setError('Course program not found.');
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
        setError('Failed to fetch course details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] bg-warm-ivory flex flex-col items-center justify-center space-y-4 text-center">
        <Loader2 className="w-8 h-8 text-burnt-orange animate-spin" />
        <span className="text-xs text-warm-gray font-semibold uppercase tracking-widest">Loading Program Details...</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-[60vh] bg-warm-ivory flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-deep-navy font-display">{error || 'Course Not Found'}</h2>
        <p className="text-xs text-warm-gray">The requested course program does not exist or has been relocated.</p>
        <Link to="/courses" className="btn-primary px-5 py-2.5 text-xs font-semibold rounded-lg shadow">
          Back to Courses
        </Link>
      </div>
    );
  }

  const instructor = course.instructor || {
    id: 'lead-instructor',
    name: 'Lead Instructor',
    role: 'Expert Practitioner',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    bio: 'Industry professional dedicated to teaching system administration and engineering.',
    expertise: ['Technology'],
    linkedin: 'https://linkedin.com'
  };
  const userEnrolled = isEnrolled(course.id);

  // Handle Enrollment navigation
  const handleEnrollment = () => {
    if (userEnrolled) {
      navigate('/dashboard/my-courses');
      return;
    }

    if (isInCart(course.id)) {
      navigate(`/checkout/${course.id}`);
    } else {
      addToCart({
        courseId: course.id,
        title: course.title,
        price: course.price,
        image: course.image,
        slug: course.slug
      });
      navigate(`/checkout/${course.id}`);
    }
  };

  // Convert Curriculum Modules to Accordion Schema
  const curriculumItems = (course.modules || []).map((mod) => ({
    id: mod.id,
    title: mod.title,
    subtitle: `${mod.lessons.length} Lessons`,
    content: (
      <ul className="space-y-2 text-xs text-warm-gray">
        {mod.lessons.map((lesson) => (
          <li key={lesson.id} className="flex items-center justify-between py-1.5 border-b border-light-taupe last:border-0">
            <span className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-burnt-orange fill-burnt-orange" />
              <span className="font-medium text-deep-navy">{lesson.title}</span>
            </span>
            <div className="flex items-center gap-2.5">
              {lesson.isPreview && (
                <span className="px-1.5 py-0.5 rounded bg-sage-green/15 text-sage-green border border-sage-green/30 text-[9px] font-bold uppercase tracking-wider">
                  Preview
                </span>
              )}
              <span className="text-[10px] text-warm-gray font-mono">{lesson.duration}</span>
            </div>
          </li>
        ))}
      </ul>
    )
  }));

  // FAQ mock items
  const faqItems = [
    {
      id: 'faq-1',
      title: 'Is this course suitable for beginners or working professionals?',
      content: 'Yes! Our Master Programs and Executive Tools & Upskills courses provide step-by-step guidance starting from core concepts to advanced real-world implementations. Whether you are a fresher or an experienced professional, the curriculum is designed for practical mastery.'
    },
    {
      id: 'faq-2',
      title: 'Do I receive a verifiable certificate upon completion?',
      content: 'Absolutely. Upon completing all module requirements, hands-on projects, and deliverables, you will earn the official theccpeeps Certificate of Completion with a unique cryptographic verification link to showcase on LinkedIn and your resume.'
    },
    {
      id: 'faq-3',
      title: 'How are the live sessions and projects conducted?',
      content: 'Sessions are led by experienced practitioners and faculty with interactive live coding, real-world case studies, and hands-on tool demonstrations. You also receive 24×7 mentor support and campus immersion opportunities.'
    },
    {
      id: 'faq-4',
      title: 'How long do I have access to the curriculum?',
      content: 'You receive lifetime access to all course recordings, resource files, datasets, and project templates through our AI-Powered LMS. There are no recurring subscription fees.'
    }
  ].map((faq) => ({
    id: faq.id,
    title: faq.title,
    content: <p className="text-xs leading-relaxed text-warm-gray">{faq.content}</p>
  }));

  // Mock Reviews
  const reviews = [
    { name: 'Alexander P.', rating: 5, date: '1 month ago', text: 'Excellent depth. The Splunk log queries and ethical hacking Scanning modules were extremely detailed. The capstone audit is highly technical.' },
    { name: 'Meera S.', rating: 5, date: '2 weeks ago', text: 'I appreciated the statistics and pandas cleaning layouts. The ML regressions models are thoroughly explained.' }
  ];

  return (
    <div className="bg-warm-ivory text-deep-navy min-h-screen">
      <SEO 
        title={course.title}
        description={course.description}
        canonical={`/courses/${course.slug}`}
        ogImage={course.image}
      />
      {/* 20. Course Details Hero */}
      <section className="bg-warm-ivory text-deep-navy py-16 border-b border-light-taupe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-left">
          <div className="flex items-center gap-1.5 text-warm-gray text-xs font-semibold">
            <Link to="/courses" className="hover:text-burnt-orange transition-colors">Courses</Link>
            <ChevronRight className="w-3.5 h-3.5 text-light-taupe" />
            <span className="text-burnt-orange font-bold">{course.category}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-deep-navy leading-tight max-w-4xl">
            {course.title}
          </h1>

          <p className="text-warm-gray text-sm sm:text-base leading-relaxed max-w-3xl font-normal">
            {course.description}
          </p>

          {/* Quick stats indicators */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-bold text-warm-gray">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-burnt-orange fill-current" />
              <span className="text-deep-navy">{course.rating}</span> ({course.students} Learners Enrolled)
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-warm-gray" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-warm-gray" />
              {course.lessons} Lessons
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-warm-gray" />
              Level: {course.level}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Layout (Grid: Main (8) vs sticky sidebar (4)) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-light-taupe gap-6 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold text-warm-gray">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'curriculum', label: 'Curriculum' },
              { id: 'instructor', label: 'Instructor' },
              { id: 'faqs', label: 'FAQs' },
              { id: 'preview', label: 'Preview' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-burnt-orange text-burnt-orange font-bold'
                    : 'border-transparent hover:text-deep-navy'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8 text-left">
              {/* What You'll Learn section */}
              <div className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-md space-y-4">
                <h3 className="font-display font-bold text-base text-deep-navy">What You'll Learn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {course.skills.map((skill) => (
                    <div key={skill} className="flex items-start gap-2.5 text-xs text-deep-navy font-semibold">
                      <CheckCircle2 className="w-4.5 h-4.5 text-burnt-orange flex-shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements & Target Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requirements */}
                <div className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-md space-y-3.5">
                  <h4 className="font-display font-bold text-sm text-deep-navy">Requirements</h4>
                  <ul className="space-y-2 text-xs text-warm-gray leading-relaxed list-disc pl-4">
                    {course.requirements?.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                {/* Target Audience */}
                <div className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-md space-y-3.5">
                  <h4 className="font-display font-bold text-sm text-deep-navy">Who This Course Is For</h4>
                  <ul className="space-y-2 text-xs text-warm-gray leading-relaxed list-disc pl-4">
                    {course.whoIsItFor?.map((who, i) => (
                      <li key={i}>{who}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Certificate Section */}
              <div className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-burnt-orange-100 border border-burnt-orange-200 text-burnt-orange flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="font-display font-bold text-sm text-deep-navy">Shareable Digital Verification</h4>
                  <p className="text-xs text-warm-gray leading-relaxed">
                    Upon passing the Capstone practical audit assignment parameters, you will earn a verifiable digital Oxyfied Certificate of Completion to display on LinkedIn.
                  </p>
                </div>
              </div>

              {/* Reviews/Feedbacks */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-sm text-deep-navy">Recent Learner Feedback</h4>
                <div className="space-y-3">
                  {reviews.map((rev, i) => (
                    <div key={i} className="bg-warm-white border border-light-taupe p-4 rounded-xl shadow-sm text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-deep-navy">
                        <span>{rev.name}</span>
                        <span className="text-warm-gray font-normal text-[11px]">{rev.date}</span>
                      </div>
                      <div className="flex text-burnt-orange gap-0.5">
                        {[...Array(rev.rating)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-warm-gray leading-relaxed">"{rev.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Curriculum Accordions */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-light-taupe pb-2">
                <h3 className="font-display font-bold text-base text-deep-navy">Course Syllabus</h3>
                <span className="text-xs text-warm-gray font-bold uppercase">{course.lessons} Lessons</span>
              </div>
              <Accordion items={curriculumItems} allowMultiple={true} defaultOpenId={course.modules?.[0]?.id} />
            </div>
          )}

          {/* Tab: Instructors */}
          {activeTab === 'instructor' && (
            <div className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-6 text-left">
              <img
                src={instructor.image}
                alt={instructor.name}
                className="w-24 h-24 rounded-2xl object-cover border border-light-taupe flex-shrink-0"
              />
              <div className="space-y-3">
                <div>
                  <h3 className="font-display font-bold text-lg text-deep-navy leading-none">{instructor.name}</h3>
                  <span className="text-xs text-burnt-orange font-bold mt-1 block">{instructor.role}</span>
                </div>
                <p className="text-xs text-warm-gray leading-relaxed">
                  {instructor.bio}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(instructor.expertise || []).map((exp) => (
                    <span key={exp} className="px-2.5 py-0.5 bg-warm-ivory border border-light-taupe text-deep-navy text-[10px] font-bold rounded">
                      {exp}
                    </span>
                  ))}
                </div>
                <a
                  href={instructor.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-burnt-orange font-bold hover:text-deep-orange pt-1"
                >
                  View LinkedIn Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Tab: FAQs */}
          {activeTab === 'faqs' && (
            <div className="space-y-4 text-left">
              <h3 className="font-display font-bold text-base text-deep-navy border-b border-light-taupe pb-2">
                Frequently Asked Questions
              </h3>
              <Accordion items={faqItems} allowMultiple={true} />
            </div>
          )}

          {/* Tab: Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-6 text-left">
              <div className="bg-warm-white border border-light-taupe p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
                <div className="space-y-2 border-b border-light-taupe pb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burnt-orange-100 border border-burnt-orange-200 text-burnt-orange text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Course Preview</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-deep-navy">
                    {course.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-warm-gray leading-relaxed max-w-3xl">
                    {course.description}
                  </p>
                </div>

                {/* Preview Video Player */}
                <div className="w-full">
                  <CoursePreviewPlayer
                    key={`${course.id}-${course.previewVideoUrl || 'no-preview'}`}
                    videoUrl={course.previewVideoUrl}
                    title={course.title}
                    thumbnail={course.image}
                  />
                </div>

                {/* Quick Program Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-warm-ivory border border-light-taupe rounded-xl text-center">
                    <span className="text-[10px] text-warm-gray uppercase font-bold block">Duration</span>
                    <span className="text-xs font-bold text-deep-navy font-mono">{course.duration}</span>
                  </div>
                  <div className="p-3 bg-warm-ivory border border-light-taupe rounded-xl text-center">
                    <span className="text-[10px] text-warm-gray uppercase font-bold block">Lessons</span>
                    <span className="text-xs font-bold text-deep-navy font-mono">{course.lessons} Lessons</span>
                  </div>
                  <div className="p-3 bg-warm-ivory border border-light-taupe rounded-xl text-center">
                    <span className="text-[10px] text-warm-gray uppercase font-bold block">Skill Level</span>
                    <span className="text-xs font-bold text-deep-navy">{course.level}</span>
                  </div>
                  <div className="p-3 bg-warm-ivory border border-light-taupe rounded-xl text-center">
                    <span className="text-[10px] text-warm-gray uppercase font-bold block">Access</span>
                    <span className="text-xs font-bold text-sage-green">Lifetime</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Pricing card (4 cols) */}
        <aside className="lg:col-span-4 bg-warm-white border border-light-taupe rounded-2xl shadow-xl overflow-hidden sticky top-24">
          <div className="aspect-[16/10] overflow-hidden bg-warm-ivory border-b border-light-taupe">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 space-y-6 text-left">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-warm-gray tracking-wider">Course Pricing</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-extrabold text-deep-navy">₹{course.price}</span>
                <span className="text-sm text-warm-gray line-through font-semibold">₹{course.originalPrice}</span>
                <span className="text-xs font-bold text-sage-green bg-sage-green-50 border border-sage-green-200 px-2 py-0.5 rounded">60% Off</span>
              </div>
            </div>

            <button
              onClick={handleEnrollment}
              className="btn-primary w-full py-3.5 font-bold rounded-xl shadow-md text-sm"
            >
              {userEnrolled ? 'Go to Classroom' : 'Enroll Now'}
            </button>

            {/* Checklist of features */}
            <div className="space-y-3 text-xs text-deep-navy font-medium pt-2 border-t border-light-taupe">
              <span className="text-[10px] uppercase text-warm-gray font-bold block tracking-widest mb-1">Includes</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-burnt-orange flex-shrink-0" />
                <span>Lifetime access to all lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-burnt-orange flex-shrink-0" />
                <span>3 Hands-On Labs and assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-green flex-shrink-0" />
                <span>Shareable completion certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-green flex-shrink-0" />
                <span>Active Q&A and support forum access</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Reusable micro icon wrapper inside curriculum
const Play: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
