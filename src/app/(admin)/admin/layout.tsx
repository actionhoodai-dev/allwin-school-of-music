'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminNavProvider, useAdminNav } from '@/context/AdminNavContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminBottomNav from '@/components/admin/AdminBottomNav';
import Spinner from '@/components/ui/Spinner';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const adminNav = useAdminNav();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [user, loading, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#f1f3f6]">{children}</div>;
  }

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
        <p className="text-xs font-bold text-slate-600 mt-3 tracking-wide">
          Authenticating Admin Portal...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {adminNav?.mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => adminNav.closeMobileSidebar()}
          />
          <div className="relative z-10">
            <AdminSidebar onClose={() => adminNav.closeMobileSidebar()} />
          </div>
        </div>
      )}

      {/* Main Content Area with padding for Mobile Bottom Navigation */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden pb-20 lg:pb-0">
        {children}
      </div>

      {/* Persistent Mobile Bottom Navigation */}
      <AdminBottomNav />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminNavProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminNavProvider>
  );
}
