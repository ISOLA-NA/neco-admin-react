// src/components/General/Configurations.tsx
import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicSelector from "../utilities/DynamicSelector";
import DynamicModal from "../utilities/DynamicModal";

interface SelectedRow {
  id: number;
  name: string;
  value: string;
  description: string;
  type: string;
}

interface ConfigurationProps {
  selectedRow: SelectedRow;
}

const Configuration: React.FC<ConfigurationProps> = ({ selectedRow }) => {
  // وضعیت برای داده‌های پیکربندی
  const [configData, setConfigData] = useState({
    id: selectedRow.id.toString(),
    name: selectedRow.name,
    value: selectedRow.value,
    description: selectedRow.description,
    type: selectedRow.type,
  });

  // وضعیت برای مدیریت مودال
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");

  // به‌روزرسانی داده‌های پیکربندی وقتی که selectedRow تغییر می‌کند
  useEffect(() => {
    setConfigData({
      id: selectedRow.id.toString(),
      name: selectedRow.name,
      value: selectedRow.value,
      description: selectedRow.description,
      type: selectedRow.type,
    });
  }, [selectedRow]);

  // تابع برای باز کردن مودال با عنوان مشخص
  const openModal = (title: string) => {
    setSelectedTitle(title);
    setModalOpen(true);
  };

  // وقتی که یک گزینه از مودال انتخاب می‌شود
  const handleSelectFromModal = (selectedName: string) => {
    setConfigData((prev) => ({
      ...prev,
      type: selectedName, // به‌روزرسانی مقدار type
    }));
    setModalOpen(false); // بستن مودال
  };

  // گزینه‌های مختلف برای DynamicSelector بر اساس عنوان
  const getSelectorOptions = (title: string) => {
    switch (title) {
      case "Program Template":
        return [
          { value: "Template1", label: "Template1" },
          { value: "Template2", label: "Template2" },
          { value: "Template3", label: "Template3" },
        ];
      case "Default Ribbon":
        return [
          { value: "Ribbon1", label: "Ribbon1" },
          { value: "Ribbon2", label: "Ribbon2" },
        ];
      case "Lesson Learned Form":
        return [
          { value: "Form1", label: "Form1" },
          { value: "Form2", label: "Form2" },
        ];
      case "Lesson Learned":
        return [
          { value: "Lesson1", label: "Lesson1" },
          { value: "Lesson2", label: "Lesson2" },
        ];
      case "Comment Form Template":
        return [
          { value: "CommentTemplate1", label: "CommentTemplate1" },
          { value: "CommentTemplate2", label: "CommentTemplate2" },
        ];
      case "Procedure Form Template":
        return [
          { value: "Procedure1", label: "Procedure1" },
          { value: "Procedure2", label: "Procedure2" },
        ];
      default:
        return [];
    }
  };

  return (
    <div>
      <TwoColumnLayout>
        {/* DynamicSelector برای انتخاب نوع */}
        <DynamicSelector
          options={getSelectorOptions("Program Template")}
          selectedValue={configData.type} // مقدار انتخاب شده
          onChange={(e) =>
            setConfigData({ ...configData, type: e.target.value })
          }
          label="Program Template"
          showButton={true}
          onButtonClick={() => openModal("Program Template")}
        />

        {/* سایر DynamicSelector ها می‌توانند در اینجا اضافه شوند */}

        {/* نمایش DynamicModal در صورت باز بودن مودال */}
        {modalOpen && (
          <DynamicModal
            onClose={() => setModalOpen(false)}
            onSelect={handleSelectFromModal}
            rowData={[
              { Name: "Template1", Description: "Program Template1" },
              { Name: "Template2", Description: "Program Template2" },
              { Name: "Template3", Description: "Program Template3" },
            ]}
            selectedRowData={selectedRowData}
            setSelectedRowData={setSelectedRowData}
            modalOpen={modalOpen}
          />
        )}
      </TwoColumnLayout>
    </div>
  );
};

export default Configuration;
