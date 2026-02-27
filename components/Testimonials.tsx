const testimonials = [
  {
    name: 'Priya M.',
    city: 'Mumbai',
    loss: '-18 kg',
    text: 'Dr. Priya\'s guidance completely changed my relationship with food. I lost 18 kg over 4 months without feeling hungry or deprived. Her diet plans use normal Indian food — no fancy imported items!',
    rating: 5,
    condition: 'Weight Loss',
  },
  {
    name: 'Rajesh K.',
    city: 'Bangalore',
    loss: 'HbA1c: 9.2 → 6.4',
    text: 'As a diabetic for 8 years, I had given up hope on managing my sugar without medication increases. Within 3 months, my HbA1c dropped from 9.2 to 6.4. My doctor was amazed!',
    rating: 5,
    condition: 'Diabetes Management',
  },
  {
    name: 'Sneha R.',
    city: 'Delhi',
    loss: 'PCOS Reversed',
    text: 'My PCOS symptoms — irregular periods, weight gain, acne — all improved within 5 months. Dr. Priya understood exactly what my body needed. The WhatsApp support is also a lifesaver!',
    rating: 5,
    condition: 'PCOS Management',
  },
  {
    name: 'Amit T.',
    city: 'Chennai',
    loss: '+8 kg Muscle',
    text: 'As an athlete, I needed precise nutrition. Dr. Priya\'s sports nutrition plan helped me gain 8 kg of lean muscle in 6 months while improving my marathon timing by 12 minutes.',
    rating: 5,
    condition: 'Sports Nutrition',
  },
  {
    name: 'Nisha V.',
    city: 'Hyderabad',
    loss: '-12 kg Post-Baby',
    text: 'After my pregnancy, I struggled to lose the baby weight while breastfeeding. Dr. Priya crafted a safe, nutritious plan that helped me lose 12 kg without affecting my milk supply.',
    rating: 5,
    condition: 'Post-Pregnancy',
  },
  {
    name: 'Kavya B.',
    city: 'Pune',
    loss: 'Thyroid Managed',
    text: 'With hypothyroidism, weight loss felt impossible. Dr. Priya\'s thyroid-specific diet made a huge difference. My energy levels are up and I\'ve lost 10 kg in 4 months!',
    rating: 5,
    condition: 'Thyroid Management',
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
            Over 5,000 patients have transformed their health. Here are some of their stories.
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
                  <span key={i} className="text-accent-500">★</span>
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
