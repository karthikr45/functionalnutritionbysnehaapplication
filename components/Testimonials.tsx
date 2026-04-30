'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  user: { name: string };
  product: { name: string };
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/reviews/latest')
      .then((r) => r.json())
      .then((d) => { setReviews(d.reviews || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  // Don't show section if no real reviews exist
  if (loaded && reviews.length === 0) return null;
  if (!loaded) return null;

  return (
    <section id="testimonials" className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">What Our Clients Say</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
            Client Reviews
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Real feedback from our clients about their experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                    {r.user.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{r.user.name}</p>
                    <p className="text-xs text-gray-500">{r.product.name}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < r.rating ? 'text-amber-400' : 'text-gray-300'}>&#9733;</span>
                ))}
              </div>

              {r.title && <p className="font-semibold text-gray-800 text-sm mb-1">{r.title}</p>}
              {r.comment && <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
