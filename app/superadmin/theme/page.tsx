'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { generatePalette } from '@/components/ThemeProvider';

const presetThemes = [
  { name: 'Default Green', color: '#16a34a' },
  { name: 'Mossy Hollow', color: '#636B2F' },
  { name: 'Olive Sage', color: '#3D4127' },
  { name: 'Teal', color: '#0d9488' },
  { name: 'Ocean Blue', color: '#2563eb' },
  { name: 'Deep Purple', color: '#7c3aed' },
  { name: 'Rose Pink', color: '#e11d48' },
  { name: 'Amber Gold', color: '#d97706' },
  { name: 'Slate Gray', color: '#475569' },
  { name: 'Forest', color: '#15803d' },
  { name: 'Burgundy', color: '#9f1239' },
  { name: 'Navy', color: '#1e3a5f' },
];

export default function ThemePage() {
  const [currentColor, setCurrentColor] = useState('#16a34a');
  const [previewColor, setPreviewColor] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState('#16a34a');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/theme')
      .then((r) => r.json())
      .then((d) => {
        const color = d.theme?.primaryColor || '#16a34a';
        setCurrentColor(color);
        setCustomColor(color);
      });
  }, []);

  const activeColor = previewColor || currentColor;
  const palette = generatePalette(activeColor);

  const applyPreview = (color: string) => {
    setPreviewColor(color);
    setCustomColor(color);
    // Live preview by updating CSS variables
    const root = document.documentElement;
    const p = generatePalette(color);
    Object.entries(p).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  const handleApply = async () => {
    const color = previewColor || customColor;
    setSaving(true);
    const res = await fetch('/api/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ primaryColor: color }),
    });
    setSaving(false);

    if (res.ok) {
      setCurrentColor(color);
      setPreviewColor(null);
      toast.success('Theme applied! All users will see the new colors.');
    } else {
      toast.error('Failed to apply theme');
    }
  };

  const handleReset = () => {
    applyPreview(currentColor);
    setPreviewColor(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Theme Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Change the primary color of the entire application. Changes apply to all users.</p>
      </div>

      {/* Current theme */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Current Theme</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl shadow-inner" style={{ backgroundColor: currentColor }} />
          <div>
            <p className="font-mono text-sm text-gray-800">{currentColor}</p>
            <p className="text-xs text-gray-400">Active primary color</p>
          </div>
        </div>
      </div>

      {/* Preset themes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Preset Themes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {presetThemes.map((theme) => (
            <button
              key={theme.color}
              onClick={() => applyPreview(theme.color)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                activeColor === theme.color
                  ? 'border-gray-900 shadow-md'
                  : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: theme.color }} />
                <span className="text-sm font-medium text-gray-800">{theme.name}</span>
              </div>
              <p className="font-mono text-xs text-gray-400">{theme.color}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom color picker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Custom Color</h2>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={customColor}
            onChange={(e) => applyPreview(e.target.value)}
            className="w-16 h-16 rounded-xl cursor-pointer border-2 border-gray-200"
          />
          <div>
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                  applyPreview(e.target.value);
                }
              }}
              placeholder="#000000"
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:border-gray-400 outline-none w-32"
            />
            <p className="text-xs text-gray-400 mt-1">Enter hex code or use picker</p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Color Palette Preview</h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Object.entries(palette).map(([name, color]) => (
            <div key={name} className="text-center">
              <div className="w-full aspect-square rounded-lg shadow-sm mb-1" style={{ backgroundColor: color }} />
              <p className="text-xs text-gray-500">{name.replace('--primary-', '')}</p>
              <p className="text-xs font-mono text-gray-400">{color}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live preview section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Live Preview</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: palette['--primary-600'] }}>
              Primary Button
            </button>
            <button className="px-6 py-3 rounded-xl font-semibold text-sm border-2" style={{ borderColor: palette['--primary-600'], color: palette['--primary-600'] }}>
              Outline Button
            </button>
            <span className="px-4 py-2 rounded-full text-xs font-medium" style={{ backgroundColor: palette['--primary-50'], color: palette['--primary-700'] }}>
              Badge
            </span>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: palette['--primary-50'] }}>
            <p className="text-sm font-semibold" style={{ color: palette['--primary-700'] }}>
              This is how highlighted sections will look with the selected theme.
            </p>
            <p className="text-xs mt-1" style={{ color: palette['--primary-600'] }}>
              All primary-colored elements across the app will update.
            </p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: palette['--primary-600'] }}>
              FN
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Gut Shell</p>
            </div>
          </div>
        </div>
      </div>

      {/* Apply / Reset */}
      {previewColor && previewColor !== currentColor && (
        <div className="sticky bottom-4 bg-white rounded-2xl border border-gray-200 shadow-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: previewColor }} />
            <div>
              <p className="text-sm font-semibold text-gray-800">Unsaved Changes</p>
              <p className="text-xs text-gray-400">Click Apply to save for all users</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              disabled={saving}
              className="px-5 py-2.5 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: previewColor }}
            >
              {saving ? 'Applying...' : 'Apply Theme'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
