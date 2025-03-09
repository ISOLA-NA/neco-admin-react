// src/components/ControllerForms/PfiLookup.tsx
import React, { useState, useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useApi } from "../../../context/ApiContext";
import { GetEnumResponse, EntityType } from "../../../services/api.services";
import AppServices from "../../../services/api.services";

interface PfiLookupProps {
  onMetaChange: (updatedMeta: any) => void;
  data?: {
    metaType1?: string | number | string[];
    LookupMode?: string | number;
  };
}

const PfiLookup: React.FC<PfiLookupProps> = ({ onMetaChange, data }) => {
  // تابع مقداردهی اولیه برای state metaTypes
  const getInitialMetaTypes = () => ({
    metaType1: data && data.metaType1 != null 
      ? String(Array.isArray(data.metaType1) ? data.metaType1[0] : data.metaType1)
      : "",
    LookupMode: data && data.LookupMode != null 
      ? String(data.LookupMode)
      : "",
  });

  const [metaTypes, setMetaTypes] = useState(getInitialMetaTypes());

  // دریافت entity types و تنظیم گزینه‌های مربوط به آن
  const { getAllEntityType, getEnum } = useApi();
  const [entityTypes, setEntityTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [modeOptions, setModeOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    // دریافت Entity Types
    getAllEntityType()
      .then((res: EntityType[]) => {
        const options = res.map((item) => ({
          value: item.ID.toString(),
          label: item.Name,
        }));
        setEntityTypes(options);
      })
      .catch((error) => console.error("Error fetching entity types:", error));
  }, [getAllEntityType]);

  useEffect(() => {
    // دریافت Enum مربوط به Modes
    getEnum({ str: "lookMode" })
      .then((response: GetEnumResponse | any) => {
        const opts = Array.isArray(response)
          ? response
          : Object.entries(response).map(([key, val]) => ({
              value: String(val),
              label: key,
            }));
        setModeOptions(opts);
      })
      .catch((error) => console.error("Error fetching modes:", error));
  }, [getEnum]);

  // هنگامی که state metaTypes تغییر کرد، آن را به والد ارسال می‌کنیم
  useEffect(() => {
    onMetaChange(metaTypes);
  }, [metaTypes, onMetaChange]);

  // Handler برای تغییر Entity Type
  const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMetaTypes((prev) => ({ ...prev, metaType1: value }));
  };

  // Handler برای تغییر Mode
  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMetaTypes((prev) => ({ ...prev, LookupMode: value }));
  };

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="flex flex-col gap-4 w-64">
        <DynamicSelector
          name="entityType"
          label="Select Entity Type"
          options={entityTypes}
          selectedValue={metaTypes.metaType1}
          onChange={handleEntityTypeChange}
        />
        <DynamicSelector
          name="mode"
          label="Modes"
          options={modeOptions}
          selectedValue={metaTypes.LookupMode}
          onChange={handleModeChange}
        />
      </div>
    </div>
  );
};

export default PfiLookup;
