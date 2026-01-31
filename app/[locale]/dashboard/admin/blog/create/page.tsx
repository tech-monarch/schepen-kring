import React from 'react';
import CreateBlogPageClient from './CreateBlogPageClient';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function CreateBlogPage() {
  return <CreateBlogPageClient />;
}