'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import type { ReactNode } from 'react';

export default function PublicLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPortalOrAdmin =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/student') ||
    pathname === '/student-login';

  if (isPortalOrAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

