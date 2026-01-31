import React from 'react';
import LegalPageClient from './LegalPageClient';

export async function generateStaticParams() {
  return [
    { locale: 'en', slug: 'privacy-policy' },
    { locale: 'en', slug: 'terms-of-service' },
    { locale: 'en', slug: 'cookie-policy' },
    { locale: 'nl', slug: 'privacy-policy' },
    { locale: 'nl', slug: 'terms-of-service' },
    { locale: 'nl', slug: 'cookie-policy' },
  ];
}

export default function LegalPage() {
  return (
    <div className="mt-16">
      <LegalPageClient />
    </div>
  );

}