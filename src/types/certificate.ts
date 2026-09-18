export type CertificateElementType = 
  | 'text' 
  | 'variable' 
  | 'image' 
  | 'signature' 
  | 'logo' 
  | 'qr' 
  | 'badge' 
  | 'divider' 
  | 'shape';

export type CertificateVariableKey = 
  | 'studentName' 
  | 'courseName' 
  | 'courseTitle' 
  | 'certificateNumber' 
  | 'issueDate' 
  | 'completionDate' 
  | 'duration' 
  | 'mentorName' 
  | 'instructorName' 
  | 'organizationName';

export interface CertificateElement {
  id: string;
  type: CertificateElementType;
  variableKey?: CertificateVariableKey;
  label: string;
  content?: string; // Text content or placeholder
  imageUrl?: string; // For images, logos, signatures, badges
  
  // Coordinates & Box (percentages 0-100 for responsive canvas or pixel coords)
  x: number; // percentage (0 to 100) or px
  y: number; // percentage (0 to 100) or px
  width: number; // percentage or px
  height: number; // percentage or px

  // Typography (for text / variable)
  fontSize?: number; // in px / pt
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | '800' | '900';
  fontFamily?: 'Inter' | 'Outfit' | 'Cinzel' | 'Playfair Display' | 'Montserrat' | 'Great Vibes' | 'Alex Brush' | 'Courier New' | 'serif' | 'sans-serif';
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number; // in px
  color?: string; // hex / rgba
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';

  // Styling & Layering
  opacity?: number; // 0 to 1
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  zIndex?: number;
  isVisible?: boolean;
  isLocked?: boolean;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  backgroundColor?: string;
  shadow?: boolean;
  aspectRatioLock?: boolean;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string | null;
  orientation: 'landscape' | 'portrait';
  width: number; // 1123 for landscape A4, 794 for portrait
  height: number; // 794 for landscape A4, 1123 for portrait
  backgroundImage?: string | null;
  elements: CertificateElement[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  coursesCount?: number;
  certificatesCount?: number;
  courses?: Array<{ id: string; title: string; slug: string }>;
}

export type CertificateStatus = 'issued' | 'reissued' | 'revoked';

export interface CertificateHistoryItem {
  id: string;
  certificateId: string;
  action: 'issued' | 'reissued' | 'revoked' | 'metadata_updated';
  performedBy: string; // 'Admin', 'System', or user email
  details?: string | null;
  createdAt: string;
}

export interface IssuedCertificate {
  id: string;
  certificateNumber: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  courseId: string;
  course: {
    id: string;
    title: string;
    slug: string;
    duration?: string;
    mentor?: {
      name: string;
      designation?: string;
    };
  };
  templateId?: string | null;
  template?: CertificateTemplate | null;
  templateSnapshot?: string | null; // JSON snapshot
  issueDate: string;
  completionDate?: string | null;
  status: CertificateStatus;
  generatedBy: string; // 'Admin' | 'System'
  metadata?: Record<string, any> | null;
  pdfUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  history?: CertificateHistoryItem[];
}

export interface CertificateVerificationResult {
  isValid: boolean;
  status: CertificateStatus;
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  courseSlug?: string;
  issueDate: string;
  completionDate?: string | null;
  organizationName: string;
  mentorName?: string;
  duration?: string;
  templateSnapshot?: any;
  verifiedAt: string;
}

export type CertificateRequestStatus = 'pending' | 'granted' | 'rejected';

export interface CertificateRequest {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  courseId: string;
  course: {
    id: string;
    title: string;
    slug: string;
    duration?: string;
  };
  mentorId?: string | null;
  mentor?: {
    id: string;
    name: string;
    designation?: string;
  } | null;
  status: CertificateRequestStatus;
  requestedAt: string;
  reviewedAt?: string | null;
  grantedAt?: string | null;
  rejectionReason?: string | null;
  certificateId?: string | null;
  certificate?: {
    id: string;
    certificateNumber: string;
    status: CertificateStatus;
    issueDate: string;
  } | null;
  submissionsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCompletedTrack {
  id: string;
  title: string;
  slug: string;
  mentorName: string;
  lessons: number;
  completedLessons: number;
  isEligible: boolean;
  hasCertificate: boolean;
  certificate?: IssuedCertificate;
  latestRequest?: CertificateRequest;
  requestStatus: 'none' | 'pending' | 'granted' | 'rejected';
  rejectionReason?: string | null;
  canApply: boolean;
}
