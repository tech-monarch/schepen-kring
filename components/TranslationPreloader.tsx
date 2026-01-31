'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { translationService } from '@/lib/translations';

export default function TranslationPreloader() {
  const locale = useLocale();

  useEffect(() => {
    // Preload translations for current locale and fallback
    const preloadTranslations = async () => {
      try {
        await translationService.preloadTranslations(['en', 'nl']);
      } catch (error) {
        console.error('Failed to preload translations:', error);
      }
    };

    preloadTranslations();
  }, [locale]);

  // This component doesn't render anything
  return null;
}
