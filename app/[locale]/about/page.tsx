import React from 'react'
import { AboutPage } from '@/components/about/About'

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const about = () => {
    return (
        <div>
            <AboutPage />
        </div>
    )
}

export default about