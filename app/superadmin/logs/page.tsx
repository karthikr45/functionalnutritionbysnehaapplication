'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  superAdmin: { name: string; email: string };
  impersonatedUser: { name: string; email: string; role: string };
}

const ACTION_COLORS: Record<string, string> = {
  START_IMPERSONATION: 'bg-red-100 text-red-700',
  STOP_IMPERSONATION: 'bg-gray-100 text-gray-700',
  VIEW_DASHBOARD: 'bg-blue-100 text-blue-700',
  UPDATE_APPOINTMENT: 'bg-amber-100 text-amber-700',
  CREATE_PACKAGE: 'bg-primary-100 text-primary-700',
  UPDATE_PACKAGE: 'bg-yellow-100 text-yellow-700',
  DELETE_PACKAGE: 'bg-red-100 text-red-700',
  NAVIGATE: 'bg-purple-100 text-purple-700',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await fetch(`/api/superadmin/audit-logs?page=${page}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Complete history of all super admin impersonation activity. ({total} entries)</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📋</p>
          <h3 className="font-semibold text-gray-700 mb-2">No audit logs yet</h3>
          <p className="text-gray-400 text-sm">Logs will appear here when impersonation is used.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Impersonated User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-800 font-medium">
                        {format(new Date(log.createdAt), 'dd MMM yyyy')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(log.createdAt), 'HH:mm:ss')}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-800 font-medium">{log.impersonatedUser.name}</p>
                      <p className="text-xs text-gray-400">{log.impersonatedUser.email} ({log.impersonatedUser.role})</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">{log.details || '—'}</p>
                      {log.entity && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {log.entity}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ''}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
