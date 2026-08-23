// ============================================
// Footer Component — Premium Multi-Column Footer
// ============================================

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react';
import { BUSINESS, NAV_ITEMS } from '@/lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const coursesList = [
    { label: 'Keyboard Classes', href: '/courses#keyboard' },
    { label: 'Guitar Classes', href: '/courses#guitar' },
    { label: 'Violin Classes', href: '/courses#violin' },
    { label: 'Vocal Music Training', href: '/courses#vocal' },
    { label: 'Bharatham / Bharatanatyam', href: '/courses#bharatham' },
    { label: 'Theory of Music', href: '/courses#theory-of-music' },
    { label: 'Trinity Grade Exam Prep', href: '/affiliations' },
    { label: 'Classical Music Course', href: '/affiliations' },
  ];

  return (
    <footer className="bg-navy text-white relative overflow-hidden pt-16 pb-24 md:pb-12 border-t border-white/10">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-deep/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Institution Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Allwin School of Music"
                width={56}
                height={56}
                className="rounded-full shadow-lg"
              />
              <div>
                <h3 className="font-heading font-bold text-xl text-white tracking-tight">
                  Allwin
                </h3>
                <p className="text-xs text-white/70 font-sans tracking-wide">
                  School of Music & Musicals
                </p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed italic">
              &ldquo;{BUSINESS.tagline}&rdquo;
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              Established in {BUSINESS.established}, providing structured Western and Classical music education, practical training, and recognized grade examination preparation in Salem.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Affiliated with Trinity College London & Annamalai University
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 hover:text-white transition-colors flex items-center group gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin/login"
                  className="text-xs text-white/40 hover:text-white/70 transition-colors pt-2 block"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Courses */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4">
              Music Programs
            </h4>
            <ul className="space-y-2.5">
              {coursesList.map((course) => (
                <li key={course.label}>
                  <Link
                    href={course.href}
                    className="text-sm text-white/70 hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span>{course.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-violet" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg font-semibold text-white mb-4">
              Contact & Location
            </h4>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-violet shrink-0 mt-0.5" />
                <span>{BUSINESS.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-violet shrink-0" />
                <a
                  href={BUSINESS.phoneLink}
                  className="hover:text-white transition-colors font-medium text-white/90"
                >
                  {BUSINESS.phoneFormatted}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-violet shrink-0" />
                <a
                  href={BUSINESS.emailLink}
                  className="hover:text-white transition-colors break-all"
                >
                  {BUSINESS.email}
                </a>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Clock className="w-5 h-5 text-violet shrink-0" />
                <span>Classes: Mon – Sat (Flexible Slots)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {currentYear} Allwin School of Music & Musicals. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span>Salem, Tamil Nadu, India</span>
            <span>Est. 2007</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
