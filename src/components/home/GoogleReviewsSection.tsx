import { Star, MapPin, ExternalLink } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';

export default function GoogleReviewsSection() {
  const reviewsUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL || 'https://maps.google.com/?q=Allwin+School+of+Music+Salem';

  return (
    <section className="py-16 bg-surface-dim border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard
          variant="light"
          className="p-8 sm:p-10 border border-white/60 bg-white/90 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
              <span className="text-xs font-semibold text-text-secondary ml-2">
                Google Reviews & Rating
              </span>
            </div>
            
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-navy">
              Find Us On Google Business
            </h3>

            <p className="text-sm text-text-secondary leading-relaxed">
              Read genuine experiences, student milestones, and ratings directly on our official Google Business profile for <strong>{BUSINESS.name}</strong>, located at Chinnathirupathi, Salem.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Button
              href={reviewsUrl}
              external
              variant="outline"
              size="md"
              iconRight={<ExternalLink className="w-4 h-4" />}
            >
              View Google Reviews
            </Button>
            <Button
              href="/contact"
              size="md"
              icon={<MapPin className="w-4 h-4" />}
            >
              Get Directions
            </Button>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
