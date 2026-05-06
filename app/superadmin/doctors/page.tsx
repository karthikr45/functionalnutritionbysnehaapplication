'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import PasswordInput from '@/components/PasswordInput';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  doctorProfile: {
    bio: string | null;
    shortBio: string | null;
    specialization: string | null;
    qualifications: string | null;
    experience: number | null;
    consultationFee: number;
    followUpFee: number;
    profileImage: string | null;
    isAcceptingPatients: boolean;
  } | null;
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  shortBio: '',
  bio: '',
  specialization: '',
  qualifications: '',
  experience: 0,
  consultationFee: 500,
  followUpFee: 300,
  profileImage: '',
  isAcceptingPatients: true,
  isActive: true,
};

export default function SuperAdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/superadmin/doctors/upload-image', { method: 'POST', body: fd });
    setUploadingImage(false);
    if (res.ok) {
      const { url } = await res.json();
      setForm((f) => ({ ...f, profileImage: url }));
      toast.success('Photo uploaded');
    } else {
      const err = await res.json();
      toast.error(err.error || 'Upload failed');
    }
    e.target.value = '';
  };

  const fetchDoctors = async () => {
    setLoading(true);
    const res = await fetch('/api/superadmin/doctors');
    const data = await res.json();
    setDoctors(data.doctors || []);
    setLoading(false);
  };

  useEffect(() => { fetchDoctors(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (doc: Doctor) => {
    setForm({
      name: doc.name,
      email: doc.email,
      phone: doc.phone || '',
      password: '', // blank = don't change
      shortBio: doc.doctorProfile?.shortBio || '',
      bio: doc.doctorProfile?.bio || '',
      specialization: doc.doctorProfile?.specialization || '',
      qualifications: doc.doctorProfile?.qualifications || '',
      experience: doc.doctorProfile?.experience || 0,
      consultationFee: doc.doctorProfile?.consultationFee || 500,
      followUpFee: doc.doctorProfile?.followUpFee || 300,
      profileImage: doc.doctorProfile?.profileImage || '',
      isAcceptingPatients: doc.doctorProfile?.isAcceptingPatients ?? true,
      isActive: doc.isActive,
    });
    setEditingId(doc.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email are required'); return; }
    if (!editingId && !form.password) { toast.error('Password is required for new doctors'); return; }

    setSaving(true);
    const payload: any = { ...form };
    if (editingId && !form.password) delete payload.password; // don't update password if blank

    const url = editingId ? `/api/superadmin/doctors/${editingId}` : '/api/superadmin/doctors';
    const method = editingId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (res.ok) {
      toast.success(editingId ? 'Doctor updated!' : 'Doctor created! Welcome email sent.');
      resetForm();
      fetchDoctors();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to save');
    }
  };

  const handleToggleActive = async (doc: Doctor) => {
    const res = await fetch(`/api/superadmin/doctors/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !doc.isActive }),
    });
    if (res.ok) {
      toast.success(doc.isActive ? 'Doctor deactivated' : 'Doctor activated');
      fetchDoctors();
    }
  };

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none';
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1.5';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Manage Doctors</h1>
          <p className="text-sm text-gray-500 mt-1">Create doctor accounts, update credentials, and manage profiles.</p>
        </div>
        <button
          onClick={showForm ? resetForm : openCreate}
          className={`px-5 py-2.5 font-semibold rounded-xl text-sm transition-colors ${
            showForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {showForm ? '✕ Cancel' : '+ Create Doctor'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900">{editingId ? 'Edit Doctor' : 'New Doctor'}</h2>

          <div>
            <label className={labelCls}>Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary-50 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {form.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.profileImage} alt="Doctor" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🩺</span>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-block px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl cursor-pointer hover:bg-primary-100">
                  {uploadingImage ? 'Uploading...' : form.profileImage ? 'Change photo' : 'Upload photo'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                </label>
                {form.profileImage && (
                  <button type="button" onClick={() => setForm({ ...form, profileImage: '' })} className="ml-2 text-xs text-gray-500 hover:underline">
                    Remove
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP · max 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. Full Name" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="doctor@example.com" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password {editingId ? '(leave blank to keep current)' : '*'}</label>
              <PasswordInput value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" minLength={editingId ? 0 : 8} className={inputCls} required={!editingId} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Short Bio</label>
            <input type="text" value={form.shortBio} onChange={e => setForm({ ...form, shortBio: e.target.value })} placeholder="One-line description..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Full Bio</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Specialization</label>
              <input type="text" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="Gut Shell, PCOS..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Qualifications</label>
              <input type="text" value={form.qualifications} onChange={e => setForm({ ...form, qualifications: e.target.value })} placeholder="Certifications..." className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Experience (years)</label>
              <input type="number" value={form.experience} onChange={e => setForm({ ...form, experience: Number(e.target.value) })} min={0} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Consultation Fee (₹)</label>
              <input type="number" value={form.consultationFee} onChange={e => setForm({ ...form, consultationFee: Number(e.target.value) })} min={0} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Follow-up Fee (₹)</label>
              <input type="number" value={form.followUpFee} onChange={e => setForm({ ...form, followUpFee: Number(e.target.value) })} min={0} className={inputCls} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-gray-700">Active account</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAcceptingPatients} onChange={e => setForm({ ...form, isAcceptingPatients: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-gray-700">Accepting new patients</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm">
              {saving ? 'Saving...' : editingId ? 'Update Doctor' : 'Create Doctor'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl text-sm">Cancel</button>
          </div>

          {!editingId && (
            <p className="text-xs text-gray-500 pt-2">
              💡 Login credentials will be sent to the doctor&apos;s email automatically.
            </p>
          )}
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading doctors...</div>
      ) : doctors.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">🩺</p>
          <h3 className="font-semibold text-gray-700 mb-2">No doctors yet</h3>
          <p className="text-gray-400 text-sm mb-4">Create the first doctor account.</p>
          <button onClick={openCreate} className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700">+ Create Doctor</button>
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map((doc) => (
            <div key={doc.id} className={`bg-white rounded-2xl border p-5 ${doc.isActive ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-60'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold text-xl flex-shrink-0 overflow-hidden">
                  {doc.doctorProfile?.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={doc.doctorProfile.profileImage} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    doc.name[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{doc.name}</h3>
                    {!doc.isActive && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Inactive</span>}
                    {doc.doctorProfile?.isAcceptingPatients === false && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Not accepting patients</span>}
                  </div>
                  <p className="text-sm text-gray-500">{doc.email}</p>
                  {doc.phone && <p className="text-xs text-gray-400">{doc.phone}</p>}
                  {doc.doctorProfile?.shortBio && <p className="text-sm text-gray-600 mt-2">{doc.doctorProfile.shortBio}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                    {doc.doctorProfile?.experience !== null && <span>👨‍⚕️ {doc.doctorProfile?.experience} years exp.</span>}
                    <span>💰 ₹{doc.doctorProfile?.consultationFee} consultation</span>
                    <span>📅 Joined {formatDate(doc.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(doc)} className="px-3 py-2 bg-primary-50 text-primary-700 text-xs font-medium rounded-xl hover:bg-primary-100">Edit</button>
                  <button onClick={() => handleToggleActive(doc)} className={`px-3 py-2 text-xs font-medium rounded-xl ${doc.isActive ? 'bg-amber-50 text-amber-700' : 'bg-primary-50 text-primary-700'}`}>
                    {doc.isActive ? 'Deactivate' : 'Activate'}
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
