// ============================================
// Header Component — Premium sticky glass nav
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Phone } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import MobileNav from './MobileNav';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-navy shadow-lg border-b border-white/10 py-2'
            : 'bg-navy py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 shrink-0"
              aria-label="Allwin School of Music — Home"
            >
              <Image
                src="/logo.png"
                alt="Allwin School of Music"
                width={isScrolled ? 44 : 52}
                height={isScrolled ? 44 : 52}
                className="transition-all duration-300 rounded-full"
                priority
              />
              <div className="hidden sm:block">
                <span className="block text-white font-heading font-bold text-lg leading-tight">
                  Allwin
                </span>
                <span className="block text-white/60 text-xs leading-tight">
                  School of Music
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-white/75 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <a
                href="tel:+919489203683"
                className="flex items-center gap-1.5 text-sm text-white/75 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden xl:inline">Call Now</span>
              </a>
              <Button href="/contact" size="sm">
                Enquire Now
              </Button>
            </div>

            {/* Mobile Controls */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <Button href="/contact" size="sm">
                Enquire
              </Button>
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      {/* Header spacer */}
      <div className="h-[72px]" />
    </>
  );
}
