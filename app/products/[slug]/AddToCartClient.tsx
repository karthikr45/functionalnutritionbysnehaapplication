'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import toast from 'react-hot-toast';

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
  const { addToCart, items } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  const inCart = items.find((i) => i.productId === productId);

  if (stock <= 0) {
    return (
      <button disabled className="w-full py-3.5 rounded-xl bg-gray-300 text-gray-500 font-semibold cursor-not-allowed">
        Out of Stock
      </button>
    );
  }

  const handleAdd = () => {
    addToCart({ productId, name, price, salePrice, image, stock, slug }, qty);
    toast.success(`${name} added to cart!`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
          >
            -
          </button>
          <span className="px-5 py-3 text-sm font-semibold min-w-[3rem] text-center border-x border-gray-300">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          className="flex-1 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors text-sm"
        >
          Add to Cart
        </button>
      </div>

      {/* Show "Go to Cart" after item is in cart */}
      {inCart && (
        <div className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-100 rounded-xl">
          <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-primary-700 font-medium flex-1">
            {inCart.quantity} in cart
          </span>
          <button
            onClick={() => router.push('/patient/cart')}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Cart →
          </button>
        </div>
      )}
    </div>
  );
}
