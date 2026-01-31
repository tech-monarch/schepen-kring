import React from 'react';
import AccountPageClient from './AccountPageClient';


export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function AccountPage() {
  return <AccountPageClient />;
}