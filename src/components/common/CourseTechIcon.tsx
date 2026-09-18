import React from 'react';
import {
  ShieldCheck,
  BarChart3,
  Code2
} from 'lucide-react';
import type { Course } from '../../types';

interface CourseTechIconProps {
  course: Course;
  className?: string;
  size?: number; // default 38
}

/**
 * Pixel-perfect SVG brand and technology icons
 */

// Python Icon
const PythonSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 128 128" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M63.594 4.062c-30.82 0-28.875 13.375-28.875 13.375l.03 13.844h29.313v4.156H21.72s-17.657 1.996-17.657 28.844c0 26.85 15.438 27.75 15.438 27.75h9.22v-12.937s-.5-15.438 15.187-15.438h29.188s14.625.242 14.625-14.188V18.25s1.94-14.188-34.125-14.188zm-16.5 8.782a4.42 4.42 0 0 1 4.437 4.437 4.42 4.42 0 0 1-4.437 4.407 4.42 4.42 0 0 1-4.407-4.407 4.42 4.42 0 0 1 4.407-4.437z"
      fill="url(#py-a)"
    />
    <path
      d="M64.406 123.938c30.82 0 28.875-13.375 28.875-13.375l-.03-13.844H63.938v-4.156h42.343s17.657-1.996 17.657-28.844c0-26.85-15.438-27.75-15.438-27.75h-9.22v12.937s.5 15.438-15.187 15.438H54.906s-14.625-.242-14.625 14.188v11.218s-1.94 14.188 34.125 14.188zm16.5-8.782a4.42 4.42 0 0 1-4.437-4.437 4.42 4.42 0 0 1 4.437-4.407 4.42 4.42 0 0 1 4.407 4.407 4.42 4.42 0 0 1-4.407 4.437z"
      fill="url(#py-b)"
    />
    <defs>
      <linearGradient id="py-a" x1="17.75" y1="9.75" x2="77.75" y2="69.75" gradientUnits="userSpaceOnUse">
        <stop stopColor="#387EB8" />
        <stop offset="1" stopColor="#366994" />
      </linearGradient>
      <linearGradient id="py-b" x1="110.25" y1="118.25" x2="50.25" y2="58.25" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFE873" />
        <stop offset="1" stopColor="#FFD43B" />
      </linearGradient>
    </defs>
  </svg>
);

// React / MERN Icon
const ReactSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="-11.5 -10.23174 23 20.46348" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="0" cy="0" r="2.05" fill="#00D8FF" />
    <g stroke="#00D8FF" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

// AWS Icon
const AwsSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 128 128" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M44.02 65.65c-6.84 0-11.83-2.02-14.96-6.07-3.13-4.04-3.18-9.42-.14-16.12 3.14-6.9 8.16-10.35 15.06-10.35 4.3 0 8.01 1.25 11.13 3.75 3.12 2.51 5.34 5.92 6.66 10.23l-7.39 2.45c-.94-2.73-2.31-4.78-4.1-6.15-1.8-1.37-3.9-2.06-6.3-2.06-3.83 0-6.72 1.76-8.67 5.29-1.95 3.52-2.14 7.02-.57 10.49 1.57 3.47 4.19 5.2 7.86 5.2 2.65 0 4.96-.8 6.92-2.4 1.96-1.61 3.4-3.94 4.33-7.01l7.39 2.22c-1.4 4.67-3.93 8.36-7.59 11.08-3.66 2.7-7.87 4.05-12.63 4.05zM83.98 65.65c-6.84 0-11.83-2.02-14.96-6.07-3.13-4.04-3.18-9.42-.14-16.12 3.14-6.9 8.16-10.35 15.06-10.35 4.3 0 8.01 1.25 11.13 3.75 3.12 2.51 5.34 5.92 6.66 10.23l-7.39 2.45c-.94-2.73-2.31-4.78-4.1-6.15-1.8-1.37-3.9-2.06-6.3-2.06-3.83 0-6.72 1.76-8.67 5.29-1.95 3.52-2.14 7.02-.57 10.49 1.57 3.47 4.19 5.2 7.86 5.2 2.65 0 4.96-.8 6.92-2.4 1.96-1.61 3.4-3.94 4.33-7.01l7.39 2.22c-1.4 4.67-3.93 8.36-7.59 11.08-3.66 2.7-7.87 4.05-12.63 4.05z"
      fill="#232F3E"
    />
    <path
      d="M106.84 89.28C91.95 100.28 72.8 106.2 53.64 106.2c-26.98 0-50.6-11.23-53.64-12.72-.65-.32-.78-1.04-.26-1.5.78-.68 2.47-1.82 3.5-2.53.46-.32 1.1-.39 1.62-.13 2.92 1.49 24.36 12.08 48.78 12.08 17.02 0 34.03-5.26 47.34-15.06.91-.68 2.01-.2 2.47.78.39.85.13 1.69-.61 2.16z"
      fill="#FF9900"
    />
    <path
      d="M113.85 79.54c-1.69-2.15-11.17-5.07-16.37-3.77-.72.19-.91.91-.32 1.43 3.77 3.38 9.87 8.83 11.23 10.26 1.36 1.43 2.86.39 2.47-1.17-.39-1.56-1.1-4.03-1.43-5.45.65.19 2.99.91 4.42 1.69 1.43.78 2.47-.19 2.47-.78 0-.46-.78-1.37-2.47-2.21z"
      fill="#FF9900"
    />
  </svg>
);

