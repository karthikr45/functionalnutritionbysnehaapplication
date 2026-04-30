import Navbar from '@/components/Navbar';

export const revalidate = 60;

import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import HowItWorks from '@/components/HowItWorks';
import Packages from '@/components/Packages';
import Testimonials from '@/components/Testimonials';
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
        <ScrollReveal animation="fade-up">
          <About settings={settings} />
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={100}>
          <Services />
        </ScrollReveal>

        <ScrollReveal animation="fade-up">
          <HowItWorks />
        </ScrollReveal>

        <ScrollReveal animation="scale-up">
          <Packages />
        </ScrollReveal>

        <ScrollReveal animation="fade-in">
          <Testimonials />
        </ScrollReveal>

        <ScrollReveal animation="fade-up">
          <VideoCarousel />
        </ScrollReveal>

        {/* Blog Preview */}
        {posts.length > 0 && (
          <ScrollReveal animation="fade-up">
          <section className="py-20 bg-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Latest Articles</p>
                  <h2 className="text-3xl font-bold text-gray-900 font-serif mt-1">Nutrition Tips & Insights</h2>
                </div>
                <Link href="/blog" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View All Articles →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.map((post: any) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug?.current}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 hover:border-primary-200 transition-all group"
                  >
                    <div className="aspect-video bg-primary-50 flex items-center justify-center text-6xl">
                      {post.mainImage ? (
                        <img src={post.mainImage} alt={post.title} className="w-full h-full object-cover" />
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
                ))}
              </div>
            </div>
          </section>
          </ScrollReveal>
        )}

        <ScrollReveal animation="fade-up">
          <FAQ />
        </ScrollReveal>

        {/* Final CTA */}
        <ScrollReveal animation="blur-in">
        <section className="py-20 bg-warm-footer text-white text-center">
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
                href="/#packages"
                className="inline-flex items-center justify-center px-8 py-4 bg-cream text-warm-footer font-bold rounded-xl hover:bg-white transition-colors shadow-lg"
              >
                View Packages & Book
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
