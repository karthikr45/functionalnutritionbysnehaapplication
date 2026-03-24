import { client } from '@/sanity/lib/client';
import { POST_BY_SLUG_QUERY, ALL_POSTS_QUERY } from '@/sanity/lib/queries';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PortableText } from '@portabletext/react';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const posts = await client.fetch(ALL_POSTS_QUERY);
    return posts.map((p: any) => ({ slug: p.slug?.current })).filter(Boolean);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const post = await client.fetch(POST_BY_SLUG_QUERY, { slug: params.slug });
    if (!post) return {};
    return {
      title: `${post.title} | Functional Nutrition by Sneha`,
      description: post.excerpt,
    };
  } catch {
    return {};
  }
}

const ptComponents = {
  block: {
    h2: ({ children }: any) => <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-serif">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>,
    normal: ({ children }: any) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-green-400 pl-5 py-2 my-5 bg-green-50 rounded-r-xl italic text-green-800">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc list-inside space-y-2 mb-5 text-gray-700">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal list-inside space-y-2 mb-5 text-gray-700">{children}</ol>,
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-bold text-gray-900">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    link: ({ children, value }: any) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
        {children}
      </a>
    ),
  },
};

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post: any;
  try {
    post = await client.fetch(POST_BY_SLUG_QUERY, { slug: params.slug });
  } catch {
    notFound();
  }

  if (!post) notFound();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <div className="bg-gradient-to-br from-green-50 to-white py-12">
          <div className="max-w-3xl mx-auto px-4">
            <Link href="/blog" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium mb-6">
              ← Back to Blog
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories?.map((c: any) => (
                <span key={c.title} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  {c.title}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight font-serif">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-gray-600 mt-4 leading-relaxed">{post.excerpt}</p>
            )}

            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
              {post.author?.image && (
                <img src={post.author.image} alt={post.author.name} className="w-10 h-10 rounded-full" />
              )}
              <div>
                {post.author?.name && <p className="font-medium text-gray-800">{post.author.name}</p>}
                <div className="flex items-center gap-2">
                  {post.publishedAt && <span>{format(new Date(post.publishedAt), 'dd MMMM yyyy')}</span>}
                  {post.readTime && <span>• {post.readTime} min read</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature image */}
        {post.mainImage && (
          <div className="max-w-4xl mx-auto px-4 -mt-4">
            <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
              <img src={post.mainImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Body */}
        <article className="max-w-3xl mx-auto px-4 py-12">
          {post.body ? (
            <div className="prose max-w-none">
              <PortableText value={post.body} components={ptComponents} />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">Content coming soon...</p>
          )}

          {/* CTA */}
          <div className="mt-12 p-8 bg-green-50 border border-green-100 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-gray-900 font-serif mb-2">
              Ready to transform your health?
            </h3>
            <p className="text-gray-600 text-sm mb-5">
              Get a personalized functional nutrition plan from Sneha and start your healing journey today.
            </p>
            <Link
              href="/#packages"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
            >
              Book a Consultation →
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
