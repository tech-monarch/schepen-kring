'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { translationService } from '@/lib/translations';

interface UseTranslationsResult {
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
  error: string | null;
  refreshTranslations: () => Promise<void>;
}

export function useTranslations(): UseTranslationsResult {
  const locale = useLocale();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTranslations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dynamicTranslations = await translationService.getTranslations(locale);
      setTranslations(dynamicTranslations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load translations');
      console.error('Translation loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTranslations();
  }, [locale]);

  const t = (key: string, fallback?: string): string => {
    // First check dynamic translations
    if (translations[key]) {
      return translations[key];
    }
    
    // Return fallback or key if not found
    return fallback || key;
  };

  const refreshTranslations = async () => {
    await loadTranslations();
  };

  return {
    t,
    isLoading,
    error,
    refreshTranslations,
  };
}
