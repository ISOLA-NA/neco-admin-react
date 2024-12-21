// src/components/MapModalButtonPigeon.tsx
import React, { useState } from "react";
import DynamicModal from "../../utilities/DynamicModal";
import { Map, Marker, Bounds } from "pigeon-maps";

const MapModalButtonPigeon: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // مختصات مارکر، شروع از مرکز تهران
  const [markerLocation, setMarkerLocation] = useState<[number, number]>([
    35.6892, 51.389,
  ]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // هر بار باز شدن مودال، مارکر در مرکز تهران
    setMarkerLocation([35.6892, 51.389]);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleBoundsChanged = ({
    center,
  }: {
    center: [number, number];
    zoom: number;
    bounds: Bounds;
    initial: boolean;
  }) => {
    // هر بار نقشه حرکت کرد، مارکر به مرکز نقشه می‌رود
    setMarkerLocation(center);
  };

  const handleMapClick = ({ latLng }: { latLng: [number, number] }) => {
    // با کلیک روی نقشه، مارکر به محل کلیک می‌رود
    setMarkerLocation(latLng);
  };

  const handleSelect = () => {
    console.log("Selected Lat/Lng: ", {
      lat: markerLocation[0],
      lng: markerLocation[1],
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button className="btn btn-primary" onClick={handleOpenModal}>
        نمایش نقشه (Pigeon Maps)
      </button>
      <DynamicModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Map
              defaultCenter={[35.6892, 51.389]}
              defaultZoom={13}
              height={500}
              onBoundsChanged={handleBoundsChanged}
              onClick={handleMapClick}
            >
              <Marker width={50} anchor={markerLocation} />
            </Map>
          </div>
          <div className="mt-4 flex justify-center items-center">
            <button className="btn btn-success" onClick={handleSelect}>
              Select
            </button>
          </div>
        </div>
      </DynamicModal>
    </div>
  );
};

export default MapModalButtonPigeon;
