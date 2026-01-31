"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Shield, Settings, Check, X } from "lucide-react";

export default function CookiePopup() {
  const t = useTranslations("COOKIES");
  const [show, setShow] = useState(false);
  const [settings, setSettings] = useState({
    functional: true,
    analytics: false,
  });

  // useEffect(() => {
  //   // Check for cookie_consent cookie
  //   const consent = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='));
  //   if (!consent) setShow(true);
  // }, []);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )cookie_consent=([^;]*)/);
    if (match) {
      try {
        const saved = JSON.parse(decodeURIComponent(match[1]));
        setSettings(saved);
        setShow(false);
      } catch {
        setShow(true);
      }
    } else {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  const savePreferences = () => {
    // Only set cookie if analytics is enabled (or you can always set it if you want to remember preferences)
    document.cookie = `cookie_consent=${encodeURIComponent(
      JSON.stringify(settings)
    )}; path=/; max-age=31536000`;
    setShow(false);
  };

  const acceptAll = () => {
    const all = { functional: true, analytics: true };
    document.cookie = `cookie_consent=${encodeURIComponent(
      JSON.stringify(all)
    )}; path=/; max-age=31536000`;
    setSettings(all);
    setShow(false);
  };

  const toggle = (key: keyof typeof settings) =>
    setSettings({ ...settings, [key]: !settings[key] });

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShow(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10 bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Cookie className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{t("title")}</h2>
                    <p className="text-blue-100 text-sm">{t("description")}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShow(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">
                  {t("manageSettings")}
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "functional",
                    label: t("types.functional.title"),
                    desc: t("types.functional.description"),
                    required: true,
                  },
                  {
                    key: "analytics",
                    label: t("types.analytics.title"),
                    desc: t("types.analytics.description"),
                    required: false,
                  },
                ].map(({ key, label, desc, required }) => (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.01 }}
                    className="flex justify-between items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{label}</p>
                        {required && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{desc}</p>
                    </div>

                    {/* Enhanced toggle switch */}
                    <div className="relative mt-1">
                      <input
                        type="checkbox"
                        id={`toggle-${key}`}
                        checked={settings[key as keyof typeof settings]}
                        onChange={() =>
                          !required && toggle(key as keyof typeof settings)
                        }
                        disabled={required}
                        className="sr-only"
                      />
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shadow-inner ${
                          settings[key as keyof typeof settings]
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200"
                            : "bg-gray-300 shadow-gray-200"
                        } ${required ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() =>
                          !required && toggle(key as keyof typeof settings)
                        }
                      >
                        <motion.div
                          layout
                          className={`bg-white w-4 h-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                            settings[key as keyof typeof settings]
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        >
                          {settings[key as keyof typeof settings] && (
                            <Check className="w-2.5 h-2.5 text-blue-600" />
                          )}
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Security Notice */}
              {/* <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>
                    Your privacy is protected. You can change these settings
                    anytime.
                  </span>
                </div>
              </div> */}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={savePreferences}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  {t("savePreferences")}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={acceptAll}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform"
                >
                  {t("acceptAll")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
