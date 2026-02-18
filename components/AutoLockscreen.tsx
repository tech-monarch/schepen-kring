"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE = "https://schepen-kring.nl/api";

interface AutoLockscreenProps {
  children: React.ReactNode;
}

export default function AutoLockscreen({ children }: AutoLockscreenProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [user, setUser] = useState<any>(null);

  // Load user from localStorage and listen for changes
  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Failed to parse user_data", e);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  // Compute timeout duration (default 10 minutes if not set)
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

  // Set up event listeners for user activity
  useEffect(() => {
    if (!user) {
      // No logged-in user → never lock
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
    resetTimer(); // initial start

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, timeoutDuration]);

  // Unlock screen and restart timer
  const handleUnlock = () => {
    setIsLocked(false);
    resetTimer();
  };

  // Handle password submission
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
      setPassword("");
    } catch (err) {
      toast.error("Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Lockscreen overlay */}
      {isLocked && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
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

      {/* Your actual page content */}
      {children}
    </>
  );
}