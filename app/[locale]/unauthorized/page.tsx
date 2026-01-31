import React from 'react';
import UnauthorizedClient from './UnauthorizedClient';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function UnauthorizedPage() {
  return <UnauthorizedClient />;
}