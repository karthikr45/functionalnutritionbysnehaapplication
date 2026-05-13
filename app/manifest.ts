import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gut Shell',
    short_name: 'Gut Shell',
    description: 'Personalized functional nutrition consultations for gut, PCOS, thyroid, diabetes, and weight management.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF6EE',
    theme_color: '#636B2F',
    icons: [
      { src: '/icon', sizes: '256x256', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
