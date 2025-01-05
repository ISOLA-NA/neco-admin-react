// src/components/General/Enterprise.tsx

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import { useAddEditDelete } from "../../context/AddEditDeleteContext";
import { Company } from "../../services/api.services";
import { showAlert } from "../utilities/Alert/DynamicAlert";

export interface CompanyHandle {
  save: () => Promise<boolean>;
}

interface EnterpriseProps {
  selectedRow: Company | null;
}

const Enterprise = forwardRef<CompanyHandle, EnterpriseProps>(
  ({ selectedRow }, ref) => {
    const { handleSaveCompany } = useAddEditDelete();

    const [enterpriseData, setEnterpriseData] = useState<Company>({
      ID: 0,
      Name: "",
      Description: "",
      Type: "",
      Information: "",
      IsVisible: true,
      LastModified: new Date().toISOString(),
      ModifiedById: null,
    });

    useEffect(() => {
      if (selectedRow) {
        setEnterpriseData({
          ID: selectedRow.ID,
          Name: selectedRow.Name || "",
          Description: selectedRow.Description || "",
          Type: selectedRow.Type || "",
          Information: selectedRow.Information || "",
          IsVisible: selectedRow.IsVisible ?? true,
          LastModified: selectedRow.LastModified || new Date().toISOString(),
          ModifiedById: selectedRow.ModifiedById || null,
        });
      } else {
        // Reset form for new entry
        setEnterpriseData({
          ID: 0,
          Name: "",
          Description: "",
          Type: "",
          Information: "",
          IsVisible: true,
          LastModified: new Date().toISOString(),
          ModifiedById: null,
        });
      }
    }, [selectedRow]);

    useImperativeHandle(ref, () => ({
      async save() {
        try {
          // Validate required fields
          if (!enterpriseData.Name.trim()) {
            showAlert(
              "error",
              null,
              "Validation Error",
              "Enterprise name is required"
            );
            return false;
          }

          // Prepare data for saving
          const dataToSave = {
            ...enterpriseData,
            LastModified: new Date().toISOString(),
          };

          // Use context to save data
          const result = await handleSaveCompany(dataToSave);

          if (result) {
            showAlert(
              "success",
              null,
              "Success",
              `Enterprise ${selectedRow ? "updated" : "created"} successfully`
            );
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error saving enterprise:", error);
          showAlert("error", null, "Error", "Failed to save enterprise data");
          return false;
        }
      },
    }));

    const handleChange = (
      field: keyof Company,
      value: string | boolean | null
    ) => {
      setEnterpriseData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    return (
      <TwoColumnLayout>
        <DynamicInput
          name="Enterprise Name"
          type="text"
          value={enterpriseData.Name}
          onChange={(e) => handleChange("Name", e.target.value)}
          required
          className="mb-4"
        />

        <DynamicInput
          name="Description"
          type="text"
          value={enterpriseData.Description || ""}
          onChange={(e) => handleChange("Description", e.target.value)}
          className="mb-4"
        />

        <DynamicInput
          name="Type"
          type="text"
          value={enterpriseData.Type || ""}
          onChange={(e) => handleChange("Type", e.target.value)}
          className="mb-4"
        />

        <DynamicInput
          name="Information"
          type="text"
          value={enterpriseData.Information || ""}
          onChange={(e) => handleChange("Information", e.target.value)}
          className="mb-4"
        />
      </TwoColumnLayout>
    );
  }
);

Enterprise.displayName = "Enterprise";

export default Enterprise;
