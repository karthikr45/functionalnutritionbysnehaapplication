import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Functional Nutrition for Gut, PCOS, Thyroid & Weight',
  description:
    'Personalized 1:1 nutrition programs from a certified functional nutritionist. Heal gut issues, PCOS, thyroid, diabetes & lose weight sustainably. Book a consultation today.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Gut Shell — Functional Nutrition That Heals from the Root',
    description:
      'Personalized 1:1 nutrition programs for gut, PCOS, thyroid, diabetes & weight. No fad diets — just science-backed, sustainable transformation.',
    url: 'https://gutshell.com',
  },
};

import Hero, { HeroContent } from '@/components/Hero';

import Services from '@/components/Services';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import SuccessStories from '@/components/SuccessStories';
import VideoCarousel from '@/components/VideoCarousel';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ScrollReveal from '@/components/ScrollReveal';
import { ScrollProgressBar } from '@/components/AnimationEffects';
import { client } from '@/sanity/lib/client';
import { RECENT_POSTS_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import Link from 'next/link';
import { format } from 'date-fns';

async function getRecentPosts() {
  try {
    return await client.fetch(RECENT_POSTS_QUERY);
  } catch {
    return [];
  }
}

async function getSiteSettings() {
  try {
    return await client.fetch(SITE_SETTINGS_QUERY);
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [posts, settings] = await Promise.all([getRecentPosts(), getSiteSettings()]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream">
      <ScrollProgressBar />
      <Navbar />
      <main>
        <Hero settings={settings} />

        <ScrollReveal animation="fade-up" delay={100}>
          <Services />
        </ScrollReveal>

        <ScrollReveal animation="blur-in">
          <HeroContent />
        </ScrollReveal>

        <ScrollReveal animation="scale-up">
          <HowItWorks />
        </ScrollReveal>

        <ScrollReveal animation="slide-left">
          <Testimonials />
        </ScrollReveal>

        <ScrollReveal animation="fade-up">
          <SuccessStories />
        </ScrollReveal>

        <ScrollReveal animation="blur-in">
          <VideoCarousel />
        </ScrollReveal>

        {/* Blog Preview */}
        {posts.length > 0 && (
          <section className="py-20 bg-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal animation="blur-in">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Latest Articles &amp; Recipes</p>
                    <h2 className="text-3xl font-bold text-gray-900 font-serif mt-1">Nutrition Tips &amp; Insights</h2>
                  </div>
                  <Link href="/blog" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    View All Articles →
                  </Link>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.map((post: any, idx: number) => (
                  <ScrollReveal key={post._id} animation="fade-up" delay={idx * 150}>
                    <Link
                      href={`/blog/${post.slug?.current}`}
                      className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 hover:border-primary-200 transition-all group hover:-translate-y-1 duration-300"
                    >
                      <div className="aspect-video bg-primary-50 flex items-center justify-center text-6xl overflow-hidden">
                        {post.mainImage ? (
                          <img src={post.mainImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          '🥗'
                        )}
                      </div>
                      <div className="p-5">
                        {post.categories?.[0] && (
                          <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                            {post.categories[0].title}
                          </span>
                        )}
                        <h3 className="font-bold text-gray-900 mt-1 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
                          {post.publishedAt && <span>{format(new Date(post.publishedAt), 'dd MMM yyyy')}</span>}
                          {post.readTime && <span>• {post.readTime} min read</span>}
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        <ScrollReveal animation="scale-up">
          <FAQ />
        </ScrollReveal>

        {/* Final CTA */}
        <ScrollReveal animation="blur-in">
        <section className="py-20 bg-olive-gradient text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-4">
              Ready to Heal from the Root Cause?
            </h2>
            <p className="text-cream-dark/80 text-lg mb-8">
              Join hundreds of clients who have transformed their health through functional nutrition.
              Your journey to lasting wellness starts with a single consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#services"
                className="inline-flex items-center justify-center px-8 py-4 bg-cream text-warm-footer font-bold rounded-xl hover:bg-white transition-colors shadow-lg"
              >
                View Services & Book
              </Link>
              <a
                href={`https://wa.me/${settings?.whatsappNumber || '919391675213'}?text=Hi%2C%20I%27d%20like%20to%20book%20a%20consultation.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                💬 Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
        </ScrollReveal>

        <ScrollReveal animation="fade-up">
          <Contact settings={settings} />
        </ScrollReveal>
      </main>
      <Footer settings={settings} />
      <WhatsAppButton />
    </div>
  );
}
