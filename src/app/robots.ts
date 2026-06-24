import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ranfitness.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/member-dashboard'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
