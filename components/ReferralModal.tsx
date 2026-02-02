import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Copy, Check, Users, Sparkles, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export function ReferralModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [stats, setStats] = useState({
    my_code: "",
    invite_link: "",
    friends_joined: 0,
    bonuses_earned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      fetchInviteStats();
    }
  }, [open]);

  const fetchInviteStats = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invite/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (error) {
      console.error("Failed to fetch referral stats");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(stats.invite_link);
    setCopied(true);
    toast.success("Link copied! Share it with your friends.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-white rounded-[32px]">
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-8 text-center text-white">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-4 right-4 text-white/20"
          >
            <Sparkles className="w-12 h-12 rotate-12" />
          </motion.div>

          <div className="bg-white/20 w-16 h-16 rounded-3xl backdrop-blur-md flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Gift className="w-8 h-8 text-white animate-bounce" />
          </div>

          <DialogTitle className="text-2xl font-black tracking-tight">
            Invite & Earn €10
          </DialogTitle>
          <p className="text-indigo-100 text-xs mt-2 font-medium">
            Share the magic of Schepenkring.nlwith your friends!
          </p>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-slate-500 text-xs font-medium text-center px-4 leading-relaxed">
              When a friend signs up via your link and books a deal for{" "}
              <span className="text-slate-900 font-bold">2+ people</span>, you
              both get{" "}
              <span className="text-emerald-500 font-black">€10.00</span> in
              your wallet.
            </p>
          </div>

          {/* Referral Link Box */}
          <div className="bg-slate-50 rounded-[24px] p-4 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Personal Invite Link
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-700 truncate">
                {loading ? "Generating link..." : stats.invite_link}
              </div>
              <button
                onClick={copyToClipboard}
                className="bg-slate-900 hover:bg-indigo-600 text-white p-3 rounded-xl transition-all shadow-lg active:scale-90"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-center">
              <p className="text-2xl font-black text-slate-900">
                {stats.friends_joined}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase">
                Friends Joined
              </p>
            </div>
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 text-center">
              <p className="text-2xl font-black text-emerald-600">
                €{stats.bonuses_earned}
              </p>
              <p className="text-[10px] font-black text-emerald-500 uppercase">
                Total Earned
              </p>
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share with Friends
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
