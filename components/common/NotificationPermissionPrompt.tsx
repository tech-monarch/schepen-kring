"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface NotificationPermissionPromptProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  autoShow?: boolean;
  delay?: number;
}

export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  autoShow = true,
  delay = 3000
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Show prompt automatically if permission is default and autoShow is enabled
      if (autoShow && Notification.permission === 'default') {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, delay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [autoShow, delay]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }

    setIsRequesting(true);
    
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled! You\'ll now receive important updates.');
        onPermissionGranted?.();
        
        // Show a test notification
        setTimeout(() => {
          new Notification('Answer24 Notifications Enabled', {
            body: 'You\'ll now receive important updates and alerts.',
            icon: '/answerLogobgRemover-removebg-preview.png',
            badge: '/answerLogobgRemover-removebg-preview.png',
          });
        }, 1000);
      } else {
        toast.error('Notifications disabled. You can enable them later in your browser settings.');
        onPermissionDenied?.();
      }
      
      setShowPrompt(false);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
    } finally {
      setIsRequesting(false);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Remember user dismissed the prompt (store in localStorage)
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  // Don't show if notifications are not supported
  if (!('Notification' in window)) {
    return null;
  }

  // Don't show if permission is already granted or denied
  if (permission !== 'default') {
    return null;
  }

  // Don't show if user previously dismissed
  if (localStorage.getItem('notification-prompt-dismissed') === 'true') {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={dismissPrompt}
          />
          
          {/* Prompt Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <Card className="w-full max-w-md pointer-events-auto shadow-2xl border-0">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Stay Updated with Answer24
                </CardTitle>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Get instant notifications about important updates, messages, and account activities. 
                  We'll only send you relevant information.
                </p>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Important account updates</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>New messages and alerts</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Service status updates</span>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={dismissPrompt}
                    className="flex-1"
                    disabled={isRequesting}
                  >
                    Not Now
                  </Button>
                  <Button
                    onClick={requestPermission}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isRequesting}
                  >
                    {isRequesting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Requesting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Enable Notifications
                      </div>
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-400 mt-4">
                  You can change this setting anytime in your browser preferences.
                </p>
              </CardContent>
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissPrompt}
                className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};