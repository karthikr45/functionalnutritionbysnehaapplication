'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { products: number };
}

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', image: '', sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch('/api/products/categories');
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', image: '', sortOrder: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setForm({ name: '', description: '', image: '', sortOrder: categories.length });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      sortOrder: cat.sortOrder,
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }

    setSaving(true);
    const url = editingId ? `/api/products/categories/${editingId}` : '/api/products/categories';
    const method = editingId ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description || null,
        image: form.image || null,
        sortOrder: form.sortOrder,
      }),
    });
    setSaving(false);

    if (res.ok) {
      toast.success(editingId ? 'Category updated!' : 'Category created!');
      resetForm();
      fetchCategories();
    } else {
      toast.error('Failed to save category');
    }
  };

  const handleToggleActive = async (cat: Category) => {
    const res = await fetch(`/api/products/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    if (res.ok) {
      toast.success(cat.isActive ? 'Category deactivated' : 'Category activated');
      fetchCategories();
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete "${cat.name}"? ${cat._count.products > 0 ? 'It has products and will be deactivated instead.' : 'This cannot be undone.'}`)) return;
    const res = await fetch(`/api/products/categories/${cat.id}`, { method: 'DELETE' });
    if (res.ok) {
      const data = await res.json();
      toast.success(data.message);
      fetchCategories();
    } else {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Product Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage categories for your supplement products.</p>
        </div>
        <button
          onClick={showForm ? resetForm : openCreate}
          className={`px-5 py-2.5 font-semibold rounded-xl text-sm transition-colors ${
            showForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {showForm ? '✕ Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900">{editingId ? 'Edit Category' : 'New Category'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Category Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Vitamins & Minerals"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Brief description of this category..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Image URL (optional)</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm transition-colors">
              {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">Loading categories...</div>
      ) : categories.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📁</p>
          <h3 className="font-semibold text-gray-700 mb-2">No categories yet</h3>
          <p className="text-gray-400 text-sm mb-5">Create categories to organize your products.</p>
          <button onClick={openCreate} className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700">
            + Add Category
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 ${
                cat.isActive ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon/Image */}
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">📁</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{cat.name}</h3>
                    <span className="text-xs text-gray-400 font-mono">/{cat.slug}</span>
                    {!cat.isActive && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">INACTIVE</span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>
                  )}
                  <div className="flex gap-4 mt-1 text-xs text-gray-400">
                    <span>{cat._count.products} product{cat._count.products !== 1 ? 's' : ''}</span>
                    <span>Order: {cat.sortOrder}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    className="px-3 py-2 bg-primary-50 text-primary-700 text-xs font-medium rounded-xl hover:bg-primary-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl ${
                      cat.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    }`}
                  >
                    {cat.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-xl hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
