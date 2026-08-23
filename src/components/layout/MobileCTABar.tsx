// ============================================
// MobileCTABar Component — Sticky Bottom CTA Bar
// ============================================

import Link from 'next/link';
import { Phone, Send } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { BUSINESS } from '@/lib/constants';

export default function MobileCTABar() {
  return (
    <aside
      aria-label="Quick contact actions"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-navy/95 backdrop-blur-xl border-t border-white/10 px-3 py-2 shadow-2xl"
    >
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* Call CTA */}
        <a
          href={BUSINESS.phoneLink}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-all text-center"
        >
          <Phone className="w-4 h-4 text-violet mb-0.5" />
          <span className="text-[11px] font-medium leading-none">Call Now</span>
        </a>

        {/* WhatsApp CTA with official icon */}
        <a
          href={BUSINESS.whatsappLink(BUSINESS.defaultWhatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/30 transition-all text-center"
        >
          <WhatsAppIcon className="w-4 h-4 mb-0.5 fill-[#25D366]" />
          <span className="text-[11px] font-medium leading-none">WhatsApp</span>
        </a>

        {/* Enquire CTA */}
        <Link
          href="/contact"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl btn-gradient text-white shadow-md transition-all text-center"
        >
          <Send className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] font-medium leading-none">Enquire</span>
        </Link>
      </div>
    </aside>
  );
}
