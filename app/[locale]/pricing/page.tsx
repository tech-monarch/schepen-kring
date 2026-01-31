import React from 'react'
import Pricing from '@/components/pricing/Pricing'

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const page = () => {
    return (
        <div className='p-20'>
            <Pricing />
        </div>
    )
}

export default page