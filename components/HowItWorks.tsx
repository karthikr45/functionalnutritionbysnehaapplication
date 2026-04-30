import { ClipboardCheckIcon, HeartHandIcon, SproutIcon, HandHoldingHeartIcon } from './Icons';
import { ReactNode } from 'react';
import ScrollReveal from './ScrollReveal';

const steps: { step: string; icon: ReactNode; title: string; description: string }[] = [
  {
    step: '01',
    icon: <ClipboardCheckIcon className="w-6 h-6 text-white" />,
    title: 'Begin Your Journey',
    description:
      'Select a consultation that aligns with your needs and schedule at your convenience. This is where your journey toward deeper healing begins.',
  },
  {
    step: '02',
    icon: <HeartHandIcon className="w-6 h-6 text-white" />,
    title: 'Deep Understanding',
    description:
      'We take the time to understand you — your body, your history, your lifestyle. Every detail matters, because true healing is never one-size-fits-all.',
  },
  {
    step: '03',
    icon: <SproutIcon className="w-6 h-6 text-white" />,
    title: 'Personalized Strategy',
    description:
      'A carefully designed plan is created to address the root cause, with tailored nutrition, routines, and guidance crafted just for you.',
  },
  {
    step: '04',
    icon: <HandHoldingHeartIcon className="w-6 h-6 text-white" />,
    title: 'Ongoing Guidance',
    description:
      'Healing is a journey, not a moment. With continuous support and thoughtful adjustments, we walk with you every step of the way.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-[0.2em]">The Experience</p>
          <div className="flex items-center justify-center gap-3 my-3">
            <div className="w-12 h-px bg-primary-300" />
            <SproutIcon className="w-5 h-5 text-primary-400" />
            <div className="w-12 h-px bg-primary-300" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium text-gray-900 font-serif">
            How Your Transformation Unfolds
          </h2>
          <p className="text-warm-text mt-4 max-w-2xl mx-auto text-base">
            A refined, step-by-step journey designed to restore your health with clarity, care, and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <ScrollReveal key={step.step} animation="fade-up" delay={i * 120}>
              <div className="relative bg-cream-dark rounded-2xl p-6 pt-8 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group h-full border-l-4 border-l-primary-600"
                style={{
                  borderImage: 'linear-gradient(to bottom, var(--primary-600), #D4A574) 1',
                }}
              >
                {/* Watermark number */}
                <span className="absolute -bottom-2 -right-1 text-[120px] font-serif font-bold leading-none text-primary-800/[0.06] select-none pointer-events-none">
                  {step.step}
                </span>

                {/* Icon */}
                <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-primary-700 to-primary-600 rounded-2xl flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-gray-900 font-serif mb-3">{step.title}</h3>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-primary-500 to-primary-300 mb-4" />
                  <p className="text-warm-text text-sm leading-relaxed">{step.description}</p>
                </div>

                {/* Step badge */}
                <div className="relative z-10 mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 uppercase tracking-wider">
                  <span className="w-4 h-px bg-primary-400" />
                  Step {step.step}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
