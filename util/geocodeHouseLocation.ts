export interface GeocodeResult {
  lat: number;
  lng: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
}

export async function geocodeHouseLocation(
  houseNumber: string,
  houseAddress: string,
  country = 'Netherlands'
): Promise<GeocodeResult | null> {
  const number = houseNumber.trim();
  const address = houseAddress.trim();

  if (!number || !address) {
    return null;
  }

  const query = `${number} ${address}, ${country}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as NominatimResult[];
  const first = data[0];

  if (!first) {
    return null;
  }

  const lat = Number.parseFloat(first.lat);
  const lng = Number.parseFloat(first.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}
