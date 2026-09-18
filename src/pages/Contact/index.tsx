import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { Accordion } from '../../components/ui/Accordion';
import { SEO } from '../../components/common/SEO';
import { enquiryService } from '../../services/enquiryService';

// Form validation schema using Zod
const contactSchema = zod.object({
  name: zod.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: zod.string().email({ message: 'Please enter a valid email address.' }),
  phone: zod.string().optional(),
  subject: zod.string().min(4, { message: 'Subject must be at least 4 characters.' }),
  message: zod.string().min(10, { message: 'Message must be at least 10 characters.' })
});

type ContactFormData = zod.infer<typeof contactSchema>;

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setApiError(null);
      await enquiryService.submitEnquiry({
        type: 'contact',
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message
      });
      setSubmitted(true);
      reset();
      setTimeout(() => {
        setSubmitted(false);
      }, 6000);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit enquiry. Please try again.');
    }
  };

  const faqItems = [
    {
      id: 'faq-c1',
      title: 'Can I request corporate team training?',
      content: 'Yes! Oxyfied offers group registration rates and custom labs configurations for corporate technology teams. Please mention "Corporate Training" in the Subject field to route your request to our enterprise accounts department.'
    },
    {
      id: 'faq-c2',
      title: 'How do I request a refund?',
      content: 'We offer a 14-day refund window on all core tracks, provided you have completed less than 20% of the lessons and have not downloaded multiple course lab folders. Email support@oxyfied.com directly to initiate a request.'
    },
    {
      id: 'faq-c3',
      title: 'How can I apply to become an instructor?',
      content: 'If you have over 5 years of production technology experience in cloud engineering, DevOps, data systems, or cybersecurity operations and a passion for project-based learning, email your resume to info@oxyfied.com.'
    }
  ].map((faq) => ({
    id: faq.id,
    title: faq.title,
    content: <p className="text-xs leading-relaxed text-warm-gray">{faq.content}</p>
  }));

  return (
    <div className="bg-warm-ivory min-h-screen">
      <SEO 
        title="Contact Support" 
        description="Get in touch with Oxyfied support, request enterprise training packages, or read through our enrollment FAQ directory."
        canonical="/contact"
      />

      {/* Contact Hero */}
      <section className="bg-warm-ivory py-16 text-center relative overflow-hidden border-b border-light-taupe">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,107,33,0.08),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <MessageSquare className="w-3.5 h-3.5" />
            Support Desk
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            How Can We <span className="text-burnt-orange">Help You?</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Reach out for technical questions, enrollment help, curriculum guidance, or corporate training inquiries.
          </p>
        </div>
      </section>

      {/* Main Form & Contact Info layout (Grid: Form (7) vs Details (5)) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        
        {/* Form Panel (7 cols) */}
        <div className="lg:col-span-7 bg-warm-white border border-light-taupe p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-display font-bold text-deep-navy border-b border-light-taupe pb-3">
            Send Us a Message
          </h2>

          {submitted && (
            <div className="p-4 bg-sage-green/15 border border-sage-green/30 text-deep-navy text-xs rounded-xl flex items-start gap-2.5 font-medium animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-sage-green flex-shrink-0" />
              <div>
                <span className="font-bold block text-deep-navy">Support Request Received!</span>
                <span className="text-warm-gray">We have cataloged your ticket and will follow up via email within 24 hours.</span>
              </div>
            </div>
          )}

          {apiError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5 font-medium animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field: Name */}
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Full Name
                </label>
                <input
                  type="text"
                  id="contact-name"
                  placeholder="e.g. John Doe"
                  {...register('name')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy placeholder-warm-gray/60 focus:outline-none focus:bg-warm-white transition-all ${
                    errors.name ? 'border-red-500 focus:border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.name && <span className="text-[10px] text-red-600 font-medium">{errors.name.message}</span>}
              </div>

              {/* Field: Email */}
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Email Address
                </label>
                <input
                  type="email"
                  id="contact-email"
                  placeholder="e.g. john@example.com"
                  {...register('email')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy placeholder-warm-gray/60 focus:outline-none focus:bg-warm-white transition-all ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.email && <span className="text-[10px] text-red-600 font-medium">{errors.email.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field: Phone */}
              <div className="space-y-1.5">
                <label htmlFor="contact-phone" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  id="contact-phone"
                  placeholder="e.g. +91 8547755667"
                  {...register('phone')}
                  className="w-full px-3.5 py-2.5 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy placeholder-warm-gray/60 focus:outline-none focus:bg-warm-white focus:border-burnt-orange transition-all"
                />
              </div>

              {/* Field: Subject */}
              <div className="space-y-1.5">
                <label htmlFor="contact-subject" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                  Subject
                </label>
                <input
                  type="text"
                  id="contact-subject"
                  placeholder="e.g. Corporate Rates, Login Issues"
                  {...register('subject')}
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy placeholder-warm-gray/60 focus:outline-none focus:bg-warm-white transition-all ${
                    errors.subject ? 'border-red-500 focus:border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                  }`}
                />
                {errors.subject && <span className="text-[10px] text-red-600 font-medium">{errors.subject.message}</span>}
              </div>
            </div>

            {/* Field: Message */}
            <div className="space-y-1.5">
              <label htmlFor="contact-message" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
                Message Body
              </label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="Describe your request or question in detail..."
                {...register('message')}
                className={`w-full px-3.5 py-2.5 bg-warm-ivory border rounded-xl text-xs text-deep-navy placeholder-warm-gray/60 focus:outline-none focus:bg-warm-white transition-all ${
                  errors.message ? 'border-red-500 focus:border-red-500' : 'border-light-taupe focus:border-burnt-orange'
                }`}
              />
              {errors.message && <span className="text-[10px] text-red-600 font-medium">{errors.message.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Info & FAQ Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Contacts details */}
          <div className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-sm space-y-5">
            <h3 className="font-display font-bold text-base text-deep-navy border-b border-light-taupe pb-3">
              Contact Information
            </h3>
            
            <div className="space-y-4 text-xs text-warm-gray">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 mt-0.5">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-deep-navy block text-sm">General Support</span>
                  <a href="mailto:support@oxyfied.com" className="text-burnt-orange hover:text-deep-orange hover:underline">
                    support@oxyfied.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-sage-green/15 border border-sage-green/30 flex items-center justify-center text-sage-green flex-shrink-0 mt-0.5">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-deep-navy block text-sm">Phone Queries</span>
                  <a href="tel:+918547755667" className="text-warm-gray hover:text-burnt-orange transition-colors block">
                    +91 8547755667
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-deep-navy/10 border border-deep-navy/20 flex items-center justify-center text-deep-navy flex-shrink-0 mt-0.5">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-deep-navy block text-sm">Corporate HQ</span>
                  <span className="text-warm-gray">Oxyfied Technologies, 100 Pine St, San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQs */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-deep-navy flex items-center gap-2 px-1">
              <HelpCircle className="w-5 h-5 text-burnt-orange" />
              Support FAQs
            </h3>
            <Accordion items={faqItems} allowMultiple={true} />
          </div>
        </div>

      </section>
    </div>
  );
};
