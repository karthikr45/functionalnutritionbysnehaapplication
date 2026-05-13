import type { MetadataRoute } from 'next';
import { client } from '@/sanity/lib/client';
import { ALL_POSTS_QUERY, ALL_SERVICES_QUERY } from '@/sanity/lib/queries';

const SITE_URL = 'https://gutshell.com';

export const revalidate = 3600; // re-build sitemap every hour

// Static fallback service slugs in case Sanity is unreachable.
const FALLBACK_SERVICE_SLUGS = [
  'gut-reset-program',
  'weight-management',
  'metabolic-health-program',
  'pregnancy-nutrition',
  'personalized-nutrition-plan',
  'group-program',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about-doctor`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/refund`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  let serviceSlugs: string[] = [];
  let posts: Array<{ slug?: { current?: string }; publishedAt?: string }> = [];

  try {
    const services = await client.fetch<Array<{ slug?: { current?: string } }>>(ALL_SERVICES_QUERY);
    serviceSlugs = (services || [])
      .map((s) => s?.slug?.current)
      .filter((s): s is string => !!s);
  } catch (e) {
    console.warn('[sitemap] services fetch failed, using fallback', e);
  }
  if (serviceSlugs.length === 0) {
    serviceSlugs = FALLBACK_SERVICE_SLUGS;
  }

  try {
    posts = await client.fetch(ALL_POSTS_QUERY);
  } catch (e) {
    console.warn('[sitemap] posts fetch failed', e);
  }

  const servicePages: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = (posts || [])
    .filter((p) => p?.slug?.current)
    .map((p) => ({
      url: `${SITE_URL}/blog/${p.slug!.current}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [...staticPages, ...servicePages, ...blogPages];
}
