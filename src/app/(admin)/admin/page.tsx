'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  GraduationCap,
  Users,
  Image as ImageIcon,
  Trophy,
  Star,
  HelpCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import GlassCard from '@/components/ui/GlassCard';
import { getDocuments } from '@/lib/firebase/firestore';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    enquiries: 0,
    newEnquiries: 0,
    courses: 0,
    faculty: 0,
    gallery: 0,
    achievements: 0,
    testimonials: 0,
    faqs: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [enq, crs, fac, gal, ach, test, fq] = await Promise.all([
          getDocuments<any>('enquiries').catch(() => []),
          getDocuments<any>('courses').catch(() => []),
          getDocuments<any>('faculty').catch(() => []),
          getDocuments<any>('gallery').catch(() => []),
          getDocuments<any>('achievements').catch(() => []),
          getDocuments<any>('testimonials').catch(() => []),
          getDocuments<any>('faqs').catch(() => []),
        ]);

        const newCount = enq.filter((e: any) => e.status === 'new').length;

        setMetrics({
          enquiries: enq.length,
          newEnquiries: newCount,
          courses: crs.length,
          faculty: fac.length,
          gallery: gal.length,
          achievements: ach.length,
          testimonials: test.length,
          faqs: fq.length,
        });
      } catch (err) {
        console.error('Error loading metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const cards = [
    {
      title: 'Total Enquiries',
      value: metrics.enquiries,
      subtext: `${metrics.newEnquiries} Pending / New`,
      icon: MessageSquare,
      color: 'from-blue-500 to-indigo-600',
      href: '/admin/enquiries',
    },
    {
      title: 'Gallery Images',
      value: metrics.gallery,
      subtext: 'Cloudinary media synced',
      icon: ImageIcon,
      color: 'from-purple-500 to-violet-600',
      href: '/admin/gallery',
    },
    {
      title: 'Published Courses',
      value: metrics.courses,
      subtext: 'Instrument & vocal syllabi',
      icon: GraduationCap,
      color: 'from-orange to-amber-500',
      href: '/admin/courses',
    },
    {
      title: 'Frequently Asked Questions',
      value: metrics.faqs,
      subtext: 'Q&A for students & parents',
      icon: HelpCircle,
      color: 'from-emerald-500 to-teal-600',
      href: '/admin/faqs',
    },
    {
      title: 'Achievements',
      value: metrics.achievements,
      subtext: 'Student grade milestones',
      icon: Trophy,
      color: 'from-yellow-500 to-amber-600',
      href: '/admin/achievements',
    },
    {
      title: 'Testimonials',
      value: metrics.testimonials,
      subtext: 'Student & parent reviews',
      icon: Star,
      color: 'from-magenta to-pink-600',
      href: '/admin/testimonials',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Institution Overview" />

      <main className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
        {/* Welcome banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-deep via-navy to-navy text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-orange">
              Allwin School of Music & Musicals
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              Welcome to the CMS Dashboard
            </h2>
            <p className="text-sm text-white/80 max-w-xl">
              Manage course syllabi, student admissions, Cloudinary image galleries, faculty rosters, FAQs, and site configuration in real-time.
            </p>
          </div>
          <Link
            href="/admin/enquiries"
            className="px-5 py-3 rounded-xl bg-white text-navy font-semibold text-sm hover:bg-slate-100 transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Review Enquiries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-heading font-bold text-navy">
                    {loading ? '...' : card.value}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {card.subtext}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-violet font-semibold group-hover:text-purple">
                  <span>Manage Section</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
