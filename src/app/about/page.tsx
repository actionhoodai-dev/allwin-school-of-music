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
                Under the guiding philosophy of <em>&ldquo;Learn Music With The Right Foundation&rdquo;</em>, we deliver comprehensive, progressive training across both Western instruments and Indian Classical traditions. Our curriculum ensures that every student builds a rock-solid foundation in music theory, ear training, rhythm, and practical performance.
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

      {/* ─── Affiliations Section ─── */}
      <section id="affiliations" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto mb-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-orange">
              Academic Affiliations
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
              Internationally Recognized <span className="gradient-text">Musical Education</span>
            </h2>
            <p className="text-sm text-text-secondary">
              Structured grade examination preparation and university-level academic frameworks in Salem.
            </p>
          </div>

          {/* Card 1: Trinity College London */}
          <div className="p-8 sm:p-12 rounded-3xl bg-surface-dim border border-border shadow-xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-purple-deep text-white shadow-md">
                  <Award className="w-8 h-8 text-orange" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-violet">
                    Western Music Examination Body
                  </span>
                  <h3 className="font-heading font-bold text-2xl sm:text-3xl text-navy">
                    Trinity College London
                  </h3>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet/10 text-violet font-semibold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                Affiliated for Western Music Grade Examinations
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <h4 className="font-heading font-semibold text-xl text-navy">
                  Structured International Grade Pathway (Initial to Grade 8)
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Allwin School of Music prepares students for the globally recognized music grade examinations administered by <strong>Trinity College London</strong>. Trinity&rsquo;s progressive syllabus evaluates candidates across technical exercises, performance pieces, sight reading, aural tests, and musical knowledge.
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Our structured coaching ensures that students do not just memorize examination pieces, but master foundational technique, expressive nuances, rhythmic stability, and music reading ability required to excel at every grade tier.
                </p>
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                  Disciplines Covered under Trinity Prep:
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-text-secondary">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet shrink-0" />
                    <span>Electronic Keyboard &amp; Piano Grade Exams</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet shrink-0" />
                    <span>Acoustic &amp; Classical Guitar Grade Exams</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet shrink-0" />
                    <span>Violin Grade Examinations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet shrink-0" />
                    <span>Theory of Music Written Examinations (Grades 1–8)</span>
                  </li>
                </ul>

                <div className="pt-3">
                  <Button
                    href="/contact?course=Trinity%20College%20London%20Grade%20Exams"
                    fullWidth
                    size="sm"
                  >
                    Enquire About Grade Examinations
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Annamalai University */}
          <div className="p-8 sm:p-12 rounded-3xl bg-surface-dim border border-border shadow-xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-navy text-white shadow-md">
                  <Sparkles className="w-8 h-8 text-magenta" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-magenta">
                    Classical Music &amp; Dance Affiliation
                  </span>
                  <h3 className="font-heading font-bold text-2xl sm:text-3xl text-navy">
                    Annamalai University, Chidambaram
                  </h3>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-magenta/10 text-magenta font-semibold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                Affiliated for Classical Music Programs
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <h4 className="font-heading font-semibold text-xl text-navy">
                  Academic Framework for Traditional Performing Arts
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Through our association with <strong>Annamalai University, Chidambaram</strong>, Allwin School of Music provides structured academic frameworks for students pursuing Classical Music and traditional Indian performing arts including Bharatham / Bharatanatyam.
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Students follow a systematic university-recognized curriculum that encompasses authentic Ragas, Talas, traditional compositions, theoretical treatises, and performance assessments.
                </p>
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                  Classical Disciplines:
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-text-secondary">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-magenta shrink-0" />
                    <span>Classical Vocal Music</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-magenta shrink-0" />
                    <span>Bharatham / Bharatanatyam Classical Dance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-magenta shrink-0" />
                    <span>Classical Instrumental Studies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-magenta shrink-0" />
                    <span>Traditional Raga &amp; Tala Theoretical Systems</span>
                  </li>
                </ul>

                <div className="pt-3">
                  <Button
                    href="/contact?course=Annamalai%20University%20Classical%20Music"
                    variant="secondary"
                    fullWidth
                    size="sm"
                  >
                    Enquire About Classical Programs
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
