import { getAllHouses } from "@/lib/apiHouses";
import { getAllZones } from "@/lib/apiZones";
import { Suspense } from "react";
import TopMenu from "./components/layout/TopMenu";
import SpookyMap from "./components/map/SpookyMap";

export default async function Home() {
  const [houses, zones] = await Promise.all([getAllHouses(), getAllZones()]);

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
        <SpookyMap houses={houses} zones={zones} />
      </Suspense>
    </>
  );
}