// Figma Icon
const FigmaSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 38 57" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" />
    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" />
    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" />
    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" />
    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" />
  </svg>
);

// Power BI Icon
const PowerBiSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="16" width="6" height="12" rx="1.5" fill="#E6AD10" />
    <rect x="10" y="10" width="6" height="18" rx="1.5" fill="#F2C811" />
    <rect x="18" y="4" width="6" height="24" rx="1.5" fill="#F6D743" />
    <rect x="26" y="12" width="4" height="16" rx="1" fill="#E6AD10" opacity="0.8" />
  </svg>
);

// Odoo Icon
const OdooSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#714B67" />
    <circle cx="32" cy="50" r="14" stroke="#FFFFFF" strokeWidth="8" fill="none" />
    <circle cx="68" cy="50" r="14" stroke="#00A09D" strokeWidth="8" fill="none" />
  </svg>
);

// Java Icon
const JavaSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M26.4 46.2c-6.8.4-12.7 1.7-12.7 3.3 0 1.9 8.2 3.4 18.3 3.4 10.1 0 18.3-1.5 18.3-3.4 0-1.5-5.2-2.8-12.4-3.3l-.7 2.1c5.4.4 9.1 1.2 9.1 2.1 0 1.2-6.4 2.2-14.3 2.2-7.9 0-14.3-1-14.3-2.2 0-.9 3.6-1.7 8.8-2.1l-.1-2.1z"
      fill="#E76F00"
    />
    <path
      d="M21.2 38.6c-5.2.4-9.7 1.4-9.7 2.6 0 1.5 6.4 2.7 14.3 2.7 7.9 0 14.3-1.2 14.3-2.7 0-1.2-4.1-2.1-9.7-2.6l-.3 1.8c4.2.3 7.1.9 7.1 1.6 0 .9-4.9 1.7-11.1 1.7s-11.1-.8-11.1-1.7c0-.7 2.8-1.3 6.9-1.6l-.4-1.8z"
      fill="#5382A1"
    />
    <path
      d="M30.1 21.2c2.2 2.6 1.4 5.3-.2 7.7-1.8 2.7-4.1 5.3-3.4 8.7.6-2.4 2.2-4.5 4.1-6.7 2.4-2.8 4.6-6.1 2.3-9.7h-2.8z"
      fill="#E76F00"
    />
    <path
      d="M37.8 15.6c3.1 3.5 1.9 7.4-.4 10.7-2.5 3.7-5.7 7.4-4.8 12.1.8-3.4 3.1-6.3 5.7-9.3 3.3-3.9 6.4-8.5 3.2-13.5h-3.7z"
      fill="#5382A1"
    />
  </svg>
);

// Docker / DevOps Icon
const DockerSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="24" width="6" height="5" rx="0.5" fill="#0db7ed" />
    <rect x="25" y="24" width="6" height="5" rx="0.5" fill="#0db7ed" />
    <rect x="32" y="24" width="6" height="5" rx="0.5" fill="#0db7ed" />
    <rect x="25" y="18" width="6" height="5" rx="0.5" fill="#0db7ed" />
    <rect x="32" y="18" width="6" height="5" rx="0.5" fill="#0db7ed" />
    <rect x="39" y="24" width="6" height="5" rx="0.5" fill="#0db7ed" />
    <path
      d="M59 34c-1.5-1-4-1.2-6-1-.5-3.5-3-6-6-6h-2v6H6c-1 4 1 9 4 12 5 5 15 6 25 6 12 0 23-4 27-14 1-.8 1-2 0-3h-3z"
      fill="#0db7ed"
    />
  </svg>
);

