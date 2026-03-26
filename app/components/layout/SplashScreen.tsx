"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if user has already seen the splash screen
    const hasSeenSplash = localStorage.getItem("splashScreenSeen");

    if (hasSeenSplash) {
      // User has seen it before, don't show — shouldShow stays false
      return;
    }

    // User hasn't seen it, show the splash
    setShouldShow(true);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsLeaving(true);
      // Set flag in localStorage so it doesn't show again
      localStorage.setItem("splashScreenSeen", "true");

      // Wait for bounce-out animation to complete before hiding
      const hideTimer = setTimeout(() => {
        setShouldShow(false);
      }, 600); // Duration of bounce-out animation

      return () => clearTimeout(hideTimer);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[2000] flex items-center justify-center bg-black ${
        isLeaving
          ? "animate-bounce-out"
          : "animate-in animate-bounce-in duration-500"
      }`}
    >
      <Image
        src="/assets/images/splash-desktop.png"
        alt="Halloween Haunted Houses"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
