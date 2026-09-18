import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { SEO } from '../../components/common/SEO';

export const PrivacyPolicy: React.FC = () => {
  const lastUpdated = 'September 18, 2026';

  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: (
        <>
          <p>
            Welcome to Oxyfied (&quot;Oxyfied&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (oxyfied.com), utilize our learning management system (LMS), enroll in courses, access browser-based virtual lab sandboxes, or use any related educational services.
          </p>
          <p className="mt-2">
            Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access or use our platform.
          </p>
        </>
      )
    },
    {
      id: 'information-we-collect',
      title: '2. Information We Collect',
      content: (
        <>
          <p>We collect information that you provide directly to us, information collected automatically when you navigate our platform, and information from verified third-party partners.</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-light-taupe">
              <h4 className="font-bold text-deep-navy text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-burnt-orange" />
                Account Information
              </h4>
              <p className="text-xs text-warm-gray leading-relaxed">
                Full name, email address, phone number, encrypted account credentials, profile avatar image, and user role configuration (student, mentor, or enterprise administrator).
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-light-taupe">
              <h4 className="font-bold text-deep-navy text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-burnt-orange" />
                Course &amp; Learning Information
              </h4>
              <p className="text-xs text-warm-gray leading-relaxed">
                Course enrollments, module and lesson progress timestamps, video playback states, capstone project submissions, assessment scores, mentor review feedback, and issued certificate records.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-light-taupe">
              <h4 className="font-bold text-deep-navy text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-burnt-orange" />
                Device &amp; Browser Information
              </h4>
              <p className="text-xs text-warm-gray leading-relaxed">
                IP address, browser type and version, operating system, device screen resolution, session identifiers, approximate geographic region (country/city level), and security login activity records.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-light-taupe">
              <h4 className="font-bold text-deep-navy text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-burnt-orange" />
                Website Usage &amp; Interactions
              </h4>
              <p className="text-xs text-warm-gray leading-relaxed">
                Pages viewed, referring URLs, search queries, click paths, timestamp data, and interactions with instructional UI elements.
              </p>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'cookies',
      title: '3. Cookies and Similar Technologies',
      content: (
        <p>
          We use essential session tokens and persistent cookies to keep you authenticated, remember your interface preferences (such as code editor themes and playback volume), measure system performance, and detect unauthorized multi-device account sharing. You can manage or disable cookies through your browser settings; however, certain core authenticated features of the learning portal may not function properly without essential cookies.
        </p>
      )
    },
    {
      id: 'how-we-use-information',
      title: '4. How We Use Information',
      content: (
        <>
          <p>We process your personal information for lawful and legitimate educational purposes, including:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-xs leading-relaxed text-warm-gray pl-1">
            <li>Providing, personalizing, and maintaining our learning environment and course curricula.</li>
            <li>Tracking individual lesson progression and verifying practical project completions.</li>
            <li>Reviewing and issuing authentic, verifiable digital certificates with unique registry hashes.</li>
            <li>Facilitating mentor-student communication, feedback loops, and live technical office hours.</li>
            <li>Processing transactional invoices, course enrollments, and support desk inquiries.</li>
            <li>Preventing fraudulent logins, unauthorized access, and violations of our Terms of Service.</li>
            <li>Improving curriculum relevance through aggregated analytics on common student bottlenecks.</li>
          </ul>
        </>
      )
    },
    {
      id: 'how-we-share-information',
      title: '5. How We Share Information',
      content: (
        <>
          <p>
            Oxyfied does not sell, rent, or trade your personal information to third-party advertisers. We only share information under strict operational guidelines:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-xs leading-relaxed text-warm-gray pl-1">
            <li><strong className="text-deep-navy font-semibold">Authorized Mentors:</strong> Lead mentors assigned to your enrolled courses receive your name, project submissions, and progress metrics to deliver personalized assessments.</li>
            <li><strong className="text-deep-navy font-semibold">Service Providers:</strong> Cloud infrastructure (Neon PostgreSQL, AWS hosting), secure media streaming, and transactional email gateways bound by confidentiality agreements.</li>
            <li><strong className="text-deep-navy font-semibold">Credential Verification:</strong> When a third party searches your unique certificate number on our public registry, only your name, completed program, and issuance date are displayed to verify legitimacy.</li>
            <li><strong className="text-deep-navy font-semibold">Legal Compliance:</strong> If required by law, subpoena, or governmental regulatory authority to comply with valid legal processes.</li>
          </ul>
        </>
      )
    },
    {
      id: 'data-security',
      title: '6. Data Security & Retention',
      content: (
        <p>
          We implement industry-standard cryptographic practices including HTTPS TLS encryption in transit, bcrypt hashed credentials, and segregated database access controls. Your learning records and issued credentials are maintained for as long as your account remains active or as needed to maintain verifiable credential registry archives. You may request account deletion at any time by contacting our privacy officer.
        </p>
      )
    },
    {
      id: 'user-rights',
      title: '7. Your Rights & Choices',
      content: (
        <>
          <p>Depending on your jurisdiction, you maintain specific rights regarding your personal data:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-xs leading-relaxed text-warm-gray pl-1">
            <li><strong className="text-deep-navy font-semibold">Access &amp; Export:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong className="text-deep-navy font-semibold">Rectification:</strong> Correct inaccurate or incomplete profile details via your account settings.</li>
            <li><strong className="text-deep-navy font-semibold">Deletion:</strong> Request erasure of your account and personal identifiers, subject to credential archival constraints.</li>
            <li><strong className="text-deep-navy font-semibold">Opt-Out:</strong> Unsubscribe from marketing communications at any time via the link in our emails.</li>
          </ul>
        </>
      )
    },
    {
      id: 'children-privacy',
      title: '8. Children&apos;s Privacy',
      content: (
        <p>
          Our services are designed for adult learners, university students, and technology professionals. We do not knowingly collect personal identifiable information from children under the age of 13. If you believe a minor has registered an account without parental consent, please contact us immediately.
        </p>
      )
    },
    {
      id: 'changes',
      title: '9. Changes to This Privacy Policy',
      content: (
        <p>
          We may update this Privacy Policy periodically to reflect enhancements to our learning systems or legal obligations. We will notify you of any material modifications by updating the &quot;Last Updated&quot; date at the top of this document or via email notification where required.
        </p>
      )
    },
    {
      id: 'contact',
      title: '10. Contact Information',
      content: (
        <div className="bg-warm-ivory p-4 rounded-xl border border-light-taupe space-y-2 text-xs">
          <p className="text-deep-navy font-semibold">For privacy inquiries, data subject access requests, or compliance questions:</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-warm-gray pt-1">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-burnt-orange" />
              privacy@oxyfied.com
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-burnt-orange" />
              Oxyfied Privacy &amp; Compliance Office
            </span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Privacy Policy" 
        description="Review Oxyfied's Privacy Policy to understand how we collect, safeguard, and manage your data across our learning platform."
        canonical="/privacy-policy"
      />

      {/* Header */}
      <section className="bg-warm-white py-14 sm:py-18 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            Legal &amp; Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-deep-navy tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm max-w-xl mx-auto">
            Last updated: {lastUpdated}. Learn how we protect your personal data and respect your digital rights.
          </p>
        </div>
      </section>

      {/* Content layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-warm-white rounded-2xl border border-light-taupe shadow-xs p-6 sm:p-10 space-y-10 text-left">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24 space-y-2.5">
              <h2 className="text-base sm:text-lg font-display font-bold text-deep-navy border-b border-light-taupe/80 pb-2">
                {section.title}
              </h2>
              <div className="text-xs sm:text-sm text-warm-gray leading-relaxed space-y-2">
                {section.content}
              </div>
            </div>
          ))}

          <div className="border-t border-light-taupe pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-warm-gray">
            <span>Questions regarding this policy?</span>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 font-bold text-burnt-orange hover:text-deep-orange transition-colors"
            >
              <span>Contact Support Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
