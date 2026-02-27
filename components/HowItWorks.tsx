const steps = [
  {
    step: '01',
    icon: '📋',
    title: 'Book Your Consultation',
    description:
      'Choose your preferred package or a single consultation. Pick a date and time that works for you from the doctor\'s live availability calendar.',
  },
  {
    step: '02',
    icon: '🔬',
    title: 'Comprehensive Assessment',
    description:
      'Share your health goals, medical history, dietary habits, and lifestyle. Upload any relevant reports or lab results for a complete picture.',
  },
  {
    step: '03',
    icon: '📊',
    title: 'Personalized Diet Plan',
    description:
      'Receive a detailed, personalized diet plan with meal timings, portion sizes, recipes, and grocery lists — all tailored to your Indian lifestyle.',
  },
  {
    step: '04',
    icon: '🚀',
    title: 'Ongoing Support & Follow-ups',
    description:
      'Track your progress with regular follow-up sessions. Your plan evolves with you as you hit milestones and your needs change.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">The Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
            Your Journey to Better Health
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            A simple, structured process designed to make your nutrition transformation as smooth as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-primary-100 -z-0" />

          {steps.map((step, i) => (
            <div key={step.step} className="relative text-center">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {i + 1}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-5 mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
