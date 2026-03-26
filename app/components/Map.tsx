"use client";

import { SubmitHouseForm } from "@/app/components/form";
import { Houses } from "@/types/houses";
import { Zones } from "@/types/zones";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet";
import HousePopup from "./HousePopup";
import MapButton from "./MapButton";
import Modal from "./Modal";
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

// Ghost SVG icon for user location
const ghostMarkerIcon = L.icon({
  iconUrl: "/assets/images/ghost.svg",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

interface UserLocation {
  lat: number;
  lng: number;
}
export default function Map({ houses, zones, center }: MapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    // Start watching user location
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Error getting user location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);
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

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={ghostMarkerIcon}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Image
            src="/assets/images/header.svg"
            alt="House"
            width={448}
            height={150}
          />

          <SubmitHouseForm center={center} onSuccess={() => setIsOpen(false)} />
        </Modal>
      </MapContainer>
    </div>
  );
}
