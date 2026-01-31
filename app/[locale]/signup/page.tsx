import React from 'react';
import PartnerSignupClient from './PartnerSignupClient';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function PartnerSignup() {
  return <PartnerSignupClient />;
}