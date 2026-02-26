"use client";

import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icons } from './MapIcons';
import { Zones } from '@/.next/types/zones';

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
  zones: Zones[];
  center: { lat: number; lng: number };
}

export default function Map({ houses, zones, center }: MapProps) {
  return (
    <div className="h-[calc(100vh-60px)] w-full overflow-hidden ">
      <MapContainer 
        center={[center.lat, center.lng]}
        zoom={15}
        style={{ height: "100vh", width: "100%" }}
        className="filter hue-rotate-60 saturate-120 brightness-90"
      >
        {/* lighter OSM tiles with a slight color shift for atmosphere */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {/* Scare Zones */}
        {zones.length > 0 && zones.map((zone) => {
          const zoneCoords = zone.locations.map(
            (loc) => [loc.latitude, loc.longitude] as [number, number]
          );
          if (zoneCoords.length < 3) return null; // Polygon needs at least 3 points
          return (
            <Polygon 
              key={zone.id}
              positions={zoneCoords} 
              pathOptions={{ 
                color: '#ea580c',
                fillColor: '#7e22ce',
                fillOpacity: 0.4,
                weight: 2,
              }}
            />
          );
        })}

        {/* Markers using Emojis */}
        {houses.map((house) => (
          <Marker 
            key={house.id}
            position={[house.latitude, house.longitude]} 
            icon={Icons.Pumpkin}
          >
            <Popup>
              <div>
                <h3>{house.address} {house.number}</h3>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}