"use client";

import { SubmitHouseForm } from "@/app/components/form";
import { Houses } from "@/types/houses";
import { Zones } from "@/types/zones";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import Modal from "../common/Modal";
import HousePopup from "../house/HousePopup";
import MapButton from "./MapButton";
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

// Used when a zone has no polygon_color from the API
const DEFAULT_ZONE_COLOR = "#ea580c";

// CARTO basemaps require a (free) API key since Sept 2026; without one,
// tiles show an "API KEY REQUIRED" notice. Get one at carto.com/basemaps/apikey.
const CARTO_API_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;
const DARK_TILES_URL = `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${
  CARTO_API_KEY ? `?key=${encodeURIComponent(CARTO_API_KEY)}` : ""
}`;

if (!CARTO_API_KEY && process.env.NODE_ENV !== "production") {
  console.warn(
    "[Map] NEXT_PUBLIC_CARTO_API_KEY is not set — map tiles will show an 'API KEY REQUIRED' notice.",
  );
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface MapClickHandlerProps {
  enabled: boolean;
  onSelectLocation: (location: { lat: number; lng: number }) => void;
}

function MapClickHandler({ enabled, onSelectLocation }: MapClickHandlerProps) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    if (enabled) {
      container.style.cursor = "default";
    } else {
      container.style.cursor = "";
    }

    return () => {
      container.style.cursor = "";
    };
  }, [enabled, map]);

  useMapEvents({
    click: (event) => {
      if (!enabled) return;

      onSelectLocation({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function Map({ houses, zones, center }: MapProps) {
  const t = useTranslations("Map");
  const [isOpen, setIsOpen] = useState(false);
  const [isPlacingHouse, setIsPlacingHouse] = useState(false);
  const [selectedHouseLocation, setSelectedHouseLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const startHouseMarking = () => {
    setIsOpen(false);
    setSelectedHouseLocation(center);
    setIsPlacingHouse(true);
  };

  const handleSelectLocation = (location: { lat: number; lng: number }) => {
    setSelectedHouseLocation(location);
    setIsPlacingHouse(false);
    setIsOpen(true);
  };

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
    <div className="h-[calc(100dvh-60px)] w-full overflow-hidden relative">
      <div className="absolute top-4 right-4 z-1000 flex gap-2">
        <MapButton text={t("markHouse")} icon="+" onClick={startHouseMarking} />
      </div>

      <div className="absolute bottom-20 left-20 z-1000 house-marker-placement">
        {isPlacingHouse && (
          <div
            className=" right-2000 
           rounded-xl border border-orange-500 bg-gray-900/95 px-4 py-3 text-xl font-creepster text-orange-300 shadow-lg"
          >
            {t("clickToMark")}
          </div>
        )}
      </div>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        className={isPlacingHouse ? "map-marking-mode" : ""}
        style={{ height: "100%", width: "100%" }}
      >
        <MapClickHandler
          enabled={isPlacingHouse}
          onSelectLocation={handleSelectLocation}
        />

        {/* Dark themed tiles */}
        <TileLayer
          url={DARK_TILES_URL}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Scare Zones (only this year's active ones) */}
        {zones
          .filter((zone) => zone.active)
          .map((zone) => {
            const zoneCoords = zone.locations.map(
              (loc) => [loc.latitude, loc.longitude] as [number, number],
            );
            if (zoneCoords.length < 3) return null; // Polygon needs at least 3 points
            const color = zone.polygon_color ?? DEFAULT_ZONE_COLOR;
            return (
              <Polygon
                key={zone.id}
                positions={zoneCoords}
                pathOptions={{
                  color,
                  fillColor: color,
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
            <Popup>{t("yourLocation")}</Popup>
          </Marker>
        )}

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Image
            src="/assets/images/header.svg"
            alt={t("houseImageAlt")}
            width={448}
            height={150}
          />
          <SubmitHouseForm
            center={selectedHouseLocation ?? center}
            onSuccess={() => setIsOpen(false)}
          />
        </Modal>
      </MapContainer>
    </div>
  );
}
