"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Send } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { tokenUtils } from '@/utils/auth';
import { toast } from 'react-hot-toast';

const NotificationTest: React.FC = () => {
  const user = tokenUtils.getUser();
  const { sendTestNotification } = usePushNotifications(user?.id);

  const handleTestNotification = () => {
    sendTestNotification();
    toast.success('Test notification sent!');
  };

  const handleBrowserNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Answer24 Test', {
          body: 'This is a test browser notification from Answer24!',
          icon: '/answerLogobgRemover-removebg-preview.png',
          badge: '/answerLogobgRemover-removebg-preview.png',
        });
        toast.success('Browser notification sent!');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('Answer24 Test', {
              body: 'This is a test browser notification from Answer24!',
              icon: '/answerLogobgRemover-removebg-preview.png',
            });
            toast.success('Browser notification sent!');
          } else {
            toast.error('Notification permission denied');
          }
        });
      } else {
        toast.error('Notifications are blocked. Please enable them in your browser settings.');
      }
    } else {
      toast.error('This browser does not support notifications');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notification Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Test the notification system to ensure everything is working properly.
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={handleTestNotification}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Send className="w-4 h-4" />
            Test Push Notification
          </Button>
          
          <Button 
            onClick={handleBrowserNotification}
            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Bell className="w-4 h-4" />
            Test Browser Notification
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          Make sure to allow notifications when prompted by your browser.
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTest;