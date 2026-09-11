// ============================================
// SEO Metadata Helpers
// ============================================

import type { Metadata } from 'next';
import { BUSINESS } from '@/lib/constants';

interface MetadataProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  image?: string;
}

export function constructMetadata({
  title,
  description,
  keywords = [],
  canonicalUrl = '/',
  image = '/logo.png',
}: MetadataProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://allwinschoolofmusic.com';
  const fullTitle = `${title} | ${BUSINESS.name}`;

  const defaultKeywords = [
    'Music classes in Salem',
    'Music school in Salem',
    'Music academy in Salem',
    'Keyboard classes in Salem',
    'Guitar classes in Salem',
    'Violin classes in Salem',
    'Vocal classes in Salem',
    'Bharatham classes in Salem',
    'Bharatanatyam classes in Salem',
    'Western music classes in Salem',
    'Classical music classes in Salem',
    'Music theory classes in Salem',
    'Trinity music grade exam classes in Salem',
    'Trinity College London Salem',
    'Annamalai University music center Salem',
    'Allwin School of Music',
  ];

  const mergedKeywords = Array.from(new Set([...defaultKeywords, ...keywords]));

  return {
    title: fullTitle,
    description,
    keywords: mergedKeywords.join(', '),
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/logo.png', type: 'image/png' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      apple: [
        { url: '/logo.png', sizes: '180x180', type: 'image/png' },
      ],
      shortcut: ['/logo.png'],
    },
    authors: [{ name: BUSINESS.name }],
    creator: BUSINESS.name,
    publisher: BUSINESS.name,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: canonicalUrl,
      title: fullTitle,
      description,
      siteName: BUSINESS.fullName,
      images: [
        {
          url: image,
          width: 800,
          height: 800,
          alt: `${BUSINESS.name} — ${BUSINESS.tagline}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
