import React, { useState, useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useApi } from "../../../context/ApiContext";
import { GetEnumResponse, EntityType } from "../../../services/api.services";

interface PfiLookupProps {
  onMetaChange: (updatedMeta: any) => void;
  data?: {
    metaType1?: string | number | string[];
    LookupMode?: string | number;
  };
}

const PfiLookup: React.FC<PfiLookupProps> = ({ onMetaChange, data }) => {
  const { getAllEntityType, getEnum } = useApi();

  const [entityTypes, setEntityTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [modeOptions, setModeOptions] = useState<Array<{ value: string; label: string }>>([]);

  // مقداردهی اولیه metaTypes از data یا به صورت خالی
  const [metaTypes, setMetaTypes] = useState({
    metaType1:
      data && data.metaType1 != null
        ? String(Array.isArray(data.metaType1) ? data.metaType1[0] : data.metaType1)
        : "",
    LookupMode: data && data.LookupMode != null ? String(data.LookupMode) : "",
  });

  // دریافت موجودیت‌ها
  useEffect(() => {
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

  // دریافت و تنظیم Modes به صورت مشابه با Lookuprealvalue
  useEffect(() => {
    const fetchModes = async () => {
      try {
        const response: GetEnumResponse | any = await getEnum({ str: "lookMode" });
        const modes =
          Array.isArray(response) === true
            ? response
            : Object.entries(response).map(([key, val]) => ({
                value: String(val),
                label: key,
              }));
        setModeOptions(modes);
        console.log("Fetched modes:", modes);

        // اگر مقدار فعلی LookupMode خالی باشد یا در لیست موجود نباشد، مقدار پیش‌فرض (اولین گزینه) ست می‌شود
        if (!metaTypes.LookupMode || !modes.some((m) => m.value === metaTypes.LookupMode)) {
          const defaultMode = modes[0]?.value || "";
          setMetaTypes((prev) => ({ ...prev, LookupMode: defaultMode }));
          onMetaChange({ ...metaTypes, LookupMode: defaultMode });
          console.log("LookupMode updated to default:", defaultMode);
        } else {
          console.log("LookupMode is valid:", metaTypes.LookupMode);
        }
      } catch (error) {
        console.error("Error fetching lookMode:", error);
      }
    };

    fetchModes();
    // در اینجا نیازی به وابستگی به metaTypes.LookupMode نداریم چون به محض دریافت گزینه‌ها بررسی می‌شود
  }, [getEnum]);

  // اطلاع‌رسانی تغییرات به والد
  useEffect(() => {
    onMetaChange(metaTypes);
    console.log("Meta changed:", metaTypes);
  }, [metaTypes, onMetaChange]);

  // هندلر برای تغییر موجودیت (Entity Type)
  const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMetaTypes((prev) => ({ ...prev, metaType1: value }));
    console.log("Entity type selected:", value);
  };

  // هندلر برای تغییر Mode
  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMetaTypes((prev) => ({ ...prev, LookupMode: value }));
    console.log("Mode selected:", value);
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
