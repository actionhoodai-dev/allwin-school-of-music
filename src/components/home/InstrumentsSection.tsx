'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Music2, Disc, Mic2, Sparkles, BookOpen, Layers, Volume2, Video } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import InstrumentAudioOverlay from '@/components/musical/InstrumentAudioOverlay';

export default function InstrumentsSection() {
  const instruments = [
    {
      name: 'Keyboard / Piano',
      slug: 'keyboard',
      image: '/images/instruments/keyboard.jpg',
      icon: <Layers className="w-5 h-5 text-violet" />,
      description: 'Learn keyboard fundamentals, technique, notation, rhythm, finger independence, and practical playing for performance and grade examinations.',
      badge: 'Trinity Grade Prep',
      featuredPiece: "Beethoven's Für Elise",
      isDance: false,
    },
    {
      name: 'Guitar',
      slug: 'guitar',
      image: '/images/instruments/guitar.jpg',
      icon: <Music2 className="w-5 h-5 text-orange" />,
      description: 'Develop guitar fundamentals, chords, strumming patterns, fingerstyle technique, scale theory, and dynamic musical expression.',
      badge: 'Acoustic & Classical',
      featuredPiece: 'Romance de Amor (Spanish Romance)',
      isDance: false,
    },
    {
      name: 'Violin',
      slug: 'violin',
      image: '/images/instruments/violin.jpg',
      icon: <Disc className="w-5 h-5 text-magenta" />,
      description: 'Build foundational violin technique, posture, bowing precision, intonation, notation reading, and classical performance skills.',
      badge: 'Western & Carnatic',
      featuredPiece: "Vivaldi's Spring (Four Seasons)",
      isDance: false,
    },
    {
      name: 'Bharatham',
      slug: 'bharatham',
      image: '/images/instruments/bharatham.jpg',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      description: 'Structured training in Bharatham / Bharatanatyam fundamentals, Adavus, rhythm (Talam), expressive abhinaya, and traditional performance.',
      badge: 'Classical Dance',
      featuredPiece: 'Annamalai Affiliated Dance Video',
      isDance: true,
    },
    {
      name: 'Vocal Music',
      slug: 'vocal',
      image: '/images/instruments/vocal.jpg',
      icon: <Mic2 className="w-5 h-5 text-purple-light" />,
      description: 'Develop vocal fundamentals, pitch accuracy, breathing technique, voice control, range development, rhythm, and expressive singing.',
      badge: 'Western & Classical',
      featuredPiece: 'Amazing Grace (English Classic)',
      isDance: false,
    },
    {
      name: 'Theory of Music',
      slug: 'theory-of-music',
      image: '/images/instruments/theory.jpg',
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      description: 'Understand music notation, rhythm, key signatures, scales, intervals, chords, terminology, and structured examination foundations.',
      badge: 'Exam Preparation',
      featuredPiece: "Beethoven's Ode to Joy",
      isDance: false,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-deep/5 text-violet text-xs font-semibold uppercase tracking-wider border border-purple-light/20 shadow-sm">
            <Volume2 className="w-4 h-4 text-orange animate-pulse" />
            <span>Interactive Audio &amp; Video Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy tracking-tight">
            Hear &amp; Explore Your <span className="gradient-text">Instrument</span>
          </h2>
          <p className="text-base text-text-secondary">
            Tap any instrument image to <span className="font-semibold text-orange">listen to its sound</span> — tap again to pause. Watch our Bharatham dance performance on video.
          </p>
        </div>

        {/* Instruments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {instruments.map((inst) => (
            <GlassCard
              key={inst.slug}
              variant="light"
              hover
              className="flex flex-col justify-between border border-slate-200/80 bg-white shadow-md group overflow-hidden rounded-3xl"
            >
              {/* Instrument Image — Click to Play/Pause */}
              <InstrumentAudioOverlay slug={inst.slug} name={inst.name}>
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-navy-light">
                  <Image
                    src={inst.image}
                    alt={inst.name}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-black/20" />

                  {/* Discipline Badge + Play/Video indicator */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-navy/80 text-white backdrop-blur-md border border-white/20">
                      {inst.badge}
                    </span>

                    {/* Small indicator pill */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-navy shadow-md">
                      {inst.isDance ? (
                        <><Video className="w-3 h-3 text-amber-600" /> Watch</>
                      ) : (
                        <><Volume2 className="w-3 h-3 text-orange" /> Tap to Play</>
                      )}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h3 className="font-heading font-bold text-2xl text-white drop-shadow-md">
                      {inst.name}
                    </h3>
                  </div>
                </div>
              </InstrumentAudioOverlay>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {inst.description}
                </p>

                {/* Featured Masterpiece Pill */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-deep/5 border border-purple-light/20 text-xs font-semibold text-navy">
                    {inst.isDance ? (
                      <>
                        <Video className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px] text-text-secondary">Demo: <strong className="text-navy font-bold">{inst.featuredPiece}</strong></span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-orange" />
                        <span className="text-[11px] text-text-secondary">Sample: <strong className="text-navy font-bold">{inst.featuredPiece}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/courses#${inst.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet hover:text-purple transition-colors"
                  >
                    <span>Learn Syllabus</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href={`/contact?course=${encodeURIComponent(inst.name)}`}
                    className="inline-flex items-center justify-center text-xs font-bold px-3.5 py-1.5 rounded-xl bg-violet/10 hover:bg-violet text-violet hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-violet border border-violet/20 dark:border-white/15 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    Enquire Now
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="mt-14 text-center">
          <Button href="/courses" size="lg">
            View All Course Details
          </Button>
        </div>
      </div>
    </section>
  );
}
