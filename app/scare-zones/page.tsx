import SpookyMap from "../components/SpookyMap";
import { getAllHouses } from "@/lib/apiHouses";
import { getAllZones } from "@/lib/apiZones";

import { Suspense } from "react";

export default async function ScareZonesPage() {

  const [houses, zones] = await Promise.all([
    getAllHouses(),
    getAllZones(),
  ]);

  return (
    <>
      <h1 className="text-4xl font-bold text-orange-500 mb-6">Scare Zones</h1>
      <Suspense
        fallback={
          <div className="h-screen bg-slate-950 flex items-center justify-center text-orange-500 animate-pulse">
            Summoning the Scare Map...
          </div>
        }
      >
        <SpookyMap houses={houses} zones={zones} />
      </Suspense>
    </>
  );
}