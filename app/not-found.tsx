import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-dark to-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-primary-200 font-serif">404</p>
        <h1 className="text-2xl font-bold text-gray-900 font-serif mt-4">Page Not Found</h1>
        <p className="text-gray-500 mt-2">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex gap-3 justify-center mt-8">
          <Link href="/" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm">
            Go Home
          </Link>
          <Link href="/#contact" className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
