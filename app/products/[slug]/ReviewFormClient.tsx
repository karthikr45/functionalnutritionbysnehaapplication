'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ReviewFormClientWrapper({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  if (!session) {
    return <p className="text-sm text-gray-500">Please log in to write a review.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !orderId) {
      setMessage('Please provide a rating and order ID.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title, comment, orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      setMessage('Review submitted successfully!');
      setRating(0);
      setTitle('');
      setComment('');
      setOrderId('');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>

      {/* Star selector */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <svg
              className={`w-7 h-7 ${star <= (hover || rating) ? 'text-amber-400' : 'text-gray-300'} transition-colors`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Order ID (from your delivered order)"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        required
      />
      <input
        type="text"
        placeholder="Review title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <textarea
        placeholder="Your review (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
      />

      {message && (
        <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
