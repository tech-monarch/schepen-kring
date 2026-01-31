import React from 'react';
import AvatarPageClient from './AvatarPageClient';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function AvatarPage() {
  return <AvatarPageClient />;
}