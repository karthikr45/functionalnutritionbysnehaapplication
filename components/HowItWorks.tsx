import { ClipboardCheckIcon, HeartHandIcon, SproutIcon, HandHoldingHeartIcon } from './Icons';
import { ReactNode } from 'react';
import ScrollReveal from './ScrollReveal';

const steps: { step: string; icon: ReactNode; title: string; description: string }[] = [
  {
    step: '01',
    icon: <ClipboardCheckIcon className="w-7 h-7 text-white" />,
    title: 'Begin Your Journey',
    description:
      'Select a consultation that aligns with your needs and schedule at your convenience. This is where your journey toward deeper healing begins.',
  },
  {
    step: '02',
    icon: <HeartHandIcon className="w-7 h-7 text-white" />,
    title: 'Deep Understanding',
    description:
      'We take the time to understand you — your body, your history, your lifestyle. Every detail matters, because true healing is never one-size-fits-all.',
  },
  {
    step: '03',
    icon: <SproutIcon className="w-7 h-7 text-white" />,
    title: 'Personalized Strategy',
    description:
      'A carefully designed plan is created to address the root cause, with tailored nutrition, routines, and guidance crafted just for you.',
  },
  {
    step: '04',
    icon: <HandHoldingHeartIcon className="w-7 h-7 text-white" />,
    title: 'Ongoing Guidance',
    description:
      'Healing is a journey, not a moment. With continuous support and thoughtful adjustments, we walk with you every step of the way.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <ScrollReveal key={step.step} animation="fade-up" delay={i * 150}>
              <div className="relative bg-cream-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group h-full hover:-translate-y-1">
                {/* Top gradient accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-primary-700 via-primary-500 to-primary-300" />

                <div className="p-7 pb-8">
                  {/* Watermark number — very subtle */}
                  <span className="absolute top-6 right-5 text-[80px] font-serif font-bold leading-none text-primary-700/[0.04] select-none pointer-events-none">
                    {step.step}
                  </span>

                  {/* Step number */}
                  <span className="text-xs font-semibold text-primary-500 uppercase tracking-[0.15em] mb-4 block">
                    Step {step.step}
                  </span>

                  {/* Icon with glow ring */}
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 bg-primary-500/20 rounded-2xl blur-md group-hover:bg-primary-500/30 transition-colors" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-primary-800 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 font-serif mb-2 leading-tight">{step.title}</h3>

                  {/* Gradient divider */}
                  <div className="w-10 h-[2px] bg-gradient-to-r from-primary-600 to-primary-300 mb-4 group-hover:w-16 transition-all duration-500" />

                  {/* Description */}
                  <p className="text-warm-text text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
