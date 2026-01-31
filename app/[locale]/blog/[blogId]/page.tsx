import React from 'react';
import BlogPostClient from './BlogPostClient';

export async function generateStaticParams() {
  return [
    { locale: 'en', blogId: '1' },
    { locale: 'en', blogId: '2' },
    { locale: 'en', blogId: '3' },
    { locale: 'en', blogId: '4' },
    { locale: 'en', blogId: '5' },
    { locale: 'nl', blogId: '1' },
    { locale: 'nl', blogId: '2' },
    { locale: 'nl', blogId: '3' },
    { locale: 'nl', blogId: '4' },
    { locale: 'nl', blogId: '5' },
  ];
}

export default function BlogPostPage() {
  return <BlogPostClient />;
}