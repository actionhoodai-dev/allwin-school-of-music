import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import PianoKeys from '@/components/musical/PianoKeys';
import { BUSINESS } from '@/lib/constants';

export default function AboutPreview() {
  const highlights = [
    'Long-standing presence in Salem since 2007',
    'Structured curriculum for both Western & Classical music',
    'Trinity College London grade examination preparation',
    'Annamalai University classical music syllabus affiliation',
    'Comprehensive practical & theoretical training',
    'Student-focused learning environment for all ages',
  ];

  return (
    <section className="py-20 lg:py-28 bg-surface-dim relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-light/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Card */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative">
              {/* Outer decorative card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-navy via-purple-deep to-navy text-white shadow-2xl relative overflow-hidden border border-white/15">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-4 mb-6">
                  <Image
                    src="/logo.png"
                    alt="Allwin School of Music Logo"
                    width={64}
                    height={64}
                    className="rounded-full shadow-lg shrink-0"
                  />
                  <div>
                    <span className="text-xs uppercase tracking-widest text-orange font-bold">
                      Established 2007
                    </span>
                    <h3 className="font-heading text-xl font-bold text-white">
                      Allwin School of Music
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-white/80 leading-relaxed italic mb-6">
                  &ldquo;Learn Music With The Wright Foundation&rdquo;
                </p>

                {/* Piano keys element */}
                <PianoKeys className="mb-6" />

                <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-white/70">
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="font-medium text-white">Chinnathirupathi, Salem</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Western Exam Body</span>
                    <span className="font-medium text-white">Trinity College London</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Classical Affiliation</span>
                    <span className="font-medium text-white">Annamalai University</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Text Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/10 text-violet text-xs font-semibold uppercase tracking-wider">
              About Allwin
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy tracking-tight leading-tight">
              A Foundation for <br />
              <span className="gradient-text">Lifelong Music</span>
            </h2>

            <p className="text-base text-text-secondary leading-relaxed">
              Founded in 2007 in Salem, Tamil Nadu, <strong>{BUSINESS.fullName}</strong> has been providing structured music education under the guiding principle of <em>&ldquo;{BUSINESS.tagline}&rdquo;</em>.
            </p>

            <p className="text-sm text-text-secondary leading-relaxed">
              We bridge the worlds of Western instrumental discipline and rich Indian classical traditions. Whether a student is preparing for international grade examinations with Trinity College London or pursuing classical certification associated with Annamalai University, our training fosters deep musical understanding, practical proficiency, and joyful performance.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-violet shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-text-primary font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Button
                href="/about"
                variant="outline"
                size="md"
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                Discover Our Story
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
