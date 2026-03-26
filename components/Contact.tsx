'use client';

import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // In production, send to an email API or store in DB
    await new Promise((r) => setTimeout(r, 1000));
    setStatus('sent');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Get In Touch</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
                Start Your Health Journey Today
              </h2>
              <p className="text-gray-600 mt-4 text-lg leading-relaxed">
                Have questions before booking? Fill out the form and I&apos;ll get back to you within 24 hours.
                Or reach out on WhatsApp for a quick chat.
              </p>
            </div>

            <div className="space-y-5">
              {[
                { icon: '📧', label: 'Email', value: 'sneha@functionalnutritionbysneha.com' },
                { icon: '📱', label: 'WhatsApp', value: '+91 98765 43210' },
                { icon: '🕐', label: 'Consultation Hours', value: 'Mon–Sat, 9 AM – 7 PM' },
                { icon: '📍', label: 'Consultations', value: 'Online (Pan India & International)' },
              ].map((info) => (
                <div key={info.label} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{info.label}</p>
                    <p className="text-gray-800 font-semibold">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Free discovery call CTA */}
            <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6">
              <h4 className="font-bold text-primary-800 text-lg">Not sure where to start?</h4>
              <p className="text-primary-700 text-sm mt-2">
                Book a free 10-minute discovery call where I&apos;ll understand your health concerns
                and recommend the right plan for you. No commitment, no pressure.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hi%20Sneha%2C%20I%27d%20like%20to%20book%20a%20free%20discovery%20call."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
              >
                <span>💬</span> Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            {status === 'sent' ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">
                  Thank you for reaching out. I&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-primary-600 font-medium hover:underline"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h3>

                {[
                  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name' },
                  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                  { name: 'phone', label: 'Phone / WhatsApp Number', type: 'tel', placeholder: '+91 98765 43210' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.name as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Health Concern / Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell me about your health goals and concerns — PCOS, thyroid, weight loss, gut health, etc."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-colors"
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
