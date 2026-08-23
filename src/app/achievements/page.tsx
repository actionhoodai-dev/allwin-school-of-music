'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, Award, Calendar, Sparkles, Filter, Music } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { getPublishedDocuments } from '@/lib/firebase/firestore';
import { ACHIEVEMENT_CATEGORIES } from '@/lib/constants';
import type { Achievement } from '@/types';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublishedDocuments<Achievement>('achievements', 'createdAt', 'desc');
        setAchievements(data);
      } catch {
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = selectedCategory === 'all'
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory);

  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
            Student Milestones
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Student <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">Achievements</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans">
            Celebrating the milestones, grade examinations, recitals, and musical progression of Allwin students.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-20 bg-surface-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Category Filter Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2">
            {ACHIEVEMENT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-white text-text-secondary hover:bg-slate-100 border border-border'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid / Empty State */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((item) => (
                <GlassCard
                  key={item.id}
                  variant="light"
                  hover
                  className="p-6 border border-slate-200 bg-white flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {item.imageUrl && (
                      <div className="relative w-full h-52 rounded-2xl overflow-hidden shadow-sm">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet/10 text-violet">
                        {item.category.replace('-', ' ')}
                      </span>
                      {item.year && (
                        <span className="text-xs text-text-muted font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.year}
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="font-heading font-bold text-xl text-navy">
                        {item.title}
                      </h2>
                      {item.studentName && (
                        <p className="text-xs font-semibold text-orange mt-0.5">
                          Student: {item.studentName}
                        </p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center p-10 sm:p-14 rounded-3xl bg-white border border-border shadow-lg space-y-6">
              <div className="w-20 h-20 rounded-full bg-purple-deep/5 flex items-center justify-center mx-auto text-violet">
                <Trophy className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-heading font-bold text-navy">
                Student Achievements & Milestones
              </h2>

              <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
                Student milestones, Trinity College London grade results, recital photos, and competition accomplishments will appear here as they are published by the academy.
              </p>

              <div className="pt-2">
                <Button href="/contact" size="sm">
                  Start Your Musical Journey Today
                </Button>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
