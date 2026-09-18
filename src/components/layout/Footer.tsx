import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing to Oxyfied tech insights!');
  };

  return (
    <footer className="bg-deep-navy text-deep-navy-200 border-t border-deep-navy-700 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group" aria-label="Oxyfied Home">
              <span className="font-display font-extrabold text-2xl tracking-tight text-white group-hover:text-burnt-orange transition-colors">
                Oxyfied
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-deep-navy-300">
              Oxyfied is an elite technology learning ecosystem and workforce partner. Master in-demand cybersecurity, AI, cloud systems, and data engineering through mentor-led capstones and verifiable industry credentials.
            </p>
            {/* Newsletter */}
            <form onSubmit={handleNewsletterSubmit} className="space-y-2.5 max-w-sm pt-2">
              <label htmlFor="newsletter-email" className="text-xs font-bold text-white uppercase tracking-wider block">
                Stay updated on new programs
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  id="newsletter-email"
                  placeholder="Enter your work email"
                  required
                  className="flex-1 px-3.5 py-2 text-xs bg-deep-navy-900 border border-deep-navy-700 rounded-lg focus:outline-none focus:border-burnt-orange text-white placeholder-deep-navy-400 transition-colors"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-burnt-orange text-white hover:bg-deep-orange rounded-lg transition-colors flex items-center justify-center font-bold shadow-sm cursor-pointer"
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Links Column 1: Programs & Projects */}
          <div>
            <h5 className="font-display font-bold text-white text-sm mb-4">Programs & Projects</h5>
            <ul className="space-y-2.5 text-xs text-deep-navy-300">
              <li>
                <Link to="/courses" className="hover:text-burnt-orange transition-colors">All Programs</Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-burnt-orange transition-colors font-medium text-white/90">Student Capstone Projects</Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-burnt-orange transition-colors">Resource Hub & Blog</Link>
              </li>
              <li>
                <Link to="/courses/cybersecurity-ethical-hacking" className="hover:text-burnt-orange transition-colors">Cybersecurity & Hacking</Link>
              </li>
              <li>
                <Link to="/courses/data-science-generative-ai" className="hover:text-burnt-orange transition-colors">Data Science & GenAI</Link>
              </li>
              <li>
                <Link to="/courses/cloud-security-devsecops" className="hover:text-burnt-orange transition-colors">Cloud Security & DevSecOps</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: For Organizations */}
          <div>
            <h5 className="font-display font-bold text-white text-sm mb-4">For Organizations</h5>
            <ul className="space-y-2.5 text-xs text-deep-navy-300">
              <li>
                <Link to="/hire-from-us" className="hover:text-burnt-orange transition-colors font-semibold text-white/95">Hire From Us</Link>
              </li>
              <li>
                <Link to="/corporate-training" className="hover:text-burnt-orange transition-colors">Corporate Training</Link>
              </li>
              <li>
                <Link to="/become-a-partner" className="hover:text-burnt-orange transition-colors">Become a Partner</Link>
              </li>
              <li>
                <Link to="/industry-collaboration" className="hover:text-burnt-orange transition-colors">Industry Collaboration</Link>
              </li>
              <li>
                <Link to="/verify-credential" className="hover:text-burnt-orange transition-colors">Credential Registry</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Company & Talent */}
          <div>
            <h5 className="font-display font-bold text-white text-sm mb-4">Company & Talent</h5>
            <ul className="space-y-2.5 text-xs text-deep-navy-300">
              <li>
                <Link to="/about" className="hover:text-burnt-orange transition-colors">About Oxyfied</Link>
              </li>
              <li>
                <Link to="/student-success" className="hover:text-burnt-orange transition-colors">Student Success & Placements</Link>
              </li>
              <li>
                <Link to="/leadership-council" className="hover:text-burnt-orange transition-colors">Leadership Council</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-burnt-orange transition-colors">Careers & Hiring</Link>
              </li>
              <li>
                <Link to="/become-an-instructor" className="hover:text-burnt-orange transition-colors">Become an Instructor</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 4: Support & Legal */}
          <div>
            <h5 className="font-display font-bold text-white text-sm mb-4">Support & Legal</h5>
            <ul className="space-y-2.5 text-xs text-deep-navy-300">
              <li>
                <Link to="/contact" className="hover:text-burnt-orange transition-colors">Contact Us & Support</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-burnt-orange transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-burnt-orange transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-burnt-orange transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-burnt-orange transition-colors">Disclaimer & Disclosures</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-deep-navy-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-deep-navy-400 font-medium">
            &copy; {currentYear} Oxyfied (Oxyfied.com). All rights reserved. Made for practical builders.
          </p>
          <div className="flex gap-3">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-deep-navy-900 hover:bg-burnt-orange text-deep-navy-300 hover:text-white rounded-lg transition-all" aria-label="Oxyfied LinkedIn Page">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-deep-navy-900 hover:bg-burnt-orange text-deep-navy-300 hover:text-white rounded-lg transition-all" aria-label="Oxyfied Instagram Page">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-deep-navy-900 hover:bg-burnt-orange text-deep-navy-300 hover:text-white rounded-lg transition-all" aria-label="Oxyfied YouTube Page">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12.5a29 29 0 0 0 .46 6.08 2.78 2.78 0 0 0 1.95 1.96C5.12 21 12 21 12 21s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12.5a29 29 0 0 0-.46-6.08z"></path>
                <polygon points="9.75 15.02 15.5 12.5 9.75 9.98 9.75 15.02"></polygon>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-deep-navy-900 hover:bg-burnt-orange text-deep-navy-300 hover:text-white rounded-lg transition-all" aria-label="Oxyfied Facebook Page">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
