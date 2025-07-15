import React, { useState, useEffect, useRef } from "react";
import DynamicModal from "../../utilities/DynamicModal";
import { Map, Marker, Bounds } from "pigeon-maps";

interface MapModalButtonPigeonProps {
  onMetaChange?: (meta: { metaType1: string }) => void;
  data?: { metaType1?: string };
}

const MapModalButtonPigeon: React.FC<MapModalButtonPigeonProps> = ({
  onMetaChange,
  data,
}) => {
  const defaultLocation: [number, number] = [35.6892, 51.389]; // تهران

  // پارس مقدار ذخیره‌شده
  const parseMetaType1 = (meta: string): { location: [number, number]; zoom: number } => {
    try {
      const [latlng, zoomStr] = meta.split("|");
      const [latStr, lngStr] = latlng.split(",");
      return { location: [parseFloat(latStr), parseFloat(lngStr)], zoom: parseInt(zoomStr, 10) };
    } catch {
      return { location: defaultLocation, zoom: 6 };
    }
  };

  // فقط یک ref برای آخرین مقدار props
  const prevMetaType1 = useRef<string | undefined>();

  // state اولیه
  const [markerLocation, setMarkerLocation] = useState<[number, number]>(() => {
    if (data?.metaType1) {
      return parseMetaType1(data.metaType1).location;
    }
    return defaultLocation;
  });
  const [zoom, setZoom] = useState<number>(() => {
    if (data?.metaType1) {
      return parseMetaType1(data.metaType1).zoom;
    }
    return 6;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // فقط وقتی مقدار data.metaType1 عوض شد، مقدار state را sync کن
  useEffect(() => {
    if (data?.metaType1 && data.metaType1 !== prevMetaType1.current) {
      const parsed = parseMetaType1(data.metaType1);
      setMarkerLocation(parsed.location);
      setZoom(parsed.zoom);
      prevMetaType1.current = data.metaType1;
    }
  }, [data?.metaType1]);

  // فقط زمانی که کاربر مکان جدید انتخاب کرد و خودش تغییر داد مقدار را به والد اعلام کن
  const prevSent = useRef<string>("");
  useEffect(() => {
    const newMeta = `${markerLocation[0]},${markerLocation[1]}|${Math.floor(zoom)}`;
    if (onMetaChange && newMeta !== prevSent.current) {
      onMetaChange({ metaType1: newMeta });
      prevSent.current = newMeta;
    }
  }, [markerLocation, zoom, onMetaChange]);

  const handleOpenModal = () => {
    // هر بار که مودال باز می‌شود، مقدار ذخیره‌شده را نشان بده
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

  const handleCloseModal = () => setIsModalOpen(false);

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
    // مقدار جدید را به والد ارسال کن و مودال را ببند
    const metaType1Value = `${markerLocation[0]},${markerLocation[1]}|${Math.floor(zoom)}`;
    if (onMetaChange) {
      onMetaChange({ metaType1: metaType1Value });
      prevSent.current = metaType1Value;
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
