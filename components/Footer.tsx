import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                FN
              </div>
              <div>
                <span className="font-bold text-white text-lg leading-tight">Functional Nutrition</span>
                <p className="text-green-400 text-xs leading-tight">by Sneha</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              Heal from the root cause with personalized, science-backed functional nutrition.
              No fad diets, no quick fixes — just sustainable health transformation through the power of real food.
            </p>
            <div className="flex gap-4">
              {[
                { name: 'Instagram', letter: 'I' },
                { name: 'YouTube', letter: 'Y' },
                { name: 'LinkedIn', letter: 'L' },
                { name: 'Facebook', letter: 'F' },
              ].map((s) => (
                <span key={s.name} className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-600 cursor-pointer transition-colors text-xs font-medium">
                  {s.letter}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/#about', label: 'About Sneha' },
                { href: '/#services', label: 'Services' },
                { href: '/#packages', label: 'Packages & Pricing' },
                { href: '/#testimonials', label: 'Success Stories' },
                { href: '/blog', label: 'Blog' },
                { href: '/#faq', label: 'FAQ' },
                { href: '/#contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-green-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li>📧 sneha@functionalnutritionbysneha.com</li>
              <li>📱 +91 98765 43210</li>
              <li>🕐 Mon–Sat, 9 AM – 7 PM</li>
              <li>📍 Online Consultations (Pan India)</li>
              <li className="mt-4">
                <Link
                  href="/#packages"
                  className="inline-block px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Book Consultation →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} Functional Nutrition by Sneha. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
