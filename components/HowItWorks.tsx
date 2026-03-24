const steps = [
  {
    step: '01',
    icon: '📋',
    title: 'Book Your Consultation',
    description:
      'Choose a consultation package that suits your needs. Pick a convenient date and time from the live availability calendar. No login needed to explore — sign in only when you\'re ready to book.',
  },
  {
    step: '02',
    icon: '🔬',
    title: 'Detailed Health Assessment',
    description:
      'Share your complete health history, current symptoms, lab reports, medications, lifestyle, stress levels, and food preferences. The more I know, the better your plan will be.',
  },
  {
    step: '03',
    icon: '📊',
    title: 'Root Cause Analysis & Custom Plan',
    description:
      'Based on functional medicine principles, I identify the root cause of your health issues and create a personalized diet plan with meal timings, recipes, and grocery lists — all using Indian food.',
  },
  {
    step: '04',
    icon: '🚀',
    title: 'Ongoing Support & Follow-ups',
    description:
      'Your plan evolves with you. Regular follow-up sessions track your progress, adjust your diet as needed, and keep you motivated. WhatsApp support is included for quick questions between sessions.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-green-600 font-semibold text-sm uppercase tracking-wide">The Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
            How It Works
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            A simple, structured process designed to make your health transformation as smooth and effective as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-green-100 -z-0" />

          {steps.map((step, i) => (
            <div key={step.step} className="relative text-center">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
