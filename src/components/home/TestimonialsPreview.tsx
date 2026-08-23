'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getPublishedDocuments } from '@/lib/firebase/firestore';
import { DEFAULT_TESTIMONIALS } from '@/lib/constants';
import type { Testimonial } from '@/types';

export default function TestimonialsPreview() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const data = await getPublishedDocuments<Testimonial>('testimonials', 'createdAt', 'desc');
        if (data && data.length > 0) {
          setTestimonials(data.slice(0, 3));
        } else {
          setTestimonials(DEFAULT_TESTIMONIALS.slice(0, 3) as any);
        }
      } catch {
        setTestimonials(DEFAULT_TESTIMONIALS.slice(0, 3) as any);
      }
    }
    loadTestimonials();
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-deep/5 text-violet text-xs font-semibold uppercase tracking-wider">
            Voices of Allwin • 5-Star Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy tracking-tight">
            What Our Students & Parents <span className="gradient-text">Say</span>
          </h2>
          <p className="text-base text-text-secondary">
            Authentic Google reviews from learners and families in Salem.
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <GlassCard
              key={t.id || idx}
              variant="light"
              hover
              className="p-7 border border-slate-200 bg-white flex flex-col justify-between rounded-3xl shadow-md hover:shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  {t.date && (
                    <span className="text-xs text-text-muted">{t.date}</span>
                  )}
                </div>
                <p className="text-sm text-text-secondary italic leading-relaxed">
                  &ldquo;{t.testimonial}&rdquo;
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-semibold text-sm text-navy">{t.name}</h4>
                  {t.course && (
                    <p className="text-xs text-violet font-medium">{t.course}</p>
                  )}
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                  Google Review
                </span>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-deep/5 text-violet font-semibold hover:bg-violet hover:text-white transition-all shadow-sm"
          >
            <span>Read All 28+ Testimonials & Google Reviews</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
