'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Profile {
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  medicalHistory: string | null;
  allergies: string | null;
  currentMedications: string | null;
  healthGoals: string | null;
  user: { name: string; email: string; phone: string | null };
}

export default function PatientProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    healthGoals: '',
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/patient/profile');
    const data = await res.json();
    setProfile(data.profile);
    if (data.profile) {
      const p = data.profile;
      setForm({
        name: p.user?.name || '',
        phone: p.user?.phone || p.phone || '',
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        gender: p.gender || '',
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        pincode: p.pincode || '',
        medicalHistory: p.medicalHistory || '',
        allergies: p.allergies || '',
        currentMedications: p.currentMedications || '',
        healthGoals: p.healthGoals || '',
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const res = await fetch('/api/patient/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        pincode: form.pincode || null,
        medicalHistory: form.medicalHistory || null,
        allergies: form.allergies || null,
        currentMedications: form.currentMedications || null,
        healthGoals: form.healthGoals || null,
      }),
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

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none';
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1.5';

  if (loading) return <div className="text-center py-12 text-gray-400">Loading your profile...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Keep your details up to date so your doctor has the full picture.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Personal Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Email (cannot be changed)</label>
              <input type="email" value={profile?.user?.email || ''} disabled className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 93916 75213" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputCls}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Address</h2>
          <div>
            <label className={labelCls}>Street Address</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House/Flat, Street" className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>City</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Pincode</label>
              <input type="text" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Health Information</h2>
          <p className="text-xs text-gray-400 -mt-2">This helps the doctor prepare better for your consultation.</p>
          <div>
            <label className={labelCls}>Health Goals</label>
            <textarea value={form.healthGoals} onChange={(e) => setForm({ ...form, healthGoals: e.target.value })} rows={2} placeholder="e.g. Lose weight, fix gut issues, manage PMOS..." className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Medical History</label>
            <textarea value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} rows={3} placeholder="Any past surgeries, chronic conditions, hospitalizations..." className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Allergies</label>
              <input type="text" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="e.g. Nuts, Dairy, Gluten" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Current Medications</label>
              <input type="text" value={form.currentMedications} onChange={(e) => setForm({ ...form, currentMedications: e.target.value })} placeholder="e.g. Metformin 500mg" className={inputCls} />
            </div>
          </div>
        </div>

        <div>
          <button type="submit" disabled={saving} className="px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
