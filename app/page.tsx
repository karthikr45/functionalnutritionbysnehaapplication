import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import HowItWorks from '@/components/HowItWorks';
import Packages from '@/components/Packages';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { client } from '@/sanity/lib/client';
import { RECENT_POSTS_QUERY } from '@/sanity/lib/queries';
import Link from 'next/link';
import { format } from 'date-fns';

async function getRecentPosts() {
  try {
    return await client.fetch(RECENT_POSTS_QUERY);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getRecentPosts();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <HowItWorks />
        <Packages />
        <Testimonials />

        {/* Blog Preview */}
        {posts.length > 0 && (
          <section className="py-20 bg-gray-50">
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
        )}

        {/* Final CTA */}
        <section className="py-20 bg-primary-600 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-4">
              Ready to Transform Your Health?
            </h2>
            <p className="text-primary-100 text-lg mb-8">
              Join 5,000+ patients who have achieved their health goals with personalized nutrition guidance.
              Your journey to better health starts with a single consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
              >
                Book Your First Consultation
              </Link>
              <Link
                href="/#packages"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                View Packages
              </Link>
            </div>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </div>
  );
}
