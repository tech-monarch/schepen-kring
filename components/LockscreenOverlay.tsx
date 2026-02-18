"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE = "https://schepen-kring.nl/api";

interface LockscreenOverlayProps {
  children: React.ReactNode;
}

export default function LockscreenOverlay({ children }: LockscreenOverlayProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [user, setUser] = useState<any>(null);

  // Load user from localStorage and keep it updated
  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  // Timeout duration in ms (default 10 minutes)
  const timeoutDuration = (user?.lockscreen_timeout ?? 10) * 60 * 1000;

  // Reset the inactivity timer
  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isLocked && user) {
      timeoutRef.current = setTimeout(() => {
        setIsLocked(true);
      }, timeoutDuration);
    }
  };

  // Listen to user activity events
  useEffect(() => {
    if (!user) {
      setIsLocked(false);
      return;
    }

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // start the timer

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, timeoutDuration]);

  // Unlock and restart timer
  const handleUnlock = () => {
    setIsLocked(false);
    resetTimer();
    setPassword("");
  };

  // Verify password with backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(
        `${API_BASE}/verify-password`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Unlocked");
      handleUnlock();
    } catch {
      toast.error("Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Lockscreen overlay – covers the whole screen when locked */}
      {isLocked && (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
          <div className="w-full max-w-md p-8">
            <div className="text-center mb-8">
              <Lock size={48} className="mx-auto text-[#003566]" />
              <h2 className="text-2xl font-serif italic text-[#003566] mt-4">
                Screen Locked
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Enter your password to continue
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border-b border-slate-200 py-2 text-center outline-none focus:border-[#003566]"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#003566] text-white py-3 text-sm font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* The actual application content */}
      {children}
    </>
  );
}