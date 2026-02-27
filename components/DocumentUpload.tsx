'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface DocumentUploadProps {
  appointmentId?: string;
  onUploadSuccess?: (doc: any) => void;
  allowedTypes?: string[];
}

const DOC_TYPES = [
  { value: 'LAB_REPORT', label: 'Lab Report' },
  { value: 'MEDICAL_REPORT', label: 'Medical Report' },
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'DIET_PLAN', label: 'Diet Plan' },
  { value: 'CONSENT_FORM', label: 'Consent Form' },
  { value: 'OTHER', label: 'Other' },
];

export default function DocumentUpload({ appointmentId, onUploadSuccess, allowedTypes }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('LAB_REPORT');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTypes = allowedTypes
    ? DOC_TYPES.filter((t) => allowedTypes.includes(t.value))
    : DOC_TYPES;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      if (!title) setTitle(dropped.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !type) { toast.error('Please fill all fields'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large (max 10MB)'); return; }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('type', type);
    if (appointmentId) formData.append('appointmentId', appointmentId);
    if (notes) formData.append('notes', notes);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const { document } = await res.json();
      toast.success('Document uploaded successfully!');
      onUploadSuccess?.(document);
      setFile(null); setTitle(''); setNotes('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-300 bg-gray-50 hover:bg-primary-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
        />
        {file ? (
          <div>
            <p className="text-4xl mb-2">📎</p>
            <p className="font-medium text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <p className="text-4xl mb-3">📁</p>
            <p className="font-medium text-gray-700">Drop your file here or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG — max 10MB</p>
          </div>
        )}
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Blood Test Report - March 2024"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
          >
            {filteredTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about this document..."
          rows={2}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || !title || uploading}
        className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  );
}
