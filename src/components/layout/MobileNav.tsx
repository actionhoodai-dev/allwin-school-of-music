// ============================================
// MobileNav Component — Slide-in navigation panel
// ============================================

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Send } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { NAV_ITEMS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import { useSiteSettings } from '@/context/SettingsContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/80 backdrop-blur-md"
          />

          {/* Slide-in drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-navy text-white shadow-2xl flex flex-col z-10 border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Allwin School of Music"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-heading font-bold text-white text-base leading-none">
                    Allwin
                  </h3>
                  <p className="text-white/60 text-xs mt-0.5">School of Music</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
              <Link
                href="/student-login"
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 mb-3 rounded-2xl bg-gradient-to-r from-purple via-violet to-magenta text-white font-bold text-sm shadow-md"
              >
                <span>Student Portal Login</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">Portal ↗</span>
              </Link>

              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple/40 to-violet/30 text-white border-l-4 border-violet font-semibold'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Quick Action CTAs */}
            <div className="p-5 border-t border-white/10 space-y-3 bg-navy-light/50">
              <Button href="/contact" fullWidth size="md" icon={<Send className="w-4 h-4" />}>
                Enquire Now
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  href={settings.phoneLink}
                  external
                  variant="secondary"
                  size="sm"
                  icon={<Phone className="w-4 h-4" />}
                >
                  Call Now
                </Button>
                <Button
                  href={settings.whatsappLink()}
                  external
                  variant="whatsapp"
                  size="sm"
                  icon={<WhatsAppIcon className="w-4 h-4 fill-white" />}
                >
                  WhatsApp
                </Button>
              </div>
              <div className="text-center pt-2">
                <p className="text-xs text-white/50">{settings.established} • Salem, TN</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
