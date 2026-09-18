import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenId?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenId
}) => {
  const [openIds, setOpenIds] = useState<string[]>(
    defaultOpenId ? [defaultOpenId] : []
  );

  const handleToggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((openId) => openId !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="border border-light-taupe rounded-xl bg-warm-white overflow-hidden shadow-sm hover:border-burnt-orange/50 transition-colors"
          >
            {/* Header Click Area */}
            <button
              onClick={() => handleToggle(item.id)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-deep-navy hover:text-burnt-orange transition-colors focus:outline-none focus:bg-warm-ivory/50"
            >
              <div className="flex-1 pr-4">
                <span className="font-display font-bold text-deep-navy sm:text-base text-sm block">
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="text-xs text-warm-gray font-normal mt-0.5 block">
                    {item.subtitle}
                  </span>
                )}
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className={`flex-shrink-0 ${isOpen ? 'text-burnt-orange' : 'text-warm-gray'}`}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>

            {/* Collapsible Content Area */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="border-t border-light-taupe/60 p-4 sm:p-5 bg-warm-ivory/40 text-sm text-warm-gray leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
