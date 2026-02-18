"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE = "https://schepen-kring.nl/api";

interface LockscreenProps {
  onUnlock: () => void;
}

export default function Lockscreen({ onUnlock }: LockscreenProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(
        `${API_BASE}/verify-password`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUnlock();
    } catch (err) {
      toast.error("Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Lock size={48} className="mx-auto text-[#003566]" />
          <h2 className="text-2xl font-serif italic text-[#003566] mt-4">Screen Locked</h2>
          <p className="text-sm text-slate-500 mt-2">Enter your password to continue</p>
        </div>
        <form onSubmit={handleUnlock} className="space-y-4">
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
  );
}