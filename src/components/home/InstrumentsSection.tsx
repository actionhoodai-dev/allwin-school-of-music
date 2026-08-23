import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Music2, Disc, Mic2, Sparkles, BookOpen, Layers } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';

export default function InstrumentsSection() {
  const instruments = [
    {
      name: 'Keyboard / Piano',
      slug: 'keyboard',
      image: '/images/instruments/keyboard.jpg',
      icon: <Layers className="w-5 h-5 text-violet" />,
      description: 'Learn keyboard fundamentals, technique, notation, rhythm, finger independence, and practical playing for performance and grade examinations.',
      accent: 'from-violet/20 to-purple/20',
      badge: 'Trinity Grade Prep',
    },
    {
      name: 'Guitar',
      slug: 'guitar',
      image: '/images/instruments/guitar.jpg',
      icon: <Music2 className="w-5 h-5 text-orange" />,
      description: 'Develop guitar fundamentals, chords, strumming patterns, fingerstyle technique, scale theory, and dynamic musical expression.',
      accent: 'from-orange/20 to-magenta/20',
      badge: 'Acoustic & Classical',
    },
    {
      name: 'Violin',
      slug: 'violin',
      image: '/images/instruments/violin.jpg',
      icon: <Disc className="w-5 h-5 text-magenta" />,
      description: 'Build foundational violin technique, posture, bowing precision, intonation, notation reading, and classical performance skills.',
      accent: 'from-magenta/20 to-crimson/20',
      badge: 'Western & Carnatic',
    },
    {
      name: 'Bharatham',
      slug: 'bharatham',
      image: '/images/instruments/bharatham.jpg',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      description: 'Structured training in Bharatham / Bharatanatyam fundamentals, Adavus, rhythm (Talam), expressive abhinaya, and traditional performance.',
      accent: 'from-amber/20 to-orange/20',
      badge: 'Classical Dance',
    },
    {
      name: 'Vocal Music',
      slug: 'vocal',
      image: '/images/instruments/vocal.jpg',
      icon: <Mic2 className="w-5 h-5 text-purple-light" />,
      description: 'Develop vocal fundamentals, pitch accuracy, breathing technique, voice control, range development, rhythm, and expressive singing.',
      accent: 'from-purple-light/20 to-violet/20',
      badge: 'Western & Classical',
    },
    {
      name: 'Theory of Music',
      slug: 'theory-of-music',
      image: '/images/instruments/theory.jpg',
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      description: 'Understand music notation, rhythm, key signatures, scales, intervals, chords, terminology, and structured examination foundations.',
      accent: 'from-blue-500/20 to-violet/20',
      badge: 'Exam Preparation',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-deep/5 text-violet text-xs font-semibold uppercase tracking-wider">
            Explore Disciplines
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy tracking-tight">
            Explore Your <span className="gradient-text">Instrument</span>
          </h2>
          <p className="text-base text-text-secondary">
            Structured musical training tailored to beginners, intermediate learners, and grade examination aspirants in Salem.
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
              {/* Instrument Image Header */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-navy-light">
                <Image
                  src={inst.image}
                  alt={inst.name}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-black/20" />
                
                {/* Discipline Badge & Icon floating on image */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <div className="p-2 rounded-xl bg-white/90 backdrop-blur-md shadow-md">
                    {inst.icon}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-navy/80 text-white backdrop-blur-md border border-white/20">
                    {inst.badge}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="font-heading font-bold text-2xl text-white drop-shadow-md">
                    {inst.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {inst.description}
                </p>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/courses#${inst.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet hover:text-purple transition-colors"
                  >
                    <span>Learn Syllabus</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href={`/contact?course=${encodeURIComponent(inst.name)}`}
                    className="text-xs font-medium text-text-muted hover:text-navy transition-colors bg-surface-dim hover:bg-slate-100 px-3 py-1.5 rounded-lg"
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