// Custom Cyber Security Shield Icon
const CyberShieldSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M24 4L8 10v14c0 10.5 6.8 20.3 16 23 9.2-2.7 16-12.5 16-23V10L24 4z"
      fill="url(#cyber-grad)"
    />
    <path
      d="M24 16c-3.3 0-6 2.7-6 6v3h-1c-.6 0-1 .4-1 1v8c0 .6.4 1 1 1h14c.6 0 1-.4 1-1v-8c0-.6-.4-1-1-1h-1v-3c0-3.3-2.7-6-6-6zm-3.5 6c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5v3h-7v-3z"
      fill="#FFFFFF"
    />
    <defs>
      <linearGradient id="cyber-grad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F172A" />
        <stop offset="0.5" stopColor="#1E293B" />
        <stop offset="1" stopColor="#F26B21" />
      </linearGradient>
    </defs>
  </svg>
);

// AI / Brain Neural Icon
const AiNeuralSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#ai-grad)" />
    <circle cx="24" cy="24" r="5" fill="#FFFFFF" />
    <circle cx="14" cy="16" r="3.5" fill="#DDD6FE" />
    <circle cx="34" cy="16" r="3.5" fill="#DDD6FE" />
    <circle cx="14" cy="32" r="3.5" fill="#DDD6FE" />
    <circle cx="34" cy="32" r="3.5" fill="#DDD6FE" />
    <line x1="14" y1="16" x2="24" y2="24" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="2 2" />
    <line x1="34" y1="16" x2="24" y2="24" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="2 2" />
    <line x1="14" y1="32" x2="24" y2="24" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="2 2" />
    <line x1="34" y1="32" x2="24" y2="24" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="2 2" />
    <defs>
      <linearGradient id="ai-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7C3AED" />
        <stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
  </svg>
);

// Data Science / Neural Spark Icon
const DataScienceSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#ds-grad)" />
    <path
      d="M12 36L20 26L28 30L36 14"
      stroke="#FFFFFF"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="36" r="3" fill="#FFE873" />
    <circle cx="20" cy="26" r="3" fill="#FFE873" />
    <circle cx="28" cy="30" r="3" fill="#FFE873" />
    <circle cx="36" cy="14" r="3" fill="#FFE873" />
    <defs>
      <linearGradient id="ds-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F26B21" />
        <stop offset="1" stopColor="#D95716" />
      </linearGradient>
    </defs>
  </svg>
);

// SOC / Blue Team Icon
const SocAnalystSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#soc-grad)" />
    <circle cx="24" cy="24" r="12" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" />
    <circle cx="24" cy="24" r="6" stroke="#38BDF8" strokeWidth="2" />
    <circle cx="24" cy="24" r="2" fill="#38BDF8" />
    <line x1="24" y1="8" x2="24" y2="40" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5" />
    <line x1="8" y1="24" x2="40" y2="24" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5" />
    <defs>
      <linearGradient id="soc-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0369A1" />
        <stop offset="1" stopColor="#0C4A6E" />
      </linearGradient>
    </defs>
  </svg>
);

// Blockchain & ZKP Icon
const BlockchainSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#bc-grad)" />
    <path
      d="M24 12l10 6v12l-10 6-10-6V18l10-6z"
      stroke="#34D399"
      strokeWidth="2.5"
      fill="none"
      strokeLinejoin="round"
    />
    <path d="M24 12v24M14 18l20 12M34 18L14 30" stroke="#34D399" strokeWidth="1.5" opacity="0.7" />
    <defs>
      <linearGradient id="bc-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#064E3B" />
        <stop offset="1" stopColor="#065F46" />
      </linearGradient>
    </defs>
  </svg>
);

// Quantum Computing Icon
const QuantumSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#qc-grad)" />
    <ellipse cx="24" cy="24" rx="14" ry="5" stroke="#A7F3D0" strokeWidth="2" transform="rotate(30 24 24)" fill="none" />
    <ellipse cx="24" cy="24" rx="14" ry="5" stroke="#A7F3D0" strokeWidth="2" transform="rotate(-30 24 24)" fill="none" />
    <circle cx="24" cy="24" r="3.5" fill="#34D399" />
    <defs>
      <linearGradient id="qc-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E1B4B" />
        <stop offset="1" stopColor="#312E81" />
      </linearGradient>
    </defs>
  </svg>
);

