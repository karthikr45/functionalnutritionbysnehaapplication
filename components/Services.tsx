const services = [
  {
    icon: '🧬',
    title: 'PCOS & Hormonal Health',
    description:
      'Functional nutrition approach to manage PCOS, irregular periods, hormonal acne, and fertility issues. Address the root cause — not just the symptoms.',
    tags: ['PCOS', 'Irregular Periods', 'Hormonal Acne', 'Fertility'],
  },
  {
    icon: '🦋',
    title: 'Thyroid Management',
    description:
      'Personalized nutrition protocols for hypothyroidism, hyperthyroidism, and Hashimoto\'s. Optimize thyroid function through targeted nutrition and lifestyle changes.',
    tags: ['Hypothyroid', 'Hyperthyroid', 'Hashimoto\'s', 'Energy'],
  },
  {
    icon: '🫁',
    title: 'Gut Health & Digestion',
    description:
      'Heal your gut, heal your body. Specialized protocols for IBS, bloating, acid reflux, leaky gut, and food sensitivities using the functional medicine approach.',
    tags: ['IBS', 'Bloating', 'Acid Reflux', 'Leaky Gut'],
  },
  {
    icon: '⚖️',
    title: 'Weight Management',
    description:
      'Sustainable weight loss and weight gain programs based on your metabolism, hormones, and lifestyle. No crash diets — just real, lasting results with Indian food.',
    tags: ['Weight Loss', 'Weight Gain', 'Metabolism', 'Body Composition'],
  },
  {
    icon: '🩺',
    title: 'Diabetes & Lifestyle Disorders',
    description:
      'Evidence-based nutrition therapy for Type 2 diabetes, pre-diabetes, high cholesterol, hypertension, and fatty liver. Reduce medication dependency naturally.',
    tags: ['Diabetes', 'Cholesterol', 'Blood Pressure', 'Fatty Liver'],
  },
  {
    icon: '🤰',
    title: 'Pregnancy & Fertility Nutrition',
    description:
      'Comprehensive nutrition support for pre-conception, pregnancy, and postpartum recovery. Ensure optimal nutrition for both mother and baby at every stage.',
    tags: ['Fertility', 'Prenatal', 'Postnatal', 'Lactation'],
  },
  {
    icon: '🧘',
    title: 'Autoimmune & Inflammation',
    description:
      'Anti-inflammatory nutrition protocols for autoimmune conditions like rheumatoid arthritis, lupus, and psoriasis. Reduce flare-ups through targeted dietary interventions.',
    tags: ['Autoimmune', 'Inflammation', 'Joint Pain', 'Skin Health'],
  },
  {
    icon: '🏃',
    title: 'Sports & Fitness Nutrition',
    description:
      'Performance-optimized nutrition for athletes, gym-goers, and fitness enthusiasts. Maximize muscle gain, endurance, and recovery with science-backed meal plans.',
    tags: ['Athletes', 'Muscle Gain', 'Endurance', 'Recovery'],
  },
  {
    icon: '👶',
    title: 'Pediatric & Adolescent Nutrition',
    description:
      'Expert dietary guidance for children and teenagers — addressing growth, immunity, picky eating, childhood obesity, and academic performance through proper nutrition.',
    tags: ['Child Nutrition', 'Teens', 'Growth', 'Immunity'],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-green-600 font-semibold text-sm uppercase tracking-wide">What I Treat</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
            Conditions & Specializations
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Every health condition has a nutritional root cause. I use functional nutrition to address
            the underlying imbalance — not just mask the symptoms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-gray-100 hover:border-green-200 transition-all duration-200 group"
            >
              <div className="text-5xl mb-5">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{service.description}</p>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full"
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
