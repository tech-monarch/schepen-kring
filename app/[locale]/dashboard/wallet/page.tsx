import React from 'react';
import WalletPageClient from './WalletPageClient';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function WalletPage() {
  return <WalletPageClient />;
}