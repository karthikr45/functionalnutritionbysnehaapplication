'use client';

import { useState, useEffect } from 'react';

let cachedLogo: string | null = null;

export function useLogo() {
  const [logo, setLogo] = useState<string | null>(cachedLogo);

  useEffect(() => {
    if (cachedLogo) return;
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((d) => {
        const url = d.settings?.logo || null;
        cachedLogo = url;
        setLogo(url);
      })
      .catch(() => {});
  }, []);

  return logo;
}
