'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type Type = 'TESTIMONIAL' | 'CASE_STUDY';

interface Testimonial {
  id: string;
  authorId: string;
  patientName: string;
  type: Type;
  title: string | null;
  content: string;
  rating: number;
  imageUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  patientName: '',
  type: 'TESTIMONIAL' as Type,
  title: '',
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

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all';

  const load = () => {
    setLoading(true);
    fetch('/api/doctor/testimonials')
      .then((r) => r.json())
      .then((d) => setItems(d.testimonials || []))
      .catch(() => toast.error('Failed to load testimonials'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };

  const openEdit = (t: Testimonial) => {
    setForm({
      patientName: t.patientName,
      type: t.type,
      title: t.title ?? '',
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
          <p className="text-sm text-gray-500 mt-1">Stories you write here are shown on the public homepage.</p>
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Image URL (optional)</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={inputCls} placeholder="https://…" />
            </div>
          </div>

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

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-cream-dark rounded-2xl">
          <p className="text-gray-500 text-sm">No stories yet. Click <strong>+ New Story</strong> to add the first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-700">
                    {t.type === 'CASE_STUDY' ? 'Case Study' : 'Testimonial'}
                  </span>
                  {t.isFeatured && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Featured</span>}
                  {!t.isPublished && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Hidden</span>}
                </div>
                <p className="font-semibold text-gray-900">{t.patientName}</p>
                {t.title && <p className="text-sm text-gray-700 mt-0.5">{t.title}</p>}
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{t.content}</p>
                <div className="text-xs text-amber-500 mt-1">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => openEdit(t)} className="px-4 py-1.5 text-xs font-semibold text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">Edit</button>
                <button onClick={() => togglePublished(t)} className="px-4 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {t.isPublished ? 'Hide' : 'Publish'}
                </button>
                <button onClick={() => remove(t.id)} className="px-4 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
