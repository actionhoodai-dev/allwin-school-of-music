'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Users, GraduationCap, Award, Send, Music } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { getPublishedDocuments } from '@/lib/firebase/firestore';
import { BUSINESS } from '@/lib/constants';
import type { Faculty } from '@/types';

export default function FacultyPage() {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFaculty() {
      try {
        const data = await getPublishedDocuments<Faculty>('faculty', 'order', 'asc');
        setFacultyList(data);
      } catch {
        setFacultyList([]);
      } finally {
        setLoading(false);
      }
    }
    loadFaculty();
  }, []);

  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
            Experienced Mentorship
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Meet Our <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">Music Educators</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans">
            Disciplined, patient, and dedicated trainers committed to student progress in Western and Classical musical traditions.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-20 bg-surface-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {facultyList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {facultyList.map((f) => (
                <GlassCard
                  key={f.id}
                  variant="light"
                  hover
                  className="p-6 border border-slate-200 bg-white flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {f.photo ? (
                      <div className="relative w-full h-60 rounded-2xl overflow-hidden shadow-inner">
                        <Image
                          src={f.photo}
                          alt={f.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 rounded-2xl bg-surface-dim flex items-center justify-center border border-slate-100">
                        <Users className="w-12 h-12 text-violet/40" />
                      </div>
                    )}

                    <div>
                      <h2 className="font-heading font-bold text-2xl text-navy">
                        {f.name}
                      </h2>
                      <p className="text-xs font-semibold text-violet uppercase tracking-wider mt-0.5">
                        {f.instrument}
                      </p>
                    </div>

                    {f.qualification && (
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <GraduationCap className="w-4 h-4 text-orange shrink-0" />
                        <span>{f.qualification}</span>
                      </div>
                    )}

                    {f.experience && (
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Award className="w-4 h-4 text-magenta shrink-0" />
                        <span>{f.experience} Experience</span>
                      </div>
                    )}

                    {f.bio && (
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-2 border-t border-slate-100">
                        {f.bio}
                      </p>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <Button
                      href={`/contact?faculty=${encodeURIComponent(f.name)}`}
                      size="sm"
                      fullWidth
                    >
                      Enquire for Classes
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto text-center p-10 sm:p-14 rounded-3xl bg-white border border-border shadow-lg space-y-6">
              <div className="w-20 h-20 rounded-full bg-purple-deep/5 flex items-center justify-center mx-auto text-violet">
                <Music className="w-10 h-10" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-navy">
                Dedicated Music Educators & Trainers
              </h2>

              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl mx-auto">
                Our faculty comprises dedicated trainers specializing in Keyboard, Guitar, Violin, Vocal, Bharatham, and Theory of Music. All training is structured to align with Trinity College London Grade Examinations and Annamalai University certifications.
              </p>

              <div className="p-6 rounded-2xl bg-surface-dim border border-slate-200 text-left max-w-lg mx-auto space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
                  Faculty Training Principles:
                </h3>
                <ul className="text-xs text-text-secondary space-y-2">
                  <li>✓ Individualized attention and technique correction</li>
                  <li>✓ Rigorous staff notation reading and rhythm discipline</li>
                  <li>✓ Examination-oriented repertoire preparation</li>
                  <li>✓ Encouraging and supportive learning environment</li>
                </ul>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  href="/contact"
                  size="md"
                  icon={<Send className="w-4 h-4" />}
                >
                  Enquire About Our Trainers
                </Button>
                <Button
                  href={BUSINESS.whatsappLink(BUSINESS.defaultWhatsappMessage)}
                  external
                  variant="whatsapp"
                  size="md"
                  icon={<WhatsAppIcon className="w-4 h-4 fill-white" />}
                >
                  WhatsApp Consultation
                </Button>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
