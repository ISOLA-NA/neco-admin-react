// src/components/MapView.tsx
import React from "react";
import { Map, Marker } from "pigeon-maps";

interface MapViewProps {
  data?: {
    DisplayName?: string;
    metaType1?: string; // فرمت: "lat,lng|zoom"
  };
  /** از FormGeneratorView پاس داده می‌شود؛ فقط همین کنترل RTL/LTR شود */
  rtl?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ data, rtl = false }) => {
  const defaultLocation: [number, number] = [35.6892, 51.389]; // مختصات تهران به عنوان پیش‌فرض
  let markerLocation: [number, number] = defaultLocation;
  let zoom = 6;

  if (data?.metaType1) {
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
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="p-4 bg-white rounded-lg border border-gray-300 flex flex-col"
      style={{
        unicodeBidi: "plaintext",
        textAlign: rtl ? "right" : "left",
      }}
    >
      {/* عنوان نقشه */}
      {data?.DisplayName && (
        <div className="mb-2 text-sm font-medium text-gray-700">
          {data.DisplayName}
        </div>
      )}

      {/* خود نقشه */}
      <div className="w-72 h-48 rounded overflow-hidden border border-gray-200">
        <Map
          center={markerLocation}
          zoom={zoom}
          height={192} // حدوداً 192px ارتفاع
          width={288} // حدوداً 288px عرض
        >
          <Marker anchor={markerLocation} />
        </Map>
      </div>

      {/* اصلاح فاصله‌ها فقط برای حالت RTL (اختیاری) */}
      <style>
        {`
          [dir="rtl"] .ml-2 { margin-right: .5rem; margin-left: 0; }
          [dir="rtl"] .mr-2 { margin-left: .5rem; margin-right: 0; }
        `}
      </style>
    </div>
  );
};

export default MapView;
