"use client";

import { Image as HouseImage } from "@/types/houses";
import Image from "next/image";
import { useState } from "react";

interface HousePhotoSliderProps {
  images: HouseImage[];
}

export default function HousePhotoSlider({ images }: HousePhotoSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="h-80 grid place-items-center text-sm text-gray-500">
        No photos available
      </div>
    );
  }

  const goPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0].clientX);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 40;

    if (Math.abs(deltaX) < swipeThreshold) {
      setTouchStartX(null);
      return;
    }

    if (deltaX > 0) {
      goPrevious();
    } else {
      goNext();
    }

    setTouchStartX(null);
  };

  if (images.length === 1) {
    return (
      <div className="relative h-80 w-full overflow-hidden rounded-lg">
        <Image
          src={images[0].file}
          alt="House photo"
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="relative h-80 w-full overflow-hidden rounded-lg"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Image
        src={images[activeIndex].file}
        alt={`House photo ${activeIndex + 1}`}
        fill
        unoptimized
        className="object-cover"
      />

      {/* Navigation Buttons */}
      <button
        onClick={goPrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={goNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Photo counter */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
        {activeIndex + 1} / {images.length}
      </div>
    </div>
  );
}
