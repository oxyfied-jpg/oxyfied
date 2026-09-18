import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  BookOpen, Award, CheckCircle2, Play, Download, User as UserIcon, Phone, 
  Loader2, Share2, AlertTriangle, X, Clock, ShieldCheck, Mail, Lock, Camera, AlertCircle, KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';
import { certificateService } from '../../services/certificateService';
import { CertificatePreviewModal } from '../../components/certificate/CertificatePreviewModal';
import type { Course } from '../../types';

// 1. My Courses View Page
// 1. My Courses View Page
export const MyCourses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const enrolled = courses.filter((c) => (user?.enrolledCourses || []).includes(c.id));

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Loading Registered Programs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-2xl font-display font-extrabold text-stone-900">My Registered Programs</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Access video modules, course files, and sandbox guides.</p>
      </div>

      {enrolled.length === 0 ? (
        <div className="bg-white border border-stone-200/80 p-12 rounded-3xl text-center space-y-4 shadow-sm max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-stone-900 text-lg">No courses enrolled</h3>
          <p className="text-xs text-stone-500 leading-relaxed">Enroll in Cybersecurity or Data Science to get started.</p>
          <div className="pt-2">
            <Link to="/courses" className="px-6 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 hover:scale-[1.02]">
              View Programs
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolled.map((course) => {
            const completedList = user?.progress[course.id] || [];
            const progressPercentage = Math.round((completedList.length / course.lessons) * 100);
            const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id || '';

            return (
              <div key={course.id} className="bg-white border border-stone-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-300/80 transition-all duration-200 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 rounded-md">
                      {course.category}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">{course.duration}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-stone-900 leading-snug">{course.title}</h3>
                  <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">{course.description}</p>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <div className="flex justify-between text-xs text-stone-600 font-semibold">
                    <span>Syllabus Progress</span>
                    <span className="font-mono text-stone-900 font-bold">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                  </div>
                  <span className="text-[11px] text-stone-400 block font-medium">
                    {completedList.length} of {course.lessons} lessons completed
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/dashboard/learn/${course.id}/${firstLessonId}`)}
                  className="w-full py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/15 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                >
                  Enter Classroom
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 2. Progress Tracking View Page
export const ProgressTracking: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const enrolled = courses.filter((c) => (user?.enrolledCourses || []).includes(c.id));

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Loading Progress Tracking...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-2xl font-display font-extrabold text-stone-900">Learning Progress</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Track completed modules and syllabus milestones across your enrolled programs.</p>
      </div>

      {enrolled.length === 0 ? (
        <p className="text-xs sm:text-sm text-stone-500 text-center py-12">Enroll in a course to trace progress.</p>
      ) : (
        <div className="space-y-6">
          {enrolled.map((course) => {
            const completedList = user?.progress[course.id] || [];
            const progressPercent = Math.round((completedList.length / course.lessons) * 100);
            
            return (
              <div key={course.id} className="bg-white border border-stone-200/80 p-6 sm:p-8 rounded-2xl shadow-sm space-y-5">
                <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-stone-900">{course.title}</h3>
                    <span className="text-xs text-stone-500 font-medium">{completedList.length} of {course.lessons} lessons completed</span>
                  </div>
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                    {progressPercent}% Complete
                  </span>
                </div>

                {/* Modules breakdown */}
                <div className="space-y-2.5">
                  {(course.modules || []).map((mod) => {
                    const completedInMod = mod.lessons.filter((l) => completedList.includes(l.id)).length;
                    const isModFinished = completedInMod === mod.lessons.length && mod.lessons.length > 0;

                    return (
                      <div key={mod.id} className="flex items-center justify-between p-4 bg-stone-50/60 hover:bg-stone-50 rounded-xl border border-stone-100 transition-colors">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-stone-900 block">{mod.title}</span>
                          <span className="text-[11px] text-stone-500 block font-medium">
                            {completedInMod} of {mod.lessons.length} lessons completed
                          </span>
                        </div>
                        {isModFinished ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-lg border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[11px] font-semibold px-3 py-1 rounded-lg border border-amber-200/60">
                            In Progress
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 3. Certificates View Page (Multi-Step Application & Verification Workflow)
export const Certificates: React.FC = () => {
  const [issuedCertificates, setIssuedCertificates] = useState<any[]>([]);
  const [completedEligibleCourses, setCompletedEligibleCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Application & Disclaimer Modal States
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [disclaimerTargetCourse, setDisclaimerTargetCourse] = useState<any | null>(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const data = await certificateService.getMyCertificates();
      setIssuedCertificates(data.certificates || []);
      setCompletedEligibleCourses(data.completedEligibleCourses || []);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleOpenDisclaimer = (course: any) => {
    setDisclaimerTargetCourse(course);
    setIsDisclaimerOpen(true);
  };

  const handleConfirmApply = async () => {
    if (!disclaimerTargetCourse) return;
    try {
      setIsSubmittingApplication(true);
      const response = await certificateService.applyForCertificate(disclaimerTargetCourse.id);
      setIsDisclaimerOpen(false);
      setDisclaimerTargetCourse(null);
      setActionFeedback({
        type: 'success',
        message: response.message || 'Certificate application submitted successfully! Your mentor will review your project submissions.'
      });
      await fetchCertificates();
      setTimeout(() => setActionFeedback(null), 6000);
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to submit certificate application. Please try again.'
      });
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleDownloadPdf = async (cert: any) => {
    try {
      setDownloadingCertId(cert.id);
      await certificateService.downloadPdf(cert.id, `Oxyfied-Certificate-${cert.certificateNumber}.pdf`);
    } catch (err) {
      alert('Failed to download certificate PDF. Please try again.');
    } finally {
      setDownloadingCertId(null);
    }
  };

  const handleCopyLink = (certNumber: string) => {
    const url = `${window.location.origin}/verify-certificate/${certNumber}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certNumber);
    setTimeout(() => setCopiedId(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Checking Certificate Credentials & Applications...</span>
      </div>
    );
  }

  const unissuedTracks = completedEligibleCourses.filter((c) => !c.hasCertificate);

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-stone-900">My Certificates</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Apply for official course credentials following project verification, download vector PDF certificates, and share verified public credentials.
          </p>
        </div>

        {issuedCertificates.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {issuedCertificates.length} {issuedCertificates.length === 1 ? 'Credential Earned' : 'Credentials Earned'}
          </span>
        )}
      </div>

      {/* Feedback Banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in ${
          actionFeedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="font-medium">{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: COMPLETED TRACKS / APPLICATIONS STATUS */}
      {unissuedTracks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Completed Courses & Certificate Applications ({unissuedTracks.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unissuedTracks.map((c) => {
              const isPending = c.requestStatus === 'pending';
              const isRejected = c.requestStatus === 'rejected';

              return (
                <div
                  key={c.id}
                  className={`p-5 rounded-2xl border shadow-xs transition-all space-y-3 ${
                    isPending
                      ? 'bg-amber-50/50 border-amber-200/80'
                      : isRejected
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-stone-50/80 border-stone-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                          100% Course Completed
                        </span>
                        {isPending && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Mentor Review
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Requires Action
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-stone-900 text-sm">{c.title}</h4>
                      <p className="text-[11px] text-stone-500">
                        Instructor: <span className="font-medium text-stone-700">{c.mentorName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status description */}
                  {isPending ? (
                    <div className="p-3 bg-amber-100/60 border border-amber-200/70 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Certificate Application Submitted</span>
                      </div>
                      <p className="text-[11px] text-amber-800/90 leading-relaxed">
                        Waiting for mentor verification. Your instructor will review your project submissions before granting the certificate.
                      </p>
                    </div>
                  ) : isRejected ? (
                    <div className="p-3 bg-rose-100/60 border border-rose-200/70 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                        <span>Certificate Application Requires Action</span>
                      </div>
                      <p className="text-[11px] text-rose-800/90 leading-relaxed">
                        Feedback: {c.rejectionReason || 'Required projects have not been fully completed. Please verify your submissions and re-apply.'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Syllabus complete. Apply for your official verified certificate following project verification.
                    </p>
                  )}

                  {/* Action Button */}
                  <div className="pt-1 flex items-center justify-between">
                    {isPending ? (
                      <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        Application In Review
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenDisclaimer(c)}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all hover:scale-[1.02]"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{isRejected ? 'Re-Apply for Certificate' : 'Apply for Certificate'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: ISSUED CERTIFICATES */}
      {issuedCertificates.length === 0 && unissuedTracks.length === 0 ? (
        <div className="bg-white border border-stone-200/80 p-12 rounded-3xl text-center space-y-3 shadow-sm max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-stone-900 text-lg">No certificates earned yet</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
            Certificates are issued after you complete 100% of your course syllabus, submit your certificate application, and have your project work verified by your mentor.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {issuedCertificates.length > 0 && (
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Active Issued Credentials ({issuedCertificates.length})
            </h3>
          )}

          {issuedCertificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white border border-stone-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Award className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                      Verified Credential
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-stone-900">{cert.course.title}</h3>
                  <span className="text-[11px] text-stone-500 block font-mono font-semibold">
                    ID: {cert.certificateNumber}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full md:w-auto self-end md:self-center">
                <button
                  onClick={() => {
                    setSelectedCert(cert);
                    setIsPreviewOpen(true);
                  }}
                  className="flex-1 md:flex-none px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 transition-colors cursor-pointer"
                >
                  View Credential
                </button>

                <button
                  onClick={() => handleCopyLink(cert.certificateNumber)}
                  className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors cursor-pointer"
                  title="Share / Copy Verification Link"
                >
                  {copiedId === cert.certificateNumber ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleDownloadPdf(cert)}
                  disabled={downloadingCertId === cert.id}
                  className="flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {downloadingCertId === cert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MANDATORY DISCLAIMER & CONFIRMATION MODAL */}
      {isDisclaimerOpen && disclaimerTargetCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  Certificate Disclaimer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDisclaimerOpen(false);
                  setDisclaimerTargetCourse(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
              <p className="font-bold text-stone-900 text-sm">
                A certificate will be provided only after successful completion and verification of all required projects associated with this course.
              </p>
              <p>
                Submitting this certificate request does not guarantee immediate certificate issuance. Your mentor will review your project completion and grant the certificate after verification.
              </p>
              <p className="font-semibold text-amber-900">
                Please make sure all required projects have been completed and submitted before applying.
              </p>
            </div>

            <div className="text-xs text-stone-500 space-y-1">
              <p>
                <strong>Program:</strong> {disclaimerTargetCourse.title}
              </p>
              <p>
                <strong>Mentor:</strong> {disclaimerTargetCourse.mentorName || 'Lead Technical Mentor'}
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setIsDisclaimerOpen(false);
                  setDisclaimerTargetCourse(null);
                }}
                disabled={isSubmittingApplication}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApply}
                disabled={isSubmittingApplication}
                className="px-5 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingApplication ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                <span>Apply for Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Certificate Preview Modal */}
      <CertificatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};

// 4. Settings View Page
interface ProfileInputs {
  name: string;
  phone: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProfileInputs>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      avatar: user?.avatar || ''
    }
  });

  const currentAvatar = watch('avatar') || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120';

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileInputs) => {
    setError(null);
    setSuccess(null);

    // Validate password match if user entered new password
    if (data.newPassword || data.confirmPassword || data.currentPassword) {
      if (!data.currentPassword) {
        setError('Please provide your current password to set a new password.');
        return;
      }
      if (!data.newPassword || data.newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (data.newPassword !== data.confirmPassword) {
        setError('New passwords do not match. Please re-type and confirm.');
        return;
      }
    }

    try {
      setIsSaving(true);
      await updateProfile({
        name: data.name.trim(),
        phone: data.phone?.trim() || '',
        avatar: data.avatar?.trim() || '',
        currentPassword: data.currentPassword ? data.currentPassword : undefined,
        newPassword: data.newPassword ? data.newPassword : undefined
      });

      setSuccess('Your profile settings have been saved successfully!');
      
      // Reset password fields
      reset({
        name: data.name.trim(),
        phone: data.phone?.trim() || '',
        avatar: data.avatar?.trim() || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);

      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.error('Profile update failed:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to update profile. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-2xl animate-in fade-in duration-300">
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-stone-900">Workspace Settings</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Modify your profile configurations, credentials, and personal details.</p>
        </div>
        {user?.role && (
          <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-amber-500/10 text-amber-700 border border-amber-500/20">
            {user.role} Account
          </span>
        )}
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-stone-200/80 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        
        {/* Profile Avatar Card & URL */}
        <div className="p-4 bg-stone-50/80 border border-stone-200/80 rounded-2xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentAvatar}
                alt={user?.name || 'User avatar'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120';
                }}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-500/30 shadow-md bg-stone-200"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-stone-900 text-white rounded-full shadow-xs">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">Profile Photo</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Enter a direct image URL (Unsplash, cloud URL, or Gravatar).</p>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="settings-avatar" className="text-[11px] font-bold text-stone-700 block">
              Avatar Image URL
            </label>
            <input
              type="url"
              id="settings-avatar"
              {...register('avatar')}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder-stone-400"
            />
          </div>
        </div>

        {/* Basic Info Fields */}
        <div className="space-y-4">
          {/* Input: Name */}
          <div className="space-y-1.5">
            <label htmlFor="settings-name" className="text-xs font-bold text-stone-800 block">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="settings-name"
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g. Jane Doe"
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder-stone-400 transition-all"
              />
              <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.name && <span className="text-xs text-rose-600 block font-medium">{errors.name.message}</span>}
          </div>

          {/* Input: Phone */}
          <div className="space-y-1.5">
            <label htmlFor="settings-phone" className="text-xs font-bold text-stone-800 block">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                id="settings-phone"
                {...register('phone')}
                placeholder="e.g. +91 98765 43210"
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder-stone-400 transition-all"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Locked Input: Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 block">
              Email Address (Account Identifier)
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-100/80 border border-stone-200 rounded-xl text-xs font-medium text-stone-500 cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-[10px] text-stone-400">Email is linked to your login session and certifications.</span>
          </div>
        </div>

        {/* Password Security Section */}
        <div className="pt-2 border-t border-stone-200/80">
          <button
            type="button"
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="flex items-center justify-between w-full py-2 text-xs font-bold text-stone-800 hover:text-amber-600 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Security & Password Changes</span>
            </div>
            <span className="text-[11px] text-amber-600 font-semibold">
              {showPasswordSection ? 'Hide Password Options' : 'Change Password'}
            </span>
          </button>

          {showPasswordSection && (
            <div className="mt-3 p-4 bg-stone-50/80 border border-stone-200/80 rounded-2xl space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">Current Password</label>
                <div className="relative">
                  <input
                    type="password"
                    {...register('currentPassword')}
                    placeholder="Enter your existing account password"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder-stone-400"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      {...register('newPassword')}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder-stone-400"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      placeholder="Re-type new password"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder-stone-400"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[11px] text-stone-400 font-medium">Changes take effect immediately across all sessions.</span>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
