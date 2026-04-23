'use client';

const SECTION_META: Record<string, { icon: string; gradient: string; textColor: string; bgColor: string; borderColor: string }> = {
  'EXECUTIVE SUMMARY': { icon: '📋', gradient: 'from-violet-500 to-indigo-500', textColor: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  'PATIENT SNAPSHOT': { icon: '👤', gradient: 'from-slate-500 to-slate-600', textColor: 'text-slate-700', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
  'KEY FINDINGS': { icon: '🔬', gradient: 'from-rose-500 to-pink-500', textColor: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  'CLINICAL INTERPRETATION': { icon: '🧠', gradient: 'from-purple-500 to-fuchsia-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  'NUTRITIONAL IMPLICATIONS': { icon: '🥗', gradient: 'from-emerald-500 to-green-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  'RECOMMENDED INTERVENTIONS': { icon: '💊', gradient: 'from-sky-500 to-cyan-500', textColor: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200' },
  'LIFESTYLE & FOLLOW-UP': { icon: '🗓', gradient: 'from-amber-500 to-orange-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  'RED FLAGS & REFERRALS': { icon: '🚨', gradient: 'from-red-500 to-rose-600', textColor: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  'CONSULTATION TALKING POINTS': { icon: '💬', gradient: 'from-teal-500 to-cyan-600', textColor: 'text-teal-700', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: '⚠️' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: '▲' },
  LOW: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', icon: '▼' },
  BORDERLINE: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: '◆' },
  'NORMAL-NOTABLE': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: '●' },
  URGENT: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700', icon: '🚨' },
};

interface ParsedSection {
  title: string;
  content: string[];
}

function parseSections(text: string): ParsedSection[] {
  const lines = text.split('\n');
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+?)\s*$/);
    if (sectionMatch) {
      if (current) sections.push(current);
      current = { title: sectionMatch[1].trim().toUpperCase(), content: [] };
      continue;
    }
    if (current) current.content.push(line);
  }
  if (current) sections.push(current);
  return sections;
}

function renderLabFinding(line: string, key: number) {
  // Format: [SEVERITY] Parameter: Value (range) — Interpretation
  const match = line.match(/^\[([A-Z\-]+)\]\s*(.+?):\s*(.+?)(?:\s*\(([^)]+)\))?\s*(?:[—–-]\s*(.+))?$/);
  if (!match) return null;

  const [, severity, param, value, range, interpretation] = match;
  const style = SEVERITY_STYLES[severity] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: '●' };

  return (
    <div key={key} className={`${style.bg} ${style.border} border rounded-xl p-3 mb-2`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-16 ${style.text} text-xs font-bold uppercase text-center py-1 rounded-md ${style.bg === 'bg-red-600' ? 'bg-red-700' : 'bg-white/60'}`}>
          {style.icon} {severity}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className={`font-semibold ${style.text === 'text-white' ? 'text-white' : 'text-gray-900'}`}>{param.trim()}</span>
            <span className={`font-mono text-sm ${style.text === 'text-white' ? 'text-red-100' : 'text-gray-700'}`}>{value.trim()}</span>
            {range && (
              <span className={`text-xs font-mono ${style.text === 'text-white' ? 'text-red-200' : 'text-gray-500'}`}>
                ref: {range.trim()}
              </span>
            )}
          </div>
          {interpretation && (
            <p className={`text-sm mt-1 ${style.text === 'text-white' ? 'text-red-50' : 'text-gray-700'}`}>{interpretation.trim()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function renderSnapshotRow(line: string, key: number) {
  const match = line.match(/^-\s*([^:]+):\s*(.+)$/);
  if (!match) return null;
  return (
    <div key={key} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{match[1].trim()}</span>
      <span className="text-sm font-semibold text-slate-800">{match[2].trim()}</span>
    </div>
  );
}

function renderLine(line: string, key: number, sectionTitle: string) {
  const trimmed = line.trim();
  if (!trimmed) return <div key={key} className="h-1" />;

  // Sub-section header (###)
  const subMatch = trimmed.match(/^###\s+(.+)$/);
  if (subMatch) {
    return (
      <h5 key={key} className="mt-4 mb-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
        {subMatch[1]}
      </h5>
    );
  }

  // Lab finding with severity tag
  if (trimmed.match(/^\[[A-Z\-]+\]/)) {
    const rendered = renderLabFinding(trimmed, key);
    if (rendered) return rendered;
  }

  // Patient snapshot rows
  if (sectionTitle === 'PATIENT SNAPSHOT' && trimmed.startsWith('-')) {
    const rendered = renderSnapshotRow(trimmed, key);
    if (rendered) return rendered;
  }

  // Bullet points
  if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
    const content = trimmed.replace(/^[-•]\s*/, '');
    return (
      <div key={key} className="flex gap-2.5 text-sm text-gray-700 my-1.5">
        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400 mt-2" />
        <span className="flex-1 leading-relaxed">{content}</span>
      </div>
    );
  }

  // Plain paragraph
  return <p key={key} className="text-sm text-gray-700 leading-relaxed my-1.5">{trimmed}</p>;
}

export default function ClinicalInsights({ text }: { text: string }) {
  const sections = parseSections(text);

  // Fallback for unstructured content
  if (sections.length === 0) {
    return (
      <div className="space-y-2">
        {text.split('\n').map((line, i) => renderLine(line, i, ''))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const meta = SECTION_META[section.title] || {
          icon: '📄',
          gradient: 'from-gray-500 to-gray-600',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
        const isPatientSnapshot = section.title === 'PATIENT SNAPSHOT';

        return (
          <section key={i} className={`rounded-2xl border ${meta.borderColor} overflow-hidden`}>
            <div className={`bg-gradient-to-r ${meta.gradient} px-4 py-2.5 flex items-center gap-2`}>
              <span className="text-lg">{meta.icon}</span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{section.title}</h4>
            </div>
            <div className={`p-4 ${meta.bgColor}/30`}>
              {isPatientSnapshot ? (
                <div>{section.content.map((line, j) => renderLine(line, j, section.title))}</div>
              ) : (
                <div>{section.content.map((line, j) => renderLine(line, j, section.title))}</div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
