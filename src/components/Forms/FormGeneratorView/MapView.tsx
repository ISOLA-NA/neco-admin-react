// src/components/MapView.tsx
import React from "react";
import { Map, Marker } from "pigeon-maps";

interface MapViewProps {
  data?: {
    DisplayName?: string;
    metaType1?: string; // فرمت: "lat,lng|zoom"
  };
}

const MapView: React.FC<MapViewProps> = ({ data }) => {
  const defaultLocation: [number, number] = [35.6892, 51.389]; // مختصات پیش‌فرض
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

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-300 flex flex-col items-center">
      {data?.DisplayName && (
        <div className="mb-2 text-sm font-medium text-gray-700">
          {data.DisplayName}
        </div>
      )}
      <div className="w-72 h-48">
        <Map
          center={markerLocation}
          zoom={zoom}
          height={192} // حدوداً 192px ارتفاع
          width={288}  // حدوداً 288px عرض (تنظیم توسط container)
        >
          <Marker anchor={markerLocation} />
        </Map>
      </div>
    </div>
  );
};

export default MapView;
