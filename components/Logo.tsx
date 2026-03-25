'use client';

import { useLogo } from '@/lib/useLogo';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showText?: boolean;
}

export default function Logo({ size = 'md', variant = 'dark', showText = true }: LogoProps) {
  const logo = useLogo();

  const sizeMap = { sm: 'w-10 h-10', md: 'w-12 h-12', lg: 'w-16 h-16' };
  const textColor = variant === 'dark' ? 'text-gray-900' : 'text-white';
  const subColor = variant === 'dark' ? 'text-green-600' : 'text-green-400';

  return (
    <div className="flex items-center gap-2.5">
      {logo ? (
        <img src={logo} alt="Functional Nutrition by Sneha" className={`${sizeMap[size]} rounded-lg object-contain`} />
      ) : (
        <div className={`${sizeMap[size]} bg-green-600 rounded-lg flex items-center justify-center text-white font-bold ${size === 'sm' ? 'text-xs' : 'text-lg'}`}>
          FN
        </div>
      )}
      {showText && (
        <div>
          <span className={`font-bold ${textColor} ${size === 'sm' ? 'text-sm' : 'text-lg'} leading-tight`}>Functional Nutrition</span>
          <p className={`${subColor} text-xs leading-tight`}>by Sneha</p>
        </div>
      )}
    </div>
  );
}
