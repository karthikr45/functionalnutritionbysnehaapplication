const services = [
  {
    icon: '⚖️',
    title: 'Weight Management',
    description:
      'Science-backed weight loss and weight gain programs tailored to your metabolism, lifestyle, and food preferences. No crash diets.',
    tags: ['Obesity', 'Underweight', 'BMI Correction'],
  },
  {
    icon: '🩺',
    title: 'Clinical Nutrition',
    description:
      'Therapeutic diet plans for managing diabetes, hypertension, PCOS, thyroid disorders, kidney disease, and liver conditions.',
    tags: ['Diabetes', 'PCOS', 'Thyroid', 'Hypertension'],
  },
  {
    icon: '🏃',
    title: 'Sports Nutrition',
    description:
      'Performance-optimized nutrition strategies for athletes, bodybuilders, and fitness enthusiasts to maximize gains and recovery.',
    tags: ['Athletes', 'Muscle Gain', 'Endurance', 'Recovery'],
  },
  {
    icon: '🤰',
    title: 'Pregnancy & Lactation',
    description:
      'Specialized nutrition support for expecting and new mothers to ensure optimal health for both mother and baby.',
    tags: ['Prenatal', 'Postnatal', 'Breastfeeding'],
  },
  {
    icon: '👶',
    title: 'Pediatric Nutrition',
    description:
      'Expert dietary guidance for children from infancy to teenage years, addressing growth, development, and common childhood conditions.',
    tags: ['Infants', 'Toddlers', 'Teens', 'Picky Eaters'],
  },
  {
    icon: '🧘',
    title: 'Gut Health & Immunity',
    description:
      'Holistic nutrition plans to heal your gut, strengthen immunity, and restore energy levels through the food-gut connection.',
    tags: ['IBS', 'Gut Health', 'Immunity', 'Energy'],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">What I Offer</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
            Specialized Nutrition Services
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Every condition requires a unique nutritional approach. I offer evidence-based, personalized
            nutrition therapy across a wide range of health concerns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-gray-100 hover:border-primary-200 transition-all duration-200 group"
            >
              <div className="text-5xl mb-5">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{service.description}</p>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
