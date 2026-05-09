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

type Tab = 'mine' | 'fromDoctor';

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
}

export default function PatientDocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [tab, setTab] = useState<Tab>('mine');

  const fetchDocs = async () => {
    setLoading(true);
    const res = await fetch('/api/upload');
    const data = await res.json();
    setDocuments(data.documents || []);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const myUploads = useMemo(
    () => documents.filter((d) => d.uploadedById === session?.user?.id),
    [documents, session?.user?.id],
  );
  const fromDoctor = useMemo(
    () => documents.filter((d) => d.recipientId === session?.user?.id && d.uploadedById !== session?.user?.id),
    [documents, session?.user?.id],
  );

  const visible = tab === 'mine' ? myUploads : fromDoctor;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">Your uploads &amp; documents from your dietitian.</p>
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
          <h2 className="font-bold text-gray-800 mb-4">Upload New Document</h2>
          <DocumentUpload
            allowedTypes={['LAB_REPORT', 'MEDICAL_REPORT', 'PRESCRIPTION', 'OTHER']}
            onUploadSuccess={(doc) => {
              setDocuments((prev) => [doc, ...prev]);
              setShowUpload(false);
            }}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <TabBtn active={tab === 'mine'} onClick={() => setTab('mine')} count={myUploads.length}>
          My Uploads
        </TabBtn>
        <TabBtn active={tab === 'fromDoctor'} onClick={() => setTab('fromDoctor')} count={fromDoctor.length}>
          From Dietitian
        </TabBtn>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">Loading documents...</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📁</p>
          <h3 className="font-semibold text-gray-700 mb-2">
            {tab === 'mine' ? 'No documents yet' : 'Nothing from your dietitian yet'}
          </h3>
          <p className="text-gray-400 text-sm mb-5">
            {tab === 'mine'
              ? 'Upload your lab reports, prescriptions, or any medical documents to share with your dietitian.'
              : 'Diet plans and prescriptions sent to you by your dietitian will appear here.'}
          </p>
          {tab === 'mine' && (
            <button onClick={() => setShowUpload(true)} className="text-primary-600 font-medium hover:underline">
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
                  {tab === 'fromDoctor' && doc.uploadedBy?.name ? (
                    <span className="text-xs text-primary-700">From Dt. {doc.uploadedBy.name}</span>
                  ) : null}
                  {tab === 'fromDoctor' && <span className="text-gray-300">•</span>}
                  <span className="text-xs text-gray-400">{formatDate(doc.createdAt)}</span>
                  {doc.fileSize && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-400">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                    </>
                  )}
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
