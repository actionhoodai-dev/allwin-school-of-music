import { Calendar, Shield, Sparkles, BookOpen, Layers, HeartHandshake } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function WhyChooseSection() {
  const reasons = [
    {
      icon: <Calendar className="w-6 h-6 text-orange" />,
      title: 'Since 2007',
      description: 'Over 15 years of continuous dedication to music education in Salem, building musical confidence across generations.',
    },
    {
      icon: <Layers className="w-6 h-6 text-violet" />,
      title: 'Structured Learning',
      description: 'A systematic approach progressing from core fundamentals and notation reading to advanced practical repertoire.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-magenta" />,
      title: 'Multiple Disciplines',
      description: 'Comprehensive choices across Keyboard, Guitar, Violin, Vocal, Bharatham, and Theory of Music under one roof.',
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: 'Examination Preparation',
      description: 'Rigorous preparation for Western grade examinations affiliated with Trinity College London.',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-purple-light" />,
      title: 'Western & Classical Pathways',
      description: 'Exposure to international Western classical repertoire as well as rich Indian Classical music associated with Annamalai University.',
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-rose-500" />,
      title: 'Student-Focused Education',
      description: 'Encouraging, patient mentors creating a supportive atmosphere where students learn at an optimal and rewarding pace.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 gradient-dark-section text-white relative overflow-hidden">
      {/* Decorative ambient lights */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-purple/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-orange/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider border border-white/10">
            Why Allwin
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight">
            Why Learn With <span className="bg-gradient-to-r from-orange via-magenta-light to-white bg-clip-text text-transparent">Allwin?</span>
          </h2>
          <p className="text-base text-white/70">
            We combine institutional discipline with personal musical inspiration to build true musical literacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, idx) => (
            <GlassCard
              key={idx}
              variant="dark"
              hover
              className="p-7 border border-white/10 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-3 w-fit rounded-xl bg-white/10 border border-white/10">
                  {reason.icon}
                </div>
                <h3 className="font-heading font-semibold text-xl text-white">
                  {reason.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed font-sans">
                  {reason.description}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
