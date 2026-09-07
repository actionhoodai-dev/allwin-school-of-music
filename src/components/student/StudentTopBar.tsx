// ============================================
// Student Portal Top Bar — Flipkart White Style with Instant Back Navigation
// ============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, User, LogOut, ChevronLeft, Sparkles } from 'lucide-react';
import { useStudentAuth } from '@/context/StudentAuthContext';
import NotificationModal from './NotificationModal';

interface StudentTopBarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

const ROUTE_TITLES: Record<string, string> = {
  '/student/attendance': 'Attendance Log',
  '/student/progress': 'Progress & Grades',
  '/student/fees': 'Fees & Dues',
  '/student/fees/history': 'Payment Receipts',
  '/student/exams': 'Grade Examinations',
  '/student/exams/trinity': 'Trinity College Hub',
  '/student/exams/fees': 'Board Exam Fees',
  '/student/schedule': 'Class Schedule',
  '/student/announcements': 'Notices & Circulars',
  '/student/profile': 'My Profile',
  '/student/settings': 'Settings & Password',
  '/student/contact': 'Contact School',
  '/student/more': 'More Modules',
};

export default function StudentTopBar({ title, showBack, backHref }: StudentTopBarProps) {
  const { student, unreadNotifications, signOut } = useStudentAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === '/student';
  const shouldShowBack = showBack !== undefined ? showBack : !isHome;
  const currentTitle = title || ROUTE_TITLES[pathname] || (pathname.split('/').pop()?.replace('-', ' ') || 'Student Portal');

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else {
      router.push('/student');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#2874f0] text-white select-none shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Left: Back or Brand */}
          <div className="flex items-center gap-2.5">
            {shouldShowBack && !isHome ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-95 transition-all shadow-xs"
                  aria-label="Go back to previous page"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <div>
                  <h1 className="font-bold text-sm text-white truncate max-w-[150px] sm:max-w-[240px] capitalize leading-tight">
                    {currentTitle}
                  </h1>
                  <p className="text-[10px] text-white/75 leading-tight">Allwin Portal</p>
                </div>
              </div>
            ) : (
              <Link href="/student" className="flex items-center gap-2.5">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="Allwin Logo"
                    width={34}
                    height={34}
                    className="rounded-full ring-2 ring-white/40 shadow-xs"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#2874f0]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm tracking-tight text-white">
                      ALLWIN
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-semibold tracking-wider">
                      PORTAL
                    </span>
                  </div>
                  <p className="text-[10px] text-white/70 leading-tight">School of Music</p>
                </div>
              </Link>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            {/* Student ID Badge */}
            {student?.studentId && (
              <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fb641b] text-xs font-bold tracking-wide text-white shadow-xs">
                <Sparkles className="w-3 h-3 text-yellow-200" />
                <span>{student.studentId}</span>
              </div>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white active:scale-95 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#fb641b] text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#2874f0]">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Student Avatar / Quick Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="relative w-8 h-8 rounded-full bg-white p-0.5 overflow-hidden flex items-center justify-center shadow-xs active:scale-95 transition-transform"
                aria-label="Profile menu"
              >
                {student?.photo ? (
                  <Image
                    src={student.photo}
                    alt={student.name || 'Student'}
                    fill
                    sizes="32px"
                    className="rounded-full object-cover object-center"
                  />
                ) : (
                  <User className="w-4 h-4 text-[#2874f0]" />
                )}
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-scale-in text-slate-900">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="font-semibold text-sm truncate text-slate-900">{student?.name || 'Student'}</p>
                      <p className="text-xs text-slate-600 font-semibold tracking-wide">{student?.studentId || 'Allwin Student'}</p>
                      <p className="text-[11px] text-[#2874f0] mt-0.5 font-medium">{student?.instrument || 'Music'} • {student?.grade || 'Grade 1'}</p>
                    </div>

                    <Link
                      href="/student/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/student/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account & Password</span>
                    </Link>

                    <button
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        await signOut();
                        window.location.href = '/student-login';
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-95 transition-all mt-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-white" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Bottom Sheet / Modal */}
      <NotificationModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}
