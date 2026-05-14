'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface MySubmission {
  id: string;
  patientName: string;
  title: string | null;
  content: string;
  rating: number;
  isApproved: boolean;
  approvedAt: string | null;
  approvalNote: string | null;
  isPublished: boolean;
  createdAt: string;
}

const inputCls =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all';

export default function PatientTestimonialsPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientName: '',
    title: '',
    content: '',
    rating: 5,
  });

  const load = () => {
    setLoading(true);
    fetch('/api/patient/testimonials')
      .then((r) => r.json())
      .then((d) => setSubmissions(d.testimonials || []))
      .catch(() => toast.error('Failed to load your stories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (session?.user?.name && !form.patientName) {
      setForm((f) => ({ ...f, patientName: session.user!.name as string }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.name]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) {
      toast.error('Please share your story before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/patient/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Submission failed');
      }
      toast.success('Thanks! Your story is with Sneha for review.');
      setForm({ patientName: session?.user?.name || '', title: '', content: '', rating: 5 });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel = (s: MySubmission) => {
    if (s.isApproved) return { text: 'Published', cls: 'bg-green-50 text-green-700' };
    if (s.approvedAt) return { text: 'Not approved', cls: 'bg-red-50 text-red-700' };
    return { text: 'Awaiting review', cls: 'bg-amber-50 text-amber-700' };
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Share Your Story</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your story helps others on a similar journey. Sneha reviews every submission before it goes live on the homepage.
        </p>
      </div>

      <form onSubmit={submit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Display name</label>
            <input
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              className={inputCls}
              placeholder="How you'd like to be credited (e.g. first name + initial)"
            />
            <p className="text-[11px] text-gray-400 mt-1">Leave blank to stay anonymous.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Rating</label>
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              className={inputCls}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}  ({n}/5)</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Title (optional)</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputCls}
            placeholder="e.g. From bloated to balanced in 3 months"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Your story *</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={6}
            className={inputCls}
            placeholder="What changed for you? How did the program help?"
            required
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-gray-400">
            By submitting, you allow Sneha to publish your story (with your chosen display name) on the public site.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap ml-4"
          >
            {submitting ? 'Sending…' : 'Submit for review'}
          </button>
        </div>
      </form>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Your submissions</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : submissions.length === 0 ? (
          <div className="text-center py-10 bg-cream-dark rounded-2xl">
            <p className="text-gray-500 text-sm">You haven&apos;t shared a story yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => {
              const status = statusLabel(s);
              return (
                <div key={s.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.cls}`}>{status.text}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {s.title && <p className="font-semibold text-gray-900">{s.title}</p>}
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">{s.content}</p>
                  <div className="text-xs text-amber-500 mt-1">
                    {'★'.repeat(s.rating)}
                    {'☆'.repeat(5 - s.rating)}
                  </div>
                  {!s.isApproved && s.approvedAt && s.approvalNote && (
                    <p className="text-xs text-gray-500 mt-2 italic">Note from Sneha: {s.approvalNote}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
