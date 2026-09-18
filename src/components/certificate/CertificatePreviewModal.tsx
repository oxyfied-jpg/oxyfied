import React, { useState } from 'react';
import { X, Download, Copy, Check, Award, ShieldCheck, Loader2 } from 'lucide-react';
import { CertificateCanvas, type CertificateSampleData } from './CertificateCanvas';
import type { IssuedCertificate, CertificateTemplate } from '../../types/certificate';
import { certificateService } from '../../services/certificateService';

interface CertificatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate?: IssuedCertificate | null;
  template?: CertificateTemplate | null;
  sampleData?: CertificateSampleData;
  title?: string;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  isOpen,
  onClose,
  certificate,
  template,
  sampleData,
  title = 'Official Certificate Preview'
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  // Resolve template elements and configuration
  let orientation: 'landscape' | 'portrait' = 'landscape';
  let elements: any[] = [];
  let backgroundImage: string | null = null;

  if (certificate?.templateSnapshot) {
    try {
      const snap = JSON.parse(certificate.templateSnapshot);
      orientation = snap.orientation || 'landscape';
      elements = snap.elements || [];
      backgroundImage = snap.backgroundImage || null;
    } catch {}
  } else if (template) {
    orientation = template.orientation;
    elements = template.elements || [];
    backgroundImage = template.backgroundImage || null;
  } else if (certificate?.template) {
    orientation = certificate.template.orientation;
    elements = certificate.template.elements || [];
    backgroundImage = certificate.template.backgroundImage || null;
  }

  // Exact recipient resolution: prioritize the actual certificate user record
  const resolvedStudentName =
    certificate?.user?.name ||
    sampleData?.studentName ||
    sampleData?.studentFullName ||
    sampleData?.name ||
    sampleData?.student_name ||
    'Student Name';

  const resolvedCourseTitle =
    certificate?.course?.title ||
    sampleData?.courseTitle ||
    sampleData?.courseName ||
    sampleData?.course_title ||
    sampleData?.course_name ||
    'Course Title';

  const renderData: CertificateSampleData = {
    studentName: resolvedStudentName,
    studentFullName: resolvedStudentName,
    name: resolvedStudentName,
    student_name: resolvedStudentName,
    courseTitle: resolvedCourseTitle,
    courseName: resolvedCourseTitle,
    course_title: resolvedCourseTitle,
    course_name: resolvedCourseTitle,
    certificateNumber: certificate?.certificateNumber || sampleData?.certificateNumber || 'OXY-000000',
    issueDate: certificate?.issueDate
      ? new Date(certificate.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : sampleData?.issueDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    completionDate: certificate?.completionDate
      ? new Date(certificate.completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : sampleData?.completionDate || sampleData?.issueDate || '',
    duration: certificate?.course?.duration || sampleData?.duration || 'Professional Track',
    mentorName: certificate?.course?.mentor?.name || sampleData?.mentorName || 'Lead Technical Mentor',
    instructorName: certificate?.course?.mentor?.name || sampleData?.instructorName || sampleData?.mentorName || 'Lead Technical Mentor',
    organizationName: sampleData?.organizationName || 'Oxyfied Official Credential Authority',
    verificationUrl: certificate?.certificateNumber
      ? `${window.location.origin}/verify-certificate/${certificate.certificateNumber}`
      : sampleData?.verificationUrl
  };

  const handleCopyLink = () => {
    if (!certificate?.certificateNumber) return;
    const url = `${window.location.origin}/verify-certificate/${certificate.certificateNumber}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadPdf = async () => {
    if (!certificate) {
      alert('Certificate must be issued before downloading vector PDF.');
      return;
    }
    try {
      setIsDownloading(true);
      await certificateService.downloadPdf(certificate.id, `Oxyfied-Certificate-${certificate.certificateNumber}.pdf`);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-stone-900 leading-tight">
                {title}
              </h3>
              <span className="text-[11px] text-stone-500 font-mono">
                ID: {renderData.certificateNumber}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Interactive Scaled Certificate Canvas */}
        <div className="flex-1 bg-[#EBE7DF] overflow-auto p-4 sm:p-8 flex items-center justify-center">
          <div className="max-w-full flex items-center justify-center">
            <CertificateCanvas
              orientation={orientation}
              backgroundImage={backgroundImage}
              elements={elements}
              sampleData={renderData}
              isEditable={false}
              zoom={0.72}
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-stone-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically verifiable on official Oxyfied registry</span>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            {certificate?.certificateNumber && (
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
                <span>{copied ? 'Verification Link Copied!' : 'Copy Verify Link'}</span>
              </button>
            )}

            {certificate && (
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Download High-Res PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
