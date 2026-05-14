'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type Type = 'TESTIMONIAL' | 'CASE_STUDY';

type Status = 'all' | 'pending' | 'approved' | 'rejected';

interface Testimonial {
  id: string;
  authorId: string;
  source: 'DOCTOR' | 'PATIENT';
  patientName: string;
  type: Type;
  title: string | null;
  quote: string | null;
  content: string;
  rating: number;
  imageUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isApproved: boolean;
  approvedAt: string | null;
  approvalNote: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  author?: { name: string; email: string; role: string };
}

const emptyForm = {
  patientName: '',
  type: 'TESTIMONIAL' as Type,
  title: '',
  quote: '',
  content: '',
  rating: 5,
  imageUrl: '',
  isPublished: true,
  isFeatured: false,
  sortOrder: 0,
};

export default function DoctorTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all';

  const uploadImage = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max file size is 5MB');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/doctor/testimonials/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      const { url } = await res.json();
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Image uploaded');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const [status, setStatus] = useState<Status>('all');
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  const load = (s: Status = status) => {
    setLoading(true);
    const url = s === 'all' ? '/api/doctor/testimonials' : `/api/doctor/testimonials?status=${s}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.testimonials || []);
        if (d.counts) setCounts(d.counts);
      })
      .catch(() => toast.error('Failed to load testimonials'))
      .finally(() => setLoading(false));
  };

  const moderate = async (id: string, action: 'approve' | 'reject', note?: string) => {
    try {
      const res = await fetch(`/api/doctor/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(action === 'approve' ? 'Approved — now visible on the homepage.' : 'Rejected.');
      load(status);
    } catch {
      toast.error('Action failed.');
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };

  const openEdit = (t: Testimonial) => {
    setForm({
      patientName: t.patientName,
      type: t.type,
      title: t.title ?? '',
      quote: t.quote ?? '',
      content: t.content,
      rating: t.rating,
      imageUrl: t.imageUrl ?? '',
      isPublished: t.isPublished,
      isFeatured: t.isFeatured,
      sortOrder: t.sortOrder,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName.trim() || !form.content.trim()) {
      toast.error('Patient name and content are required');
      return;
    }
    setSaving(true);
    try {
      const url = editingId
        ? `/api/doctor/testimonials/${editingId}`
        : '/api/doctor/testimonials';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Save failed');
      }
      toast.success(editingId ? 'Testimonial updated' : 'Testimonial created');
      resetForm();
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/doctor/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const togglePublished = async (t: Testimonial) => {
    try {
      const res = await fetch(`/api/doctor/testimonials/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !t.isPublished }),
      });
      if (!res.ok) throw new Error('Update failed');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials &amp; Case Studies</h1>
          <p className="text-sm text-gray-500 mt-1">Stories you write here are published immediately. Patient submissions wait for your approval before appearing on the homepage.</p>
        </div>
        <button
          onClick={showForm ? resetForm : openCreate}
          className="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Story'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Patient name *</label>
              <input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Type })} className={inputCls}>
                <option value="TESTIMONIAL">Testimonial</option>
                <option value="CASE_STUDY">Case Study</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Title (optional)</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. From bloated to balanced in 12 weeks" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Pull-quote (optional)</label>
            <textarea
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              rows={2}
              className={inputCls}
              placeholder='A short standout line from the patient. e.g. "I finally feel like myself again."'
            />
            <p className="text-[11px] text-gray-400 mt-1">Shown larger and italic at the top of the card.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Story / Content *</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={form.type === 'CASE_STUDY' ? 8 : 4} className={inputCls} placeholder="The patient's words, your case write-up, or before/after summary." required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Rating (1–5)</label>
              <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Sort order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputCls} placeholder="Lower = shown earlier" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Image (optional)</label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors">
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file);
                      e.target.value = '';
                    }}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className={inputCls}
                  placeholder="…or paste a URL"
                />
              </div>
            </div>
          </div>

          {form.imageUrl && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
              <button type="button" onClick={() => setForm({ ...form, imageUrl: '' })} className="text-xs text-gray-500 hover:text-red-600 underline">Remove image</button>
            </div>
          )}

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              Published (visible on site)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              Featured (sorted to top)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-colors">
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-1 mb-5 border-b border-gray-200 overflow-x-auto">
        {([
          { key: 'all', label: 'All' },
          { key: 'pending', label: `Pending review${counts.pending ? ` (${counts.pending})` : ''}` },
          { key: 'approved', label: `Approved${counts.approved ? ` (${counts.approved})` : ''}` },
          { key: 'rejected', label: `Rejected${counts.rejected ? ` (${counts.rejected})` : ''}` },
        ] as { key: Status; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatus(tab.key); load(tab.key); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              status === tab.key
                ? 'border-primary-700 text-primary-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-cream-dark rounded-2xl">
          <p className="text-gray-500 text-sm">
            {status === 'pending'
              ? 'No pending submissions. Patient stories will appear here for review.'
              : status === 'rejected'
              ? 'No rejected stories.'
              : 'No stories yet. Click + New Story to add the first one.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => {
            const isPending = !t.isApproved && !t.approvedAt;
            const isRejected = !t.isApproved && !!t.approvedAt;
            return (
              <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-700">
                      {t.type === 'CASE_STUDY' ? 'Case Study' : 'Testimonial'}
                    </span>
                    {t.source === 'PATIENT' && (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">Patient submission</span>
                    )}
                    {isPending && (
                      <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">Pending review</span>
                    )}
                    {isRejected && (
                      <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full">Rejected</span>
                    )}
                    {t.isApproved && t.source === 'PATIENT' && (
                      <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">Approved</span>
                    )}
                    {t.isFeatured && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Featured</span>}
                    {!t.isPublished && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Hidden</span>}
                  </div>
                  <p className="font-semibold text-gray-900">{t.patientName}</p>
                  {t.source === 'PATIENT' && t.author?.email && (
                    <p className="text-[11px] text-gray-400">Submitted by {t.author.name || t.author.email}</p>
                  )}
                  {t.title && <p className="text-sm text-gray-700 mt-0.5">{t.title}</p>}
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{t.content}</p>
                  <div className="text-xs text-amber-500 mt-1">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
                  {t.approvalNote && (
                    <p className="text-[11px] text-gray-500 mt-2 italic">Note: {t.approvalNote}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                  {isPending && (
                    <>
                      <button
                        onClick={() => moderate(t.id, 'approve')}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const note = prompt('Optional reason (shown to the patient on their submissions page):') ?? undefined;
                          moderate(t.id, 'reject', note || undefined);
                        }}
                        className="px-4 py-1.5 text-xs font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {isRejected && (
                    <button
                      onClick={() => moderate(t.id, 'approve')}
                      className="px-4 py-1.5 text-xs font-semibold text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  <button onClick={() => openEdit(t)} className="px-4 py-1.5 text-xs font-semibold text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">Edit</button>
                  <button onClick={() => togglePublished(t)} className="px-4 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    {t.isPublished ? 'Hide' : 'Publish'}
                  </button>
                  <button onClick={() => remove(t.id)} className="px-4 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
