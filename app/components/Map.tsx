"use client";

import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Icons } from "./MapIcons";
import { Zones } from "@/types/zones";
import MapButton from "./MapButton";
import Modal from "./Modal";
import { useState } from "react";
import { SubmitHouseForm } from "@/app/components/form";
import HousePopup from "./HousePopup";
import { Houses } from "@/types/houses";
import Image from "next/image";
export interface House {
  id: number;
  number: string;
  address: string;
  latitude: number;
  longitude: number;
  images: Array<{ file: string }>;
}

interface MapProps {
  houses: Houses[];
  zones: Zones[];
  center: { lat: number; lng: number };
}
const houseMarkerIcon = L.icon({
  iconUrl: "/assets/images/marker.png",
  iconSize: [60, 60],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});
export default function Map({ houses, zones, center }: MapProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="h-[calc(100vh-60px)] w-full overflow-hidden relative">
      <div className="absolute top-4 right-4 z-1000 flex gap-2">
        <MapButton
          text="Mark a Hount"
          icon="+"
          onClick={() => setIsOpen(true)}
        />
      </div>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        style={{ height: "100vh", width: "100%" }}
      >
        {/* Dark themed tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap, &copy; CartoDB"
        />

        {/* Scare Zones */}
        {zones.length > 0 &&
          zones.map((zone) => {
            const zoneCoords = zone.locations.map(
              (loc) => [loc.latitude, loc.longitude] as [number, number],
            );
            if (zoneCoords.length < 3) return null; // Polygon needs at least 3 points
            return (
              <Polygon
                key={zone.id}
                positions={zoneCoords}
                pathOptions={{
                  color: "#ea580c",
                  fillColor: "#7e22ce",
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
            icon={houseMarkerIcon}
          >
            <Popup className="house-popup" closeButton={false} minWidth={350}>
              <HousePopup house={house} />
            </Popup>
          </Marker>
        ))}
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <Image src="/assets/images/header.svg" alt="House" width={448} height={150} /> 
            
          <SubmitHouseForm center={center} onSuccess={() => setIsOpen(false)} />
        </Modal>
      </MapContainer>
    </div>
  );
}
