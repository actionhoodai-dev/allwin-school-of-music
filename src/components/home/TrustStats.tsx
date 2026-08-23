import { Calendar, Music, Award, BookOpen } from 'lucide-react';

export default function TrustStats() {
  const stats = [
    {
      icon: <Calendar className="w-6 h-6 text-orange" />,
      value: 'Since 2007',
      label: '15+ Years of Dedicated Music Education',
    },
    {
      icon: <Music className="w-6 h-6 text-violet" />,
      value: 'Multiple Disciplines',
      label: 'Keyboard, Guitar, Violin, Vocal & Bharatham',
    },
    {
      icon: <Award className="w-6 h-6 text-magenta" />,
      value: 'Trinity College London',
      label: 'Western Music Grade Examination Training',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-purple-light" />,
      value: 'Annamalai University',
      label: 'Classical Music Academic Affiliation',
    },
  ];

  return (
    <section className="relative z-10 py-12 bg-surface-dim border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="p-3.5 rounded-xl bg-purple-deep/5 shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="font-heading font-bold text-lg text-navy leading-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-text-secondary mt-1.5 leading-snug">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
