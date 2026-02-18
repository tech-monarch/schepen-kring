"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE = "https://schepen-kring.nl/api";

interface LockscreenOverlayProps {
  children: React.ReactNode;
}

export default function LockscreenOverlay({ children }: LockscreenOverlayProps) {
  // 1. Initialize state based on LocalStorage to prevent flash on reload
  const [isLocked, setIsLocked] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("is_locked") === "true";
    }
    return false;
  });

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [user, setUser] = useState<any>(null);

  // Load user data
  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        try { setUser(JSON.parse(userData)); } catch { setUser(null); }
      }
    };
    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  // Determine timeout duration (default 10 mins)
  const timeoutDuration = (user?.lockscreen_timeout ?? 10) * 60 * 1000;

  // 2. Function to Lock the screen
  const lockScreen = () => {
    setIsLocked(true);
    localStorage.setItem("is_locked", "true"); // Persist lock state
  };

  // 3. Reset the inactivity timer
  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Only start timer if user exists and screen is NOT currently locked
    if (!isLocked && user) {
      timeoutRef.current = setTimeout(() => {
        lockScreen();
      }, timeoutDuration);
    }
  };

  // 4. Activity Listeners
  useEffect(() => {
    // If we are already locked (e.g. from reload), don't start listeners yet
    if (isLocked || !user) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handleActivity = () => resetTimer();

    events.forEach((e) => window.addEventListener(e, handleActivity));
    resetTimer(); // Start initial timer

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, timeoutDuration, isLocked]);

  // 5. Verify PIN with backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      // Use the 4-digit PIN verification endpoint
      await axios.post(
        `${API_BASE}/verify-password`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 6. On Success: Unlock and Clear Storage
      setIsLocked(false);
      localStorage.removeItem("is_locked"); // Remove persistent flag
      setPassword("");
      toast.success("Identity Verified");
      resetTimer(); // Restart timer immediately
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Incorrect PIN Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Professional Overlay Styling */}
      <AnimatePresence>
        {isLocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl p-10 text-center relative overflow-hidden"
            >
              {/* Decorative top bar */}
              <div className="absolute top-0 left-0 w-full h-2 bg-[#003566]"></div>

              <div className="mb-8 mt-2">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Lock size={32} className="text-[#003566]" />
                </div>
                <h2 className="text-2xl font-serif italic text-[#003566]">Secure Session</h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-3 font-bold">
                  Enter 4-Digit PIN
                </p>
                <p className="text-[10px] text-slate-300 mt-2">
                  (Default access code: 1234)
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full text-4xl tracking-[0.5em] text-center border-b-2 border-slate-100 py-4 outline-none focus:border-[#003566] text-[#003566] placeholder:text-slate-200 transition-all font-serif"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || password.length < 4}
                  className="w-full bg-[#003566] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#003566]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      <ShieldCheck size={16} />
                      Unlock Dashboard
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area - Blurred when locked */}
      <div className={`transition-all duration-300 ${isLocked ? "blur-sm pointer-events-none select-none h-screen overflow-hidden" : ""}`}>
        {children}
      </div>
    </>
  );
}