'use client';

import { useTranslations } from '@/hooks/useTranslations';
import { useTranslations as useNextIntlTranslations } from 'next-intl';

export default function DynamicTranslationExample() {
  const { t: dynamicT, isLoading, error } = useTranslations();
  const t = useNextIntlTranslations(); // Fallback to static translations

  if (isLoading) {
    return <div>Loading translations...</div>;
  }

  if (error) {
    return <div>Error loading translations: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {/* This will use dynamic translation from API */}
        {dynamicT('header.title', t('HeroSection.hero_title_1'))}
      </h2>
      
      <p className="mb-4">
        {/* This will use dynamic translation with fallback */}
        {dynamicT('chat.welcome_message', 'Welcome! How can I help you?')}
      </p>
      
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        {/* This will use dynamic translation */}
        {dynamicT('faq.button_label', 'View Answer')}
      </button>
      
      <div className="mt-6 text-sm text-gray-600">
        <p>
          <strong>How this works:</strong>
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>First tries to get translation from API</li>
          <li>Falls back to provided fallback text if API fails</li>
          <li>Caches translations for better performance</li>
          <li>Automatically switches language based on locale</li>
        </ul>
      </div>
    </div>
  );
}
