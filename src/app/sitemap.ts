import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://allwinschoolofmusic.com';
  const now = new Date();

  const routes = [
    '',
    '/about',
    '/courses',
    '/instruments',
    '/affiliations',
    '/achievements',
    '/faculty',
    '/gallery',
    '/testimonials',
    '/faq',
    '/contact',
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/courses' || route === '/contact' ? 0.9 : 0.8,
  }));
}
