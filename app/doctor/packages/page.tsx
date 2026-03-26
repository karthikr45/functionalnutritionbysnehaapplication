'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  sessions: number;
  validity: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
}

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  sessions: 1,
  validity: 30,
  features: [''],
  isActive: true,
  isPopular: false,
  sortOrder: 0,
};

export default function DoctorPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    const res = await fetch('/api/packages');
    const data = await res.json();
    const pkgs = (data.packages || []).map((p: any) => ({
      ...p,
      features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]'),
    }));
    setPackages(pkgs);
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setForm({ ...emptyForm, sortOrder: packages.length });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (pkg: Package) => {
    setForm({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      sessions: pkg.sessions,
      validity: pkg.validity,
      features: pkg.features.length > 0 ? pkg.features : [''],
      isActive: pkg.isActive,
      isPopular: pkg.isPopular,
      sortOrder: pkg.sortOrder,
    });
    setEditingId(pkg.id);
    setShowForm(true);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...form.features];
    updated[index] = value;
    setForm({ ...form, features: updated });
  };

  const addFeature = () => setForm({ ...form, features: [...form.features, ''] });

  const removeFeature = (index: number) => {
    if (form.features.length <= 1) return;
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || form.price <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      features: form.features.filter((f) => f.trim() !== ''),
    };

    try {
      const url = editingId ? `/api/packages/${editingId}` : '/api/packages';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingId ? 'Package updated!' : 'Package created!');
        resetForm();
        fetchPackages();
      } else {
        toast.error('Failed to save package');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setSaving(false);
  };

  const handleToggleActive = async (pkg: Package) => {
    const res = await fetch(`/api/packages/${pkg.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !pkg.isActive }),
    });
    if (res.ok) {
      toast.success(pkg.isActive ? 'Package deactivated' : 'Package activated');
      fetchPackages();
    }
  };

  const handleTogglePopular = async (pkg: Package) => {
    const res = await fetch(`/api/packages/${pkg.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPopular: !pkg.isPopular }),
    });
    if (res.ok) {
      toast.success(pkg.isPopular ? 'Removed popular badge' : 'Marked as popular');
      fetchPackages();
    }
  };

  const handleDelete = async (pkg: Package) => {
    if (!confirm(`Are you sure you want to delete "${pkg.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/packages/${pkg.id}`, { method: 'DELETE' });
    if (res.ok) {
      const data = await res.json();
      toast.success(data.message);
      fetchPackages();
    } else {
      toast.error('Failed to delete package');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Manage Packages</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage consultation packages displayed on your website.</p>
        </div>
        <button
          onClick={showForm ? resetForm : openCreate}
          className={`px-5 py-2.5 font-semibold rounded-xl text-sm transition-colors ${
            showForm
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {showForm ? '✕ Cancel' : '+ Create Package'}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">
            {editingId ? 'Edit Package' : 'Create New Package'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Package Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Starter Plan"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Price (INR) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                min={1}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Brief description of the package..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Number of Sessions *</label>
              <input
                type="number"
                value={form.sessions}
                onChange={(e) => setForm({ ...form, sessions: Number(e.target.value) })}
                min={1}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Validity (days)</label>
              <input
                type="number"
                value={form.validity}
                onChange={(e) => setForm({ ...form, validity: Number(e.target.value) })}
                min={1}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                min={0}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Features / Highlights</label>
            <div className="space-y-2">
              {form.features.map((feature, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder={`Feature ${idx + 1}`}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
                  />
                  {form.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-xs text-primary-600 hover:underline font-medium"
              >
                + Add Feature
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Active (visible to patients)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPopular}
                onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Mark as Popular</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {saving ? 'Saving...' : editingId ? 'Update Package' : 'Create Package'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Packages List */}
      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">Loading packages...</div>
      ) : packages.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📦</p>
          <h3 className="font-semibold text-gray-700 mb-2">No packages yet</h3>
          <p className="text-gray-400 text-sm mb-5">Create your first consultation package to display on the website.</p>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 transition-colors"
          >
            + Create Package
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 ${
                pkg.isActive ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-lg">{pkg.name}</h3>
                    {pkg.isPopular && (
                      <span className="px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-bold rounded-full">
                        POPULAR
                      </span>
                    )}
                    {!pkg.isActive && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <span className="text-primary-700 font-bold">{formatCurrency(pkg.price)}</span>
                    <span className="text-gray-500">{pkg.sessions} sessions</span>
                    <span className="text-gray-500">{pkg.validity} days validity</span>
                    <span className="text-gray-400">Order: {pkg.sortOrder}</span>
                  </div>
                  {pkg.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {pkg.features.map((f, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-100">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="px-3 py-2 bg-primary-50 text-primary-700 text-xs font-medium rounded-xl hover:bg-primary-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl ${
                      pkg.isActive
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    }`}
                  >
                    {pkg.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleTogglePopular(pkg)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl ${
                      pkg.isPopular
                        ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    {pkg.isPopular ? 'Unmark Popular' : 'Mark Popular'}
                  </button>
                  <button
                    onClick={() => handleDelete(pkg)}
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
