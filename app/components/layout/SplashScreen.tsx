"use client";

import Image from "next/image";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black">
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
