// src/components/MapView.tsx
import React from "react";
import { Map, Marker } from "pigeon-maps";

interface MapViewProps {
  data?: {
    DisplayName?: string;
    PersianName?: string;
    metaType1?: string;
  };
  isFaMode?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ data, isFaMode = false }) => {
  const defaultLocation: [number, number] = [35.6892, 51.389];
  let markerLocation: [number, number] = defaultLocation;
  let zoom = 6;

  if (data && data.metaType1) {
    try {
      const [latlng, zoomStr] = data.metaType1.split("|");
      const [lat, lng] = latlng.split(",").map(Number);
      markerLocation = [lat, lng];
      zoom = parseInt(zoomStr, 10);
    } catch (error) {
      console.error("Error parsing metaType1:", error);
    }
  }

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || ""
    : data?.DisplayName || data?.PersianName || "";

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-300 flex flex-col items-center">
      {label && (
        <div className="mb-2 text-xs font-semibold text-gray-700">{label}</div>
      )}
      <div className="w-72 h-48">
        <Map center={markerLocation} zoom={zoom} height={192} width={288}>
          <Marker anchor={markerLocation} />
        </Map>
      </div>
    </div>
  );
};

export default MapView;
