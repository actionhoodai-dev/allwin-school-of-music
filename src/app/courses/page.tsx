'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Layers, Music2, Disc, Mic2, Sparkles, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { getPublishedDocuments } from '@/lib/firebase/firestore';
import { BUSINESS } from '@/lib/constants';
import type { Course } from '@/types';

export default function CoursesPage() {
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
    },
    {
      slug: 'guitar',
      title: 'Guitar Classes',
      category: 'Instrumental',
      image: '/images/instruments/guitar.jpg',
      icon: <Music2 className="w-6 h-6 text-orange" />,
      overview: 'Structured training for acoustic and classical guitar, focusing on chord progressions, strumming patterns, fingerstyle technique, scale theory, and melody playing.',
      suitableLearners: 'Beginners and intermediate players interested in acoustic, classical, or contemporary guitar playing.',
      learningFocus: [
        'Fretboard navigation, posture, and tuning fundamentals',
        'Open chords, barre chords, and smooth transitions',
        'Strumming patterns, fingerpicking, and rhythm timing',
        'Lead scales, soloing techniques, and melody harmonization',
        'Song accompaniment and grade examination pieces',
      ],
      examInfo: 'Trinity College London Western Music Grade Examinations syllabus available.',
      badge: 'Acoustic & Classical',
    },
    {
      slug: 'violin',
      title: 'Violin Classes',
      category: 'Instrumental',
      image: '/images/instruments/violin.jpg',
      icon: <Disc className="w-6 h-6 text-magenta" />,
      overview: 'Foundational and advanced violin training developing bow control, correct posture, intonation precision, notation reading, and classical performance artistry.',
      suitableLearners: 'Learners seeking formal, disciplined string instrument training in Western or Classical traditions.',
      learningFocus: [
        'Instrument hold, chin-rest posture, and bow grip mechanics',
        'Bowing dynamics, tone production, and smooth string crossings',
        'Finger placement, pitch intonation, and shifting positions',
        'Sheet music reading, classical études, and melodic pieces',
        'Ensemble coordination and recital preparation',
      ],
      examInfo: 'Trinity College London grade exam prep & Classical music syllabus.',
      badge: 'Western & Classical',
    },
    {
      slug: 'vocal',
      title: 'Vocal Music Training',
      category: 'Vocal',
      image: '/images/instruments/vocal.jpg',
      icon: <Mic2 className="w-6 h-6 text-purple-light" />,
      overview: 'Structured vocal coaching aimed at developing pitch accuracy, breath support, voice modulation, tonal resonance, range expansion, and confident stage presentation.',
      suitableLearners: 'Aspiring singers of all age groups interested in Western or Indian classical vocal traditions.',
      learningFocus: [
        'Diaphragmatic breathing and posture alignment',
        'Pitch stabilization, scale singing, and ear training',
        'Vocal range expansion and resonance placement',
        'Pronunciation, diction, and expressive phrasing',
        'Rhythmic precision (Talam) and stage singing confidence',
      ],
      examInfo: 'Preparation for Classical certifications & Western singing grade exams.',
      badge: 'Western & Classical Vocal',
    },
    {
      slug: 'bharatham',
      title: 'Bharatham / Bharatanatyam Training',
      category: 'Classical Dance',
      image: '/images/instruments/bharatham.jpg',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      overview: 'Traditional Indian classical dance training teaching foundational Adavus, rhythm synchronization (Talam), mudras (hand gestures), expressive abhinaya, and stage items.',
      suitableLearners: 'Children, students, and enthusiasts looking for structured, authentic Bharatanatyam training.',
      learningFocus: [
        'Basic Adavus (steps) and posture (Aramandi, Muzhumandi)',
        'Asamyutha and Samyutha Hastas (hand gestures)',
        'Tala consciousness, footwork speed, and body coordination',
        'Bhava, Rasa, and Abhinaya (facial expressions & storytelling)',
        'Margam items (Alarippu, Jatiswaram, Shabdam, Varnam)',
      ],
      examInfo: 'Associated with Annamalai University classical dance syllabus.',
      badge: 'Annamalai Affiliated',
    },
    {
      slug: 'theory-of-music',
      title: 'Theory of Music',
      category: 'Academic',
      image: '/images/instruments/theory.jpg',
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      overview: 'A deep-dive academic course in music literacy covering staff notation, rhythm, time signatures, key signatures, scales, intervals, chords, and musical terminology.',
      suitableLearners: 'All instrumental and vocal students preparing for Trinity grade exams or wishing to master musical literacy.',
      learningFocus: [
        'Staff notation (Treble, Bass, Alto, and Tenor Clefs)',
        'Simple, compound, and complex time signatures & rhythm dictation',
        'Major, minor, chromatic scales, and circle of fifths',
        'Intervals, triads, chords, cadence progressions, and transposition',
        'Italian terms, dynamic markings, and formal analysis',
      ],
      examInfo: 'Trinity College London Theory of Music Grade Examinations (Grades 1–8).',
      badge: 'Grade Exam Centric',
    },
  ];

  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
            Structured Music Curriculum • Since 2007
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Music Courses & <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">Disciplines</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans">
            Affiliated with Trinity College London for Western Music Grade Examinations and associated with Annamalai University for Classical Music.
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
              className="scroll-mt-24 rounded-3xl bg-white border border-border shadow-lg hover:shadow-xl transition-all overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                
                {/* Course Image Column */}
                <div className="lg:col-span-4 relative min-h-[240px] sm:min-h-[280px] lg:min-h-full bg-navy-light overflow-hidden group">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-navy/40" />
                  
                  {/* Badge on image */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-navy/85 text-white backdrop-blur-md border border-white/20">
                      {course.badge}
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
                      href={BUSINESS.whatsappLink(
                        `Hello Allwin School of Music, I am interested in ${course.title}.`
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

          {/* Dynamic Firestore Courses if any added by Admin */}
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
