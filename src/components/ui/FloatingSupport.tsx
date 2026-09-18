import React, { useState } from 'react';
import { MessageSquare, X, MessageCircle, Mail, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingSupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionSent, setQuestionSent] = useState(false);

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    
    // Simulate API delivery
    console.log('User submitted support question:', questionText);
    setQuestionSent(true);
    setQuestionText('');
    setTimeout(() => {
      setQuestionSent(false);
    }, 3000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 bg-warm-white rounded-2xl shadow-2xl border border-light-taupe overflow-hidden"
          >
            {/* Header */}
            <div className="bg-deep-navy text-white p-4 flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-white text-base">Oxyfied Support</h4>
                <p className="text-xs text-deep-navy-200 mt-0.5">We typically reply in minutes</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-deep-navy-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content / Options */}
            <div className="p-4 space-y-3 bg-warm-white">
              {/* Option: WhatsApp */}
              <a
                href="https://wa.me/918547755667" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-sage-green-50 hover:bg-sage-green-100 border border-sage-green-200 text-deep-navy rounded-xl transition-all group"
              >
                <div className="p-2 rounded-lg bg-sage-green text-white">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-sm font-bold text-deep-navy block group-hover:text-sage-green-800">Chat on WhatsApp</span>
                  <span className="text-[11px] text-warm-gray block">Instant technical assistance</span>
                </div>
              </a>

              {/* Option: Email */}
              <a
                href="mailto:support@oxyfied.com"
                className="flex items-center gap-3 p-3 bg-warm-ivory hover:bg-soft-beige border border-light-taupe text-deep-navy rounded-xl transition-all group"
              >
                <div className="p-2 rounded-lg bg-deep-navy text-white">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-deep-navy block group-hover:text-burnt-orange">Email Support</span>
                  <span className="text-[11px] text-warm-gray block">support@oxyfied.com</span>
                </div>
              </a>

              {/* Option: Ask a Question Quick Form */}
              <div className="border-t border-light-taupe pt-3">
                <span className="text-xs font-bold text-deep-navy uppercase tracking-wider block mb-2">Ask a Question</span>
                
                {questionSent ? (
                  <div className="p-3 bg-sage-green-50 border border-sage-green-200 text-sage-green-800 rounded-lg text-xs text-center font-medium">
                    Question received! We will reach out via email shortly.
                  </div>
                ) : (
                  <form onSubmit={handleSendQuestion} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your question..."
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-warm-ivory border border-light-taupe text-xs text-deep-navy placeholder-warm-gray rounded-lg focus:outline-none focus:border-burnt-orange"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-burnt-orange text-white rounded-lg hover:bg-deep-orange transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle support options"
        className="p-4 bg-burnt-orange hover:bg-deep-orange text-white rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
      >
        {isOpen ? <X className="w-6 h-6 animate-pulse" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};
