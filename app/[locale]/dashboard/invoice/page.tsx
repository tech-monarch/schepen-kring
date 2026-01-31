import React from 'react';
import InvoicePageClient from './InvoicePageClient';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function InvoicePage() {
  return <InvoicePageClient />;
}