import React from 'react';
import Faq from '@/components/faq/Faq';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const FaqPage = () => {
  return (
    <main className="min-h-screen bg-background  m-20">
      <Faq />
    </main>
  );
};

export default FaqPage;