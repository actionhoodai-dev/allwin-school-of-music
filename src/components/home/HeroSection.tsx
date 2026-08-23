'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, PhoneCall, Award } from 'lucide-react';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import MusicalNotes from '@/components/musical/MusicalNotes';
import WaveformBg from '@/components/musical/WaveformBg';
import { BUSINESS } from '@/lib/constants';

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden gradient-hero text-white py-16 lg:py-24">
      {/* Animated floating notes background */}
      <MusicalNotes count={12} />

      {/* Decorative gradient glow orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-magenta/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-dark border border-white/15 text-xs sm:text-sm text-white/90 shadow-lg">
              <Sparkles className="w-4 h-4 text-orange" />
              <span className="font-medium tracking-wide">
                Established Since {BUSINESS.established} • Salem, Tamil Nadu
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-white leading-[1.15]">
              Discover Your <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">
                Musical Journey
              </span>
            </h1>

            {/* Tagline & Supporting text */}
            <p className="text-lg sm:text-xl font-heading text-white/90 italic">
              {BUSINESS.tagline}
            </p>

            <p className="text-sm sm:text-base text-white/75 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Nurturing musicians since 2007 through structured music education, practical training, and internationally recognized grade examinations with Trinity College London and Annamalai University.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                href="/courses"
                size="lg"
                className="w-full sm:w-auto shadow-2xl"
                iconRight={<ArrowRight className="w-5 h-5" />}
              >
                Explore Courses
              </Button>
              <Button
                href="/contact"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20"
                icon={<PhoneCall className="w-4 h-4 text-violet" />}
              >
                Enquire Now
              </Button>
            </div>

            {/* Mini Trust Highlights */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                <Award className="w-5 h-5 text-orange shrink-0" />
                <span className="text-xs text-white/80 font-medium">
                  Trinity College London Grade Exams
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-xs text-white/80 font-medium">
                  Annamalai University Classical Music
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card (Liquid Glass) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Pulsing halo */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet via-magenta to-orange opacity-40 blur-xl animate-pulse-glow" />

              <GlassCard
                variant="dark"
                className="relative p-6 sm:p-8 border border-white/20 text-center flex flex-col items-center shadow-2xl"
              >
                {/* Official Brand Logo */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-4">
                  <Image
                    src="/logo.png"
                    alt="Allwin School of Music & Musicals Official Logo"
                    fill
                    sizes="(max-width: 640px) 192px, 224px"
                    className="object-contain drop-shadow-2xl rounded-full"
                    priority
                  />
                </div>

                <h2 className="font-heading font-bold text-xl sm:text-2xl text-white tracking-wide">
                  ALLWIN
                </h2>
                <p className="text-xs sm:text-sm text-white/70 tracking-widest uppercase font-semibold mt-0.5">
                  School of Music & Musicals
                </p>

                <div className="w-16 h-0.5 bg-gradient-to-r from-violet to-orange my-3 rounded-full" />

                <p className="text-xs text-white/80 italic mb-4">
                  &ldquo;Learn Music With The Wright Foundation&rdquo;
                </p>

                {/* Animated Waveform underneath */}
                <WaveformBg className="my-2" />

                <div className="mt-4 pt-4 border-t border-white/10 w-full flex items-center justify-between text-xs text-white/70">
                  <span>📍 Chinnathirupathi, Salem</span>
                  <span className="font-semibold text-orange">Est. 2007</span>
                </div>
              </GlassCard>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
