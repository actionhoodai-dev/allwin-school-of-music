'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Send } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { getPublishedDocuments } from '@/lib/firebase/firestore';
import { BUSINESS } from '@/lib/constants';
import type { FAQ } from '@/types';

export default function FAQPage() {
  const [dbFaqs, setDbFaqs] = useState<FAQ[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs = [
    {
      question: 'What instruments and music courses are offered at Allwin School of Music?',
      answer:
        'Allwin School of Music offers structured training in Keyboard / Piano, Guitar (Acoustic and Classical), Violin, Vocal Music, Bharatham (Bharatanatyam), and Theory of Music.',
    },
    {
      question: 'Is Allwin School of Music affiliated with examination boards?',
      answer:
        'Yes. Allwin School of Music is affiliated with Trinity College London for Western Music Grade Examinations (Initial through Grade 8) and associated with Annamalai University, Chidambaram for Classical Music and traditional performing arts.',
    },
    {
      question: 'Where is Allwin School of Music located?',
      answer: `Our academy is located at Chinnathirupathi, Salem - 636008, Tamil Nadu, India. You can contact us directly at ${BUSINESS.phoneFormatted} or find directions on our Contact page.`,
    },
    {
      question: 'Can beginners with no prior musical background join?',
      answer:
        'Absolutely. Our programs are designed with systematic pedagogical progressions that introduce notation reading, rhythm exercises, finger posture, and instrument geography from the absolute beginner level.',
    },
    {
      question: 'What is the "Theory of Music" course?',
      answer:
        'Theory of Music is an academic study of notation reading, clefs, key signatures, scales, intervals, chords, time signatures, and music analysis. It prepares students for Trinity College London written grade examinations and builds complete musical literacy.',
    },
    {
      question: 'How can I enquire about batch timings and admissions?',
      answer:
        'You can submit an online enquiry through our website, message us directly via WhatsApp at +91 9489203683, or call us at 9489203683 to discuss available batch slots and course requirements.',
    },
  ];

  useEffect(() => {
    async function loadFaqs() {
      try {
        const data = await getPublishedDocuments<FAQ>('faqs', 'order', 'asc');
        setDbFaqs(data);
      } catch {
        setDbFaqs([]);
      }
    }
    loadFaqs();
  }, []);

  const faqsToDisplay = dbFaqs.length > 0 ? dbFaqs : defaultFaqs;

  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
            Got Questions?
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Frequently Asked <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">Questions</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans">
            Find answers regarding our music classes, affiliations, Trinity grade exams, and admissions in Salem.
          </p>
        </div>
      </section>

      {/* Accordion FAQ list */}
      <section className="py-20 bg-surface-dim">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {faqsToDisplay.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-border overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-lg text-navy hover:text-violet transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-violet shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-violet' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-text-secondary leading-relaxed border-t border-slate-100 bg-surface-dim/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}

          {/* CTA Box */}
          <div className="mt-12 p-8 rounded-3xl bg-navy text-white text-center space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-xl text-white">
              Have a Specific Question Not Listed Here?
            </h3>
            <p className="text-sm text-white/80 max-w-md mx-auto">
              Our team will be delighted to guide you regarding class schedules, course selection, or examination guidelines.
            </p>
            <Button
              href="/contact"
              size="md"
              icon={<Send className="w-4 h-4" />}
            >
              Contact Allwin School of Music
            </Button>
          </div>

        </div>
      </section>
    </div>
  );
}
