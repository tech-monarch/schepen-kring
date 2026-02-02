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
      <Faq />
  );
};

export default FaqPage;