import React from 'react';
import CreateAvatarPageClient from './CreateAvatarPageClient';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function CreateAvatarPage() {
  return <CreateAvatarPageClient />;
}