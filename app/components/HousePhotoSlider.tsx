"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as HouseImage } from "@/types/houses";

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

      <button
        type="button"
        onClick={goPrevious}
        aria-label="Previous photo"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white text-lg leading-none cursor-pointer"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Next photo"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white text-lg leading-none cursor-pointer"
      >
        ›
      </button>
    </div>
  );
}
