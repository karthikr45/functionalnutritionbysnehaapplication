import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';
import AddToCartClientWrapper from './AddToCartClient';
import ReviewFormClientWrapper from './ReviewFormClient';

async function fetchProduct(slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/products/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()).product;
}

async function fetchReviews(productId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/products/${productId}/reviews`, { cache: 'no-store' });
  if (!res.ok) return { reviews: [], total: 0 };
  return res.json();
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`${cls} ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await fetchProduct(params.slug);
  if (!product) notFound();

  const rawImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
  const images: { url: string; publicId?: string }[] = rawImages.map((img: any) =>
    typeof img === 'string' ? { url: img } : img
  );
  const benefits: string[] =
    typeof product.benefits === 'string' ? JSON.parse(product.benefits) : product.benefits || [];
  const tags: string[] =
    typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags || [];

  const { reviews } = await fetchReviews(product.id);
  const mainImage = images[0]?.url || '';
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <a href="/products" className="hover:text-primary-600">Products</a>
          {product.category && (
            <><span className="mx-2">/</span><span>{product.category.name}</span></>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Top */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200">
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain p-4" />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  -{discountPct}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-white hover:border-primary-500 transition-colors">
                    <img src={img.url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain p-1" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span key={tag} className="text-xs font-semibold px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                    {tag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 font-serif mb-3">{product.name}</h1>

            {product.totalReviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={product.avgRating} />
                <span className="text-sm text-gray-600">
                  {product.avgRating.toFixed(1)} ({product.totalReviews} review{product.totalReviews !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-primary-700">
                {formatCurrency(hasDiscount ? product.salePrice! : product.price)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-gray-600 leading-relaxed mb-6">{product.shortDescription}</p>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    {product.stock <= product.lowStockThreshold ? `Only ${product.stock} left` : 'In Stock'}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            <AddToCartClientWrapper
              productId={product.id}
              name={product.name}
              price={product.price}
              salePrice={product.salePrice}
              image={mainImage}
              stock={product.stock}
              slug={product.slug}
            />

            {product.weight && (
              <p className="text-sm text-gray-500 mt-4">Weight: {product.weight}</p>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 font-serif mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {benefits.length > 0 && (
            <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100">
              <h2 className="text-xl font-bold text-gray-900 font-serif mb-4">Benefits</h2>
              <ul className="space-y-3">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Ingredients & How to Use */}
        {(product.ingredients || product.howToUse) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {product.ingredients && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 font-serif mb-4">Ingredients</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.ingredients}</p>
              </div>
            )}
            {product.howToUse && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 font-serif mb-4">How to Use</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.howToUse}</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6">
            Customer Reviews{product.totalReviews > 0 && ` (${product.totalReviews})`}
          </h2>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                        {review.user?.name?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.title && <p className="font-semibold text-gray-800 mt-2">{review.title}</p>}
                  {review.comment && <p className="text-gray-600 text-sm mt-1">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <ReviewFormClientWrapper productId={product.id} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
