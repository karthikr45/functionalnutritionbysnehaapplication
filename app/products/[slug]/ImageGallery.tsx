'use client';

import { useState } from 'react';

interface ImageGalleryProps {
  images: { url: string }[];
  productName: string;
  discountPct?: number;
}

export default function ImageGallery({ images, productName, discountPct }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImage = images[selectedIndex]?.url || '';

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-6xl">
        📦
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200">
        <img
          src={mainImage}
          alt={productName}
          className="w-full h-full object-contain p-4"
        />
        {discountPct && discountPct > 0 && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden bg-white transition-colors ${
                i === selectedIndex ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <img src={img.url} alt={`${productName} ${i + 1}`} className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
