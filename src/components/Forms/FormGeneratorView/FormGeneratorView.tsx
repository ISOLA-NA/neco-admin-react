import React from "react";
import { EntityField } from "../../../services/api.services";
import CtrTextBoxView from "./CtrTextBoxView";
import RichTextControllerView from "./RichTextControllerView";

const viewComponentMapping: { [key: number]: React.FC<any> } = {
  15: CtrTextBoxView,
  1: RichTextControllerView,
};

interface FormGeneratorViewProps {
  isOpen: boolean;
  onClose: () => void;
  entityFields: EntityField[];
  selectedRow?: any;
}

const FormGeneratorView: React.FC<FormGeneratorViewProps> = ({
  isOpen,
  onClose,
  entityFields,
  selectedRow,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">View Form</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
        <div className="form-generator-view">
          {entityFields.map((field, index) => {
            const ViewComponent = viewComponentMapping[field.ColumnType];
            if (!ViewComponent) return null;
            return (
              <div key={index} className="mb-4">
                <ViewComponent data={field} selectedRow={selectedRow} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormGeneratorView;
