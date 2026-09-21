// ============================================
// Bulk Attendance Removed — Redirect to Students Directory
// ============================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAttendancePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/students');
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] text-slate-500 text-sm">
      Redirecting to Student Directory...
    </div>
  );
}
