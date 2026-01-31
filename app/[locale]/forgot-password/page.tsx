import React from 'react';
import ForgotPasswordClient from './ForgotPasswordClient';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function ForgotPassword() {
  return <ForgotPasswordClient />;
}