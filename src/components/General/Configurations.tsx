// src/components/General/Configurations.tsx
import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicInput from "../utilities/DynamicInput";
import DynamicSelector from "../utilities/DynamicSelector";
import ListSelector from "../ListSelector/ListSelector";
import DynamicModal from "../utilities/DynamicModal"; // وارد کردن DynamicModal

interface ConfigurationProps {
  selectedRow: {
    id: number;
    name: string;
    value: string;
    description: string;
    type: string;
  };
}

const Configuration: React.FC<ConfigurationProps> = ({ selectedRow }) => {
  const [configData, setConfigData] = useState({
    id: selectedRow.id.toString(),
    name: selectedRow.name,
    value: selectedRow.value,
    description: selectedRow.description,
    typeProgramTemplate: selectedRow.type, // فیلد جداگانه برای Program Template
    typeDefaultRibbon: "", // فیلد جداگانه برای Default Ribbon
    typeLessonLearnedForm: "", // فیلد جداگانه برای Lesson Learned Form
    typeLessonLearned: "", // فیلد جداگانه برای Lesson Learned
    typeCommentFormTemplate: "", // فیلد جداگانه برای Comment Form Template
    typeProcedureFormTemplate: "", // فیلد جداگانه برای Procedure Form Template
  });

  const [descriptionError, setDescriptionError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // برای کنترل نمایش مدال
  const [selectedRowData, setSelectedRowData] = useState<any>(null); // برای ذخیره داده‌های ردیف انتخاب شده
  const [currentSelector, setCurrentSelector] = useState<string>(""); // برای ذخیره عنوان انتخاب‌کننده فعلی

  useEffect(() => {
    setConfigData({
      id: selectedRow.id.toString(),
      name: selectedRow.name,
      value: selectedRow.value,
      description: selectedRow.description,
      typeProgramTemplate: selectedRow.type,
      typeDefaultRibbon: "",
      typeLessonLearnedForm: "",
      typeLessonLearned: "",
      typeCommentFormTemplate: "",
      typeProcedureFormTemplate: "",
    });
  }, [selectedRow]);

  const handleChange = (field: keyof typeof configData, value: string) => {
    setConfigData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "description") {
      if (value.length < 10) {
        setDescriptionError(true);
      } else {
        setDescriptionError(false);
      }
    }
  };

  // برای باز کردن DynamicModal
  const openModal = (selector: string) => {
    setCurrentSelector(selector); // تنظیم انتخاب‌کننده فعلی
    setModalOpen(true);
  };

  // محتوای مختلف برای DataTable بسته به انتخاب‌کننده فعلی
  const getRowData = (selector: string) => {
    switch (selector) {
      case "Program Template":
        return [
          { Name: "Template1", Description: "Program Template1" },
          { Name: "Template2", Description: "Program Template2" },
          { Name: "Template3", Description: "Program Template3" },
        ];
      case "Default Ribbon":
        return [
          { Name: "Ribbon1", Description: "Default Ribbon1" },
          { Name: "Ribbon2", Description: "Default Ribbon2" },
        ];
      case "Lesson Learned Form":
        return [
          { Name: "Form1", Description: "Lesson Learned Form1" },
          { Name: "Form2", Description: "Lesson Learned Form2" },
        ];
      case "Lesson Learned":
        return [
          { Name: "Lesson1", Description: "Lesson Learned1" },
          { Name: "Lesson2", Description: "Lesson Learned2" },
        ];
      case "Comment Form Template":
        return [
          { Name: "CommentTemplate1", Description: "Comment Form Template1" },
          { Name: "CommentTemplate2", Description: "Comment Form Template2" },
        ];
      case "Procedure Form Template":
        return [
          { Name: "Procedure1", Description: "Procedure Form Template1" },
          { Name: "Procedure2", Description: "Procedure Form Template2" },
        ];
      default:
        return [];
    }
  };

  // تابع برای بروزرسانی مقدار انتخاب شده
  const handleSelectFromModal = (selectedName: string) => {
    switch (currentSelector) {
      case "Program Template":
        setConfigData((prev) => ({
          ...prev,
          typeProgramTemplate: selectedName,
        }));
        break;
      case "Default Ribbon":
        setConfigData((prev) => ({
          ...prev,
          typeDefaultRibbon: selectedName,
        }));
        break;
      case "Lesson Learned Form":
        setConfigData((prev) => ({
          ...prev,
          typeLessonLearnedForm: selectedName,
        }));
        break;
      case "Lesson Learned":
        setConfigData((prev) => ({
          ...prev,
          typeLessonLearned: selectedName,
        }));
        break;
      case "Comment Form Template":
        setConfigData((prev) => ({
          ...prev,
          typeCommentFormTemplate: selectedName,
        }));
        break;
      case "Procedure Form Template":
        setConfigData((prev) => ({
          ...prev,
          typeProcedureFormTemplate: selectedName,
        }));
        break;
      default:
        break;
    }
    setModalOpen(false); // بستن مدال پس از انتخاب
  };

  // گزینه‌های مختلف برای DynamicSelector بر اساس انتخاب‌کننده
  const getSelectorOptions = (selector: string) => {
    const rows = getRowData(selector);
    return rows.map((row: any) => ({
      value: row.Name,
      label: row.Name,
    }));
  };

  return (
    <div>
      <TwoColumnLayout>
        {/* Input Name */}
        <DynamicInput
          name="Name"
          type="text"
          value={configData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required

        />

        {/* Input Description */}
        <CustomTextarea
          id="description"
          name="Description"
          value={configData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder=""
          className={`${
            descriptionError ? "border-red-500" : "border-gray-300"
          }`}
        />

        {/* DynamicSelector - Program Template */}
        <DynamicSelector
          options={getSelectorOptions("Program Template")}
          selectedValue={configData.typeProgramTemplate}
          onChange={(e) => handleChange("typeProgramTemplate", e.target.value)}
          label="Program Template"
          showButton={true}
          onButtonClick={() => openModal("Program Template")}
        />

        {/* DynamicSelector - Default Ribbon */}
        <DynamicSelector
          options={getSelectorOptions("Default Ribbon")}
          selectedValue={configData.typeDefaultRibbon}
          onChange={(e) => handleChange("typeDefaultRibbon", e.target.value)}
          label="Default Ribbon"
          showButton={true}
          onButtonClick={() => openModal("Default Ribbon")}
        />

        {/* DynamicSelector - Lesson Learned Form */}
        <DynamicSelector
          options={getSelectorOptions("Lesson Learned Form")}
          selectedValue={configData.typeLessonLearnedForm}
          onChange={(e) =>
            handleChange("typeLessonLearnedForm", e.target.value)
          }
          label="Lesson Learned Form"
          showButton={true}
          onButtonClick={() => openModal("Lesson Learned Form")}
          className="mt-5"
        />

        {/* DynamicSelector - Lesson Learned */}
        <DynamicSelector
          options={getSelectorOptions("Lesson Learned")}
          selectedValue={configData.typeLessonLearned}
          onChange={(e) => handleChange("typeLessonLearned", e.target.value)}
          label="Lesson Learned"
          showButton={true}
          onButtonClick={() => openModal("Lesson Learned")}
          className="mt-5"
        />

        {/* DynamicSelector - Comment Form Template */}
        <DynamicSelector
          options={getSelectorOptions("Comment Form Template")}
          selectedValue={configData.typeCommentFormTemplate}
          onChange={(e) =>
            handleChange("typeCommentFormTemplate", e.target.value)
          }
          label="Comment Form Template"
          showButton={true}
          onButtonClick={() => openModal("Comment Form Template")}
          className="mt-5"
        />

        {/* DynamicSelector - Procedure Form Template */}
        <DynamicSelector
          options={getSelectorOptions("Procedure Form Template")}
          selectedValue={configData.typeProcedureFormTemplate}
          onChange={(e) =>
            handleChange("typeProcedureFormTemplate", e.target.value)
          }
          label="Procedure Form Template"
          showButton={true}
          onButtonClick={() => openModal("Procedure Form Template")}
          className="mt-5"
        />

        {/* List Selectors */}
        <ListSelector title={"Default Action Buttons"} className="mt-5"/>
        <ListSelector title={"Letter Action Buttons"} className="mt-5"/>
        <ListSelector title={"Meeting Action Buttons"} />

        {/* نمایش DynamicModal */}
        {modalOpen && (
          <DynamicModal
            onClose={() => setModalOpen(false)}
            onSelect={handleSelectFromModal} // ارسال مقدار به handleSelectFromModal
            rowData={getRowData(currentSelector)} // ارسال rowData صحیح
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
