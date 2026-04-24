'use client';

import { useState, useEffect } from 'react';

const STAGES = [
  { label: 'Extracting document content', detail: 'Reading text, tables, and values from the uploaded file', icon: '📄', duration: 2500 },
  { label: 'Identifying clinical parameters', detail: 'Detecting lab markers, vitals, and diagnostic values', icon: '🔍', duration: 3000 },
  { label: 'Cross-referencing reference ranges', detail: 'Comparing values against clinical reference intervals', icon: '📊', duration: 3500 },
  { label: 'Analyzing patterns & correlations', detail: 'Identifying metabolic patterns and root-cause signals', icon: '🧠', duration: 4000 },
  { label: 'Generating nutritional assessment', detail: 'Mapping findings to evidence-based nutrition interventions', icon: '🥗', duration: 4000 },
  { label: 'Compiling clinical report', detail: 'Structuring insights with severity coding and action items', icon: '📋', duration: 5000 },
];

interface Props {
  isActive: boolean;
  documentTitle?: string;
}

export default function AnalysisProgress({ isActive, documentTitle }: Props) {
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrentStage(0);
      setStageProgress(0);
      return;
    }

    let stageIdx = 0;
    let progressInterval: NodeJS.Timeout;
    let stageTimeout: NodeJS.Timeout;

    const advanceStage = () => {
      if (stageIdx >= STAGES.length - 1) return;
      stageIdx++;
      setCurrentStage(stageIdx);
      setStageProgress(0);
      startProgress();
    };

    const startProgress = () => {
      const duration = STAGES[stageIdx].duration;
      const step = 100 / (duration / 50);
      clearInterval(progressInterval);
      progressInterval = setInterval(() => {
        setStageProgress((prev) => Math.min(prev + step, 100));
      }, 50);
      stageTimeout = setTimeout(advanceStage, duration);
    };

    startProgress();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stageTimeout);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 px-6 py-5 border-b-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-xl shadow-lg animate-pulse">
              🧬
            </div>
            <div>
              <h3 className="font-bold text-white font-serif">Analyzing Document</h3>
              {documentTitle && (
                <p className="text-xs text-indigo-200 truncate max-w-sm">📄 {documentTitle}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {STAGES.map((stage, i) => {
            const isComplete = i < currentStage;
            const isCurrent = i === currentStage;
            const isPending = i > currentStage;

            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-500 ${
                  isCurrent ? 'bg-indigo-50 border border-indigo-200' : isComplete ? 'bg-emerald-50/50' : 'opacity-40'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-all ${
                  isComplete
                    ? 'bg-emerald-100 text-emerald-600'
                    : isCurrent
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{stage.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isComplete ? 'text-emerald-700' : isCurrent ? 'text-indigo-800' : 'text-gray-500'}`}>
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <>
                      <p className="text-xs text-indigo-500 mt-0.5">{stage.detail}</p>
                      <div className="mt-2 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-100"
                          style={{ width: `${stageProgress}%` }}
                        />
                      </div>
                    </>
                  )}
                  {isPending && (
                    <p className="text-xs text-gray-400 mt-0.5">{stage.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-xs text-slate-500">This typically takes 15–30 seconds for detailed reports</p>
        </div>
      </div>
    </div>
  );
}
