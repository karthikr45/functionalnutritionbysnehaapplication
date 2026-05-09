'use client';

import { useEffect, useState } from 'react';

interface WebhookEvent {
  id: string;
  source: string;
  eventId: string;
  eventType: string;
  rawPayload: any;
  signatureOk: boolean;
  processed: boolean;
  errorMessage: string | null;
  receivedAt: string;
  processedAt: string | null;
}

type Filter = 'all' | 'processed' | 'unprocessed' | 'failed';

export default function SuperAdminWebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = filter === 'all'
        ? '/api/superadmin/webhooks'
        : `/api/superadmin/webhooks?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setEvents(data.events || []);
      if (data.error) setError(data.error);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const FILTERS: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'processed', label: 'Processed' },
    { value: 'unprocessed', label: 'Unprocessed' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Webhook Events</h1>
        <p className="text-sm text-gray-500 mt-1">Inbound payment webhooks (Razorpay). Used for idempotency and audit.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto px-4 py-2 text-sm font-medium rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">🔔</p>
          <p className="text-gray-500 text-sm">No webhook events {filter !== 'all' ? `(${filter})` : ''} yet.</p>
          <p className="text-xs text-gray-400 mt-2">Razorpay events will appear here as they arrive.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {events.map((ev) => (
            <div key={ev.id} className="p-4">
              <button
                onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
                className="w-full text-left flex items-start gap-4 hover:bg-gray-50 -m-4 p-4 transition-colors rounded-xl"
              >
                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                  ev.errorMessage
                    ? 'bg-red-500'
                    : ev.processed
                      ? 'bg-green-500'
                      : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm font-semibold text-gray-900">{ev.eventType}</code>
                    {!ev.signatureOk && (
                      <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold uppercase tracking-wider">
                        Signature failed
                      </span>
                    )}
                    {ev.errorMessage && (
                      <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold uppercase tracking-wider">
                        Error
                      </span>
                    )}
                    {!ev.processed && !ev.errorMessage && ev.signatureOk && (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold uppercase tracking-wider">
                        Unprocessed
                      </span>
                    )}
                    {ev.processed && (
                      <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold uppercase tracking-wider">
                        Processed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                    <code className="text-xs font-mono">{ev.eventId}</code>
                    <span>•</span>
                    <span>{new Date(ev.receivedAt).toLocaleString()}</span>
                    {ev.processedAt && (
                      <>
                        <span>•</span>
                        <span>processed in {Math.round((new Date(ev.processedAt).getTime() - new Date(ev.receivedAt).getTime()))}ms</span>
                      </>
                    )}
                  </div>
                  {ev.errorMessage && (
                    <p className="text-xs text-red-700 mt-1.5 font-mono">{ev.errorMessage}</p>
                  )}
                </div>
                <span className={`text-gray-400 transition-transform ${expanded === ev.id ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {expanded === ev.id && (
                <pre className="mt-4 p-4 bg-gray-50 rounded-xl text-xs overflow-auto max-h-80 border border-gray-100">
                  {JSON.stringify(ev.rawPayload, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
