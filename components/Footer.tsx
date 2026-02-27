import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                N
              </div>
              <div>
                <span className="font-bold text-white text-lg leading-tight">NutritionCare</span>
                <p className="text-primary-400 text-xs leading-tight">by Dr. Priya Sharma</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              Evidence-based, personalized nutrition therapy that transforms your health through sustainable
              dietary changes — no fad diets, no shortcuts.
            </p>
            <div className="flex gap-4">
              {['Instagram', 'YouTube', 'LinkedIn', 'Facebook'].map((s) => (
                <span key={s} className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 cursor-pointer transition-colors text-xs font-medium">
                  {s[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/#about', label: 'About Dr. Priya' },
                { href: '/#services', label: 'Services' },
                { href: '/#packages', label: 'Packages' },
                { href: '/blog', label: 'Blog' },
                { href: '/#contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary-400 transition-colors">
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
              <li>📧 dr.priya@nutritioncare.com</li>
              <li>📱 +91 98765 43210</li>
              <li>🕐 Mon–Sat, 9 AM – 6 PM</li>
              <li className="mt-4">
                <Link
                  href="/signup"
                  className="inline-block px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Book Consultation →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} NutritionCare by Dr. Priya Sharma. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
