"use client";

import dynamic from "next/dynamic";
import { Houses } from "@/.next/types/houses";
import { Zones } from "@/.next/types/zones";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-slate-950 flex items-center justify-center text-orange-500 animate-pulse">
      Summoning the Scare Map...
    </div>
  ),
});

interface SpookyMapProps {
  houses: Houses[];
  zones: Zones[];
}

export default function SpookyMap({ houses, zones }: SpookyMapProps) {
  // Fallback to Nesselande coordinates if no houses are returned
  const center = houses.length > 0
    ? { lat: houses[0].latitude, lng: houses[0].longitude }
    : { lat: 51.98, lng: 4.58 };

  return (
   
      <Map houses={houses} zones={zones} center={center} />
 
  );
}