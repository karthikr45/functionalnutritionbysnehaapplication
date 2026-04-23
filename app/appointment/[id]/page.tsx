'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { formatTime, STATUS_COLORS } from '@/lib/utils';
import DocumentUpload from '@/components/DocumentUpload';
import ClinicalInsights from '@/components/ClinicalInsights';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface DocumentItem {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  notes: string | null;
  aiAnalyzedAt: string | null;
  createdAt: string;
  uploadedBy: { name: string; role: string };
}

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [appointment, setAppointment] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'details'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{ docId: string; docTitle: string; text: string } | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const isDoctor = session?.user?.role === 'DOCTOR';

  const handleAiAnalyze = async (doc: DocumentItem, forceRegenerate = false) => {
    // If doc already has cached analysis from DB and we're not forcing, show it
    if (!forceRegenerate && doc.aiAnalyzedAt) {
      setAiLoading(doc.id);
      try {
        const res = await fetch('/api/ai/analyze-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: doc.id }),
        });
        const data = await res.json();
        if (res.ok) {
          setAiAnalysis({ docId: doc.id, docTitle: doc.title, text: data.analysis });
        } else {
          toast.error(data.error || 'Failed to load insights');
        }
      } catch {
        toast.error('Failed to load insights');
      }
      setAiLoading(null);
      return;
    }
    setAiLoading(doc.id);
    setAiAnalysis(null);
    try {
      const res = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id, force: forceRegenerate }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiAnalysis({ docId: doc.id, docTitle: doc.title, text: data.analysis });
        // Update the local documents array so button shows 'View Insights'
        setDocuments((prev: DocumentItem[]) => prev.map((d: DocumentItem) => d.id === doc.id ? { ...d, aiAnalyzedAt: data.analyzedAt } : d));
      } else {
        toast.error(data.error || 'Failed to analyze document');
      }
    } catch {
      toast.error('Failed to analyze document');
    }
    setAiLoading(null);
  };

  const handleDownloadInsights = () => {
    if (!aiAnalysis) return;
    const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const header = [
      '═══════════════════════════════════════════════════════',
      '  GUT SHELL — CLINICAL ANALYSIS REPORT',
      '═══════════════════════════════════════════════════════',
      '',
      `Document:  ${aiAnalysis.docTitle}`,
      `Generated: ${date}`,
      `Source:    AI-Assisted clinical decision support`,
      '',
      '───────────────────────────────────────────────────────',
      '',
    ].join('\n');
    const footer = [
      '',
      '───────────────────────────────────────────────────────',
      'Clinical Decision Support Notice: This analysis is',
      'AI-generated and intended for qualified clinicians.',
      'Always apply professional clinical judgment.',
      '═══════════════════════════════════════════════════════',
    ].join('\n');
    const body = aiAnalysis.text.replace(/^##\s+/gm, '\n▸ ').replace(/^###\s+/gm, '  → ');
    const blob = new Blob([header + body + footer], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Clinical-Analysis-${aiAnalysis.docTitle.replace(/[^a-zA-Z0-9]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openViewer = (index: number) => setViewerIndex(index);
  const closeViewer = () => setViewerIndex(null);
  const goNext = useCallback(() => {
    if (viewerIndex !== null && viewerIndex < documents.length - 1) setViewerIndex(viewerIndex + 1);
  }, [viewerIndex, documents.length]);
  const goPrev = useCallback(() => {
    if (viewerIndex !== null && viewerIndex > 0) setViewerIndex(viewerIndex - 1);
  }, [viewerIndex]);

  // Keyboard navigation for viewer
  useEffect(() => {
    if (viewerIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [viewerIndex, goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  const fetchAppointment = async () => {
    const res = await fetch(`/api/appointments/${id}`);
    if (!res.ok) { router.back(); return; }
    const data = await res.json();
    setAppointment(data.appointment);
    setDocuments(data.appointment.documents || []);
    setLoading(false);
  };

  const fetchMessages = async () => {
    const res = await fetch(`/api/appointments/${id}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  };

  useEffect(() => {
    if (!session) return;
    fetchAppointment();
    fetchMessages();

    // Poll for new messages every 5 seconds
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const res = await fetch(`/api/appointments/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setNewMessage('');
    } else {
      toast.error('Failed to send message');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading appointment...</div>
      </div>
    );
  }

  if (!appointment) return null;

  const appt = appointment;
  const otherPerson = isDoctor
    ? appt.patient?.user?.name || 'Patient'
    : appt.doctor?.user?.name || 'Doctor';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
            Appointment with {otherPerson}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-500">
            <span>{format(new Date(appt.date), 'EEE, dd MMM yyyy')}</span>
            <span>{formatTime(appt.startTime)} – {formatTime(appt.endTime)}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[appt.status]}`}>
              {appt.status}
            </span>
          </div>
        </div>
        {appt.status === 'CONFIRMED' && (
          <button
            onClick={() => router.push(`/consultation/${id}`)}
            className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition-colors whitespace-nowrap self-start"
          >
            {isDoctor ? '📹 Start Call' : '📹 Join Call'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['chat', 'documents', 'details'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'chat' && `Chat (${messages.length})`}
            {tab === 'documents' && `Documents (${documents.length})`}
            {tab === 'details' && 'Details'}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: '500px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                <div className="text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender.id === session?.user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isMine ? 'order-2' : ''}`}>
                      <div className={`px-4 py-3 rounded-2xl ${
                        isMine
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className={`flex items-center gap-2 mt-1 text-xs text-gray-400 ${isMine ? 'justify-end' : ''}`}>
                        <span>{msg.sender.name}</span>
                        <span>{format(new Date(msg.createdAt), 'hh:mm a')}</span>
                        {isMine && msg.isRead && <span className="text-primary-500">read</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-100 p-4 flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-5 py-3 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 disabled:bg-primary-300 transition-colors"
            >
              {sending ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Shared Documents</h2>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              {showUpload ? 'Close' : '+ Upload Document'}
            </button>
          </div>

          {showUpload && (
            <div className="border border-gray-200 rounded-xl p-4">
              <DocumentUpload
                appointmentId={id as string}
                onUploadSuccess={(doc) => {
                  setDocuments((prev) => [doc, ...prev]);
                  setShowUpload(false);
                  toast.success('Document uploaded!');
                }}
              />
            </div>
          )}

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📄</p>
              <p className="text-gray-500 text-sm">No documents shared for this appointment yet.</p>
              <button
                onClick={() => setShowUpload(true)}
                className="text-primary-600 text-sm font-medium hover:underline mt-2"
              >
                Upload the first document
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc, idx) => (
                <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  {/* Thumbnail */}
                  <div
                    className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-primary-100 transition-colors"
                    onClick={() => openViewer(idx)}
                  >
                    {doc.fileType?.includes('image') ? (
                      <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover rounded-lg" />
                    ) : doc.fileType?.includes('pdf') ? (
                      <span className="text-2xl">📄</span>
                    ) : (
                      <span className="text-2xl">📎</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{doc.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-500">{doc.type.replace('_', ' ')}</span>
                      <span>by {doc.uploadedBy?.name}</span>
                      <span>{format(new Date(doc.createdAt), 'dd MMM yyyy')}</span>
                      {doc.fileSize && <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>}
                    </div>
                    {doc.notes && <p className="text-xs text-gray-500 mt-1 truncate">{doc.notes}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openViewer(idx)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      View
                    </button>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      download
                    >
                      Download
                    </a>
                    {isDoctor && (
                      <button
                        onClick={() => handleAiAnalyze(doc)}
                        disabled={aiLoading === doc.id}
                        className="px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 text-xs font-medium rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                      >
                        {aiLoading === doc.id ? (
                          <>
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            {doc.aiAnalyzedAt ? 'View Insights' : 'AI Insights'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Appointment Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-800">{format(new Date(appt.date), 'dd MMMM yyyy')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-800">{formatTime(appt.startTime)} – {formatTime(appt.endTime)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-800">{appt.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">{isDoctor ? 'Patient' : 'Doctor'}</span>
                <span className="font-medium text-gray-800">{otherPerson}</span>
              </div>
              {appt.patient?.user?.email && isDoctor && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-800">{appt.patient.user.email}</span>
                </div>
              )}
              {appt.patient?.user?.phone && isDoctor && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-800">{appt.patient.user.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {appt.healthConcerns && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-3">Health Concerns</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{appt.healthConcerns}</p>
              </div>
            )}
            {appt.doctorNotes && (
              <div className="bg-primary-50 rounded-2xl border border-primary-100 p-6">
                <h2 className="font-bold text-gray-900 mb-3">Doctor&apos;s Notes</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{appt.doctorNotes}</p>
              </div>
            )}
            {appt.dietPlanUrl && (
              <a
                href={appt.dietPlanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary-200 transition-colors"
              >
                <span className="text-3xl">🥗</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Diet Plan</p>
                  <p className="text-xs text-gray-400">Click to view or download</p>
                </div>
              </a>
            )}
          </div>
        </div>
      )}

      {/* AI Insights Modal */}
      {aiAnalysis && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 px-6 py-5 flex items-center justify-between flex-shrink-0 border-b-4 border-indigo-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                  🧬
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-lg font-serif">Clinical Analysis</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-500/30">
                      AI-Assisted
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 truncate max-w-md mt-0.5">
                    📄 {aiAnalysis.docTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiAnalysis(null)}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white">
              <ClinicalInsights text={aiAnalysis.text} />

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl">
                <div className="flex gap-3">
                  <span className="text-amber-600 text-lg flex-shrink-0">⚠️</span>
                  <div>
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">Clinical Decision Support Notice</p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      This analysis is AI-generated from the uploaded document and is intended as a decision-support tool for qualified clinicians. Always apply your professional clinical judgment. Verify critical values against the source document before acting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-slate-400">Analysis by Claude · Anthropic</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadInsights}
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => {
                    const doc = documents.find((d: DocumentItem) => d.id === aiAnalysis?.docId);
                    if (doc) handleAiAnalyze(doc, true);
                  }}
                  disabled={!!aiLoading}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-200 bg-indigo-600/20 border border-indigo-500/40 rounded-lg hover:bg-indigo-600/30 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate
                </button>
                <button
                  onClick={() => setAiAnalysis(null)}
                  className="px-4 py-2 bg-white text-slate-900 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Document Viewer Modal */}
      {viewerIndex !== null && documents[viewerIndex] && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/50 text-white flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{documents[viewerIndex].title}</h3>
              <p className="text-xs text-gray-400">
                {viewerIndex + 1} of {documents.length} &bull; {documents[viewerIndex].type.replace('_', ' ')}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <a
                href={documents[viewerIndex].fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors"
                download
              >
                Download
              </a>
              <button
                onClick={closeViewer}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {/* Previous button */}
            {viewerIndex > 0 && (
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Document display */}
            <div className="w-full h-full flex items-center justify-center p-4">
              {documents[viewerIndex].fileType?.includes('image') ? (
                <img
                  src={documents[viewerIndex].fileUrl}
                  alt={documents[viewerIndex].title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              ) : documents[viewerIndex].fileType?.includes('pdf') ? (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(documents[viewerIndex].fileUrl)}&embedded=true`}
                  className="w-full max-w-4xl h-full rounded-lg bg-white"
                  title={documents[viewerIndex].title}
                />
              ) : (
                <div className="text-center text-white">
                  <p className="text-6xl mb-4">📎</p>
                  <p className="text-lg font-semibold mb-2">{documents[viewerIndex].title}</p>
                  <p className="text-gray-400 text-sm mb-6">This file type cannot be previewed inline.</p>
                  <a
                    href={documents[viewerIndex].fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Open in New Tab
                  </a>
                </div>
              )}
            </div>

            {/* Next button */}
            {viewerIndex < documents.length - 1 && (
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {documents.length > 1 && (
            <div className="flex justify-center gap-2 px-4 py-3 bg-black/50 flex-shrink-0 overflow-x-auto">
              {documents.map((doc, idx) => (
                <button
                  key={doc.id}
                  onClick={() => setViewerIndex(idx)}
                  className={`w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden border-2 transition-all ${
                    idx === viewerIndex ? 'border-primary-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {doc.fileType?.includes('image') ? (
                    <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-lg">
                      {doc.fileType?.includes('pdf') ? '📄' : '📎'}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
