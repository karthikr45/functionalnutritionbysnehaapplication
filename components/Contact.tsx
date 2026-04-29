'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface ContactProps {
  settings?: {
    contactEmail?: string;
    contactPhone?: string;
    whatsappNumber?: string;
    consultationHours?: string;
    consultationMode?: string;
  } | null;
}

export default function Contact({ settings }: ContactProps) {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const waNumber = settings?.whatsappNumber || '919391675213';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          message: form.message,
        }),
      });
      if (res.ok) {
        setStatus('sent');
        setForm({ firstName: '', lastName: '', phone: '', email: '', message: '' });
        toast.success('Message sent successfully!');
      } else {
        setStatus('idle');
        const data = await res.json();
        toast.error(data.error || 'Failed to send message');
      }
    } catch {
      setStatus('idle');
      toast.error('Network error. Please try again.');
    }
  };

  const inputCls = 'w-full px-5 py-3.5 bg-transparent border-2 border-amber-300 rounded-full text-gray-800 placeholder-amber-700/60 focus:border-amber-500 focus:ring-0 outline-none text-sm font-medium';

  return (
    <section id="contact" className="py-0">
      <div className="max-w-full">

        {/* Form Card — full width */}
        <div className="bg-amber-300 px-4 sm:px-8 md:px-16 lg:px-32 py-16 sm:py-20">
          {status === 'sent' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 font-serif mb-2">Message Sent!</h3>
              <p className="text-amber-800 max-w-xs">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">Get In Touch</h2>
                <p className="text-amber-800 text-sm leading-relaxed mt-3 max-w-lg mx-auto">
                  Share your details and our team will reach out to guide you on the next steps toward better health
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className={inputCls}
                />
                <input
                  type="text"
                  placeholder="How can we help you? (share your health concerns or goals)"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className={inputCls}
                />
                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="px-10 py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white font-bold rounded-full transition-colors text-sm"
                  >
                    {status === 'sending' ? 'Sending...' : 'Submit'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* WhatsApp CTA — full width */}
        <div className="bg-primary-600 px-4 sm:px-8 md:px-16 lg:px-32 py-12 sm:py-16 text-white text-center">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl mb-4">
              💬
            </div>
            <h4 className="font-bold text-xl">Not sure where to start?</h4>
            <p className="text-primary-100 text-sm mt-2 max-w-md leading-relaxed">
              Book a free 10-minute discovery call. No commitment, no pressure — just guidance toward better health.
            </p>
            <a
              href={`https://wa.me/${waNumber}?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20discovery%20call.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 bg-white text-primary-700 rounded-full font-bold text-sm hover:bg-primary-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
