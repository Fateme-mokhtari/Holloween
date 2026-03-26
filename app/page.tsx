import { getAllHouses } from "@/lib/apiHouses";
import { getAllZones } from "@/lib/apiZones";
import { Suspense } from "react";
import SplashScreen from "./components/SplashScreen";
import SpookyMap from "./components/SpookyMap";
import TopMenu from "./components/TopMenu";

export default async function Home() {
  const [houses, zones] = await Promise.all([getAllHouses(), getAllZones()]);

  return (
    <>
      <SplashScreen />
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
