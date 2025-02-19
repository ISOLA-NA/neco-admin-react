// src/components/ColumnViewModal.tsx
import React from "react";
import DynamicModal from "../utilities/DynamicModal";
import TextController from "./ControllerForms/TextController";
import { EntityField } from "../../services/api.services";

interface ColumnViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityFields: EntityField[];
}

const ColumnViewModal: React.FC<ColumnViewModalProps> = ({
  isOpen,
  onClose,
  entityFields
}) => {
  // جستجو برای اولین ستون با ColumnType برابر 15
  const column15Field = entityFields.find(
    (field) => field.ColumnType === 15
  );

  return (
    <DynamicModal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        {column15Field ? (
          <>
            <h2 className="text-lg font-bold mb-4">Column Value</h2>
            <TextController
              onMetaChange={(meta) => {
                console.log("Meta Changed:", meta);
              }}
              data={{ metaType1: column15Field.DisplayName || "" }}
              isDisable={true}
            />
          </>
        ) : (
          <div>No column with ColumnType 15 available.</div>
        )}
      </div>
    </DynamicModal>
  );
};

export default ColumnViewModal;
