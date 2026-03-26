'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartProvider';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Product {
  id: string; slug: string; name: string; shortDescription?: string;
  price: number; salePrice?: number | null; images: string[];
  avgRating: number; reviewCount: number; tags: string[];
  stock: number; isActive: boolean;
  category?: { name: string; slug: string };
}

interface Category { id: string; name: string; slug: string; _count: { products: number } }

const TAG_OPTIONS = ['POPULAR', 'BEST_SELLER', 'NEW_ARRIVAL'] as const;
const TAG_COLORS: Record<string, string> = {
  POPULAR: 'bg-amber-100 text-amber-800',
  BEST_SELLER: 'bg-red-100 text-red-800',
  NEW_ARRIVAL: 'bg-blue-100 text-blue-800',
};
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch('/api/products/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: '12', search, category, tag, sort,
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load products'); }
    setLoading(false);
  }, [page, search, category, tag, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => { setPage(1); }, [search, category, tag, sort]);

  const handleAddToCart = (p: Product) => {
    if (p.stock < 1) return toast.error('Out of stock');
    addToCart({
      productId: p.id, name: p.name, price: p.salePrice ?? p.price,
      salePrice: p.salePrice, image: p.images?.[0], stock: p.stock, slug: p.slug,
    });
    toast.success(`${p.name} added to cart`);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">({rating.toFixed(1)})</span>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-primary-600 text-white py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Products</h1>
          <p className="text-primary-100 max-w-xl mx-auto">Curated nutrition supplements to support your wellness journey</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search & Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search products..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setCategory('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${!category ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-primary-50'}`}>
              All
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setCategory(c.slug)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${category === c.slug ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-primary-50'}`}>
                {c.name} ({c._count.products})
              </button>
            ))}
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TAG_OPTIONS.map(t => (
              <button key={t} onClick={() => setTag(tag === t ? '' : t)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${tag === t ? TAG_COLORS[t] + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-4">{total} product{total !== 1 ? 's' : ''} found</p>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                  <div className="h-56 bg-gray-200 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
                  <Link href={`/products/${p.slug}`} className="block relative">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-56 object-cover" />
                    ) : (
                      <div className="w-full h-56 bg-primary-50 flex items-center justify-center text-primary-300">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {p.salePrice && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(((p.price - p.salePrice) / p.price) * 100)}% OFF
                      </span>
                    )}
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    {/* Tags */}
                    {p.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {p.tags.map(t => (
                          <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[t] || 'bg-gray-100 text-gray-600'}`}>
                            {t.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link href={`/products/${p.slug}`} className="font-semibold text-gray-900 hover:text-primary-600 transition line-clamp-1">
                      {p.name}
                    </Link>
                    {p.shortDescription && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.shortDescription}</p>
                    )}
                    <div className="mt-2">{renderStars(p.avgRating || 0)}</div>
                    <div className="mt-auto pt-3 flex items-end justify-between">
                      <div>
                        {p.salePrice ? (
                          <>
                            <span className="text-lg font-bold text-primary-600">{formatCurrency(p.salePrice)}</span>
                            <span className="text-sm text-gray-400 line-through ml-2">{formatCurrency(p.price)}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-primary-600">{formatCurrency(p.price)}</span>
                        )}
                        <p className={`text-xs mt-0.5 ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {p.stock > 0 ? (p.stock <= 5 ? `Only ${p.stock} left` : 'In Stock') : 'Out of Stock'}
                        </p>
                      </div>
                      <button onClick={() => handleAddToCart(p)} disabled={p.stock < 1}
                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | string)[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  typeof p === 'string' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${page === p ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-primary-50'}`}>
                      {p}
                    </button>
                  )
                )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
