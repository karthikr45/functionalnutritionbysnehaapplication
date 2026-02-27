export default function About() {
  const credentials = [
    { icon: '🎓', label: 'M.Sc. Food Science & Nutrition, Delhi University' },
    { icon: '🏅', label: 'Registered Dietitian (RD), Indian Dietetic Association' },
    { icon: '💊', label: 'Certified Diabetes Educator (CDE)' },
    { icon: '🏃', label: 'Sports & Performance Nutrition Certified' },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl p-8 text-center">
              <div className="w-48 h-48 bg-white rounded-full mx-auto shadow-lg flex items-center justify-center text-8xl mb-6">
                👩‍⚕️
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { number: '10+', label: 'Years Experience' },
                  { number: '5000+', label: 'Patients Helped' },
                  { number: '95%', label: 'Success Rate' },
                  { number: '4.9★', label: 'Patient Rating' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-2xl font-bold text-primary-600">{stat.number}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content side */}
          <div className="space-y-6">
            <div>
              <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">About Me</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
                Meet Dr. Priya Sharma
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              I am a certified Clinical Nutritionist and Dietitian with over 10 years of experience in
              personalized nutrition therapy. My approach combines cutting-edge nutritional science with
              an understanding of Indian food culture and lifestyle.
            </p>
            <p className="text-gray-600 leading-relaxed">
              I specialize in weight management, therapeutic diets for diabetes, PCOS, thyroid disorders,
              and sports nutrition. Every diet plan I create is evidence-based, sustainable, and tailored
              to your unique body chemistry, food preferences, and lifestyle.
            </p>
            <p className="text-gray-600 leading-relaxed">
              My philosophy is simple: <strong className="text-primary-700">real food, real results.</strong>{' '}
              No crash diets, no starvation, no supplements you don&apos;t need. Just a practical, holistic
              approach to nutrition that you can follow for life.
            </p>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Qualifications & Certifications</h4>
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
