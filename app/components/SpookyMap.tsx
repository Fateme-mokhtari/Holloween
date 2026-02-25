import { getAllHouses } from "@/lib/apiHouses";
import { getAllZones } from "@/lib/apiZones";
import Map from "./Map";
import { Zones } from "@/.next/types/zones";

interface House {
  id: number;
  number: string;
  address: string;
  latitude: number;
  longitude: number;
  images: Array<{ file: string }>;
}

/** Calculate map center from house coordinates (average of all houses) */
function calculateCenter(houses: House[]) {
  if (houses.length === 0) {
    return { lat: 51.95, lng: 4.58 }; // Default center
  }
  
  // Ensure coordinates are numbers and valid
  const validHouses = houses.filter(
    (h) => typeof h.latitude === 'number' && typeof h.longitude === 'number' && 
           !isNaN(h.latitude) && !isNaN(h.longitude)
  );

  if (validHouses.length === 0) {
    console.warn('No valid house coordinates found');
    return { lat: 51.95, lng: 4.58 }; // Default center
  }

  const avgLat = validHouses.reduce((sum, h) => sum + h.latitude, 0) / validHouses.length;
  const avgLng = validHouses.reduce((sum, h) => sum + h.longitude, 0) / validHouses.length;
  
  return { lat: avgLat, lng: avgLng };
}

export default async function SpookyMap() {
  // Fetch data in parallel using Promise.allSettled
  const [housesResult, zonesResult] = await Promise.allSettled([
    getAllHouses(),
    getAllZones(),
  ]);

  // Extract houses data
  const houses: House[] =
    housesResult.status === "fulfilled" ? housesResult.value : [];

  // Extract zones data (non-critical, defaults to empty array)
  const zones: Zones[] =
    zonesResult.status === "fulfilled" ? zonesResult.value : [];

  // Log warnings if zones failed
  if (zonesResult.status === "rejected") {
    console.warn("Could not fetch zones:", zonesResult.reason);
  }

  // Show error if critical data (houses) failed to load
  if (housesResult.status === "rejected") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">⚠️ Error Loading Map</h2>
          <p className="text-gray-400">
            {housesResult.reason instanceof Error
              ? housesResult.reason.message
              : "Failed to load houses data"}
          </p>
        </div>
      </div>
    );
  }

  if (houses.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">No haunted houses found 👻</p>
      </div>
    );
  }

  const center = calculateCenter(houses);

  return <Map houses={houses} zones={zones} center={center} />;
}