"use client";

import React, { useState, useEffect, useRef } from "react";

const PWALoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const progressCircleRef = useRef<SVGCircleElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if running in PWA mode
    const checkPWAMode = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const userAgent = window.navigator.userAgent;

      console.log("PWA Detection Details:", {
        isStandalone,
        isInWebAppiOS,
        userAgent,
        displayMode: window.matchMedia("(display-mode: standalone)").media,
      });

      return isStandalone || isInWebAppiOS;
    };

    const isPWA = checkPWAMode();
    console.log("Final PWA Detection:", { isPWA });

    if (isPWA) {
      console.log("PWA detected, showing loader");
      setVisible(true);

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        console.log("Starting animation");
        startAnimation();
      }, 100);
    } else {
      console.log("Not PWA mode, hiding loader");
      setVisible(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startAnimation = () => {
    console.log("startAnimation called");
    const circle = progressCircleRef.current;
    if (!circle) {
      console.log("Circle ref not found, retrying...");
      setTimeout(startAnimation, 100);
      return;
    }

    console.log("Circle found, setting up animation");
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    let currentProgress = 0;
    const duration = 2000; // 2 seconds
    const steps = 100;
    const stepDuration = duration / steps;

    console.log("Starting interval with stepDuration:", stepDuration);

    intervalRef.current = setInterval(() => {
      currentProgress += 1;

      const offset = circumference - (currentProgress / 100) * circumference;
      circle.style.strokeDashoffset = `${offset}`;
      setProgress(currentProgress);

      console.log("Progress:", currentProgress);

      if (currentProgress >= 100) {
        console.log("Animation complete");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Hide loader after completion
        setTimeout(() => {
          console.log("Hiding loader");
          setVisible(false);
        }, 500);
      }
    }, stepDuration);
  };

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  return (
    <div
      id="pwa-loader-container"
      className="flex fixed inset-0 z-[9999] justify-center items-center min-h-screen overflow-hidden"
      style={{
        backgroundColor: `rgba(243, 244, 246, ${1 - progress / 100})`,
        transition: "background-color 0.1s ease",
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
            className="fill-none stroke-blue-500"
            strokeWidth={10}
            strokeLinecap="round"
            cx={104}
            cy={104}
            r={90}
            style={{ transition: "stroke-dashoffset 0.1s ease" }}
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

export default PWALoader;
