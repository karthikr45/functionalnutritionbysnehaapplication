export default function About() {
  const credentials = [
    { icon: '🎓', label: 'Certified Functional Nutrition Consultant' },
    { icon: '🏅', label: 'Advanced Clinical Nutrition & Dietetics' },
    { icon: '💊', label: 'Certified in Functional Medicine Approach' },
    { icon: '🧬', label: 'Gut Microbiome & Hormonal Health Specialist' },
    { icon: '🏃', label: 'Sports & Performance Nutrition Certified' },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 text-center">
              <div className="w-48 h-48 bg-white rounded-full mx-auto shadow-lg flex items-center justify-center text-8xl mb-6">
                🌿
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { number: '8+', label: 'Years Experience' },
                  { number: '500+', label: 'Clients Transformed' },
                  { number: '95%', label: 'Success Rate' },
                  { number: '4.9★', label: 'Client Rating' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-2xl font-bold text-green-600">{stat.number}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content side */}
          <div className="space-y-6">
            <div>
              <p className="text-green-600 font-semibold text-sm uppercase tracking-wide">About Me</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
                Hi, I&apos;m Sneha
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              I&apos;m a certified Functional Nutrition Consultant passionate about helping people heal
              from the root cause — not just manage symptoms. With over 8 years of experience, I combine
              the principles of functional medicine with personalized nutrition to create lasting health transformations.
            </p>
            <p className="text-gray-600 leading-relaxed">
              I specialize in hormonal imbalances (PCOS, thyroid), gut health issues (IBS, bloating, acid reflux),
              diabetes management, weight loss, and autoimmune conditions. My approach goes beyond calorie counting —
              I look at your complete health picture including lab work, lifestyle, stress, sleep, and gut health.
            </p>
            <p className="text-gray-600 leading-relaxed">
              My philosophy is simple: <strong className="text-green-700">food is medicine.</strong>{' '}
              When you give your body the right nutrition, it has an incredible ability to heal itself.
              Every plan I create is rooted in science, customized to Indian food habits, and designed
              for real life — not just theory.
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-gray-800">Qualifications & Expertise</h4>
              {credentials.map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <span className="text-gray-700 text-sm">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
