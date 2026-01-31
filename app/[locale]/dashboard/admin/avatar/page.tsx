import React from 'react';
import AvatarManagementClient from './AvatarManagementClient';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function AvatarManagement() {
  return <AvatarManagementClient />;
}