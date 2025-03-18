// DeemedSection.tsx
import React, { useState, useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicInput from "../../utilities/DynamicInput";
import AppServices, { GetEnumResponse } from "../../../services/api.services";
import { useApi } from "../../../context/ApiContext";

interface DeemedSectionProps {
  deemDay: number;
  setDeemDay: (val: number) => void;
  deemCondition: number;
  setDeemCondition: (val: number) => void;
  deemAction: number;
  setDeemAction: (val: number) => void;
  previewsStateId: number | null;
  setPreviewsStateId: (val: number | null) => void;
  goToPreviousStateID: number | null;
  setGoToPreviousStateID: (val: number | null) => void;
  boxTemplates: { ID: number; Name: string }[];
  disableMain?: boolean;
  showAdminSection?: boolean;
  actionBtnID: number | null;
  setActionBtnID: (val: number | null) => void;
}

const DeemedSection: React.FC<DeemedSectionProps> = ({
  deemDay,
  setDeemDay,
  deemCondition,
  setDeemCondition,
  deemAction,
  setDeemAction,
  previewsStateId,
  setPreviewsStateId,
  goToPreviousStateID,
  setGoToPreviousStateID,
  boxTemplates,
  disableMain = false,
  showAdminSection = true,
  actionBtnID,
  setActionBtnID,
}) => {
  const [fromOptions, setFromOptions] = useState<{ value: number; label: string }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ value: number; label: string }[]>([]);
  const [loadingEnums, setLoadingEnums] = useState<boolean>(false);
  const [errorEnums, setErrorEnums] = useState<string | null>(null);
  const [localActionBtnOptions, setLocalActionBtnOptions] = useState<{ value: number; label: string }[]>([]);
  const api = useApi();

  useEffect(() => {
    const fetchEnums = async () => {
      setLoadingEnums(true);
      setErrorEnums(null);
      try {
        const response1: GetEnumResponse = await AppServices.getEnum({ str: "DeemCondition" });
        const fromOpts = Object.entries(response1).map(([key, val]) => ({
          value: Number(val),
          label: key,
        }));
        setFromOptions(fromOpts);
      } catch (error) {
        console.error("Error fetching DeemCondition enums:", error);
        setErrorEnums("خطا در دریافت DeemCondition");
      }
      try {
        const response2: GetEnumResponse = await AppServices.getEnum({ str: "DeemAction" });
        const statusOpts = Object.entries(response2).map(([key, val]) => ({
          value: Number(val),
          label: key,
        }));
        setStatusOptions(statusOpts);
      } catch (error) {
        console.error("Error fetching DeemAction enums:", error);
        setErrorEnums("خطا در دریافت DeemAction");
      } finally {
        setLoadingEnums(false);
      }
    };
    fetchEnums();
  }, []);

  useEffect(() => {
    const fetchActionBtnOptions = async () => {
      try {
        const res = await api.getAllAfbtn();
        const options = res.map((btn: any) => ({
          value: btn.ID,
          label: btn.Name,
        }));
        setLocalActionBtnOptions(options);
      } catch (error) {
        console.error("Error fetching action button options:", error);
      }
    };
    fetchActionBtnOptions();
  }, [api]);

  const previousStateOptions = boxTemplates.map((box) => ({
    value: box.ID,
    label: box.Name,
  }));

  return (
    <div className="mt-4">
      <div className="bg-gray-200 p-6 rounded mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-40">
            <DynamicInput
              name="After"
              type="number"
              value={deemDay}
              onChange={(e) => setDeemDay(Number(e.target.value))}
              disabled={disableMain}
            />
          </div>
          <div className="w-40">
            <DynamicSelector
              options={fromOptions}
              selectedValue={deemCondition.toString()}
              onChange={(e) => setDeemCondition(Number(e.target.value))}
              label="From"
              disabled={disableMain}
            />
          </div>
          <div className="w-40">
            <DynamicSelector
              options={statusOptions}
              selectedValue={deemAction.toString()}
              onChange={(e) => setDeemAction(Number(e.target.value))}
              label="The status will set to"
              disabled={disableMain}
            />
          </div>
          <div className="w-40">
            <DynamicSelector
              options={previousStateOptions}
              selectedValue={previewsStateId !== null ? previewsStateId.toString() : ""}
              onChange={(e) => setPreviewsStateId(e.target.value ? Number(e.target.value) : null)}
              label="Previous State"
              disabled={disableMain}
            />
          </div>
          {showAdminSection && (
            <div className="w-40">
              <DynamicSelector
                options={localActionBtnOptions}
                selectedValue={actionBtnID !== null ? actionBtnID.toString() : ""}
                onChange={(e) => setActionBtnID(e.target.value ? Number(e.target.value) : null)}
                label="Select Action Button"
                disabled={disableMain}
              />
            </div>
          )}
        </div>
        {loadingEnums && <p className="text-xs text-gray-600 mt-2">Loading enums...</p>}
        {errorEnums && <p className="text-xs text-red-600 mt-2">{errorEnums}</p>}
      </div>
      <div className="bg-gray-100 p-2 rounded">
        <p className="text-sm text-gray-700 mb-2">
          If user clicks on a button with command <span className="font-bold">"Go to Previous State By Admin"</span>, the previous state will set to:
        </p>
        <DynamicSelector
          options={previousStateOptions}
          selectedValue={goToPreviousStateID !== null ? goToPreviousStateID.toString() : ""}
          onChange={(e) => setGoToPreviousStateID(e.target.value ? Number(e.target.value) : null)}
          label=""
          className="w-40"
        />
      </div>
    </div>
  );
};

export default DeemedSection;
