'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

type Status = 'pending' | 'approved' | 'rejected';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  approvedAt: string | null;
  approvalNote: string | null;
  user: { name: string; email: string };
  product: { name: string };
}

export default function ReviewsModerationPage() {
  return <Suspense><Content /></Suspense>;
}

function Content() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get('status') as Status) || 'pending';
  const [status, setStatus] = useState<Status>(initial);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doctor/reviews?status=${status}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setCounts(data.counts || { pending: 0, approved: 0, rejected: 0 });
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const act = async (id: string, action: 'approve' | 'reject', note?: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/doctor/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(action === 'approve' ? 'Review approved — now visible on the homepage.' : 'Review rejected.');
      setNoteOpen(null);
      setNoteText('');
      load();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setActing(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this review permanently? This cannot be undone.')) return;
    setActing(id);
    try {
      const res = await fetch(`/api/doctor/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Review deleted.');
      load();
    } catch {
      toast.error('Delete failed.');
    } finally {
      setActing(null);
    }
  };

  const TABS: { value: Status; label: string; count: number }[] = [
    { value: 'pending', label: 'Pending', count: counts.pending },
    { value: 'approved', label: 'Approved', count: counts.approved },
    { value: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Review Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">Approve patient-submitted product reviews before they appear publicly.</p>
      </div>

      <div className="flex border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              status === t.value ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              status === t.value ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">✨</p>
          <p className="text-gray-500 text-sm">
            {status === 'pending' && 'No reviews awaiting approval. New submissions will appear here.'}
            {status === 'approved' && 'No approved reviews yet.'}
            {status === 'rejected' && 'No rejected reviews.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <article key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                      {r.user.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{r.user.name}</p>
                      <p className="text-xs text-gray-500">{r.user.email} · {r.product.name}</p>
                    </div>
                    <div className="ml-2 text-amber-400 text-sm">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </div>
                  </div>
                  {r.title && <p className="font-semibold text-gray-800 text-sm mt-3">{r.title}</p>}
                  {r.comment && <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{r.comment}</p>}
                  <p className="text-xs text-gray-400 mt-3">
                    Submitted {new Date(r.createdAt).toLocaleString()}
                    {r.approvedAt && ` · Last action ${new Date(r.approvedAt).toLocaleString()}`}
                  </p>
                  {r.approvalNote && (
                    <p className="text-xs italic text-gray-500 mt-1">Internal note: &ldquo;{r.approvalNote}&rdquo;</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                  {status !== 'approved' && (
                    <button
                      disabled={acting === r.id}
                      onClick={() => act(r.id, 'approve')}
                      className="px-4 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                    >
                      ✓ Approve
                    </button>
                  )}
                  {status !== 'rejected' && (
                    <button
                      disabled={acting === r.id}
                      onClick={() => { setNoteOpen(r.id); setNoteText(''); }}
                      className="px-4 py-2 text-xs font-semibold text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50 disabled:opacity-50 transition-colors"
                    >
                      ✕ Reject
                    </button>
                  )}
                  <button
                    disabled={acting === r.id}
                    onClick={() => remove(r.id)}
                    className="px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {noteOpen === r.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <label className="text-xs font-medium text-gray-600">Optional internal note for why this is being rejected</label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    placeholder="e.g. Off-topic / inappropriate language / duplicate"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={acting === r.id}
                      onClick={() => act(r.id, 'reject', noteText)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => { setNoteOpen(null); setNoteText(''); }}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
