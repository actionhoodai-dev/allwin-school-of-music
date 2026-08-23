// ============================================
// Official Floating WhatsApp Button Widget
// ============================================

'use client';

import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { BUSINESS } from '@/lib/constants';

interface WhatsAppButtonProps {
  message?: string;
  courseName?: string;
}

export default function WhatsAppButton({ message, courseName }: WhatsAppButtonProps) {
  const finalMessage = message
    ? message
    : courseName
    ? `Hello Allwin School of Music, I am interested in ${courseName} classes.`
    : BUSINESS.defaultWhatsappMessage;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={BUSINESS.whatsappLink(finalMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Allwin School of Music on WhatsApp"
        className="group relative flex items-center justify-center"
      >
        {/* Soft pulse glow ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />

        {/* Floating circular button */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:bg-[#20BD5A] hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/40">
          <WhatsAppIcon className="w-8 h-8 fill-white" />
        </div>

        {/* Hover label tooltip */}
        <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-navy/90 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-white/10 backdrop-blur-md">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
