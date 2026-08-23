import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Award, GraduationCap, CheckCircle2, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = constructMetadata({
  title: 'Affiliations & Grade Examinations | Allwin School of Music',
  description:
    'Allwin School of Music is affiliated with Trinity College London for Western Music Grade Examinations and associated with Annamalai University, Chidambaram for Classical Music.',
  canonicalUrl: '/affiliations',
});

export default function AffiliationsPage() {
  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
            Recognized Musical Standards
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Recognized <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">Musical Education</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans">
            Structured grade examination preparation and university-level academic frameworks in Salem.
          </p>
        </div>
      </section>

      {/* Main Affiliation Cards */}
      <section className="py-20 bg-surface-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Card 1: Trinity College London */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-border shadow-xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-purple-deep text-white shadow-md">
                  <Award className="w-8 h-8 text-orange" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-violet">
                    Western Music Examination Body
                  </span>
                  <h2 className="font-heading font-bold text-2xl sm:text-3xl text-navy">
                    Trinity College London
                  </h2>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet/10 text-violet font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Affiliated for Western Music Grade Examinations
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-heading font-semibold text-xl text-navy">
                  Structured International Grade Pathway (Initial to Grade 8)
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Allwin School of Music prepares students for the globally recognized music grade examinations administered by <strong>Trinity College London</strong>. Trinity&rsquo;s progressive syllabus evaluates candidates across technical exercises, performance pieces, sight reading, aural tests, and musical knowledge.
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Our structured coaching ensures that students do not just memorize examination pieces, but master foundational technique, expressive nuances, rhythmic stability, and music reading ability required to excel at every grade tier.
                </p>
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-dim border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                  Disciplines Covered under Trinity Prep:
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-text-secondary">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet shrink-0" />
                    <span>Electronic Keyboard & Piano Grade Exams</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet shrink-0" />
                    <span>Acoustic & Classical Guitar Grade Exams</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet shrink-0" />
                    <span>Violin Grade Examinations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet shrink-0" />
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
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-border shadow-xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-navy text-white shadow-md">
                  <GraduationCap className="w-8 h-8 text-magenta" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-magenta">
                    Classical Music & Dance Affiliation
                  </span>
                  <h2 className="font-heading font-bold text-2xl sm:text-3xl text-navy">
                    Annamalai University, Chidambaram
                  </h2>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-magenta/10 text-magenta font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Affiliated for Classical Music Programs
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-heading font-semibold text-xl text-navy">
                  Academic Framework for Traditional Performing Arts
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Through our association with <strong>Annamalai University, Chidambaram</strong>, Allwin School of Music provides structured academic frameworks for students pursuing Classical Music and traditional Indian performing arts including Bharatham / Bharatanatyam.
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Students follow a systematic university-recognized curriculum that encompasses authentic Ragas, Talas, traditional compositions, theoretical treatises, and performance assessments.
                </p>
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-dim border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                  Classical Disciplines:
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-text-secondary">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-magenta shrink-0" />
                    <span>Classical Vocal Music</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-magenta shrink-0" />
                    <span>Bharatham / Bharatanatyam Classical Dance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-magenta shrink-0" />
                    <span>Classical Instrumental Studies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-magenta shrink-0" />
                    <span>Traditional Raga & Tala Theoretical Systems</span>
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

      {/* Trust Quote */}
      <section className="py-16 bg-navy text-white text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <p className="text-lg font-heading italic text-white/90">
            &ldquo;We provide our students in Salem with accredited pathways that open doors to global musical standards and university-recognized artistic credentials.&rdquo;
          </p>
          <p className="text-xs text-white/60 uppercase tracking-wider">
            Allwin School of Music & Musicals • Since {BUSINESS.established}
          </p>
        </div>
      </section>
    </div>
  );
}
