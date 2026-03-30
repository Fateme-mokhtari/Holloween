import { getAllHouses } from "@/lib/apiHouses";
import { getAllZones } from "@/lib/apiZones";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import TopMenu from "./components/layout/TopMenu";
import SpookyMap from "./components/map/SpookyMap";

async function MapSection() {
  const [houses, zones] = await Promise.all([getAllHouses(), getAllZones()]);
  return <SpookyMap houses={houses} zones={zones} />;
}

export default function Home() {
  return (
    <>
      <TopMenu />
      <Suspense
        fallback={
          <div className="h-screen bg-slate-950 flex items-center justify-center text-orange-500 animate-pulse">
            Summoning the Scare Map...
          </div>
        }
      >
        <MapSection />
      </Suspense>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
