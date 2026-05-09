'use client';

import { useState, useEffect, useMemo } from 'react';
import DocumentUpload from '@/components/DocumentUpload';
import { useSession } from 'next-auth/react';
import { formatDate } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  LAB_REPORT: '🧪 Lab Report',
  MEDICAL_REPORT: '🏥 Medical Report',
  PRESCRIPTION: '💊 Prescription',
  DIET_PLAN: '🥗 Diet Plan',
  CONSENT_FORM: '📋 Consent Form',
  OTHER: '📄 Other',
};

type Tab = 'mine' | 'fromPatients';

interface DocItem {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
  notes?: string | null;
  createdAt: string;
  uploadedById: string;
  recipientId: string | null;
  uploadedBy?: { name: string; role: string } | null;
  recipient?: { name: string } | null;
}

export default function DoctorDocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [tab, setTab] = useState<Tab>('mine');
  const [search, setSearch] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/upload');
      if (!res.ok) {
        console.error('GET /api/upload responded', res.status);
        setDocuments([]);
        return;
      }
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        console.error('GET /api/upload returned non-JSON');
        setDocuments([]);
        return;
      }
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (e) {
      console.error('GET /api/upload failed:', e);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const myUploads = useMemo(
    () => documents.filter((d) => d.uploadedById === session?.user?.id),
    [documents, session?.user?.id],
  );
  const fromPatients = useMemo(
    () => documents.filter((d) => d.uploadedBy?.role === 'PATIENT'),
    [documents],
  );

  const baseList = tab === 'mine' ? myUploads : fromPatients;
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter((d) => {
      const personName = tab === 'mine' ? d.recipient?.name : d.uploadedBy?.name;
      return (
        d.title.toLowerCase().includes(q) ||
        (personName || '').toLowerCase().includes(q) ||
        (d.notes || '').toLowerCase().includes(q)
      );
    });
  }, [baseList, search, tab]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">Manage diet plans, prescriptions, and patient-shared documents.</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 transition-colors"
        >
          {showUpload ? '✕ Close' : '+ Upload Document'}
        </button>
      </div>

      {showUpload && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Upload Document</h2>
          <p className="text-xs text-gray-500 mb-4">
            Diet plans &amp; prescriptions <strong>require</strong> a patient to be assigned. Other types can be uploaded without a recipient.
          </p>
          <DocumentUpload
            allowedTypes={['DIET_PLAN', 'PRESCRIPTION', 'OTHER']}
            showRecipientPicker
            onUploadSuccess={(doc) => {
              setDocuments((prev) => [doc, ...prev]);
              setShowUpload(false);
            }}
          />
        </div>
      )}

      {/* Tabs + search */}
      <div className="flex items-end justify-between gap-4 border-b border-gray-200 flex-wrap">
        <div className="flex">
          <TabBtn active={tab === 'mine'} onClick={() => setTab('mine')} count={myUploads.length}>
            My Uploads
          </TabBtn>
          <TabBtn active={tab === 'fromPatients'} onClick={() => setTab('fromPatients')} count={fromPatients.length}>
            From Patients
          </TabBtn>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient or title…"
          className="px-3 py-2 mb-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 outline-none w-full sm:w-64"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">Loading documents...</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📁</p>
          <p className="text-gray-500 text-sm mb-4">
            {tab === 'mine'
              ? 'You haven’t sent any documents yet. Click "+ Upload Document" to send a diet plan or prescription to a patient.'
              : 'No patient documents yet. When patients upload lab reports or medical documents, they’ll appear here.'}
          </p>
          {tab === 'mine' && (
            <button onClick={() => setShowUpload(true)} className="text-primary-600 font-medium hover:underline text-sm">
              Upload your first document →
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {visible.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors group">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {doc.fileType?.includes('pdf') ? '📄' : '🖼'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate group-hover:text-primary-600">{doc.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-500">{TYPE_LABELS[doc.type] || doc.type}</span>
                  <span className="text-gray-300">•</span>
                  {tab === 'mine' ? (
                    doc.recipient?.name ? (
                      <span className="text-xs text-primary-700">→ {doc.recipient.name}</span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">unassigned</span>
                    )
                  ) : (
                    <span className="text-xs text-gray-700">From {doc.uploadedBy?.name}</span>
                  )}
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-400">{formatDate(doc.createdAt)}</span>
                </div>
                {doc.notes && <p className="text-xs text-gray-400 mt-1 truncate">{doc.notes}</p>}
              </div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl hover:bg-primary-100 transition-colors flex-shrink-0"
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, count, children }: { active: boolean; onClick: () => void; count: number; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
        active ? 'text-primary-700 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700'
      }`}
    >
      {children}
      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${active ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
        {count}
      </span>
    </button>
  );
}
