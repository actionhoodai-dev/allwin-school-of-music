import { Send, Phone, Music } from 'lucide-react';
import Button from '@/components/ui/Button';
import MusicalNotes from '@/components/musical/MusicalNotes';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { BUSINESS } from '@/lib/constants';

export default function CTASection() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-navy text-white">
      {/* Background elements */}
      <MusicalNotes count={8} />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-deep via-navy to-purple-deep opacity-90" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-violet/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
          <Music className="w-4 h-4" />
          Admissions & Enquiries Open
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-white leading-tight">
          Ready to Begin Your <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">
            Musical Journey?
          </span>
        </h2>

        <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans leading-relaxed">
          Whether you aspire to learn Keyboard, Guitar, Violin, Vocal, Bharatham, or prepare for Trinity College London Grade Examinations, Allwin School of Music welcomes you.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button
            href="/contact"
            size="lg"
            className="w-full sm:w-auto shadow-2xl"
            icon={<Send className="w-5 h-5" />}
          >
            Enquire Now
          </Button>

          <Button
            href={BUSINESS.whatsappLink(BUSINESS.defaultWhatsappMessage)}
            external
            variant="whatsapp"
            size="lg"
            className="w-full sm:w-auto"
            icon={<WhatsAppIcon className="w-5 h-5 fill-white" />}
          >
            WhatsApp Us
          </Button>

          <Button
            href={BUSINESS.phoneLink}
            external
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20"
            icon={<Phone className="w-4 h-4 text-violet" />}
          >
            Call {BUSINESS.phoneFormatted}
          </Button>
        </div>

        <p className="text-xs text-white/50 italic pt-2">
          {BUSINESS.tagline} • Since {BUSINESS.established}
        </p>

      </div>
    </section>
  );
}
