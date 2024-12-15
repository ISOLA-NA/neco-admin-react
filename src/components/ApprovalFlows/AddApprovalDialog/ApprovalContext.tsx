// src/components/ApprovalFlows/ApprovalContextSection.tsx

import React from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import { Role } from "../../Views/tab/tabData";
import { FaPlus, FaTimes, FaEdit } from "react-icons/fa";

interface ApprovalContextProps {
  // Form state
  nameValue: string;
  setNameValue: (value: string) => void;
  minAcceptValue: string;
  setMinAcceptValue: (value: string) => void;
  minRejectValue: string;
  setMinRejectValue: (value: string) => void;
  actDurationValue: string;
  setActDurationValue: (value: string) => void;
  orderValue: string;
  setOrderValue: (value: string) => void;
  acceptChecked: boolean;
  setAcceptChecked: (value: boolean) => void;
  rejectChecked: boolean;
  setRejectChecked: (value: boolean) => void;

  // Table row state
  staticPostOptions: { value: string; label: string }[];
  staticPostValue: string;
  setStaticPostValue: (value: string) => void;
  selectedStaticPost: Role | null;
  setSelectedStaticPost: (role: Role | null) => void;

  cost1: string;
  setCost1: (value: string) => void;
  cost2: string;
  setCost2: (value: string) => void;
  cost3: string;
  setCost3: (value: string) => void;
  weight1: string;
  setWeight1: (value: string) => void;
  weight2: string;
  setWeight2: (value: string) => void;
  weight3: string;
  setWeight3: (value: string) => void;
  vetoChecked: boolean;
  setVetoChecked: (value: boolean) => void;
  requiredChecked: boolean;
  setRequiredChecked: (value: boolean) => void;
  codeValue: string;
  setCodeValue: (value: string) => void;

  // Handlers
  handleAddOrUpdateRow: () => void;
  handleDeleteRow: () => void;
  openModal: () => void;
}

const ApprovalContextSection: React.FC<ApprovalContextProps> = ({
  nameValue,
  setNameValue,
  minAcceptValue,
  setMinAcceptValue,
  minRejectValue,
  setMinRejectValue,
  actDurationValue,
  setActDurationValue,
  orderValue,
  setOrderValue,
  acceptChecked,
  setAcceptChecked,
  rejectChecked,
  setRejectChecked,
  staticPostOptions,
  staticPostValue,
  setStaticPostValue,
  selectedStaticPost,
  setSelectedStaticPost,
  cost1,
  setCost1,
  cost2,
  setCost2,
  cost3,
  setCost3,
  weight1,
  setWeight1,
  weight2,
  setWeight2,
  weight3,
  setWeight3,
  vetoChecked,
  setVetoChecked,
  requiredChecked,
  setRequiredChecked,
  codeValue,
  setCodeValue,
  handleAddOrUpdateRow,
  handleDeleteRow,
  openModal,
}) => {
  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold text-gray-700">
          Approval Context:
        </span>
        <div className="flex gap-x-2">
          <button
            type="button"
            className="flex items-center justify-center bg-green-500 text-white rounded-md p-2 hover:bg-green-600 transition-colors"
            onClick={handleAddOrUpdateRow}
          >
            {selectedStaticPost ? (
              <>
                <FaEdit className="mr-2" />
                ویرایش
              </>
            ) : (
              <>
                <FaPlus className="mr-2" />
                افزودن
              </>
            )}
          </button>

          <button
            type="button"
            className={`flex items-center justify-center bg-red-500 text-white rounded-md p-2 hover:bg-red-600 transition-colors ${
              !selectedStaticPost ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleDeleteRow}
            disabled={!selectedStaticPost}
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="flex flex-row gap-x-4 w-full items-center">
        <div className="flex flex-col flex-2 ">
          <label className="text-sm text-gray-700 ">پست ثابت</label>
          <DynamicSelector
            options={staticPostOptions}
            selectedValue={staticPostValue}
            onChange={(e) => setStaticPostValue(e.target.value)}
            label=""
            showButton={true}
            onButtonClick={openModal}
            disabled={false}
            className="w-full"
          />
        </div>

        <div className="flex flex-row gap-x-4 w-full mt-10 items-center">
          <div className="flex flex-col flex-1 ">
            <DynamicInput
              name="وزن1"
              type="number"
              value={weight1}
              onChange={(e) => setWeight1(e.target.value)}
            />
          </div>

          <div className="flex flex-col flex-1">
            <DynamicInput
              name="وزن2"
              type="number"
              value={weight2}
              onChange={(e) => setWeight2(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-col flex-1">
            <DynamicInput
              name="وزن3"
              type="number"
              value={weight3}
              onChange={(e) => setWeight3(e.target.value)}
              className="w-full "
            />
          </div>

          <div className="flex flex-col w-auto">
            <label className="flex items-center text-sm text-gray-700 mb-1">
              <input
                type="checkbox"
                checked={vetoChecked}
                onChange={(e) => setVetoChecked(e.target.checked)}
                className="h-4 w-4 mr-2"
              />
              وتو
            </label>
          </div>

          <div className="flex flex-col flex-1">
            <DynamicInput
              name="کد"
              type="number"
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-x-4 w-full mt-4 items-center">
        <div className="flex flex-col flex-1 ">
          <DynamicInput
            name="هزینه1"
            type="number"
            value={cost1}
            onChange={(e) => setCost1(e.target.value)}
          />
        </div>

        <div className="flex flex-col flex-1">
          <DynamicInput
            name="هزینه2"
            type="number"
            value={cost2}
            onChange={(e) => setCost2(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-col flex-1">
          <DynamicInput
            name="هزینه3"
            type="number"
            value={cost3}
            onChange={(e) => setCost3(e.target.value)}
            className="w-full "
          />
        </div>

        <div className="flex flex-col w-auto">
          <label className="flex items-center text-sm text-gray-700 mb-1">
            <input
              type="checkbox"
              checked={requiredChecked}
              onChange={(e) => setRequiredChecked(e.target.checked)}
              className="h-4 w-4 mr-2"
            />
            اجباری
          </label>
        </div>
      </div>
    </div>
  );
};

export default ApprovalContextSection;
