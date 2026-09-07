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
  ArrowRight,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { getDocuments } from '@/lib/firebase/firestore';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    students: 0,
    activeStudents: 0,
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
        const [stud, enq, crs, fac, gal, ach, test, fq] = await Promise.all([
          getDocuments<any>('students').catch(() => []),
          getDocuments<any>('enquiries').catch(() => []),
          getDocuments<any>('courses').catch(() => []),
          getDocuments<any>('faculty').catch(() => []),
          getDocuments<any>('gallery').catch(() => []),
          getDocuments<any>('achievements').catch(() => []),
          getDocuments<any>('testimonials').catch(() => []),
          getDocuments<any>('faqs').catch(() => []),
        ]);

        const newCount = enq.filter((e: any) => e.status === 'new').length;
        const activeCount = stud.filter((s: any) => s.status === 'active').length;

        setMetrics({
          students: stud.length,
          activeStudents: activeCount,
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
      title: 'Enrolled Students',
      value: metrics.students,
      subtext: `${metrics.activeStudents} Active in Portal`,
      icon: Users,
      iconBg: 'bg-blue-50 text-[#2874f0] border border-blue-100',
      href: '/admin/students',
    },
    {
      title: 'Total Enquiries',
      value: metrics.enquiries,
      subtext: `${metrics.newEnquiries} Pending / New`,
      icon: MessageSquare,
      iconBg: 'bg-amber-50 text-[#fb641b] border border-orange-100',
      href: '/admin/enquiries',
    },
    {
      title: 'Published Courses',
      value: metrics.courses,
      subtext: 'Instrument & vocal syllabi',
      icon: GraduationCap,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      href: '/admin/courses',
    },
    {
      title: 'Achievements',
      value: metrics.achievements,
      subtext: 'Student grade milestones',
      icon: Trophy,
      iconBg: 'bg-yellow-50 text-amber-600 border border-amber-100',
      href: '/admin/achievements',
    },
    {
      title: 'Gallery Images',
      value: metrics.gallery,
      subtext: 'Cloudinary media synced',
      icon: ImageIcon,
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-100',
      href: '/admin/gallery',
    },
    {
      title: 'Testimonials',
      value: metrics.testimonials,
      subtext: 'Student & parent reviews',
      icon: Star,
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      href: '/admin/testimonials',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f1f3f6] min-h-screen">
      <AdminHeader title="Institution Overview" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Welcome banner — Clean White Card with Flipkart Blue & Amazon Gold */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-[#fff7e6] text-[#b78103] border border-[#ffd591]">
              Allwin School of Music & Musicals
            </span>
            <h2 className="font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
              Welcome to the Admin Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium">
              Manage course syllabi, student admissions, attendance markers, faculty rosters, FAQs, and site configuration in real-time.
            </p>
          </div>
          <Link
            href="/admin/enquiries"
            className="px-5 py-2.5 rounded-xl bg-[#fb641b] text-white font-bold text-xs sm:text-sm hover:bg-orange-600 transition-all shadow-sm shrink-0 flex items-center gap-2 active:scale-95"
          >
            <span>Review Enquiries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {loading ? '...' : card.value}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {card.subtext}
                  </p>
                </div>

                <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-[#2874f0] font-bold group-hover:text-blue-700">
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
