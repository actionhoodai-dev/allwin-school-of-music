// ============================================
// Student Portal App Layout (Mobile Application Shell)
// Forced White Theme — Flipkart / Amazon Style
// ============================================

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useStudentAuth } from '@/context/StudentAuthContext';
import StudentTopBar from '@/components/student/StudentTopBar';
import StudentBottomNav from '@/components/student/StudentBottomNav';
import ForcePasswordChangeModal from '@/components/student/ForcePasswordChangeModal';
import Spinner from '@/components/ui/Spinner';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, student, loading, hasCachedSession } = useStudentAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    if (!loading && !user && !hasCachedSession) {
      router.push('/student-login');
    }
  }, [user, loading, hasCachedSession, router]);

  useEffect(() => {
    if (student?.mustChangePassword) {
      setShowPasswordChange(true);
    } else {
      setShowPasswordChange(false);
    }
  }, [student?.mustChangePassword]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col items-center justify-center p-6 text-slate-900 text-center select-none">
        <div className="relative w-20 h-20 mb-4 animate-pulse">
          <Image
            src="/logo.png"
            alt="Allwin School of Music"
            fill
            sizes="80px"
            className="object-contain rounded-full shadow-md ring-4 ring-blue-100"
            priority
          />
        </div>
        <Spinner size="md" />
        <p className="text-xs text-slate-600 mt-3 font-bold tracking-wide">
          Opening Student Portal...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-900 flex flex-col">
      {/* Top Application Bar */}
      <StudentTopBar />

      {/* Main Content Area — optimized for 390px mobile-first width while gracefully scaling to desktop */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-28 sm:pb-24">
        {children}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <StudentBottomNav />

      {/* Force Password Change Modal on First Login */}
      <ForcePasswordChangeModal
        isOpen={showPasswordChange}
        onClose={() => setShowPasswordChange(false)}
      />
    </div>
  );
}
