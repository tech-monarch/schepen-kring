import React from 'react';
import WebshopDetailClient from './WebshopDetailClient';

export async function generateStaticParams() {
  return [
    { locale: 'en', id: '1' },
    { locale: 'en', id: '2' },
    { locale: 'en', id: '3' },
    { locale: 'en', id: '4' },
    { locale: 'en', id: '5' },
    { locale: 'nl', id: '1' },
    { locale: 'nl', id: '2' },
    { locale: 'nl', id: '3' },
    { locale: 'nl', id: '4' },
    { locale: 'nl', id: '5' },
  ];
}

const WebshopDetailPage = () => {
  return <WebshopDetailClient />;
};

export default WebshopDetailPage;