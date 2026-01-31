import { CleanDashboardContainer } from '@/components/dashboard/Container'
import React from 'react'

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
} 

const DashboardPage = () => {
  return (
    <div>
        <CleanDashboardContainer/>
    </div>
  )
}

export default DashboardPage
