import React from 'react'
import Blog from '@/components/blog/Blog'

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const page = () => {
    return (
        <div className=''>
            <Blog />
        </div>
    )
}

export default page