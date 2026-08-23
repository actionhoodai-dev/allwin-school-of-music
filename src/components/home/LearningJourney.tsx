import { Compass, BookOpenCheck, Repeat, Cpu, Sparkles, TrendingUp } from 'lucide-react';

export default function LearningJourney() {
  const steps = [
    {
      num: '01',
      title: 'Discover',
      subtitle: 'Identify Musical Passion',
      desc: 'Explore instruments, rhythm, and vocal acoustics to find your ideal musical path.',
      icon: <Compass className="w-5 h-5 text-orange" />,
    },
    {
      num: '02',
      title: 'Learn',
      subtitle: 'Structured Foundations',
      desc: 'Master music theory, staff notation, rhythm, and foundational finger technique.',
      icon: <BookOpenCheck className="w-5 h-5 text-violet" />,
    },
    {
      num: '03',
      title: 'Practice',
      subtitle: 'Hands-on Discipline',
      desc: 'Reinforce exercises, scale studies, and structured piece repertoire with guidance.',
      icon: <Repeat className="w-5 h-5 text-magenta" />,
    },
    {
      num: '04',
      title: 'Develop',
      subtitle: 'Musical Expression',
      desc: 'Cultivate dynamics, tone control, timing precision, and independent playing confidence.',
      icon: <Cpu className="w-5 h-5 text-purple-light" />,
    },
    {
      num: '05',
      title: 'Perform',
      subtitle: 'Stage & Recitals',
      desc: 'Experience playing before audiences, overcoming stage fright and expressing musical joy.',
      icon: <Sparkles className="w-5 h-5 text-crimson" />,
    },
    {
      num: '06',
      title: 'Progress',
      subtitle: 'Grade Examinations',
      desc: 'Achieve formal grade milestones through Trinity College London & Annamalai University.',
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-surface-dim relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/10 text-violet text-xs font-semibold uppercase tracking-wider">
            Student Roadmap
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy tracking-tight">
            Your Musical <span className="gradient-text">Learning Journey</span>
          </h2>
          <p className="text-base text-text-secondary">
            A proven pedagogical path that transforms curious beginners into accomplished musicians.
          </p>
        </div>

        {/* Timeline grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-heading text-3xl font-extrabold text-slate-200 group-hover:text-violet/30 transition-colors">
                  {step.num}
                </span>
                <div className="p-2.5 rounded-xl bg-surface-dim border border-slate-100">
                  {step.icon}
                </div>
              </div>

              <span className="text-xs uppercase tracking-wider text-text-muted font-bold block mb-1">
                {step.subtitle}
              </span>
              <h3 className="font-heading font-bold text-xl text-navy mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
