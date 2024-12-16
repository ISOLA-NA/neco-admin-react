// src/components/General/OdpComp.tsx

import React, { useState, useEffect } from "react";
import DynamicInput from "../utilities/DynamicInput";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSelector from "../utilities/DynamicSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector";
import ListSelector from "../ListSelector/ListSelector"; // وارد کردن ListSelector

interface OdpProps {
  selectedRow: any;
}

interface ItemType {
  ID: number;
  Name: string;
}

const OdpComp: React.FC<OdpProps> = ({ selectedRow }) => {
  const [OdpData, setOdpData] = useState<{
    ID: string | number;
    Name: string;
    Description: string;
    Address: string;
    nProgramTemplateID: number | null;
    nEntityTypeID: number | null;
    nWFTemplateID: number | null;
  }>({
    ID: "",
    Name: "",
    Description: "",
    Address: "",
    nProgramTemplateID: null,
    nEntityTypeID: null,
    nWFTemplateID: null,
  });

  // داده‌های MODALها
  const MODALodp: ItemType[] = [
    { ID: 1, Name: "odp 1" },
    { ID: 2, Name: "odp 2" },
    { ID: 3, Name: "odp 3" },
    { ID: 4, Name: "odp 4" },
  ];

  const MODALFormTemplate: ItemType[] = [
    { ID: 10, Name: "Form Template 1" },
    { ID: 11, Name: "Form Template 2" },
    { ID: 12, Name: "Form Template 3" },
  ];

  const MODALApprovalFlowTemplate: ItemType[] = [
    { ID: 20, Name: "Approval Flow Template 1" },
    { ID: 21, Name: "Approval Flow Template 2" },
    { ID: 22, Name: "Approval Flow Template 3" },
  ];

  // داده‌های Relate Project
  const MODALRelateProjects: ItemType[] = [
    { ID: 100, Name: "Project A" },
    { ID: 101, Name: "Project B" },
    { ID: 102, Name: "Project C" },
    { ID: 103, Name: "Project D" },
  ];

  // ستون‌های جدول برای TableSelector
  const columnDefs = [
    { headerName: "ID", field: "ID" },
    { headerName: "Name", field: "Name" },
  ];

  const handleChange = (
    field: keyof typeof OdpData,
    value: string | boolean | number | null
  ) => {
    setOdpData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (selectedRow) {
      setOdpData({
        ID: selectedRow.ID || "",
        Name: selectedRow.Name || "",
        Description: selectedRow.Description || "",
        Address: selectedRow.Address || "",
        nProgramTemplateID: selectedRow.nProgramTemplateID || null,
        nEntityTypeID: selectedRow.nEntityTypeID || null,
        nWFTemplateID: selectedRow.nWFTemplateID || null,
      });
    } else {
      setOdpData({
        ID: "",
        Name: "",
        Description: "",
        Address: "",
        nProgramTemplateID: null,
        nEntityTypeID: null,
        nWFTemplateID: null,
      });
    }
  }, [selectedRow]);

  // state های مربوط به MODALها
  const [isOdpModalOpen, setIsOdpModalOpen] = useState(false);
  const [selectedOdpRow, setSelectedOdpRow] = useState<any>(null);

  const [isFormTemplateModalOpen, setIsFormTemplateModalOpen] = useState(false);
  const [selectedFormTemplateRow, setSelectedFormTemplateRow] =
    useState<any>(null);

  const [isApprovalFlowModalOpen, setIsApprovalFlowModalOpen] = useState(false);
  const [selectedApprovalFlowRow, setSelectedApprovalFlowRow] =
    useState<any>(null);

  const [isRelateProjectsModalOpen, setIsRelateProjectsModalOpen] =
    useState(false);
  const [selectedRelateProjectsRows, setSelectedRelateProjectsRows] = useState<
    any[]
  >([]);

  // state های مربوط به ListSelector "Relate Project"
  const [relateProjectSelectedIds, setRelateProjectSelectedIds] = useState<
    (string | number)[]
  >([]);
  const [relateProjectIsGlobal, setRelateProjectIsGlobal] = useState(false);

  // توابع باز و بسته کردن مودال‌ها
  const handleOpenOdpModal = () => setIsOdpModalOpen(true);
  const handleCloseOdpModal = () => setIsOdpModalOpen(false);

  const handleOpenFormTemplateModal = () => setIsFormTemplateModalOpen(true);
  const handleCloseFormTemplateModal = () => setIsFormTemplateModalOpen(false);

  const handleOpenApprovalFlowModal = () => setIsApprovalFlowModalOpen(true);
  const handleCloseApprovalFlowModal = () => setIsApprovalFlowModalOpen(false);

  const handleCloseRelateProjectsModal = () =>
    setIsRelateProjectsModalOpen(false);

  // توابع انتخاب سطر در هر مودال
  const handleOdpRowClick = (data: any) => setSelectedOdpRow(data);
  const handleOdpRowDoubleClick = (data: any) => {
    setSelectedOdpRow(data);
    handleSelectOdpFromModal();
  };

  const handleFormTemplateRowClick = (data: any) =>
    setSelectedFormTemplateRow(data);
  const handleFormTemplateRowDoubleClick = (data: any) => {
    setSelectedFormTemplateRow(data);
    handleSelectFormTemplateFromModal();
  };

  const handleApprovalFlowRowClick = (data: any) =>
    setSelectedApprovalFlowRow(data);
  const handleApprovalFlowRowDoubleClick = (data: any) => {
    setSelectedApprovalFlowRow(data);
    handleSelectApprovalFlowFromModal();
  };

  const handleRelateProjectsRowClick = (data: any) => {
    setSelectedRelateProjectsRows([data]);
  };
  const handleRelateProjectsRowDoubleClick = (data: any) => {
    setSelectedRelateProjectsRows([data]);
    handleSelectRelateProjectsFromModal();
  };

  // توابع کلیک روی دکمه Select در مودال‌ها
  const handleSelectOdpFromModal = () => {
    if (selectedOdpRow) {
      handleChange("nProgramTemplateID", selectedOdpRow.ID);
    }
    handleCloseOdpModal();
  };

  const handleSelectFormTemplateFromModal = () => {
    if (selectedFormTemplateRow) {
      handleChange("nEntityTypeID", selectedFormTemplateRow.ID);
    }
    handleCloseFormTemplateModal();
  };

  const handleSelectApprovalFlowFromModal = () => {
    if (selectedApprovalFlowRow) {
      handleChange("nWFTemplateID", selectedApprovalFlowRow.ID);
    }
    handleCloseApprovalFlowModal();
  };

  const handleSelectRelateProjectsFromModal = () => {
    if (selectedRelateProjectsRows.length > 0) {
      const ids = selectedRelateProjectsRows.map((row) => row.ID);
      setRelateProjectSelectedIds(ids);
    }
    handleCloseRelateProjectsModal();
  };

  // ساخت آپشن‌های DynamicSelector بر اساس داده‌های هر Modal
  const odpOptions = MODALodp.map((item) => ({
    value: item.ID.toString(),
    label: item.Name,
  }));

  const formTemplateOptions = MODALFormTemplate.map((item) => ({
    value: item.ID.toString(),
    label: item.Name,
  }));

  const approvalFlowOptions = MODALApprovalFlowTemplate.map((item) => ({
    value: item.ID.toString(),
    label: item.Name,
  }));

  // ستون‌های جدول برای ListSelector "Relate Project"
  const relateProjectColumnDefs = [
    { headerName: "ID", field: "ID" },
    { headerName: "Name", field: "Name" },
  ];

  // داده‌های برای ListSelector "Relate Project"
  const relateProjectRowData = MODALRelateProjects;

  // توابع مدیریت تغییر در ListSelector "Relate Project"
  const handleRelateProjectSelectionChange = (
    selectedIds: (string | number)[]
  ) => {
    setRelateProjectSelectedIds(selectedIds);
  };

  return (
    <TwoColumnLayout>
      {/* نام ODP */}
      <DynamicInput
        name="Odp Name"
        type="text"
        value={OdpData.Name}
        placeholder=""
        onChange={(e) => handleChange("Name", e.target.value)}
        required={true}
      />

      {/* توضیحات */}
      <CustomTextarea
        id="description"
        name="Description"
        value={OdpData.Description}
        placeholder=""
        onChange={(e) => handleChange("Description", e.target.value)}
      />

      {/* آدرس */}
      <DynamicInput
        name="Address"
        type="text"
        value={OdpData.Address}
        placeholder=""
        onChange={(e) => handleChange("Address", e.target.value)}
        required={true}
      />

      {/* DynamicSelector برای ODP */}
      <DynamicSelector
        options={odpOptions}
        selectedValue={
          OdpData.nProgramTemplateID
            ? OdpData.nProgramTemplateID.toString()
            : ""
        }
        onChange={(e) => {
          const val = e.target.value;
          const idNumber = val ? parseInt(val, 10) : null;
          handleChange("nProgramTemplateID", idNumber);
        }}
        label="Select ODP"
        showButton={true}
        onButtonClick={handleOpenOdpModal}
        disabled={false}
      />

      {/* DynamicSelector برای Form Template */}
      <DynamicSelector
        options={formTemplateOptions}
        selectedValue={
          OdpData.nEntityTypeID ? OdpData.nEntityTypeID.toString() : ""
        }
        onChange={(e) => {
          const val = e.target.value;
          const idNumber = val ? parseInt(val, 10) : null;
          handleChange("nEntityTypeID", idNumber);
        }}
        label="Select Form Template"
        showButton={true}
        onButtonClick={handleOpenFormTemplateModal}
        disabled={OdpData.nEntityTypeID !== null}
      />

      {/* DynamicSelector برای Approval Flow Template */}
      <DynamicSelector
        options={approvalFlowOptions}
        selectedValue={
          OdpData.nWFTemplateID ? OdpData.nWFTemplateID.toString() : ""
        }
        onChange={(e) => {
          const val = e.target.value;
          const idNumber = val ? parseInt(val, 10) : null;
          handleChange("nWFTemplateID", idNumber);
        }}
        label="Select Approval Flow Template"
        showButton={true}
        onButtonClick={handleOpenApprovalFlowModal}
        disabled={OdpData.nWFTemplateID !== null}
      />

      {/* لیست سلکتور جدید برای Relate Project با قابلیت داینامیک */}
      <ListSelector
        title="Relate Project"
        className="mt-4"
        columnDefs={relateProjectColumnDefs}
        rowData={relateProjectRowData}
        selectedIds={relateProjectSelectedIds}
        onSelectionChange={handleRelateProjectSelectionChange}
        showSwitcher={true}
        isGlobal={relateProjectIsGlobal}
        onGlobalChange={setRelateProjectIsGlobal}
        // افزودن ModalContentComponent و modalContentProps برای داینامیک شدن
        ModalContentComponent={TableSelector}
        modalContentProps={{
          columnDefs: relateProjectColumnDefs,
          rowData: relateProjectRowData,
          selectedRow:
            selectedRelateProjectsRows.length > 0
              ? selectedRelateProjectsRows[0]
              : null,
          onRowDoubleClick: handleRelateProjectsRowDoubleClick,
          onRowClick: handleRelateProjectsRowClick,
          onSelectButtonClick: handleSelectRelateProjectsFromModal,
          isSelectDisabled: selectedRelateProjectsRows.length === 0,
        }}
      />

      {/* MODAL برای ODP */}
      <DynamicModal isOpen={isOdpModalOpen} onClose={handleCloseOdpModal}>
        <TableSelector
          columnDefs={columnDefs}
          rowData={MODALodp}
          selectedRow={selectedOdpRow}
          onRowDoubleClick={handleOdpRowDoubleClick}
          onRowClick={handleOdpRowClick}
          onSelectButtonClick={handleSelectOdpFromModal}
          isSelectDisabled={!selectedOdpRow}
        />
      </DynamicModal>

      {/* MODAL برای Form Template */}
      <DynamicModal
        isOpen={isFormTemplateModalOpen}
        onClose={handleCloseFormTemplateModal}
      >
        <TableSelector
          columnDefs={columnDefs}
          rowData={MODALFormTemplate}
          selectedRow={selectedFormTemplateRow}
          onRowDoubleClick={handleFormTemplateRowDoubleClick}
          onRowClick={handleFormTemplateRowClick}
          onSelectButtonClick={handleSelectFormTemplateFromModal}
          isSelectDisabled={!selectedFormTemplateRow}
        />
      </DynamicModal>

      {/* MODAL برای Approval Flow Template */}
      <DynamicModal
        isOpen={isApprovalFlowModalOpen}
        onClose={handleCloseApprovalFlowModal}
      >
        <TableSelector
          columnDefs={columnDefs}
          rowData={MODALApprovalFlowTemplate}
          selectedRow={selectedApprovalFlowRow}
          onRowDoubleClick={handleApprovalFlowRowDoubleClick}
          onRowClick={handleApprovalFlowRowClick}
          onSelectButtonClick={handleSelectApprovalFlowFromModal}
          isSelectDisabled={!selectedApprovalFlowRow}
        />
      </DynamicModal>

      {/* MODAL برای Relate Projects */}
      <DynamicModal
        isOpen={isRelateProjectsModalOpen}
        onClose={handleCloseRelateProjectsModal}
      >
        <TableSelector
          columnDefs={relateProjectColumnDefs}
          rowData={MODALRelateProjects}
          selectedRow={
            selectedRelateProjectsRows.length > 0
              ? selectedRelateProjectsRows[0]
              : null
          }
          onRowDoubleClick={handleRelateProjectsRowDoubleClick}
          onRowClick={handleRelateProjectsRowClick}
          onSelectButtonClick={handleSelectRelateProjectsFromModal}
          isSelectDisabled={selectedRelateProjectsRows.length === 0}
        />
      </DynamicModal>
    </TwoColumnLayout>
  );
};

export default OdpComp;
