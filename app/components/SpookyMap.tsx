"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { getAllHouses } from "@/lib/apiHouses"; 
import { getAllZones } from "@/lib/apiZones";
import { Houses } from "@/.next/types/houses";
import { Zones } from "@/.next/types/zones";

const SpookyMapContent = dynamic(() => import("./Map"), { 
  ssr: false,
  loading: () => (
    <div className="h-screen bg-slate-950 flex items-center justify-center text-orange-500 animate-pulse">
      Summoning the Scare Map...
    </div>
  )
});

export default function SpookyMap() {
  const [houses, setHouses] = useState<Houses[]>([]);
  const [zones, setZones] = useState<Zones[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // BETTER: Fetch both in parallel so the user waits less time
        const [housesData, zonesData] = await Promise.all([
          getAllHouses(),
          getAllZones()
        ]);
console.log({ zonesData });
        setHouses(housesData);
        setZones(zonesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "The spirits are blocking the signal.");
        console.error("API Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-orange-600 font-halloween">
        <span className="text-6xl mb-4 animate-bounce">🎃</span>
        <p className="font-mono tracking-widest uppercase">Loading Scary Locations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 p-6">
        <div className="text-center border border-red-500/50 p-10 rounded-lg bg-red-950/10 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <h2 className="text-4xl font-bold text-red-500 mb-2">CURSED API</h2>
          <p className="text-gray-400 font-mono mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold transition-all shadow-lg shadow-orange-900/40"
          >
            RETRY SUMMONING
          </button>
        </div>
      </div>
    );
  }
console.log({ zones });
  // Fallback to Nesselande coordinates if no houses are returned
  const center = houses.length > 0
    ? { lat: houses[0].latitude, lng: houses[0].longitude }
    : { lat: 51.98, lng: 4.58 };

  return (
    <div className="h-screen w-full relative">
      <SpookyMapContent houses={houses} zones={zones} center={center} />
    </div>
  );
}