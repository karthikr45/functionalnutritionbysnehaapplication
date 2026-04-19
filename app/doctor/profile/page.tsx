'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DoctorProfileCard from '@/components/DoctorProfileCard';

interface Me {
  id: string;
  name: string;
  email: string;
  phone: string | null;
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

export default function DoctorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    shortBio: '',
    bio: '',
    specialization: '',
    qualifications: '',
    experience: 0,
    consultationFee: 500,
    followUpFee: 300,
    profileImage: '',
    isAcceptingPatients: true,
  });

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/doctor/me');
    const data = await res.json();
    setMe(data.doctor);
    if (data.doctor) {
      const p = data.doctor.doctorProfile;
      setForm({
        name: data.doctor.name || '',
        phone: data.doctor.phone || '',
        shortBio: p?.shortBio || '',
        bio: p?.bio || '',
        specialization: p?.specialization || '',
        qualifications: p?.qualifications || '',
        experience: p?.experience || 0,
        consultationFee: p?.consultationFee || 500,
        followUpFee: p?.followUpFee || 300,
        profileImage: p?.profileImage || '',
        isAcceptingPatients: p?.isAcceptingPatients ?? true,
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/doctor/upload-image', { method: 'POST', body: fd });
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const res = await fetch('/api/doctor/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Profile updated');
      load();
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to update');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) { toast.error('New passwords do not match'); return; }
    if (pwd.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    setSaving(true);
    const res = await fetch('/api/doctor/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Password changed');
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to change password');
    }
  };

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none';
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1.5';

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading your profile...</div>;
  }

  if (!me || !me.doctorProfile) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
        <p className="text-5xl mb-4">⚠️</p>
        <p className="text-gray-500">Profile not found. Please contact the administrator.</p>
      </div>
    );
  }

  const preview = {
    user: { name: form.name || me.name },
    shortBio: form.shortBio,
    bio: form.bio,
    specialization: form.specialization,
    qualifications: form.qualifications,
    experience: form.experience,
    consultationFee: form.consultationFee,
    followUpFee: form.followUpFee,
    profileImage: form.profileImage,
    isAcceptingPatients: form.isAcceptingPatients,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Update how patients see you when they book a consultation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form onSubmit={handleSave} className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900">Profile Details</h2>

          <div>
            <label className={labelCls}>Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary-50 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {form.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.profileImage} alt="You" className="w-full h-full object-cover" />
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
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Email (contact admin to change)</label>
              <input type="email" value={me.email} disabled className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Short Bio</label>
            <input type="text" value={form.shortBio} onChange={(e) => setForm({ ...form, shortBio: e.target.value })} placeholder="One-line description shown on booking" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Full Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className={`${inputCls} resize-none`} placeholder="Your story, approach, and expertise..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Specialization</label>
              <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Functional Nutrition, PCOS..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Qualifications (comma separated)</label>
              <input type="text" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} placeholder="MSc, RD, IFMCP" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Experience (years)</label>
              <input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} min={0} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Consultation Fee (₹)</label>
              <input type="number" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })} min={0} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Follow-up Fee (₹)</label>
              <input type="number" value={form.followUpFee} onChange={(e) => setForm({ ...form, followUpFee: Number(e.target.value) })} min={0} className={inputCls} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isAcceptingPatients} onChange={(e) => setForm({ ...form, isAcceptingPatients: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm text-gray-700">Currently accepting new patients</span>
          </label>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">Live Preview</h2>
            <DoctorProfileCard doctor={preview} />
            <p className="text-xs text-gray-400 mt-2">This is how patients see you on the booking page.</p>
          </div>

          <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Change Password</h2>
            <div>
              <label className={labelCls}>Current Password</label>
              <input type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>New Password</label>
              <input type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} minLength={8} placeholder="Min. 8 characters" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Confirm New Password</label>
              <input type="password" value={pwd.confirmPassword} onChange={(e) => setPwd({ ...pwd, confirmPassword: e.target.value })} className={inputCls} required />
            </div>
            <button type="submit" disabled={saving} className="w-full px-6 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-xl text-sm">
              {saving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
