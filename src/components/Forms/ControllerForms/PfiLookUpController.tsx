import React, { useState, useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useApi } from "../../../context/ApiContext";
import { GetEnumResponse, EntityType } from "../../../services/api.services";

interface PfiLookupProps {
  onMetaChange: (meta: any) => void;
  data?: any;
}

const PfiLookup: React.FC<PfiLookupProps> = ({ onMetaChange, data }) => {
  const { getAllEntityType, getEnum } = useApi();

  const [entityTypes, setEntityTypes] = useState<Array<{ value: any; label: string }>>([]);
  const [modeOptions, setModeOptions] = useState<Array<{ value: number; label: string }>>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<any>("");
  const [selectedMode, setSelectedMode] = useState<any>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isModeInitialized, setIsModeInitialized] = useState(false);

  // دریافت Entity Types از API و تنظیم گزینه‌ها
  useEffect(() => {
    getAllEntityType()
      .then((res: EntityType[]) => {
        const options = res.map((item) => ({
          value: item.ID,
          label: item.Name,
        }));
        setEntityTypes(options);
        // فقط در اولین بار مقداردهی کنیم
        if (!isInitialized && data && data.metaType1) {
          setSelectedEntityType(data.metaType1);
          onMetaChange((prev: any) => ({ ...prev, metaType1: data.metaType1 }));
          setIsInitialized(true);
        }
      })
      .catch((error) => console.error("Error fetching entity types:", error));
  }, [data, getAllEntityType, onMetaChange, isInitialized]);

  // دریافت Enum مربوط به Modes از API و تنظیم گزینه‌ها
  useEffect(() => {
    getEnum({ str: "lookMode" })
      .then((response: GetEnumResponse) => {
        const opts = Object.entries(response).map(([key, val]) => ({
          value: Number(val),
          label: key,
        }));
        setModeOptions(opts);
        // فقط در اولین بار مقداردهی کنیم
        if (!isModeInitialized && data && data.LookupMode) {
          setSelectedMode(data.LookupMode);
          onMetaChange((prev: any) => ({ ...prev, LookupMode: data.LookupMode }));
          setIsModeInitialized(true);
        }
      })
      .catch((error) => console.error("Error fetching modes:", error));
  }, [data, getEnum, onMetaChange, isModeInitialized]);

  // هندل تغییر در انتخاب Entity Type
  const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedEntityType(val);
    onMetaChange((prev: any) => ({ ...prev, metaType1: val }));
  };

  // هندل تغییر در انتخاب Mode
  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMode(val);
    onMetaChange((prev: any) => ({ ...prev, LookupMode: Number(val) }));
  };

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="flex flex-col gap-4 w-64">
        <DynamicSelector
          name="entityType"
          options={entityTypes}
          selectedValue={selectedEntityType}
          onChange={handleEntityTypeChange}
          label="Select Entity Types"
          rightIcon={null}
        />
        <DynamicSelector
          name="mode"
          options={modeOptions}
          selectedValue={selectedMode}
          onChange={handleModeChange}
          label="Modes"
          rightIcon={null}
        />
      </div>
    </div>
  );
};

export default PfiLookup;
