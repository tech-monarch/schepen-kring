import React from 'react';
import UpdateBlogClient from './UpdateBlogClient';

export async function generateStaticParams() {
  return [
    { locale: 'en', slug: 'blog-post-1' },
    { locale: 'en', slug: 'blog-post-2' },
    { locale: 'en', slug: 'blog-post-3' },
    { locale: 'en', slug: 'blog-post-4' },
    { locale: 'en', slug: 'blog-post-5' },
    { locale: 'nl', slug: 'blog-post-1' },
    { locale: 'nl', slug: 'blog-post-2' },
    { locale: 'nl', slug: 'blog-post-3' },
    { locale: 'nl', slug: 'blog-post-4' },
    { locale: 'nl', slug: 'blog-post-5' },
  ];
}

export default function UpdateBlogPage() {
  return <UpdateBlogClient />;
}