// SQL & Database Icon
const SqlSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="url(#sql-grad)" />
    <ellipse cx="24" cy="14" rx="12" ry="4" stroke="#93C5FD" strokeWidth="2" fill="#1E3A8A" />
    <path d="M12 14v8c0 2.2 5.4 4 12 4s12-1.8 12-4v-8" stroke="#93C5FD" strokeWidth="2" />
    <path d="M12 22v8c0 2.2 5.4 4 12 4s12-1.8 12-4v-8" stroke="#93C5FD" strokeWidth="2" />
    <defs>
      <linearGradient id="sql-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E3A8A" />
        <stop offset="1" stopColor="#172554" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Helper to determine the best matching tech icon config
 */
export const getCourseIconElement = (course: Course) => {
  const textToScan = [
    course.title || '',
    course.slug || '',
    course.category || '',
    course.description || '',
    ...(course.skills || [])
  ].join(' ').toLowerCase();

  // 1. Python
  if (textToScan.includes('python') || textToScan.includes('pandas') || textToScan.includes('numpy')) {
    return {
      type: 'custom',
      component: <PythonSvg className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />,
      bg: 'bg-[#387EB8]/10 border-[#387EB8]/20 text-[#387EB8]'
    };
  }

  // 2. React / MERN / Frontend
  if (textToScan.includes('react') || textToScan.includes('mern') || textToScan.includes('next.js')) {
    return {
      type: 'custom',
      component: <ReactSvg className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />,
      bg: 'bg-[#00D8FF]/10 border-[#00D8FF]/25 text-[#00D8FF]'
    };
  }

  // 3. AWS / Cloud
  if (textToScan.includes('aws') || textToScan.includes('amazon') || textToScan.includes('cloud')) {
    return {
      type: 'custom',
      component: <AwsSvg className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />,
      bg: 'bg-[#FF9900]/10 border-[#FF9900]/25 text-[#FF9900]'
    };
  }

  // 4. Figma / UI UX
  if (textToScan.includes('figma') || textToScan.includes('ui/ux') || textToScan.includes('ui ux') || textToScan.includes('ux design')) {
    return {
      type: 'custom',
      component: <FigmaSvg className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />,
      bg: 'bg-[#A259FF]/10 border-[#A259FF]/20 text-[#A259FF]'
    };
  }

  // 5. Power BI / Business Intelligence / Tableau
  if (textToScan.includes('power bi') || textToScan.includes('powerbi') || textToScan.includes('business intelligence') || textToScan.includes('dax') || textToScan.includes('tableau')) {
    return {
      type: 'custom',
      component: <PowerBiSvg className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />,
      bg: 'bg-[#F2C811]/15 border-[#F2C811]/30 text-[#D97706]'
    };
  }

  // 6. Odoo
  if (textToScan.includes('odoo')) {
    return {
      type: 'custom',
      component: <OdooSvg className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />,
      bg: 'bg-[#714B67]/15 border-[#714B67]/25 text-[#714B67]'
    };
  }

  // 7. Java / Spring
  if (textToScan.includes('java ') || textToScan.includes('java full') || textToScan.includes('spring boot')) {
    return {
      type: 'custom',
      component: <JavaSvg className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />,
      bg: 'bg-[#E76F00]/10 border-[#E76F00]/25 text-[#E76F00]'
    };
  }

  // 8. DevOps / Docker / Kubernetes
  if (textToScan.includes('docker') || textToScan.includes('kubernetes') || textToScan.includes('devops') || textToScan.includes('devsecops') || textToScan.includes('ci/cd')) {
    return {
      type: 'custom',
      component: <DockerSvg className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />,
      bg: 'bg-[#0db7ed]/15 border-[#0db7ed]/25 text-[#0db7ed]'
    };
  }

  // 9. SOC Analyst / Threat Intelligence / SIEM / Splunk
  if (textToScan.includes('soc') || textToScan.includes('threat') || textToScan.includes('siem') || textToScan.includes('splunk') || textToScan.includes('wireshark') || textToScan.includes('blue team')) {
    return {
      type: 'custom',
      component: <SocAnalystSvg className="w-6 h-6 object-contain shadow-2xs rounded-lg" />,
      bg: 'bg-transparent border-transparent'
    };
  }

  // 10. Cybersecurity / Ethical Hacking / Penetration Testing
  if (textToScan.includes('ethical hacking') || textToScan.includes('cybersecurity') || textToScan.includes('cyber') || textToScan.includes('penetration') || textToScan.includes('metasploit') || textToScan.includes('burp suite')) {
    return {
      type: 'custom',
      component: <CyberShieldSvg className="w-6 h-6 object-contain shadow-2xs rounded-lg" />,
      bg: 'bg-transparent border-transparent'
    };
  }

  // 11. Generative AI / LLM / LangChain / RAG
  if (textToScan.includes('generative ai') || textToScan.includes('llm') || textToScan.includes('langchain') || textToScan.includes('rag') || textToScan.includes('agent') || textToScan.includes('chatgpt') || textToScan.includes('prompt')) {
    return {
      type: 'custom',
      component: <AiNeuralSvg className="w-6 h-6 object-contain shadow-2xs rounded-lg" />,
      bg: 'bg-transparent border-transparent'
    };
  }

  // 12. Data Science / Machine Learning / Deep Learning
  if (textToScan.includes('data science') || textToScan.includes('machine learning') || textToScan.includes('deep learning') || textToScan.includes('scikit') || textToScan.includes('tensorflow') || textToScan.includes('pytorch')) {
    return {
      type: 'custom',
      component: <DataScienceSvg className="w-6 h-6 object-contain shadow-2xs rounded-lg" />,
      bg: 'bg-transparent border-transparent'
    };
  }

  // 13. Blockchain / ZKP / Web3
  if (textToScan.includes('blockchain') || textToScan.includes('zkp') || textToScan.includes('zero-knowledge') || textToScan.includes('solidity') || textToScan.includes('smart contract')) {
    return {
      type: 'custom',
      component: <BlockchainSvg className="w-6 h-6 object-contain shadow-2xs rounded-lg" />,
      bg: 'bg-transparent border-transparent'
    };
  }

  // 14. Quantum Computing
  if (textToScan.includes('quantum') || textToScan.includes('qiskit') || textToScan.includes('qubit')) {
    return {
      type: 'custom',
      component: <QuantumSvg className="w-6 h-6 object-contain shadow-2xs rounded-lg" />,
      bg: 'bg-transparent border-transparent'
    };
  }

  // 15. SQL / Database
  if (textToScan.includes('sql') || textToScan.includes('database') || textToScan.includes('postgres') || textToScan.includes('mongodb')) {
    return {
      type: 'custom',
      component: <SqlSvg className="w-6 h-6 object-contain shadow-2xs rounded-lg" />,
      bg: 'bg-transparent border-transparent'
    };
  }

  // 16. Fallbacks based on category / general tech
  if (course.category?.toLowerCase().includes('cyber') || course.category?.toLowerCase().includes('security')) {
    return {
      type: 'lucide',
      component: <ShieldCheck className="w-5 h-5 text-deep-navy" />,
      bg: 'bg-deep-navy/10 border-deep-navy/20'
    };
  }

  if (course.category?.toLowerCase().includes('data')) {
    return {
      type: 'lucide',
      component: <BarChart3 className="w-5 h-5 text-burnt-orange" />,
      bg: 'bg-burnt-orange/10 border-burnt-orange/20'
    };
  }

  return {
    type: 'lucide',
    component: <Code2 className="w-5 h-5 text-burnt-orange" />,
    bg: 'bg-warm-ivory border-light-taupe'
  };
};

export const CourseTechIcon: React.FC<CourseTechIconProps> = ({ course, className = '', size = 38 }) => {
  const iconConfig = getCourseIconElement(course);

  // If the icon is an integrated graphic box (like AI, SOC, CyberShield with embedded gradient background)
  if (iconConfig.bg.includes('bg-transparent')) {
    return (
      <div
        className={`flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-2xs hover:scale-105 transition-transform duration-200 ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        title={course.title}
      >
        {iconConfig.component}
      </div>
    );
  }

  return (
    <div
      className={`flex-shrink-0 flex items-center justify-center rounded-xl border shadow-2xs hover:scale-105 transition-transform duration-200 ${iconConfig.bg} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      title={course.title}
    >
      {iconConfig.component}
    </div>
  );
};
