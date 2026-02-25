"use client";

import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icons } from './MapIcons';
interface House {
  id: number;
  number: string;
  address: string;
  latitude: number;
  longitude: number;
  images: Array<{ file: string }>;
}

interface MapProps {
  houses: House[];
  center: { lat: number; lng: number };
}
// Your neighborhood coordinates (Example: Central Park area)
const center: [number, number] = [40.7812, -73.9665];

// Coordinates for a "High Scare Zone" polygon
const zoneCoords: [number, number][] = [
  [51.98521, -4.58204],
  [51.985114, -4.584045],
  [51.982488, -4.583698],
  [51.982601, -4.581782],
];

export default function Map({ houses, center }: MapProps) {
  return (
    <div className="h-[100vh] w-full rounded-lg overflow-hidden border-4 border-orange-600 shadow-2xl">
      <MapContainer    center={[center.lat, center.lng]}
      zoom={15}
      style={{ height: "100vh", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {/* Highlighted Scare Zone */}
        <Polygon 
          positions={zoneCoords} 
          fillColor="#7e22ce"
          pathOptions={{ 
            color: '#ea580c', // Orange
            fillColor: '#7e22ce', // Purple
            fillOpacity: 1
          }} 
        />
          <Polygon 
          positions={zoneCoords} 
          fillColor="#7e22ce"
          pathOptions={{ 
            color: '#ea580c', // Orange
            fillColor: '#9978b5', // Purple
            fillOpacity: 1
          }} 
        />

        {/* Markers using Emojis */}
       {houses.map((house) => (
        <Marker key={house.id}
         position={[house.latitude, house.longitude]} 
            icon={Icons.Pumpkin}
        >
          <Popup>
            <div>
              <h3>{house.address} {house.number}</h3>
              {/* {house.images[0] && (
                <img src={house.images[0].file} alt={house.address} width={200} />
              )} */}
            </div>
          </Popup>
        </Marker>
      ))}

      </MapContainer>
    </div>
  );
}