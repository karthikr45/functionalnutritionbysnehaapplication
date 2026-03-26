'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

interface Category { id: string; name: string; slug: string; }
interface Product {
  id: string; name: string; description: string; shortDescription?: string;
  price: number; salePrice?: number | null; sku?: string; stock: number;
  lowStockThreshold: number; categoryId: string; category?: { name: string; slug: string };
  tags: string[]; benefits: string[]; ingredients?: string; howToUse?: string;
  weight?: string; images: string[]; isActive: boolean; isFeatured: boolean; sortOrder: number;
}

const TAG_OPTIONS = ['POPULAR', 'BEST_SELLER', 'NEW_ARRIVAL'] as const;

const emptyForm = {
  name: '', description: '', shortDescription: '', price: 0, salePrice: 0,
  sku: '', stock: 0, lowStockThreshold: 5, categoryId: '', tags: [] as string[],
  benefits: [''], ingredients: '', howToUse: '', weight: '', images: [''],
  isActive: true, isFeatured: false, sortOrder: 0,
};

export default function DoctorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch(`/api/products?limit=100${search ? `&search=${search}` : ''}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/products/categories');
    const data = await res.json();
    setCategories(data.categories || []);
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);
  useEffect(() => { const t = setTimeout(fetchProducts, 300); return () => clearTimeout(t); }, [search]);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const openCreate = () => {
    setForm({ ...emptyForm, sortOrder: products.length });
    setEditingId(null); setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description, shortDescription: p.shortDescription || '',
      price: p.price, salePrice: p.salePrice || 0, sku: p.sku || '', stock: p.stock,
      lowStockThreshold: p.lowStockThreshold, categoryId: p.categoryId,
      tags: Array.isArray(p.tags) ? p.tags : [], benefits: p.benefits?.length ? p.benefits : [''],
      ingredients: p.ingredients || '', howToUse: p.howToUse || '', weight: p.weight || '',
      images: p.images?.length ? p.images : [''], isActive: p.isActive,
      isFeatured: p.isFeatured, sortOrder: p.sortOrder,
    });
    setEditingId(p.id); setShowForm(true);
  };

  const handleListChange = (field: 'benefits' | 'images', idx: number, val: string) => {
    const updated = [...form[field]]; updated[idx] = val;
    setForm({ ...form, [field]: updated });
  };
  const addListItem = (field: 'benefits' | 'images') => setForm({ ...form, [field]: [...form[field], ''] });
  const removeListItem = (field: 'benefits' | 'images', idx: number) => {
    if (form[field].length <= 1) return;
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== idx) });
  };

  const toggleTag = (tag: string) => {
    const tags = form.tags.includes(tag) ? form.tags.filter(t => t !== tag) : [...form.tags, tag];
    setForm({ ...form, tags });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || form.price <= 0 || !form.categoryId) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    const payload = {
      ...form,
      salePrice: form.salePrice || null,
      benefits: form.benefits.filter(b => b.trim()),
      images: form.images.filter(i => i.trim()),
    };
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        toast.success(editingId ? 'Product updated!' : 'Product created!');
        resetForm(); fetchProducts();
      } else { toast.error('Failed to save product'); }
    } catch { toast.error('Something went wrong'); }
    setSaving(false);
  };

  const handleToggle = async (p: Product, field: 'isActive' | 'isFeatured') => {
    const res = await fetch(`/api/products/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !p[field] }),
    });
    if (res.ok) {
      const labels = { isActive: ['Deactivated', 'Activated'], isFeatured: ['Unfeatured', 'Featured'] };
      toast.success(`Product ${labels[field][p[field] ? 0 : 1].toLowerCase()}`);
      fetchProducts();
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Are you sure you want to delete "${p.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Product deactivated'); fetchProducts(); }
    else { toast.error('Failed to delete product'); }
  };

  const stockColor = (p: Product) => p.stock <= 0 ? 'text-red-600 font-bold'
    : p.stock <= p.lowStockThreshold ? 'text-amber-600 font-semibold' : 'text-gray-600';

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none';
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1.5';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Manage Products</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage products displayed in your store.</p>
        </div>
        <button onClick={showForm ? resetForm : openCreate}
          className={`px-5 py-2.5 font-semibold rounded-xl text-sm transition-colors ${showForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
          {showForm ? '\u2715 Cancel' : '+ Create Product'}
        </button>
      </div>

      {/* Search */}
      {!showForm && (
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none" />
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">{editingId ? 'Edit Product' : 'Create New Product'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} required /></div>
            <div><label className={labelCls}>Category *</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className={inputCls} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
          </div>
          <div><label className={labelCls}>Description *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputCls} resize-none`} required /></div>
          <div><label className={labelCls}>Short Description</label>
            <input type="text" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} className={inputCls} /></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><label className={labelCls}>Price (INR) *</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} min={1} className={inputCls} required /></div>
            <div><label className={labelCls}>Sale Price</label>
              <input type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: Number(e.target.value) })} min={0} className={inputCls} /></div>
            <div><label className={labelCls}>SKU</label>
              <input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={inputCls} /></div>
            <div><label className={labelCls}>Weight</label>
              <input type="text" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 250g" className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><label className={labelCls}>Stock *</label>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} min={0} className={inputCls} /></div>
            <div><label className={labelCls}>Low Stock Threshold</label>
              <input type="number" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} min={0} className={inputCls} /></div>
            <div><label className={labelCls}>Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} min={0} className={inputCls} /></div>
          </div>
          {/* Tags */}
          <div><label className={labelCls}>Tags</label>
            <div className="flex flex-wrap gap-3">
              {TAG_OPTIONS.map(tag => (
                <label key={tag} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.tags.includes(tag)} onChange={() => toggleTag(tag)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-700">{tag.replace('_', ' ')}</span>
                </label>
              ))}
            </div></div>
          {/* Benefits */}
          <div><label className={labelCls}>Benefits</label>
            <div className="space-y-2">
              {form.benefits.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={b} onChange={e => handleListChange('benefits', i, e.target.value)} placeholder={`Benefit ${i + 1}`} className={`flex-1 ${inputCls}`} />
                  {form.benefits.length > 1 && <button type="button" onClick={() => removeListItem('benefits', i)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">{'\u2715'}</button>}
                </div>))}
              <button type="button" onClick={() => addListItem('benefits')} className="text-xs text-primary-600 hover:underline font-medium">+ Add Benefit</button>
            </div></div>
          {/* Ingredients & How to Use */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Ingredients</label>
              <textarea value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })} rows={2} className={`${inputCls} resize-none`} /></div>
            <div><label className={labelCls}>How to Use</label>
              <textarea value={form.howToUse} onChange={e => setForm({ ...form, howToUse: e.target.value })} rows={2} className={`${inputCls} resize-none`} /></div>
          </div>
          {/* Images */}
          <div><label className={labelCls}>Images (URLs)</label>
            <div className="space-y-2">
              {form.images.map((img, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={img} onChange={e => handleListChange('images', i, e.target.value)} placeholder="https://..." className={`flex-1 ${inputCls}`} />
                  {form.images.length > 1 && <button type="button" onClick={() => removeListItem('images', i)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">{'\u2715'}</button>}
                </div>))}
              <button type="button" onClick={() => addListItem('images')} className="text-xs text-primary-600 hover:underline font-medium">+ Add Image</button>
            </div></div>
          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-gray-700">Active (visible in store)</span></label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-gray-700">Featured</span></label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm transition-colors">
              {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}</button>
            <button type="button" onClick={resetForm}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Product List */}
      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">Loading products...</div>
      ) : products.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">🛍️</p>
          <h3 className="font-semibold text-gray-700 mb-2">No products yet</h3>
          <p className="text-gray-400 text-sm mb-5">Create your first product to display in the store.</p>
          <button onClick={openCreate} className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 transition-colors">+ Create Product</button>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${p.isActive ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-60'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-lg">{p.name}</h3>
                    {p.isFeatured && <span className="px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-bold rounded-full">FEATURED</span>}
                    {p.tags?.map(t => <span key={t} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">{t.replace('_', ' ')}</span>)}
                    {!p.isActive && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">INACTIVE</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">{p.shortDescription || p.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <span className="text-primary-700 font-bold">{formatCurrency(p.price)}</span>
                    {p.salePrice ? <span className="text-green-600 font-semibold">Sale: {formatCurrency(p.salePrice)}</span> : null}
                    <span className={stockColor(p)}>Stock: {p.stock}</span>
                    {p.category && <span className="text-gray-500">{p.category.name}</span>}
                    <span className="text-gray-400">Order: {p.sortOrder}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(p)} className="px-3 py-2 bg-primary-50 text-primary-700 text-xs font-medium rounded-xl hover:bg-primary-100">Edit</button>
                  <button onClick={() => handleToggle(p, 'isActive')}
                    className={`px-3 py-2 text-xs font-medium rounded-xl ${p.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'}`}>
                    {p.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => handleToggle(p, 'isFeatured')}
                    className={`px-3 py-2 text-xs font-medium rounded-xl ${p.isFeatured ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>
                    {p.isFeatured ? 'Unfeature' : 'Feature'}</button>
                  <button onClick={() => handleDelete(p)} className="px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-xl hover:bg-red-100">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
