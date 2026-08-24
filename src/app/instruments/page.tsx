import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { Layers, Music2, Disc, Sparkles, Mic2, BookOpen, Check, ArrowRight, Volume2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import InstrumentAudioButton from '@/components/musical/InstrumentAudioButton';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = constructMetadata({
  title: 'Musical Instruments & Training | Allwin School of Music Salem',
  description:
    'Explore Keyboard, Guitar, Violin, Vocal, Bharatham, and Music Theory training at Allwin School of Music in Salem. Trinity College London grade exam prep.',
  canonicalUrl: '/instruments',
});

export default function InstrumentsPage() {
  const instruments = [
    {
      name: 'Keyboard & Piano',
      slug: 'keyboard',
      image: '/images/instruments/keyboard.jpg',
      icon: <Layers className="w-5 h-5 text-violet" />,
      tagline: 'Mastering Melody, Harmony & Multi-Hand Independence',
      description: 'Learn keyboard fundamentals, technique, notation, rhythm, and practical playing for performance and internationally recognized grade examinations.',
      points: [
        'Staff notation & sight reading',
        'Chord construction & progressions',
        'Dual-hand independence training',
        'Trinity College London grade pieces',
      ],
      exam: 'Trinity College London Initial – Grade 8',
    },
    {
      name: 'Guitar',
      slug: 'guitar',
      image: '/images/instruments/guitar.jpg',
      icon: <Music2 className="w-5 h-5 text-orange" />,
      tagline: 'Fretboard Literacy, Acoustic Chords & Expressive Lead',
      description: 'Develop guitar fundamentals, chords, rhythm, technique, and musical expression across acoustic and classical guitar styles.',
      points: [
        'Chords, strumming & fingerpicking',
        'Fretboard scale theory & solos',
        'Rhythm precision & song accompaniments',
        'Grade examination preparation',
      ],
      exam: 'Trinity College London Acoustic & Classical',
    },
    {
      name: 'Violin',
      slug: 'violin',
      image: '/images/instruments/violin.jpg',
      icon: <Disc className="w-5 h-5 text-magenta" />,
      tagline: 'Bowing Precision, Pitch Intonation & Timbre',
      description: 'Build foundational violin technique, posture, notation, rhythm, and performance skills in Western and Classical traditions.',
      points: [
        'Correct chin-rest & bow grip posture',
        'Bowing dynamics & string transitions',
        'Pitch intonation & ear calibration',
        'Western & Carnatic repertoire studies',
      ],
      exam: 'Western Grade Exams & Classical certifications',
    },
    {
      name: 'Bharatham (Bharatanatyam)',
      slug: 'bharatham',
      image: '/images/instruments/bharatham.jpg',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      tagline: 'Rhythmic Footwork, Mudras & Traditional Performance',
      description: 'Provide structured training in Bharatham / Bharatanatyam fundamentals and traditional performance practices associated with Annamalai University.',
      points: [
        'Systematic Adavu steps training',
        'Hastas (hand mudras) & postures',
        'Tala rhythm consciousness',
        'Abhinaya and Margam repertoire',
      ],
      exam: 'Associated with Annamalai University syllabus',
    },
    {
      name: 'Vocal Music',
      slug: 'vocal',
      image: '/images/instruments/vocal.jpg',
      icon: <Mic2 className="w-5 h-5 text-purple-light" />,
      tagline: 'Breath Support, Pitch Alignment & Stage Artistry',
      description: 'Develop vocal fundamentals, pitch, rhythm, voice control, range modulation, and expressive singing.',
      points: [
        'Diaphragmatic breath management',
        'Pitch accuracy & vocal exercises',
        'Voice range expansion & projection',
        'Western & Classical song repertoire',
      ],
      exam: 'Graded performance & university certifications',
    },
    {
      name: 'Theory of Music',
      slug: 'theory-of-music',
      image: '/images/instruments/theory.jpg',
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      tagline: 'The Global Language of Music Reading & Writing',
      description: 'Understand music notation, rhythm, scales, intervals, keys, transposition, and theoretical foundations for grade exams.',
      points: [
        'Clefs, time & key signatures',
        'Scales, triads & harmonic cadence',
        'Musical terms & transcription',
        'Trinity Theory of Music grades 1–8',
      ],
      exam: 'Trinity College London Theory of Music exams',
    },
  ];

  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
            <Volume2 className="w-4 h-4 text-orange" />
            Interactive Instrument Audio Previews
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Explore Your <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">Musical Instrument</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans">
            Choose from six primary disciplines taught by disciplined educators following structured international syllabi. Tap any card to hear its sound!
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 bg-surface-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {instruments.map((inst) => (
              <GlassCard
                key={inst.slug}
                variant="light"
                hover
                className="border border-slate-200 bg-white flex flex-col justify-between overflow-hidden rounded-3xl group shadow-md"
              >
                {/* Top Image */}
                <div className="relative h-52 w-full overflow-hidden bg-navy-light">
                  <Image
                    src={inst.image}
                    alt={inst.name}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-black/20" />
                  
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <div className="p-2 rounded-xl bg-white/90 backdrop-blur-md shadow-md">
                      {inst.icon}
                    </div>

                    {/* Audio Listen Badge */}
                    <InstrumentAudioButton
                      slug={inst.slug}
                      name={inst.name.split(' ')[0]}
                      variant="badge"
                    />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h2 className="font-heading font-bold text-2xl text-white drop-shadow-md">
                      {inst.name}
                    </h2>
                    <p className="text-xs text-orange font-medium mt-0.5 drop-shadow">
                      {inst.tagline}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {inst.description}
                    </p>

                    {/* Interactive Audio Button */}
                    <div className="pt-1">
                      <InstrumentAudioButton
                        slug={inst.slug}
                        name={inst.name}
                        className="w-full"
                      />
                    </div>

                    <ul className="space-y-2 pt-2 border-t border-slate-100">
                      {inst.points.map((p, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                          <Check className="w-3.5 h-3.5 text-violet shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2">
                      <span className="inline-block text-[11px] font-semibold text-navy bg-purple-deep/5 px-2.5 py-1 rounded-lg border border-purple-light/20">
                        🎓 {inst.exam}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      href={`/courses#${inst.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet hover:text-purple transition-colors"
                    >
                      <span>Syllabus</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Button
                      href={`/contact?course=${encodeURIComponent(inst.name)}`}
                      size="sm"
                    >
                      Enquire Now
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-navy">
            Not Sure Which Instrument to Start With?
          </h2>
          <p className="text-sm text-text-secondary max-w-xl mx-auto">
            Our experienced faculty will assist in evaluating your musical interests, rhythm response, and goals.
          </p>
          <Button href="/contact" size="md">
            Schedule an Enquiry Consultation
          </Button>
        </div>
      </section>
    </div>
  );
}
