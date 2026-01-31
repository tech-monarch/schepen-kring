import React from 'react'
import AllNotifications from '@/components/AllNotifications'

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const AdminNotificationsPage = () => {
    return (
        <AllNotifications userType="admin" />
    )
}

export default AdminNotificationsPage