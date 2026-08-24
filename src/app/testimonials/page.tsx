'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Calendar, ExternalLink, MessageSquareQuote, Search, Filter } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { getPublishedDocuments } from '@/lib/firebase/firestore';
import { DEFAULT_TESTIMONIALS } from '@/lib/constants';
import { useSiteSettings } from '@/context/SettingsContext';
import type { Testimonial } from '@/types';

export default function TestimonialsPage() {
  const { settings } = useSiteSettings();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS as any);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublishedDocuments<Testimonial>('testimonials', 'createdAt', 'desc');
        if (data && data.length > 0) {
          // Combine dynamic reviews with default reviews (avoiding duplicates)
          const dynamicIds = new Set(data.map((d) => d.id));
          const filteredDefaults = DEFAULT_TESTIMONIALS.filter((d) => !dynamicIds.has(d.id));
          setTestimonials([...data, ...(filteredDefaults as any)]);
        }
      } catch {
        setTestimonials(DEFAULT_TESTIMONIALS as any);
      }
    }
    load();
  }, []);

  const filteredTestimonials = testimonials.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.testimonial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.course && t.course.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRating =
      selectedRating === 'all' || (t.rating || 5) === selectedRating;

    return matchesSearch && matchesRating;
  });

  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
            Verified Google Reviews &amp; Experiences
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Student &amp; Parent <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">Testimonials</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans">
            Genuine 5-star ratings and feedback from over 15+ years of music mentoring at {settings.businessName} in Salem.
          </p>

          <div className="pt-2 flex items-center justify-center gap-4">
            <a
              href={settings.googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-navy font-bold text-sm sm:text-base shadow-xl hover:bg-amber-50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] border-2 border-amber-300/40 cursor-pointer"
            >
              <Star className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
              <span className="text-[#0a1628] font-bold">View on Google Maps (5.0 ★)</span>
              <ExternalLink className="w-4 h-4 text-[#0a1628]/70 shrink-0" />
            </a>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="py-8 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reviews by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-dim border border-border text-sm focus:outline-none focus:ring-2 focus:ring-violet/20"
              />
            </div>

            {/* Rating Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              <span className="text-xs text-text-muted font-medium shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Rating:
              </span>
              <button
                onClick={() => setSelectedRating('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedRating === 'all'
                    ? 'bg-violet text-white shadow-sm'
                    : 'bg-surface-dim text-text-secondary hover:bg-slate-100'
                }`}
              >
                All ({testimonials.length})
              </button>
              <button
                onClick={() => setSelectedRating(5)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  selectedRating === 5
                    ? 'bg-violet text-white shadow-sm'
                    : 'bg-surface-dim text-text-secondary hover:bg-slate-100'
                }`}
              >
                <span>5 Stars</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-20 bg-surface-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTestimonials.map((t, idx) => (
              <GlassCard
                key={t.id || idx}
                variant="light"
                hover
                className="p-8 border border-slate-200 bg-white flex flex-col justify-between rounded-3xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {t.date && (
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t.date}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-text-secondary italic leading-relaxed">
                    &ldquo;{t.testimonial}&rdquo;
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {t.profileImage ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={t.profileImage}
                          alt={t.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-deep/10 text-violet flex items-center justify-center font-heading font-bold text-sm shrink-0">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-heading font-bold text-sm text-navy">{t.name}</h4>
                      {t.course && (
                        <p className="text-xs text-violet font-medium">{t.course}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 shrink-0">
                    Google Review
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>

          {filteredTestimonials.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-text-muted">No reviews match your search filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRating('all');
                }}
                className="mt-2 text-xs font-semibold text-violet hover:underline"
              >
                Reset Filter
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Callout */}
      <section className="py-16 bg-navy text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold">
            Experience Musical Excellence With Us
          </h2>
          <p className="text-sm text-white/80 max-w-xl mx-auto">
            Join hundreds of successful students who have built their musical foundation at Allwin School of Music in Salem.
          </p>
          <Button href="/contact" size="lg">
            Enquire for Classes Today
          </Button>
        </div>
      </section>
    </div>
  );
}
