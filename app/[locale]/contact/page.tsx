// Remove the { } braces
import ContactPage from '@/components/contact/Contact' 
import React from 'react'

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const Contact = () => {
  return (
    <div>
      <ContactPage />
    </div>
  )
}

export default Contact