import type { MetadataRoute } from 'next';

const SITE_URL = 'https://gutshell.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/patient/',
          '/doctor/',
          '/superadmin/',
          '/studio/',
          '/appointment/',
          '/consultation/',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
