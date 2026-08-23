// ============================================
// JSON-LD Structured Data Generators (LocalBusiness, EducationalOrganization, FAQ)
// ============================================

import { BUSINESS } from '@/lib/constants';

export function getLocalBusinessSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://allwinschoolofmusic.com';

  return {
    '@context': 'https://schema.org',
    '@type': ['MusicSchool', 'EducationalOrganization', 'LocalBusiness'],
    '@id': `${siteUrl}/#organization`,
    name: BUSINESS.fullName,
    alternateName: BUSINESS.name,
    description:
      'Allwin School of Music & Musicals, established in 2007 in Salem, Tamil Nadu, offers structured Western & Classical music classes, Trinity College London grade examinations, and Annamalai University classical music training.',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/logo.png`,
    telephone: `+91-${BUSINESS.phone}`,
    email: BUSINESS.email,
    foundingDate: BUSINESS.established,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Chinnathirupathi',
      addressLocality: 'Salem',
      addressRegion: 'Tamil Nadu',
      postalCode: '636008',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '11.6643',
      longitude: '78.1460',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '09:00',
        closes: '20:00',
      },
    ],
    priceRange: '₹₹',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Music Education Programs',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'Keyboard Classes',
            description: 'Keyboard fundamentals, practical playing, notation, rhythm, and grade exam training.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'Guitar Classes',
            description: 'Guitar chords, fingerpicking, rhythm, technique, and music expression.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'Violin Classes',
            description: 'Violin posture, bowing technique, notation, rhythm, and classical performance skills.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'Vocal Classes',
            description: 'Vocal training, voice modulation, pitch control, and musical repertoire.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'Bharatham Classes',
            description: 'Traditional Bharatanatyam dance training, rhythm, and performance.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'Theory of Music',
            description: 'Music notation, scales, chords, rhythm, and examination syllabus.',
          },
        },
      ],
    },
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://allwinschoolofmusic.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

export function getFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
