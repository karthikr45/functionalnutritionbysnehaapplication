'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { documents: number };
}

export default function SuperAdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [impersonating, setImpersonating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter !== 'ALL') params.set('role', roleFilter);
    const res = await fetch(`/api/superadmin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleImpersonate = async (user: UserItem) => {
    if (!confirm(`Impersonate ${user.name} (${user.email}) as ${user.role}?\n\nAll your actions will be logged.`)) return;

    setImpersonating(true);
    try {
      const res = await fetch('/api/superadmin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        toast.success(`Now impersonating ${user.name}`);
        // Redirect to the impersonated user's dashboard
        if (user.role === 'DOCTOR') {
          router.push('/doctor/dashboard');
        } else {
          router.push('/patient/dashboard');
        }
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to impersonate');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setImpersonating(false);
  };

  const stats = {
    total: users.length,
    doctors: users.filter((u) => u.role === 'DOCTOR').length,
    patients: users.filter((u) => u.role === 'PATIENT').length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Super Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users and impersonate accounts. All actions are logged.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: '👥', color: 'bg-blue-50 text-blue-700' },
          { label: 'Doctors', value: stats.doctors, icon: '🩺', color: 'bg-primary-50 text-primary-700' },
          { label: 'Patients', value: stats.patients, icon: '🧑', color: 'bg-purple-50 text-purple-700' },
          { label: 'Admins', value: stats.admins, icon: '🔑', color: 'bg-amber-50 text-amber-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-red-400 outline-none"
            />
            <button type="submit" className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl text-sm hover:bg-gray-800 transition-colors">
              Search
            </button>
          </form>
          <div className="flex gap-2">
            {['ALL', 'DOCTOR', 'PATIENT', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  roleFilter === r ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                  user.role === 'DOCTOR' ? 'bg-primary-100 text-primary-700' :
                  user.role === 'PATIENT' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {user.name[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{user.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'DOCTOR' ? 'bg-primary-100 text-primary-700' :
                      user.role === 'PATIENT' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {user.role}
                    </span>
                    {!user.isActive && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                  <div className="flex gap-4 text-xs text-gray-400 mt-1">
                    {user.phone && <span>{user.phone}</span>}
                    <span>Joined {formatDate(user.createdAt)}</span>
                    <span>{user._count.documents} documents</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {(user.role === 'DOCTOR' || user.role === 'PATIENT') && (
                    <button
                      onClick={() => handleImpersonate(user)}
                      disabled={impersonating}
                      className="px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {impersonating ? 'Loading...' : `Impersonate as ${user.role === 'DOCTOR' ? 'Doctor' : 'Patient'}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
