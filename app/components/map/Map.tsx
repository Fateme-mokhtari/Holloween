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
    <div className="h-[calc(100vh-60px)] w-full overflow-hidden relative">
      <div className="absolute top-4 right-4 z-1000 flex gap-2">
        <MapButton text={t("markHouse")} icon="+" onClick={startHouseMarking} />
      </div>

      <div className="absolute bottom-20 left-20 z-1000 house-marker-placement">
        {isPlacingHouse && (
          <div
            className=" right-2000 
           rounded-xl border border-orange-500 bg-gray-900/95 px-3 py-2 text-sm font-semibold text-orange-300 shadow-lg"
          >
            {t("clickToMark")}
          </div>
        )}
      </div>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        className={isPlacingHouse ? "map-marking-mode" : ""}
        style={{ height: "100vh", width: "100%" }}
      >
        <MapClickHandler
          enabled={isPlacingHouse}
          onSelectLocation={handleSelectLocation}
        />

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
