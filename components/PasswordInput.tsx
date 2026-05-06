'use client';

import { forwardRef, useState } from 'react';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  className?: string;
};

/**
 * Password input with an eye toggle to reveal/hide the value.
 * Drop-in replacement for <input type="password" ... />.
 */
const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { className = '', ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...rest}
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {visible ? (
          // eye (open) — password currently visible
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
            <circle cx="12" cy="12" r="3" strokeWidth={1.8} />
          </svg>
        ) : (
          // eye-off (crossed) — password currently hidden
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3l18 18M10.477 10.477a3 3 0 004.046 4.046M9.88 4.262A9.953 9.953 0 0112 4c5 0 9.27 3.11 11 8a11.05 11.05 0 01-3.225 4.575M6.343 6.343A11.05 11.05 0 001 12c1.73 4.89 6 8 11 8 1.5 0 2.92-.27 4.21-.76" />
          </svg>
        )}
      </button>
    </div>
  );
});

export default PasswordInput;
