import HeroSection from '@/components/home/HeroSection';
import TrustStats from '@/components/home/TrustStats';
import AboutPreview from '@/components/home/AboutPreview';
import InstrumentsSection from '@/components/home/InstrumentsSection';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import LearningJourney from '@/components/home/LearningJourney';
import TestimonialsPreview from '@/components/home/TestimonialsPreview';
import GoogleReviewsSection from '@/components/home/GoogleReviewsSection';
import MapPreview from '@/components/home/MapPreview';
import CTASection from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStats />
      <AboutPreview />
      <InstrumentsSection />
      <WhyChooseSection />
      <LearningJourney />
      <TestimonialsPreview />
      <GoogleReviewsSection />
      <MapPreview />
      <CTASection />
    </>
  );
}
