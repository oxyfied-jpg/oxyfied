import React, { useRef, useState, useEffect } from 'react';
import type { CertificateElement, CertificateVariableKey } from '../../types/certificate';
import { QrCode, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

/**
 * Resolves an asset URL (background image, logo, signature, etc.) safely.
 * Handles base64 data URLs, remote absolute URLs, and relative upload paths.
 */
export function resolveAssetUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs, Blobs, and Object URLs are self-contained
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Normalize localhost / 127.0.0.1 URLs that were saved during local development
  if (trimmed.startsWith('http://localhost') || trimmed.startsWith('http://127.0.0.1')) {
    const uploadIndex = trimmed.indexOf('/uploads/');
    if (uploadIndex !== -1) {
      trimmed = trimmed.substring(uploadIndex);
    }
  }

  // If already HTTPS or protocol-relative, return as-is
  if (trimmed.startsWith('https://') || trimmed.startsWith('//')) {
    return trimmed;
  }

  // Relative /uploads paths
  const apiBase = api.defaults.baseURL || '';
  if (apiBase.startsWith('https://') || apiBase.startsWith('http://')) {
    const hostBase = apiBase.replace(/\/api\/?$/, '');
    return `${hostBase}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }

  return trimmed;
}

export interface CertificateSampleData {
  studentName?: string;
  studentFullName?: string;
  name?: string;
  student_name?: string;
  courseTitle?: string;
  courseName?: string;
  course_title?: string;
  course_name?: string;
  certificateNumber?: string;
  certificate_number?: string;
  issueDate?: string;
  issue_date?: string;
  completionDate?: string;
  completion_date?: string;
  duration?: string;
  mentorName?: string;
  instructorName?: string;
  mentor_name?: string;
  instructor_name?: string;
  organizationName?: string;
  organization_name?: string;
  verificationUrl?: string;
  verification_url?: string;
}

interface CertificateCanvasProps {
  orientation: 'landscape' | 'portrait';
  width?: number;
  height?: number;
  backgroundImage?: string | null;
  elements: CertificateElement[];
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onUpdateElement?: (id: string, updates: Partial<CertificateElement>) => void;
  isEditable?: boolean;
  sampleData?: CertificateSampleData;
  zoom?: number; // scale factor e.g. 1
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  orientation,
  width = orientation === 'portrait' ? 794 : 1123,
  height = orientation === 'portrait' ? 1123 : 794,
  backgroundImage,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  isEditable = false,
  sampleData = {
    studentName: 'Alex Mercer',
    courseTitle: 'Master Program in Data Science and AI',
    courseName: 'Master Program in Data Science and AI',
    certificateNumber: 'OXY-2026-894120',
    issueDate: 'October 24, 2026',
    completionDate: 'October 24, 2026',
    duration: '12 Weeks (180 Hours)',
    mentorName: 'Dr. Evelyn Vance',
    instructorName: 'Dr. Evelyn Vance',
    organizationName: 'Oxyfied Official Credential Authority',
    verificationUrl: 'https://oxyfied.com/verify-certificate/OXY-2026-894120'
  },
  zoom = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; elemX: number; elemY: number; elemW: number; elemH: number } | null>(null);

  // Background Image Failure-Safe State
  const [bgImageError, setBgImageError] = useState<boolean>(false);

  const resolvedBgUrl = resolveAssetUrl(backgroundImage);

  // Safely preload background image asynchronously with error handling
  useEffect(() => {
    console.log("Certificate background:", resolvedBgUrl);
    console.log("Certificate background exists:", !!resolvedBgUrl);

    if (!resolvedBgUrl) {
      setBgImageError(false);
      return;
    }

    let isMounted = true;
    setBgImageError(false);

    const img = new Image();
    if (resolvedBgUrl.startsWith('http://') || resolvedBgUrl.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      if (isMounted) {
        setBgImageError(false);
      }
    };

    img.onerror = () => {
      if (isMounted) {
        setBgImageError(true);
        // Safe diagnostic without exposing sensitive tokens
        const sanitizedUrl = resolvedBgUrl.split('?')[0];
        console.warn(`Certificate background image failed to load: ${sanitizedUrl}`);
      }
    };

    img.src = resolvedBgUrl;

    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [resolvedBgUrl]);

  // Normalized data resolution
  const resolvedStudentName =
    sampleData.studentName ||
    sampleData.studentFullName ||
    sampleData.name ||
    sampleData.student_name ||
    'Student Name';

  const resolvedCourseTitle =
    sampleData.courseTitle ||
    sampleData.courseName ||
    sampleData.course_title ||
    sampleData.course_name ||
    'Course Track Title';

  const resolvedCertificateNumber =
    sampleData.certificateNumber ||
    sampleData.certificate_number ||
    'OXY-2026-XXXXXX';

  const resolvedIssueDate =
    sampleData.issueDate ||
    sampleData.issue_date ||
    'October 24, 2026';

  const resolvedCompletionDate =
    sampleData.completionDate ||
    sampleData.completion_date ||
    resolvedIssueDate;

  const resolvedDuration =
    sampleData.duration ||
    '10 Weeks (180 Hours)';

  const resolvedMentorName =
    sampleData.mentorName ||
    sampleData.instructorName ||
    sampleData.mentor_name ||
    sampleData.instructor_name ||
    'Lead Technical Mentor';

  const resolvedOrgName =
    sampleData.organizationName ||
    sampleData.organization_name ||
    'Oxyfied Official Credential Authority';

  const resolvedVerificationUrl =
    sampleData.verificationUrl ||
    sampleData.verification_url ||
    '';

  // Variable replacement helper
  const interpolateText = (text?: string, variableKey?: CertificateVariableKey) => {
    if (variableKey) {
      switch (variableKey) {
        case 'studentName':
          return resolvedStudentName;
        case 'courseName':
        case 'courseTitle':
          return resolvedCourseTitle;
        case 'certificateNumber':
          return resolvedCertificateNumber;
        case 'issueDate':
          return resolvedIssueDate;
        case 'completionDate':
          return resolvedCompletionDate;
        case 'duration':
          return resolvedDuration;
        case 'mentorName':
        case 'instructorName':
          return resolvedMentorName;
        case 'organizationName':
          return resolvedOrgName;
        default:
          return text || '';
      }
    }

    if (!text) return '';
    return text
      .replace(/\{\{(studentName|studentFullName|name|student_name)\}\}/gi, resolvedStudentName)
      .replace(/\{\{(courseTitle|courseName|course_title|course_name)\}\}/gi, resolvedCourseTitle)
      .replace(/\{\{(certificateNumber|certificate_number|certNumber)\}\}/gi, resolvedCertificateNumber)
      .replace(/\{\{(issueDate|issue_date)\}\}/gi, resolvedIssueDate)
      .replace(/\{\{(completionDate|completion_date)\}\}/gi, resolvedCompletionDate)
      .replace(/\{\{(duration|courseDuration)\}\}/gi, resolvedDuration)
      .replace(/\{\{(mentorName|instructorName|mentor_name|instructor_name)\}\}/gi, resolvedMentorName)
      .replace(/\{\{(organizationName|organization_name|orgName)\}\}/gi, resolvedOrgName)
      .replace(/\{\{(verificationUrl|verification_url)\}\}/gi, resolvedVerificationUrl);
  };

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent, elem: CertificateElement) => {
    if (!isEditable || elem.isLocked) return;
    e.stopPropagation();
    onSelectElement?.(elem.id);
    setDraggingId(elem.id);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
      elemW: elem.width,
      elemH: elem.height
    });
  };

  const handleResizeStart = (e: React.MouseEvent, elem: CertificateElement) => {
    if (!isEditable || elem.isLocked) return;
    e.stopPropagation();
    setResizingId(elem.id);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
      elemW: elem.width,
      elemH: elem.height
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      if (draggingId) {
        const newX = Math.max(0, Math.min(100 - dragStart.elemW, Math.round((dragStart.elemX + deltaX) * 10) / 10));
        const newY = Math.max(0, Math.min(100 - dragStart.elemH, Math.round((dragStart.elemY + deltaY) * 10) / 10));
        onUpdateElement?.(draggingId, { x: newX, y: newY });
      } else if (resizingId) {
        const newW = Math.max(3, Math.min(100 - dragStart.elemX, Math.round((dragStart.elemW + deltaX) * 10) / 10));
        const newH = Math.max(2, Math.min(100 - dragStart.elemY, Math.round((dragStart.elemH + deltaY) * 10) / 10));
        onUpdateElement?.(resizingId, { width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      setResizingId(null);
      setDragStart(null);
    };

    if (draggingId || resizingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, resizingId, dragStart, onUpdateElement]);

  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div className="relative flex items-center justify-center w-full h-full p-2 sm:p-4 overflow-auto select-none">
      {/* Canvas Paper Container */}
      <div
        ref={containerRef}
        onClick={() => isEditable && onSelectElement?.(null)}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          aspectRatio: `${width} / ${height}`
        }}
        className="relative bg-white shadow-2xl rounded-sm overflow-hidden flex-shrink-0 transition-transform duration-100 ease-out border border-stone-300"
      >
        {/* Background Image Layer (Failure-Safe) */}
        {resolvedBgUrl && !bgImageError ? (
          <img
            src={resolvedBgUrl}
            alt="Certificate Background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            crossOrigin="anonymous"
            onError={() => {
              setBgImageError(true);
              const sanitizedUrl = resolvedBgUrl.split('?')[0];
              console.warn(`Certificate background image failed to render: ${sanitizedUrl}`);
            }}
          />
        ) : (
          /* Default Luxury Certificate Border & Background Fallback */
          <div className="absolute inset-0 w-full h-full bg-[#FAF8F5] pointer-events-none p-6 sm:p-8">
            {/* Outer Gold Border */}
            <div className="w-full h-full border-2 border-[#D4AF37]/70 rounded-xs p-1.5 sm:p-2">
              {/* Inner Fine Border */}
              <div className="w-full h-full border border-[#D4AF37]/30 rounded-xs relative flex flex-col items-center justify-between p-6">
                {/* Corner Decorative Ornaments */}
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37]" />
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37]" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37]" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37]" />
              </div>
            </div>
          </div>
        )}

        {/* Elements Layer */}
        {sortedElements.map((elem) => {
          if (elem.isVisible === false) return null;
          const isSelected = isEditable && selectedElementId === elem.id;

          const fontFamilyClass =
            elem.fontFamily === 'Cinzel'
              ? 'font-serif tracking-wide'
              : elem.fontFamily === 'Playfair Display'
              ? 'font-serif'
              : elem.fontFamily === 'Courier New'
              ? 'font-mono'
              : elem.fontFamily === 'Outfit'
              ? 'font-display'
              : elem.fontFamily === 'Great Vibes'
              ? 'italic font-serif'
              : 'font-sans';

          return (
            <div
              key={elem.id}
              onMouseDown={(e) => handleMouseDown(e, elem)}
              style={{
                position: 'absolute',
                left: `${elem.x}%`,
                top: `${elem.y}%`,
                width: `${elem.width}%`,
                height: `${elem.height}%`,
                zIndex: elem.zIndex || 1,
                opacity: elem.opacity !== undefined ? elem.opacity : 1,
                cursor: isEditable ? (elem.isLocked ? 'default' : 'move') : 'default'
              }}
              className={`group transition-shadow duration-100 ${
                isSelected
                  ? 'ring-2 ring-amber-500 ring-offset-1 bg-amber-500/5 z-50'
                  : isEditable
                  ? 'hover:ring-1 hover:ring-amber-400/60 hover:bg-amber-500/5'
                  : ''
              }`}
            >
              {/* Element Content Rendering */}
              {elem.type === 'text' || elem.type === 'variable' ? (
                <div
                  style={{
                    fontSize: `${elem.fontSize || 16}px`,
                    fontWeight: elem.fontWeight || (elem.isBold ? 'bold' : 'normal'),
                    fontStyle: elem.isItalic ? 'italic' : 'normal',
                    textDecoration: elem.isUnderline ? 'underline' : 'none',
                    textAlign: elem.textAlign || 'center',
                    letterSpacing: `${elem.letterSpacing || 0}px`,
                    color: elem.color || '#0B1120',
                    lineHeight: elem.lineHeight || 1.2
                  }}
                  className={`w-full h-full flex items-center ${
                    elem.textAlign === 'left'
                      ? 'justify-start'
                      : elem.textAlign === 'right'
                      ? 'justify-end'
                      : 'justify-center'
                  } ${fontFamilyClass} break-words overflow-hidden leading-tight`}
                >
                  <span>{interpolateText(elem.content, elem.variableKey)}</span>
                </div>
              ) : elem.type === 'qr' ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-white border border-stone-200 shadow-xs rounded">
                  <QrCode className="w-full h-full text-slate-900" style={{ color: elem.color || '#0B1120' }} />
                  <span className="text-[7px] font-mono font-bold text-stone-500 mt-0.5 tracking-tighter uppercase">Scan to Verify</span>
                </div>
              ) : ['image', 'logo', 'signature', 'badge'].includes(elem.type) ? (
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  {elem.imageUrl ? (
                    <img
                      src={resolveAssetUrl(elem.imageUrl)}
                      alt={elem.label || 'Asset'}
                      className="w-full h-full object-contain pointer-events-none"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-100 border border-dashed border-stone-300 rounded flex flex-col items-center justify-center text-stone-400">
                      <ImageIcon className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-semibold">{elem.label || 'Upload Image'}</span>
                    </div>
                  )}
                </div>
              ) : elem.type === 'divider' || elem.type === 'shape' ? (
                <div
                  style={{
                    backgroundColor: elem.backgroundColor || elem.color || '#D4AF37',
                    borderRadius: `${elem.borderRadius || 0}px`
                  }}
                  className="w-full h-full"
                />
              ) : null}

              {/* Editable Selection Controls */}
              {isSelected && !elem.isLocked && (
                <>
                  {/* Resize Handle at Bottom-Right */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, elem)}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-500 border-2 border-white rounded-xs shadow cursor-nwse-resize z-50 hover:scale-125 transition-transform"
                    title="Resize Element"
                  />
                  {/* Coordinate Label Tooltip */}
                  <div className="absolute -top-6 left-0 px-1.5 py-0.5 bg-slate-900/90 text-amber-300 text-[9px] font-mono rounded shadow pointer-events-none whitespace-nowrap z-50">
                    X: {elem.x}% Y: {elem.y}% | W: {elem.width}% H: {elem.height}%
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
