import { ClipboardCheckIcon, HeartHandIcon, SproutIcon, HandHoldingHeartIcon } from './Icons';
import { ReactNode } from 'react';

const steps: { step: string; icon: ReactNode; title: string; description: string }[] = [
  {
    step: '01',
    icon: <ClipboardCheckIcon className="w-8 h-8 text-primary-700" />,
    title: 'Begin Your Journey',
    description:
      'Select a consultation that aligns with your needs and schedule at your convenience. This is where your journey toward deeper healing begins.',
  },
  {
    step: '02',
    icon: <HeartHandIcon className="w-8 h-8 text-primary-700" />,
    title: 'Deep Understanding',
    description:
      'We take the time to understand you — your body, your history, your lifestyle. Every detail matters, because true healing is never one-size-fits-all.',
  },
  {
    step: '03',
    icon: <SproutIcon className="w-8 h-8 text-primary-700" />,
    title: 'Personalized Strategy',
    description:
      'A carefully designed plan is created to address the root cause, with tailored nutrition, routines, and guidance crafted just for you.',
  },
  {
    step: '04',
    icon: <HandHoldingHeartIcon className="w-8 h-8 text-primary-700" />,
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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">
            How Your Transformation Unfolds
          </h2>
          <p className="text-warm-text mt-4 max-w-2xl mx-auto text-base">
            A refined, step-by-step journey designed to restore your health with clarity, care, and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className={`relative text-center px-6 py-8 ${
                i < steps.length - 1 ? 'lg:border-r border-b lg:border-b-0 border-primary-200/50' : ''
              }`}
            >
              <p className="text-primary-400 font-serif text-2xl mb-4">{step.step}</p>
              <div className="w-16 h-16 border-2 border-primary-300 rounded-full flex items-center justify-center mx-auto mb-5">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-serif mb-2">{step.title}</h3>
              <div className="w-8 h-0.5 bg-primary-400 mx-auto mb-4" />
              <p className="text-warm-text text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
