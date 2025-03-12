// src/components/MapModalButtonPigeon.tsx
import React, { useState, useEffect } from "react";
import DynamicModal from "../../utilities/DynamicModal";
import { Map, Marker, Bounds } from "pigeon-maps";

interface MapModalButtonPigeonProps {
  onMetaChange?: (meta: { metaType1: string }) => void;
  data?: { metaType1?: string }; // داده‌هایی که از فرم والد دریافت می‌شوند
}

const MapModalButtonPigeon: React.FC<MapModalButtonPigeonProps> = ({
  onMetaChange,
  data,
}) => {
  const defaultLocation: [number, number] = [35.6892, 51.389]; // مختصات پیش‌فرض (تهران)

  // تابعی برای تجزیه مقدار `metaType1` به مختصات و زوم
  const parseMetaType1 = (meta: string): { location: [number, number]; zoom: number } => {
    try {
      const [latlng, zoomStr] = meta.split("|");
      const [latStr, lngStr] = latlng.split(",");
      return { location: [parseFloat(latStr), parseFloat(lngStr)], zoom: parseInt(zoomStr, 10) };
    } catch (error) {
      return { location: defaultLocation, zoom: 6 };
    }
  };

  // مقدار اولیه از `data?.metaType1` گرفته می‌شود
  const [markerLocation, setMarkerLocation] = useState<[number, number]>(
    data?.metaType1 ? parseMetaType1(data.metaType1).location : defaultLocation
  );
  const [zoom, setZoom] = useState<number>(
    data?.metaType1 ? parseMetaType1(data.metaType1).zoom : 6
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // هر تغییری در `markerLocation` یا `zoom` مقدار جدید را به `onMetaChange` ارسال می‌کند
  useEffect(() => {
    if (onMetaChange) {
      onMetaChange({
        metaType1: `${markerLocation[0]},${markerLocation[1]}|${Math.floor(zoom)}`,
      });
    }
  }, [markerLocation, zoom, onMetaChange]);

  // زمانی که `data?.metaType1` تغییر کند (مثلاً هنگام ویرایش)، مقدار را تنظیم کن
  useEffect(() => {
    if (data?.metaType1) {
      const parsed = parseMetaType1(data.metaType1);
      setMarkerLocation(parsed.location);
      setZoom(parsed.zoom);
    }
  }, [data?.metaType1]);

  const handleOpenModal = () => {
    // مقدار ذخیره‌شده در `data.metaType1` بررسی شود، در غیر این‌صورت مقدار پیش‌فرض تنظیم شود
    if (data?.metaType1) {
      const parsed = parseMetaType1(data.metaType1);
      setMarkerLocation(parsed.location);
      setZoom(parsed.zoom);
    } else {
      setMarkerLocation(defaultLocation);
      setZoom(6);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleBoundsChanged = ({
    center,
    zoom: newZoom,
  }: {
    center: [number, number];
    zoom: number;
    bounds: Bounds;
    initial: boolean;
  }) => {
    setMarkerLocation(center);
    setZoom(newZoom);
  };

  const handleMapClick = ({ latLng }: { latLng: [number, number] }) => {
    setMarkerLocation(latLng);
  };

  const handleSelect = () => {
    // مقدار جدید `metaType1` را ثبت کن و مودال را ببند
    const metaType1Value = `${markerLocation[0]},${markerLocation[1]}|${Math.floor(zoom)}`;
    console.log("Selected metaType1:", metaType1Value);
    if (onMetaChange) {
      onMetaChange({ metaType1: metaType1Value });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <button type="button" className="btn btn-primary" onClick={handleOpenModal}>
        Choose your area
        </button>
        <DynamicModal isOpen={isModalOpen} onClose={handleCloseModal}>
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <Map
                center={markerLocation}
                zoom={zoom}
                height={500}
                onBoundsChanged={handleBoundsChanged}
                onClick={handleMapClick}
              >
                <Marker width={50} anchor={markerLocation} />
              </Map>
            </div>
            <div className="mt-4 flex justify-center items-center">
              <button type="button" className="btn btn-success" onClick={handleSelect}>
                Select
              </button>
            </div>
          </div>
        </DynamicModal>
      </div>
    </div>
  );
};

export default MapModalButtonPigeon;
