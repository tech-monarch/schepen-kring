"use client";

import { useState, useEffect } from "react";

export const usePWADetection = () => {
  const [isPWA, setIsPWA] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPWAMode = () => {
      // Check if running in PWA mode
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isPWAMode = isStandalone || isInWebAppiOS;

      setIsPWA(isPWAMode);
      setIsLoading(false);

      console.log("PWA Detection:", { isStandalone, isInWebAppiOS, isPWAMode });
    };

    // Check immediately
    checkPWAMode();

    // Listen for changes in display mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addEventListener("change", checkPWAMode);

    return () => {
      mediaQuery.removeEventListener("change", checkPWAMode);
    };
  }, []);

  return { isPWA, isLoading };
};
