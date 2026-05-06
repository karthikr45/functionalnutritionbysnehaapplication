'use client';

import { useState, useEffect } from 'react';

type Type = 'TESTIMONIAL' | 'CASE_STUDY';

interface Story {
  id: string;
  patientName: string;
  type: Type;
  title: string | null;
  quote: string | null;
  content: string;
  rating: number;
  imageUrl: string | null;
  isFeatured: boolean;
  createdAt: string;
}

// Roughly the character count at which content overflows the default 4-line clamp.
// Stories shorter than this don't get a Read more button.
const COLLAPSE_THRESHOLD = 240;

function StoryCard({ s }: { s: Story }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = s.content.length > COLLAPSE_THRESHOLD;

  return (
    <article
      className={`rounded-2xl p-6 border transition-all duration-200 hover:shadow-md ${
        s.type === 'CASE_STUDY'
          ? 'bg-cream-dark border-primary-100/50'
          : 'bg-white border-gray-100 hover:border-primary-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700">
          {s.type === 'CASE_STUDY' ? 'Case Study' : 'Testimonial'}
        </span>
        {s.isFeatured && (
          <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full uppercase tracking-wider font-semibold">
            Featured
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 mb-3">
        {s.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.imageUrl} alt={s.patientName} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg shrink-0">
            {s.patientName[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{s.patientName}</p>
          <div className="flex gap-0.5 text-amber-400 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < s.rating ? 'text-amber-400' : 'text-gray-300'}>
                &#9733;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pull-quote (optional) */}
      {s.quote && (
        <blockquote className="font-serif italic text-lg text-gray-800 leading-snug border-l-2 border-primary-300 pl-4 my-4">
          &ldquo;{s.quote}&rdquo;
        </blockquote>
      )}

      {s.title && <p className="font-semibold text-gray-800 text-sm mb-1.5">{s.title}</p>}

      <p
        className={`text-warm-text text-sm leading-relaxed whitespace-pre-line ${
          isLong && !expanded ? 'line-clamp-4' : ''
        }`}
      >
        {s.content}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold text-primary-700 hover:text-primary-800 mt-3 inline-flex items-center gap-1"
        >
          {expanded ? 'Show less' : 'Read more'}
          <span aria-hidden className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            ↓
          </span>
        </button>
      )}
    </article>
  );
}

export default function SuccessStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/testimonials/published')
      .then((r) => r.json())
      .then((d) => {
        setStories(d.testimonials || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return null;
  if (stories.length === 0) return null;

  return (
    <section id="success-stories" className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Success Stories</p>
          <h2 className="text-3xl sm:text-4xl font-medium text-gray-900 font-serif mt-2">
            Real Patients. Real Transformations.
          </h2>
          <p className="text-warm-text mt-4 max-w-2xl mx-auto text-base">
            Testimonials and case studies from clients who&apos;ve healed from the root cause through functional nutrition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {stories.map((s) => (
            <StoryCard key={s.id} s={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
