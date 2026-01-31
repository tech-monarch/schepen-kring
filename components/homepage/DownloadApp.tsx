"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Download, X, ShieldCheck, Cpu } from "lucide-react";

const SectionDownloadApp = () => {
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    setIsInstalled(standalone);
    setShouldRender(!standalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const t = useTranslations("DownloadApp");

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowModal(false);
      setDeferredPrompt(null);
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 p-10 text-center"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-[#c5a572]/10 border border-[#c5a572]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Cpu className="text-[#c5a572]" size={28} />
              </div>

              <h2 className="text-2xl font-serif italic text-white mb-4">
                {t("modal_title")}
              </h2>
              <p className="text-slate-400 text-sm font-light leading-relaxed mb-10">
                {t("modal_subtitle")}
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleInstallClick}
                  disabled={!deferredPrompt}
                  className="w-full py-4 bg-[#c5a572] text-black font-bold text-xs tracking-[0.2em] uppercase transition-all hover:bg-white disabled:opacity-30"
                >
                  {t("install_button")}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-4 bg-transparent border border-white/10 text-white font-bold text-xs tracking-[0.2em] uppercase hover:bg-white/5"
                >
                  {t("later_button")}
                </button>
              </div>
              
              {!deferredPrompt && (
                <p className="mt-6 text-[10px] text-slate-500 uppercase tracking-widest leading-loose">
                  {t("manual_add")}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="relative py-32 bg-[#0a0a0a] overflow-hidden border-t border-white/5">
        {/* Decorative Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/dowloadAppBG.png"
            alt="Dashboard Preview"
            fill
            className="object-cover object-right opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-[1px] bg-[#c5a572]" />
                <span className="text-[#c5a572] text-[10px] font-bold tracking-[0.4em] uppercase">
                  {t("section_title")}
                </span>
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-serif text-white italic mb-8 leading-tight">
                The Fleet <br />
                <span className="not-italic text-slate-600">In Your Pocket</span>
              </h2>
              
              <p className="text-xl text-slate-400 font-light leading-relaxed mb-12 max-w-xl">
                {t("section_subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-4 px-8 py-5 bg-white text-black group transition-all hover:bg-[#c5a572]"
                >
                  <Smartphone size={20} />
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-none">Access for</p>
                    <p className="text-sm font-bold uppercase tracking-wider">iOS Devices</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-4 px-8 py-5 border border-white/10 text-white group transition-all hover:bg-white/5"
                >
                  <Download size={20} className="text-[#c5a572]" />
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-none">Access for</p>
                    <p className="text-sm font-bold uppercase tracking-wider">Android</p>
                  </div>
                </button>
              </div>

              {/* Security Badge */}
              <div className="mt-12 flex items-center gap-3 text-slate-500">
                <ShieldCheck size={16} className="text-[#c5a572]" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">End-to-End Encrypted Fleet Management</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Abstract Element */}
        <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-[#c5a572]/5 rounded-full blur-[120px] pointer-events-none" />
      </section>
    </>
  );
};

export default SectionDownloadApp;