'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Layers, Music2, Disc, Mic2, Sparkles, BookOpen, CheckCircle2, ArrowRight, Volume2, Video } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import InstrumentAudioOverlay from '@/components/musical/InstrumentAudioOverlay';
import { getPublishedDocuments } from '@/lib/firebase/firestore';
import { useSiteSettings } from '@/context/SettingsContext';
import type { Course } from '@/types';

export default function CoursesPage() {
  const { settings } = useSiteSettings();
  const [dbCourses, setDbCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublishedDocuments<Course>('courses', 'order', 'asc');
        setDbCourses(data);
      } catch {
        // Fallback to static courses
      }
    }
    load();
  }, []);

  const defaultCourses = [
    {
      slug: 'keyboard',
      title: 'Keyboard / Piano Classes',
      category: 'Instrumental',
      image: '/images/instruments/keyboard.jpg',
      icon: <Layers className="w-6 h-6 text-violet" />,
      overview: 'A comprehensive curriculum covering keyboard fundamentals, practical piano technique, music reading, rhythm, and classical as well as contemporary pieces.',
      suitableLearners: 'Beginners, children (from age 5+), teens, adults, and Trinity grade exam aspirants.',
      learningFocus: [
        'Finger positioning, posture, and keyboard geography',
        'Staff notation reading (Treble & Bass Clef)',
        'Scales, arpeggios, chords, and hand coordination',
        'Sight reading, ear training, and dynamics',
        'Performance repertoire and Trinity grade pieces',
      ],
      examInfo: 'Trinity College London Western Music Grade Examinations (Initial to Grade 8).',
      badge: 'Trinity Grade Exam Prep',
      isDance: false,
    },
    {
      slug: 'guitar',
      title: 'Guitar Classes',
      category: 'Instrumental',
      image: '/images/instruments/guitar.jpg',
      icon: <Music2 className="w-6 h-6 text-orange" />,
      overview: 'Structured training for acoustic and classical guitar covering fundamentals, open and barre chords, rhythm, fingerpicking, and grade syllabus pieces.',
      suitableLearners: 'Ages 7+, teens, adults, casual learners, and Trinity College London certificate aspirants.',
      learningFocus: [
        'Fretboard navigation, posture, and hand placement',
        'Open chords, barre chords, and strumming patterns',
        'Fingerstyle technique and picking accuracy',
        'Scale theory, lead playing, and song accompaniment',
        'Trinity College London acoustic & classical pieces',
      ],
      examInfo: 'Trinity College London Acoustic & Classical Guitar Grade Examinations.',
      badge: 'Acoustic & Classical',
      isDance: false,
    },
    {
      slug: 'violin',
      title: 'Violin Classes',
      category: 'Instrumental',
      image: '/images/instruments/violin.jpg',
      icon: <Disc className="w-6 h-6 text-magenta" />,
      overview: 'Refined instruction in violin performance covering correct posture, bowing mechanics, intonation calibration, and repertoire across Western and Classical styles.',
      suitableLearners: 'Ages 6+, dedicated beginners, and learners preparing for graded certifications.',
      learningFocus: [
        'Instrument hold, chin rest posture, and bow grip mechanics',
        'Bowing dynamics, articulation, and smooth string transitions',
        'Pitch accuracy, intonation, and ear training exercises',
        'Notation reading, rhythm discipline, and classical repertoire',
        'Grade examination preparation and solo performance skills',
      ],
      examInfo: 'Western Music Grade Examinations & Classical certifications.',
      badge: 'Western & Classical',
      isDance: false,
    },
    {
      slug: 'bharatham',
      title: 'Bharatham (Bharatanatyam)',
      category: 'Classical Dance',
      image: '/images/instruments/bharatham.jpg',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      overview: 'Traditional Indian classical dance training rooted in systematic Adavu practice, Mudras, rhythmic discipline (Talam), and expressive performance.',
      suitableLearners: 'Children from age 5+, teens, and adult learners passionate about classical dance.',
      learningFocus: [
        'Systematic Adavu steps training (Tatta, Natta, Kuditta, etc.)',
        'Asamyuta & Samyuta Hastas (hand gestures and mudras)',
        'Tala rhythm consciousness and footwork precision',
        'Bhavas, Rasas, and Abhinaya (facial expressions & storytelling)',
        'Margam repertoire items and traditional stage performance',
      ],
      examInfo: 'Associated with Annamalai University grade/diploma certifications.',
      badge: 'Classical Dance Training',
      isDance: true,
    },
    {
      slug: 'vocal',
      title: 'Vocal Music Classes',
      category: 'Vocal',
      image: '/images/instruments/vocal.jpg',
      icon: <Mic2 className="w-6 h-6 text-purple-light" />,
      overview: 'Systematic vocal training designed to build strong pitch awareness, diaphragmatic breath control, voice projection, range, and expressive confidence.',
      suitableLearners: 'All age groups — children, teens, and adults pursuing classical or light music singing.',
      learningFocus: [
        'Breath support, diaphragmatic management, and posture',
        'Pitch alignment, voice placement, and ear calibration',
        'Vocal exercises, scale runs, and range expansion',
        'Diction, tone quality, and emotional expression',
        'Western and Indian classical song repertoire',
      ],
      examInfo: 'Graded performance examinations & university certified syllabus.',
      badge: 'Vocal Excellence',
      isDance: false,
    },
    {
      slug: 'theory-of-music',
      title: 'Theory of Music',
      category: 'Academic Music',
      image: '/images/instruments/theory.jpg',
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      overview: 'The essential foundation for every disciplined musician — covering staff notation, key signatures, intervals, chord harmony, rhythm, and analysis.',
      suitableLearners: 'Students of all instruments, practical exam candidates, and music enthusiasts.',
      learningFocus: [
        'Clefs (Treble, Bass, Alto), note values, and time signatures',
        'Major, minor, and modal scale constructions',
        'Intervals, triads, chords, and cadences',
        'Transposition, musical terms, and signs',
        'Trinity College London Theory of Music grade exam papers',
      ],
      examInfo: 'Trinity College London Theory of Music Examinations (Grades 1 to 8).',
      badge: 'Examination Syllabus',
      isDance: false,
    },
  ];

  const coursesToRender = dbCourses.length > 0 ? dbCourses : defaultCourses;

  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
            <Volume2 className="w-4 h-4 text-orange" />
            Structured Syllabus &amp; Media Showcase
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Our <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">Courses &amp; Syllabus</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans">
            Structured musical training tailored to beginners, intermediate learners, and grade examination aspirants in Salem. Tap course images to preview their sound!
          </p>
        </div>
      </section>

      {/* Courses List */}
      <section className="py-20 bg-surface-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {defaultCourses.map((course) => (
            <div
              key={course.slug}
              id={course.slug}
              className="scroll-mt-28 bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                
                {/* Course Image Column — Click to Play/Pause / Watch Video */}
                <div className="lg:col-span-4 relative min-h-[240px] sm:min-h-[280px] lg:min-h-full bg-navy-light overflow-hidden group">
                  <InstrumentAudioOverlay slug={course.slug} name={course.title} className="h-full w-full">
                    <div className="relative h-full min-h-[240px] sm:min-h-[280px] w-full">
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-navy/40" />
                      
                      {/* Badge & Audio indicator on image */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-navy/85 text-white backdrop-blur-md border border-white/20">
                          {course.badge}
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-navy shadow-md">
                          {course.slug === 'bharatham' ? (
                            <><Video className="w-3 h-3 text-amber-600" /> Watch</>
                          ) : (
                            <><Volume2 className="w-3 h-3 text-orange" /> Tap to Play</>
                          )}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 z-10 lg:hidden">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-white/90 backdrop-blur-md shadow">
                            {course.icon}
                          </div>
                          <h2 className="text-xl font-heading font-bold text-white drop-shadow">
                            {course.title}
                          </h2>
                        </div>
                      </div>
                    </div>
                  </InstrumentAudioOverlay>
                </div>

                {/* Course Details Column */}
                <div className="lg:col-span-5 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="hidden lg:flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-surface-dim border border-slate-100 shadow-sm">
                        {course.icon}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-violet">
                          {course.category}
                        </span>
                        <h2 className="text-2xl font-heading font-bold text-navy">
                          {course.title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-sm text-text-secondary leading-relaxed">
                      {course.overview}
                    </p>

                    <div className="p-4 rounded-2xl bg-surface-dim border border-slate-200/80 space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-navy">
                        Target Learners
                      </p>
                      <p className="text-xs text-text-secondary">
                        {course.suitableLearners}
                      </p>
                    </div>

                    {course.examInfo && (
                      <div className="p-4 rounded-2xl bg-purple-deep/5 border border-purple-light/20 space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-violet">
                          Examination / Affiliation Pathway
                        </p>
                        <p className="text-xs text-navy font-medium">
                          {course.examInfo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right col: Learning focus checklist & CTAs */}
                <div className="lg:col-span-3 p-6 sm:p-8 bg-slate-50/70 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      Core Learning Focus
                    </h3>
                    <ul className="space-y-2.5">
                      {course.learningFocus.map((focus, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet shrink-0 mt-0.5" />
                          <span className="leading-tight">{focus}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 space-y-2.5">
                    <Button
                      href={`/contact?course=${encodeURIComponent(course.title)}`}
                      fullWidth
                      size="sm"
                      iconRight={<ArrowRight className="w-4 h-4" />}
                    >
                      Enquire Course
                    </Button>
                    <Button
                      href={settings.whatsappLink(
                        `Hello ${settings.businessName}, I am interested in ${course.title}.`
                      )}
                      external
                      variant="whatsapp"
                      fullWidth
                      size="sm"
                      icon={<WhatsAppIcon className="w-4 h-4 fill-white" />}
                    >
                      WhatsApp Us
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          ))}

          {/* Dynamic Firestore Courses if any additional added by Admin */}
          {dbCourses.map((course) => (
            <div
              key={course.id}
              className="p-8 sm:p-10 rounded-3xl bg-white border border-border shadow-lg space-y-4"
            >
              <h2 className="text-2xl font-heading font-bold text-navy">{course.title}</h2>
              <p className="text-sm text-text-secondary">{course.overview || course.description}</p>
              {course.examInfo && (
                <p className="text-xs text-violet font-semibold">Affiliation: {course.examInfo}</p>
              )}
              <Button href={`/contact?course=${encodeURIComponent(course.title)}`} size="sm">
                Enquire Now
              </Button>
            </div>
          ))}

        </div>
      </section>

      {/* Callout */}
      <section className="py-16 bg-navy text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold">
            Need Guidance Choosing an Instrument or Course?
          </h2>
          <p className="text-sm text-white/80 max-w-xl mx-auto">
            Contact our mentors to arrange a friendly consultation to identify the best learning path for you or your child.
          </p>
          <Button href="/contact" size="lg">
            Speak with an Educator
          </Button>
        </div>
      </section>
    </div>
  );
}
