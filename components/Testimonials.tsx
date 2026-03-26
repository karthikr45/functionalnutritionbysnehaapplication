const testimonials = [
  {
    name: 'Ananya S.',
    city: 'Hyderabad',
    loss: 'PCOS Reversed',
    text: 'Sneha completely changed my life. After struggling with PCOS for 5 years, irregular periods, weight gain, and acne — everything improved within 4 months. Her root cause approach is different from any dietitian I\'ve consulted before.',
    rating: 5,
    condition: 'PCOS Management',
  },
  {
    name: 'Rajesh M.',
    city: 'Bangalore',
    loss: 'HbA1c: 9.1 → 6.3',
    text: 'I was on diabetes medication for 6 years and thought I\'d be on it forever. With Sneha\'s functional nutrition plan, my HbA1c dropped from 9.1 to 6.3 in just 3 months. My doctor reduced my medication by half!',
    rating: 5,
    condition: 'Diabetes Management',
  },
  {
    name: 'Priya K.',
    city: 'Mumbai',
    loss: '-15 kg in 4 months',
    text: 'I had tried every diet out there — keto, intermittent fasting, juice cleanses — nothing lasted. Sneha\'s approach was different. She used normal Indian food, understood my lifestyle, and I lost 15 kg sustainably. No cravings, no hunger!',
    rating: 5,
    condition: 'Weight Loss',
  },
  {
    name: 'Deepika R.',
    city: 'Chennai',
    loss: 'Thyroid Managed',
    text: 'With Hashimoto\'s, I felt exhausted all the time. Within 2 months of following Sneha\'s plan, my energy levels improved dramatically. My TSH is now in the optimal range and I feel like a new person.',
    rating: 5,
    condition: 'Thyroid Management',
  },
  {
    name: 'Kavitha N.',
    city: 'Pune',
    loss: 'IBS Healed',
    text: 'Years of bloating, gas, and stomach pain — no doctor could help. Sneha identified my food triggers, healed my gut with the right protocol, and I\'m now symptom-free. The WhatsApp support was incredibly helpful throughout.',
    rating: 5,
    condition: 'Gut Health',
  },
  {
    name: 'Meera J.',
    city: 'Delhi',
    loss: 'Conceived Naturally',
    text: 'After 2 years of trying to conceive and one failed IVF cycle, Sneha\'s fertility nutrition plan helped me get my hormones balanced. I conceived naturally within 6 months of following her plan. Forever grateful!',
    rating: 5,
    condition: 'Fertility',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Success Stories</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
            Real People, Real Results
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Hundreds of clients have transformed their health through functional nutrition. Here are some of their stories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.city}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                  {t.condition}
                </span>
              </div>

              <div className="bg-primary-600 text-white rounded-xl px-4 py-2 text-center font-bold mb-4">
                {t.loss}
              </div>

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-amber-400">&#9733;</span>
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
