
import React from 'react'
import AllNotifications from '@/components/AllNotifications'


export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const ClientNotificationsPage = () => {
    return (
        <AllNotifications userType="client" />
    )
}

export default ClientNotificationsPage