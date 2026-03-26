'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';

interface Props {
  productId: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image: string;
  stock: number;
  slug: string;
}

export default function AddToCartClientWrapper({ productId, name, price, salePrice, image, stock, slug }: Props) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (stock <= 0) {
    return (
      <button disabled className="w-full py-3 rounded-xl bg-gray-300 text-gray-500 font-semibold cursor-not-allowed">
        Out of Stock
      </button>
    );
  }

  const handleAdd = () => {
    addToCart({ productId, name, price, salePrice, image, stock, slug }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          -
        </button>
        <span className="px-4 py-2 text-sm font-medium min-w-[2.5rem] text-center">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(stock, q + 1))}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAdd}
        className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
      >
        {added ? 'Added to Cart!' : 'Add to Cart'}
      </button>
    </div>
  );
}
