import type { Metadata } from 'next';
import Image from 'next/image';
import { constructMetadata } from '@/lib/seo/metadata';
import { Award, Shield, CheckCircle, Heart, Users, Sparkles, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import PianoKeys from '@/components/musical/PianoKeys';
import WaveformBg from '@/components/musical/WaveformBg';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = constructMetadata({
  title: 'About Us | Allwin School of Music Salem',
  description:
    'Learn about Allwin School of Music & Musicals, established in 2007 in Salem, Tamil Nadu. Affiliated with Trinity College London and Annamalai University.',
  canonicalUrl: '/about',
});

export default function AboutPage() {
  const values = [
    {
      icon: <Award className="w-6 h-6 text-orange" />,
      title: 'Academic Discipline',
      desc: 'Grounding musical ambition in rigorous theory, notation, posture, and international grading standards.',
    },
    {
      icon: <Heart className="w-6 h-6 text-magenta" />,
      title: 'Artistic Passion',
      desc: 'Fostering expressive artistry, musical intuition, dynamic phrasing, and joy in performance.',
    },
    {
      icon: <Users className="w-6 h-6 text-violet" />,
      title: 'Inclusive Mentorship',
      desc: 'Welcoming beginners, children, teens, and adults with patient and customized pedagogical pacing.',
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: 'Credible Affiliations',
      desc: 'Empowering students with internationally recognized Trinity College London examinations and Annamalai University classical certification.',
    },
  ];

  return (
    <div className="bg-surface">
      {/* Hero Header */}
      <section className="relative py-20 lg:py-28 gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
            Since {BUSINESS.established} • Salem, Tamil Nadu
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Our Musical <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">Heritage</span>
          </h1>

          <p className="text-lg text-white/80 max-w-2xl mx-auto italic font-heading">
            &ldquo;{BUSINESS.tagline}&rdquo;
          </p>
        </div>
      </section>

      {/* Main Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/10 text-violet text-xs font-semibold uppercase tracking-wider">
                The Allwin Foundation
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
                Dedicated to Musical Excellence Since 2007
              </h2>
              <p className="text-base text-text-secondary leading-relaxed">
                Founded in 2007 in Chinnathirupathi, Salem, <strong>{BUSINESS.fullName}</strong> was established with the vision of creating an inspiring environment where music learners could develop both technical mastery and a lifelong passion for the performing arts.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                Under the guiding philosophy of <em>&ldquo;Learn Music With The Wright Foundation&rdquo;</em>, we deliver comprehensive, progressive training across both Western instruments and Indian Classical traditions. Our curriculum ensures that every student builds a rock-solid foundation in music theory, ear training, rhythm, and practical performance.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                Whether a learner is preparing for prestigious grade examinations or exploring music as a personal passion, our experienced educators guide each student with care, discipline, and encouragement.
              </p>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md p-8 rounded-3xl bg-navy text-white shadow-2xl border border-white/10 text-center space-y-6">
                <div className="relative w-36 h-36 mx-auto">
                  <Image
                    src="/logo.png"
                    alt="Allwin School of Music Official Logo"
                    fill
                    sizes="144px"
                    className="object-contain rounded-full shadow-lg"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-2xl text-white">
                    ALLWIN
                  </h3>
                  <p className="text-xs text-white/70 tracking-widest uppercase font-semibold">
                    School of Music & Musicals
                  </p>
                </div>
                <PianoKeys />
                <div className="pt-4 border-t border-white/10 text-xs text-white/70 space-y-2">
                  <p>📍 Chinnathirupathi, Salem - 636008</p>
                  <p>📞 {BUSINESS.phoneFormatted}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-surface-dim border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
              Our Core <span className="gradient-text">Pillars</span>
            </h2>
            <p className="text-sm text-text-secondary">
              The foundational principles that guide every class, rehearsal, and examination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <GlassCard
                key={i}
                variant="light"
                hover
                className="p-6 border border-slate-200 bg-white"
              >
                <div className="p-3 w-fit rounded-xl bg-purple-deep/5 mb-4">
                  {v.icon}
                </div>
                <h3 className="font-heading font-semibold text-lg text-navy mb-2">
                  {v.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {v.desc}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliation Recognition Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-deep to-navy text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-orange">
                Academic Affiliations
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                Internationally Recognized Grade Examination Preparation
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Allwin School of Music is affiliated with <strong>Trinity College London</strong> for Western Music Grade Examinations and associated with <strong>Annamalai University, Chidambaram</strong> for Classical Music.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Button href="/affiliations" variant="secondary" size="md">
                View Affiliations
              </Button>
              <Button href="/contact" size="md">
                Enquire for Classes
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
