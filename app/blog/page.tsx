import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { ALL_POSTS_QUERY } from '@/sanity/lib/queries';
import Link from 'next/link';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Blog — Functional Nutrition Insights & Recipes',
  description:
    'Evidence-based articles on gut health, PMOS, thyroid, diabetes, pregnancy nutrition, weight management and more. Practical recipes and tips you can use today.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Gut Shell Blog — Functional Nutrition Insights',
    description: 'Articles on gut health, PMOS, thyroid, diabetes, pregnancy nutrition & weight management — with recipes.',
    url: 'https://gutshell.com/blog',
  },
};
import Footer from '@/components/Footer';

export const revalidate = 60;

async function getPosts() {
  try { return await client.fetch(ALL_POSTS_QUERY); }
  catch { return []; }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main>
        {/* Hero */}
        <div className="bg-gradient-to-br from-cream-dark to-cream py-16 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Expert Insights</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-serif mt-3">
              Nutrition Blog
            </h1>
            <p className="text-gray-600 text-lg mt-4">
              Evidence-based articles on nutrition, health, wellness, and lifestyle transformation.
              Written by the Gut Shell team.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">✍️</p>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Articles Coming Soon</h3>
              <p className="text-gray-400">
                Check back soon for expert nutrition insights.{' '}
                <Link href="/#contact" className="text-primary-600 hover:underline">Subscribe for updates.</Link>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug?.current}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200 group flex flex-col"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary-50 to-primary-50 flex items-center justify-center overflow-hidden">
                    {post.mainImage ? (
                      <img src={post.mainImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-6xl">🥗</span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.categories?.[0] && (
                        <span className="px-2.5 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
                          {post.categories[0].title}
                        </span>
                      )}
                      {post.isFeatured && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-medium rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-primary-600 transition-colors flex-1">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                      {post.author?.name && <span>By {post.author.name}</span>}
                      {post.publishedAt && <span>• {format(new Date(post.publishedAt), 'dd MMM yyyy')}</span>}
                      {post.readTime && <span>• {post.readTime} min read</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
