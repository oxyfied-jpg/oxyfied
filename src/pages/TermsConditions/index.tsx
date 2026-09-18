import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowRight, Mail } from 'lucide-react';
import { SEO } from '../../components/common/SEO';

export const TermsConditions: React.FC = () => {
  const lastUpdated = 'September 18, 2026';

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: (
        <p>
          By creating an account, accessing the Oxyfied website, purchasing course enrollments, or interacting with our learning systems, you agree to be bound by these Terms &amp; Conditions (&quot;Terms&quot;) and our Privacy Policy. If you do not agree to all terms and conditions stated herein, you must immediately discontinue use of the platform.
        </p>
      )
    },
    {
      id: 'eligibility',
      title: '2. Eligibility & Account Registration',
      content: (
        <>
          <p>
            To use our platform, you must be at least 18 years of age or the age of majority in your jurisdiction, or have express permission from a parent or legal guardian.
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-xs leading-relaxed text-warm-gray pl-1">
            <li>You agree to provide accurate, current, and complete registration information.</li>
            <li>You are solely responsible for maintaining the confidentiality of your credentials and account password.</li>
            <li>Accounts are individual and non-transferable; credential sharing, concurrent device leasing, or reselling course access is strictly prohibited.</li>
            <li>You must notify Oxyfied immediately of any unauthorized access to your account.</li>
          </ul>
        </>
      )
    },
    {
      id: 'course-access',
      title: '3. Courses & Learning Content Access',
      content: (
        <>
          <p>
            Upon successful enrollment in a course track, Oxyfied grants you a limited, non-exclusive, non-transferable, revocable license to access instructional videos, code repositories, assignments, and sandbox environments strictly for your personal, non-commercial educational use.
          </p>
          <p className="mt-2 text-xs text-warm-gray leading-relaxed">
            Course access durations and curriculum updates are provided according to the specific track tier selected during checkout. Oxyfied reserves the right to revise, modernize, or update course syllabi and lab architectures to maintain high industry alignment.
          </p>
        </>
      )
    },
    {
      id: 'intellectual-property',
      title: '4. Intellectual Property Rights',
      content: (
        <p>
          All educational materials, video lessons, code demonstrations, diagrams, brand assets, and platform architecture provided on Oxyfied are the proprietary intellectual property of Oxyfied and its authorized mentors. You may not record, scrape, redistribute, republish, decompile, or create derivative commercial training offerings from our materials without explicit prior written consent.
        </p>
      )
    },
    {
      id: 'prohibited-activities',
      title: '5. Prohibited Activities',
      content: (
        <>
          <p>When using Oxyfied systems, you explicitly agree not to:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-xs leading-relaxed text-warm-gray pl-1">
            <li>Deploy malicious exploits, port scans, or denial-of-service tests against Oxyfied infrastructure outside designated, isolated sandbox targets.</li>
            <li>Submit plagiarized project code or claim third-party open-source implementations as your original capstone output.</li>
            <li>Harass, abuse, or use hate speech in mentor communications or community channels.</li>
            <li>Attempt to reverse-engineer platform security controls or tamper with certificate registry generation.</li>
          </ul>
        </>
      )
    },
    {
      id: 'projects-submissions',
      title: '6. Projects & Capstone Submissions',
      content: (
        <p>
          Students retain ownership of original code and documentation created during their capstone projects. By submitting projects to Oxyfied for mentor grading, you grant Oxyfied a non-exclusive license to review, execute, evaluate, and verify your submission for credential qualification and plagiarism auditing.
        </p>
      )
    },
    {
      id: 'certificates',
      title: '7. Certificates & Credential Issuance Workflow',
      content: (
        <>
          <p className="font-semibold text-deep-navy">
            Important Notice on Credential Qualification:
          </p>
          <p className="mt-1">
            Course enrollment or passive video watching does not automatically guarantee issuance of an Oxyfied Certificate of Completion. In accordance with Oxyfied&apos;s rigorous quality standards, certificate generation follows a structured multi-tier workflow:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-xs leading-relaxed text-warm-gray pl-1">
            <li><strong>Syllabus Progress:</strong> All mandatory modules, lessons, and quizzes must be 100% completed.</li>
            <li><strong>Capstone Submission:</strong> Required practical lab projects must be submitted through the student workspace.</li>
            <li><strong>Mentor Review &amp; Grant:</strong> Assigned technical mentors or course administrators review and officially approve submissions before a verifiable credential hash is generated.</li>
            <li><strong>Registry Verification:</strong> Verified certificates are recorded on the public registry at <code>/verify-credential</code> for independent employer verification. Oxyfied reserves the right to revoke credentials obtained through fraudulent submissions.</li>
          </ul>
        </>
      )
    },
    {
      id: 'payments-refunds',
      title: '8. Payments & Billing',
      content: (
        <p>
          All program prices and applicable taxes are stated at checkout in the local designated currency. Transactions are processed through encrypted payment processors. Refund terms are governed exclusively by our published <Link to="/refund-policy" className="text-burnt-orange font-semibold hover:underline">Refund Policy</Link>.
        </p>
      )
    },
    {
      id: 'third-party',
      title: '9. Third-Party Services & External Tools',
      content: (
        <p>
          Certain learning tracks may reference external development environments, GitHub repositories, cloud platforms (e.g. AWS, Splunk, Docker), or APIs. Oxyfied does not control third-party service availability and is not liable for changes in third-party licensing or service terms.
        </p>
      )
    },
    {
      id: 'termination',
      title: '10. Suspension & Termination',
      content: (
        <p>
          Oxyfied reserves the right to suspend or terminate your account without notice if you violate these Terms, engage in academic dishonesty, attempt unauthorized system tampering, or fail to settle outstanding enrollment fees.
        </p>
      )
    },
    {
      id: 'liability',
      title: '11. Limitation of Liability',
      content: (
        <p>
          To the fullest extent permitted by law, Oxyfied and its affiliates, instructors, and directors shall not be liable for indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to access the platform.
        </p>
      )
    },
    {
      id: 'governing-law',
      title: '12. Governing Law & Dispute Resolution',
      content: (
        <p>
          These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any legal disputes arising under these Terms shall be resolved through good-faith mediation prior to formal jurisdiction proceedings.
        </p>
      )
    },
    {
      id: 'contact',
      title: '13. Contact Information',
      content: (
        <div className="bg-warm-ivory p-4 rounded-xl border border-light-taupe space-y-2 text-xs">
          <p className="text-deep-navy font-semibold">For legal inquiries or questions regarding these Terms &amp; Conditions:</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-warm-gray pt-1">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-burnt-orange" />
              legal@oxyfied.com
            </span>
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-burnt-orange" />
              Oxyfied Legal Operations
            </span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Terms & Conditions" 
        description="Read the Terms and Conditions governing your use of the Oxyfied learning platform, course access, project grading, and credential verification."
        canonical="/terms-and-conditions"
      />

      {/* Header */}
      <section className="bg-warm-white py-14 sm:py-18 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" />
            Terms of Service
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-deep-navy tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm max-w-xl mx-auto">
            Last updated: {lastUpdated}. Please review the operational and academic guidelines governing the Oxyfied platform.
          </p>
        </div>
      </section>

      {/* Main Body */}
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
            <span>Have questions about our certificate process?</span>
            <Link
              to="/verify-credential"
              className="inline-flex items-center gap-1.5 font-bold text-burnt-orange hover:text-deep-orange transition-colors"
            >
              <span>View Credential Verification Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
