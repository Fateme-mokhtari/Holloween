import { getAllHouses } from "@/lib/apiHouses";
import Map from "./Map";

interface House {
  id: number;
  number: string;
  address: string;
  latitude: number;
  longitude: number;
  images: Array<{ file: string }>;
}

export default async function SpookyMap() {
  let houses: House[] = [];
  let error: string | null = null;

  try {
    houses = await getAllHouses();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch houses";
    console.error("Fetch error:", error);
  }

  if (error) return <p>Error: {error}</p>;
  if (houses.length === 0) return <p>No houses found</p>;

  // Calculate center from first house or use default
  const center = houses.length > 0 
    ? { lat: houses[0].latitude, lng: houses[0].longitude }
    : { lat: 51.95, lng: 4.58 };

  return <Map houses={houses} center={center} />;
}