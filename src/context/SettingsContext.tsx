// ============================================
// SettingsContext — Real-time Site Settings Provider
// ============================================

'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { BUSINESS } from '@/lib/constants';

export interface DynamicSiteSettings {
  businessName: string;
  fullName: string;
  tagline: string;
  established: string;
  phone: string;
  phoneFormatted: string;
  phoneLink: string;
  email: string;
  emailLink: string;
  address: string;
  whatsapp: string;
  whatsappLink: (message?: string) => string;
  googleMapsEmbedUrl: string;
  googleMapsDirectionsUrl: string;
  googleReviewsUrl: string;
  heroHeading: string;
  heroDescription: string;
  footerText: string;
}

const defaultDynamicSettings: DynamicSiteSettings = {
  businessName: BUSINESS.name,
  fullName: BUSINESS.fullName,
  tagline: BUSINESS.tagline,
  established: BUSINESS.established,
  phone: BUSINESS.phone,
  phoneFormatted: BUSINESS.phoneFormatted,
  phoneLink: BUSINESS.phoneLink,
  email: BUSINESS.email,
  emailLink: BUSINESS.emailLink,
  address: BUSINESS.address,
  whatsapp: BUSINESS.whatsapp,
  whatsappLink: (msg = BUSINESS.defaultWhatsappMessage) => BUSINESS.whatsappLink(msg),
  googleMapsEmbedUrl: BUSINESS.googleMapsEmbedUrl,
  googleMapsDirectionsUrl: BUSINESS.googleMapsDirectionsUrl,
  googleReviewsUrl: BUSINESS.googleReviewsUrl,
  heroHeading: 'Discover Your Musical Journey',
  heroDescription:
    'Nurturing musicians since 2007 through structured music education, practical training, and internationally recognized grade examinations with Trinity College London and Annamalai University.',
  footerText: 'Learn Music With The Right Foundation • Established 2007 in Salem, Tamil Nadu.',
};

interface SettingsContextType {
  settings: DynamicSiteSettings;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultDynamicSettings,
  isLoading: false,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DynamicSiteSettings>(defaultDynamicSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        doc(db, 'siteSettings', 'main'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const phoneClean = (data.phone || BUSINESS.phone).replace(/\s+/g, '');
            const whatsappClean = (data.whatsappNumber || data.whatsapp || BUSINESS.whatsapp).replace(/\D/g, '');

            setSettings({
              businessName: data.businessName || BUSINESS.name,
              fullName: data.businessName ? `${data.businessName} & Musicals` : BUSINESS.fullName,
              tagline: data.tagline || BUSINESS.tagline,
              established: data.established || BUSINESS.established,
              phone: phoneClean,
              phoneFormatted: data.phone ? (data.phone.startsWith('+91') ? data.phone : `+91 ${data.phone}`) : BUSINESS.phoneFormatted,
              phoneLink: `tel:${phoneClean.startsWith('+') ? phoneClean : `+91${phoneClean}`}`,
              email: data.email || BUSINESS.email,
              emailLink: `mailto:${data.email || BUSINESS.email}`,
              address: data.address || BUSINESS.address,
              whatsapp: whatsappClean,
              whatsappLink: (msg = BUSINESS.defaultWhatsappMessage) =>
                `https://wa.me/${whatsappClean || '919489203683'}?text=${encodeURIComponent(msg)}`,
              googleMapsEmbedUrl: data.googleMapsUrl || BUSINESS.googleMapsEmbedUrl,
              googleMapsDirectionsUrl:
                data.googleReviewsUrl || BUSINESS.googleMapsDirectionsUrl,
              googleReviewsUrl: data.googleReviewsUrl || BUSINESS.googleReviewsUrl,
              heroHeading: data.heroHeading || defaultDynamicSettings.heroHeading,
              heroDescription: data.heroDescription || defaultDynamicSettings.heroDescription,
              footerText: data.footerText || defaultDynamicSettings.footerText,
            });
          }
          setIsLoading(false);
        },
        (error) => {
          console.warn('[Firestore] siteSettings listener error, using defaults:', error);
          setIsLoading(false);
        }
      );

      return () => unsub();
    } catch (err) {
      console.warn('[Firestore] siteSettings init error:', err);
      setIsLoading(false);
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SettingsContext);
}
