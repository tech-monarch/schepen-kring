
import React from 'react'
import AllNotifications from '@/components/AllNotifications'

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const PartnerNotificationsPage = () => {
    return (
        <AllNotifications userType="partner" />
    )
}

export default PartnerNotificationsPage