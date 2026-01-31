"use client"
import React, { useEffect, useRef, useState } from "react";
import LockScreen from "@/components/LockScreen";

interface InactivityLockProviderProps {
  children: React.ReactNode;
}

const getLockTimeoutMs = () => {
  if (typeof window === "undefined") return 15 * 60 * 1000;
  
  // Try to get from user data first
  const userDataStr = localStorage.getItem("user_data");
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      if (userData.lock_timeout) {
        return Number(userData.lock_timeout) * 60 * 1000;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
  
  // Fallback to direct localStorage key
  const stored = localStorage.getItem("lockTimeout");
  return stored ? Number(stored) * 60 * 1000 : 1 * 60 * 1000;
};

// Helper functions for lock state persistence
const getLockState = (): boolean => {
  if (typeof window === "undefined") return false;
  const lockState = localStorage.getItem("screenLocked");
  return lockState === "true";
};

const setLockState = (locked: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("screenLocked", locked.toString());
};

const InactivityLockProvider: React.FC<InactivityLockProviderProps> = ({ children }) => {
  const [locked, setLocked] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize client-side state and restore lock state
  useEffect(() => {
    setIsClient(true);
    const wasLocked = getLockState();
    if (wasLocked) {
      setLocked(true);
    }
  }, []);

  // Reset timer on user activity
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLocked(true);
      setLockState(true);
    }, getLockTimeoutMs());
    // If locked, don't reset timer
    if (locked) return;
  };

  // Listen to user activity
  useEffect(() => {
    if (!isClient) return;
    
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    const handler = () => resetTimer();
    events.forEach((event) => window.addEventListener(event, handler));
    resetTimer();
    return () => {
      events.forEach((event) => window.removeEventListener(event, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line
  }, [locked, isClient]);

  // Unlock callback
  const handleUnlock = () => {
    setLocked(false);
    setLockState(false);
    resetTimer();
  };

  // Prevent hydration mismatch by only rendering on client
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <>
      <LockScreen show={locked} onUnlock={handleUnlock} />
      {children}
    </>
  );
};

export default InactivityLockProvider;
