"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { tokenUtils } from "@/utils/auth";

const PWAAuthLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const progressCircleRef = useRef<SVGCircleElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Detect PWA display mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    const checkIfPWA = () => {
      const pwaMode = mediaQuery.matches;
      setIsPWA(pwaMode);

      if (pwaMode) {
        setVisible(true);
        // Check authentication status when PWA starts
        checkAuthAndRedirect();
      } else {
        setVisible(false);
      }
    };

    const checkAuthAndRedirect = () => {
      const token = tokenUtils.getToken();
      const user = tokenUtils.getUser();

      // If user is authenticated, we'll redirect to dashboard after loading
      if (token && user) {
        console.log("PWA: User is authenticated, will redirect to dashboard");
      } else {
        console.log("PWA: User not authenticated, will redirect to login");
      }
    };

    // Initial check
    checkIfPWA();

    // Listen for changes in display mode
    mediaQuery.addEventListener("change", checkIfPWA);

    // 2. Handle the progress animation and visibility based on PWA mode
    let loadingInterval: NodeJS.Timeout | undefined;

    if (isPWA) {
      const circle = progressCircleRef.current;
      if (!circle) return;

      const radius = circle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;

      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = `${circumference}`;

      const updateProgress = (percent: number) => {
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = `${offset}`;
        setProgress(Math.round(percent));
      };

      let currentProgress = 0;
      const duration = 2000; // Total duration for progress animation
      const interval = 20; // Update interval

      loadingInterval = setInterval(() => {
        currentProgress += 100 / (duration / interval);
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(loadingInterval);

          // After loading completes, handle authentication redirect
          setTimeout(() => {
            const token = tokenUtils.getToken();
            const user = tokenUtils.getUser();

            if (token && user) {
              // User is authenticated, redirect to dashboard
              router.replace("/dashboard");
            } else {
              // User not authenticated, redirect to signin
              router.replace("/login");
            }

            setVisible(false);
          }, 400);
        }
        updateProgress(currentProgress);
      }, interval);
    }

    // Cleanup function
    return () => {
      mediaQuery.removeEventListener("change", checkIfPWA);
      if (loadingInterval) {
        clearInterval(loadingInterval);
      }
    };
  }, [isPWA, router]);

  // Don't render the loader if it's not visible or not in PWA mode
  if (!visible || !isPWA) {
    return null;
  }

  return (
    <div
      id="pwa-loader-container"
      className="flex fixed inset-0 z-[9999] justify-center items-center min-h-screen overflow-hidden"
      style={{
        backgroundColor: `rgba(243,244,246,${1 - progress / 100})`, // bg-gray-100 with animated alpha
        transition: "background-color 0.3s",
      }}
    >
      <div className="flex relative justify-center items-center w-52 h-52 z-10">
        <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
          <circle
            className="fill-none stroke-gray-200"
            strokeWidth={10}
            cx={104}
            cy={104}
            r={90}
          />
          <circle
            ref={progressCircleRef}
            className="transition-all duration-300 ease-linear fill-none stroke-blue-500 stroke-round"
            strokeWidth={10}
            cx={104}
            cy={104}
            r={90}
          />
        </svg>
        <div className="flex relative z-10 flex-col justify-center items-center text-center text-gray-800">
          <img src="/icon-192.png" alt="Logo" className="mb-4 w-20 h-20" />
          <div className="text-2xl font-semibold text-gray-800">
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAAuthLoader;
