import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Clock, CreditCard, Mail, ArrowRight } from 'lucide-react';
import { SEO } from '../../components/common/SEO';

export const RefundPolicy: React.FC = () => {
  const lastUpdated = 'September 18, 2026';

  const sections = [
    {
      id: 'purchases',
      title: '1. Course & Program Purchases',
      content: (
        <p>
          Oxyfied offers industry-aligned master programs, specialty courses, and practical technical labs. All enrollment fees and subscription prices are clearly listed at checkout prior to final payment authorization. By completing an enrollment transaction, you receive immediate digital access to learning modules, project specifications, and mentor workspaces.
        </p>
      )
    },
    {
      id: 'cancellation',
      title: '2. Enrollment Cancellation & Refund Window',
      content: (
        <>
          <p>
            We strive to provide exceptional practical education. If you determine that a program does not meet your learning expectations, you may submit a formal cancellation request within the standard evaluation period:
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-deep-navy my-3 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <Clock className="w-4 h-4 text-amber-700" />
              Standard Refund Evaluation Window: [Configurable: 7 to 14 Days from Enrollment]
            </div>
            <p className="text-warm-gray leading-relaxed">
              Refund requests must be submitted in writing to support@oxyfied.com from your registered account email within the designated evaluation window following course activation.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'eligibility',
      title: '3. Refund Eligibility Criteria',
      content: (
        <>
          <p>To qualify for a program fee refund, all of the following conditions must be satisfied:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-xs leading-relaxed text-warm-gray pl-1">
            <li>The written request is received within the designated policy window from the initial purchase date.</li>
            <li>Course progression does not exceed [Configurable Policy Limit: e.g. 20% of total curriculum lessons].</li>
            <li>No capstone project submissions or graded assessments have been submitted for official mentor evaluation.</li>
            <li>No Certificate of Completion or verifiable credential has been generated or issued for the enrolled track.</li>
          </ul>
        </>
      )
    },
    {
      id: 'non-refundable',
      title: '4. Non-Refundable Items & Services',
      content: (
        <>
          <p>The following items and specialized services are strictly non-refundable once initiated or delivered:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-xs leading-relaxed text-warm-gray pl-1">
            <li>Custom enterprise cohort training agreements and dedicated corporate cloud lab deployments.</li>
            <li>Individual 1-on-1 private mentoring sessions that have already been conducted or cancelled with less than 24 hours notice.</li>
            <li>Issued and verified digital credentials, blockchain/registry recording fees, or re-issuance processing fees.</li>
            <li>Downloaded proprietary offline exercise files and source asset bundles where digital rights have been transferred.</li>
          </ul>
        </>
      )
    },
    {
      id: 'processing-timelines',
      title: '5. Processing Timelines & Methods',
      content: (
        <p>
          Once an eligible refund request is reviewed and approved by our finance department, the refund is initiated within [Configurable: 5 to 7 Business Days]. Funds are automatically returned to the original payment method (credit card, debit card, or banking portal) used during the transaction. Depending on your financial institution, posting to your bank statement may take an additional 3 to 10 business days.
        </p>
      )
    },
    {
      id: 'duplicate-payments',
      title: '6. Duplicate Payments & Failed Transactions',
      content: (
        <p>
          In the event of a duplicate charge resulting from technical network timeouts or accidental multi-clicks during checkout, the excess charge will be refunded in full immediately upon verification by our support desk. If your payment method was charged but your course access was not activated, contact support with your transaction reference number for immediate reconciliation.
        </p>
      )
    },
    {
      id: 'contact',
      title: '7. How to Request a Refund or Support',
      content: (
        <div className="bg-warm-ivory p-4 rounded-xl border border-light-taupe space-y-2 text-xs">
          <p className="text-deep-navy font-semibold">To submit a cancellation request or report billing discrepancies:</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-warm-gray pt-1">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-burnt-orange" />
              support@oxyfied.com (Subject: &quot;Refund Request - [Course Name]&quot;)
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-burnt-orange" />
              Oxyfied Billing &amp; Student Accounts
            </span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-warm-ivory min-h-screen text-stone-900">
      <SEO 
        title="Refund & Cancellation Policy" 
        description="Review Oxyfied's Refund and Cancellation Policy regarding program purchases, eligibility criteria, processing timelines, and billing support."
        canonical="/refund-policy"
      />

      {/* Header */}
      <section className="bg-warm-white py-14 sm:py-18 border-b border-light-taupe text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <RotateCcw className="w-3.5 h-3.5" />
            Billing Guidelines
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-deep-navy tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm max-w-xl mx-auto">
            Last updated: {lastUpdated}. Clear, transparent guidelines for course enrollments, evaluation windows, and payment reconciliations.
          </p>
        </div>
      </section>

      {/* Content */}
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
            <span>Need assistance with an existing enrollment or invoice?</span>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 font-bold text-burnt-orange hover:text-deep-orange transition-colors"
            >
              <span>Contact Student Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
