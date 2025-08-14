// src/components/CommandSettings.tsx

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSelector from "../utilities/DynamicSelector";
import { useAddEditDelete } from "../../context/AddEditDeleteContext";
import { CommandItem, GetEnumResponse } from "../../services/api.services";
import AppServices from "../../services/api.services";
import DynamicSwitcher from "../utilities/DynamicSwitcher";
import { useTranslation } from "react-i18next";

export interface CommandHandle {
  save: () => Promise<CommandItem | null>;
}

interface CommandProps {
  selectedRow: any;
}

const CommandSettings = forwardRef<CommandHandle, CommandProps>(
  ({ selectedRow }, ref) => {
    const { handleSaveCommand } = useAddEditDelete();

    const [commandData, setCommandData] = useState({
      id: selectedRow?.ID?.toString() || "",
      Name: selectedRow?.Name || "",
      Describtion: selectedRow?.Describtion || "",
      MainColumnIDName: selectedRow?.MainColumnIDName || "",
      GroupName: selectedRow?.GroupName || "",
      gridCmd: selectedRow?.gridCmd || "",
      tabCmd: selectedRow?.tabCmd || "",
      QR: selectedRow?.QR || "",
      ViewMode:
        selectedRow?.ViewMode !== undefined
          ? selectedRow.ViewMode.toString()
          : "",
      DefaultColumns: selectedRow?.DefaultColumns || "",
      ReportParam: selectedRow?.ReportParam || "",
      ProjectIntensive:
        selectedRow?.ProjectIntensive === undefined
          ? true
          : selectedRow.ProjectIntensive,
      ColorColumn: selectedRow?.ColorColumn || "",
      InvisibleColumns: selectedRow?.InvisibleColumns || "",
      ApiColumns: selectedRow?.ApiColumns || "",
      SpParam: selectedRow?.SpParam || "",
      CmdType:
        selectedRow?.CmdType !== undefined
          ? selectedRow.CmdType.toString()
          : "",
    });

    // وضعیت برای ViewModes و ApiModes
    const [viewModes, setViewModes] = useState<
      { value: string; label: string }[]
    >([]);
    const [apiModes, setApiModes] = useState<
      { value: string; label: string }[]
    >([]);

    const [loadingViewModes, setLoadingViewModes] = useState<boolean>(false);
    const [loadingApiModes, setLoadingApiModes] = useState<boolean>(false);

    const [, setErrorViewModes] = useState<string | null>(null);
    const [, setErrorApiModes] = useState<string | null>(null);
    const { t } = useTranslation();

    // به‌روزرسانی داده‌های فرم هنگام تغییر selectedRow
    useEffect(() => {
      setCommandData({
        id: selectedRow?.ID?.toString() || "",
        Name: selectedRow?.Name || "",
        Describtion: selectedRow?.Describtion || "",
        MainColumnIDName: selectedRow?.MainColumnIDName || "",
        GroupName: selectedRow?.GroupName || "",
        gridCmd: selectedRow?.gridCmd || "",
        tabCmd: selectedRow?.tabCmd || "",
        QR: selectedRow?.QR || "",
        ViewMode:
          selectedRow?.ViewMode !== undefined
            ? selectedRow.ViewMode.toString()
            : "",
        DefaultColumns: selectedRow?.DefaultColumns || "",
        ReportParam: selectedRow?.ReportParam || "",
        ProjectIntensive:
          selectedRow?.ProjectIntensive === undefined
            ? true
            : selectedRow.ProjectIntensive,
        ColorColumn: selectedRow?.ColorColumn || "",
        InvisibleColumns: selectedRow?.InvisibleColumns || "",
        ApiColumns: selectedRow?.ApiColumns || "",
        SpParam: selectedRow?.SpParam || "",
        CmdType:
          selectedRow?.CmdType !== undefined
            ? selectedRow.CmdType.toString()
            : "",
      });
    }, [selectedRow]);

    // فراخوانی API‌ها برای دریافت enums
    useEffect(() => {
      const fetchEnums = async () => {
        // Fetch ViewMode
        setLoadingViewModes(true);
        setErrorViewModes(null);
        try {
          const response: GetEnumResponse = await AppServices.getEnum({
            str: "ViewMode",
          });
          const viewModeOptions = Object.entries(response).map(
            ([key, val]) => ({
              value: val.toString(),
              label: key,
            })
          );
          setViewModes(viewModeOptions);
          console.log("viewModeOptions", viewModeOptions);
        } catch (error) {
          // console.error("Error fetching ViewMode enums:", error);
          setErrorViewModes("خطا در دریافت ViewMode");
        } finally {
          setLoadingViewModes(false);
        }

        // Fetch CmdType (Api Mode)
        setLoadingApiModes(true);
        setErrorApiModes(null);
        try {
          const response: GetEnumResponse = await AppServices.getEnum({
            str: "CmdType",
          });
          const apiModeOptions = Object.entries(response).map(([key, val]) => ({
            value: val.toString(),
            label: key,
          }));
          setApiModes(apiModeOptions);
          console.log("apiModeOptions", apiModeOptions);
        } catch (error) {
          console.error("Error fetching CmdType enums:", error);
          setErrorApiModes("خطا در دریافت CmdType");
        } finally {
          setLoadingApiModes(false);
        }
      };

      fetchEnums();
    }, []);

    // در صورتی که CmdType خالی باشد، مقدار پیش‌فرض (اولین گزینه) را تنظیم می‌کنیم
    useEffect(() => {
      if (!commandData.CmdType && apiModes.length > 0) {
        setCommandData((prev) => ({ ...prev, CmdType: apiModes[0].value }));
      }
    }, [apiModes, commandData.CmdType]);

    const handleChange = (
      field: keyof typeof commandData,
      value: string | boolean | number | null
    ) => {
      if (field === "ViewMode" || field === "CmdType") {
        setCommandData((prev) => ({
          ...prev,
          [field]: value?.toString() || "",
        }));
      } else {
        setCommandData((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

    // متد اصلی ذخیره (برای forwardRef)
    const save = async (): Promise<CommandItem | null> => {
      const dataToSave = {
        ...commandData,
        ViewMode: commandData.ViewMode ? parseInt(commandData.ViewMode, 10) : 0,
        CmdType: commandData.CmdType ? parseInt(commandData.CmdType, 10) : 0,
      };
      const result = await handleSaveCommand(dataToSave);
      return result;
    };

    useImperativeHandle(ref, () => ({
      save,
    }));

    return (
      <TwoColumnLayout>
        {/* Name */}
        <DynamicInput
          name={t("CommandPage.Name")}
          type="text"
          value={commandData.Name}
          placeholder=""
          onChange={(e) => handleChange("Name", e.target.value)}
        />

        {/* Describtion */}
        <CustomTextarea
          name={t("CommandPage.Describtion")}
          value={commandData.Describtion || ""}
          placeholder=""
          onChange={(e) => handleChange("Describtion", e.target.value)}
        />

        {/* ViewMode */}
        <DynamicSelector
          name="ViewMode"
          options={viewModes}
          selectedValue={commandData.ViewMode || ""}
          onChange={(e) => handleChange("ViewMode", e.target.value)}
          label={t("CommandPage.ViewMode")}
          loading={loadingViewModes}
        />

        {/* MainColumnIDName */}
        <DynamicInput
          name={t("CommandPage.MainColumnIDName")}
          type="text"
          value={commandData.MainColumnIDName || ""}
          placeholder=""
          onChange={(e) => handleChange("MainColumnIDName", e.target.value)}
        />

        {/* ColorColumn */}
        <DynamicInput
          name={t("CommandPage.ColorColumn")}
          type="text"
          value={commandData.ColorColumn || ""}
          placeholder=""
          onChange={(e) => handleChange("ColorColumn", e.target.value)}
        />

        {/* GroupName */}
        <DynamicInput
          name={t("CommandPage.GroupName")}
          type="text"
          value={commandData.GroupName || ""}
          placeholder=""
          onChange={(e) => handleChange("GroupName", e.target.value)}
        />

        {/* QR */}
        <CustomTextarea
          name={t("CommandPage.Query")}
          value={commandData.QR || ""}
          placeholder=""
          onChange={(e) => handleChange("QR", e.target.value)}
        />

        {/* DefaultColumns */}
        <CustomTextarea
          name={t("CommandPage.HiddenColumns")}
          value={commandData.DefaultColumns || ""}
          placeholder=""
          onChange={(e) => handleChange("DefaultColumns", e.target.value)}
        />

        {/* InvisibleColumns */}
        <CustomTextarea
          name={t("CommandPage.InvisibleColumns")}
          value={commandData.InvisibleColumns || ""}
          placeholder=""
          onChange={(e) => handleChange("InvisibleColumns", e.target.value)}
        />

        {/* ApiColumns */}
        <CustomTextarea
          name={t("CommandPage.ApiColumns")}
          value={commandData.ApiColumns || ""}
          placeholder=""
          onChange={(e) => handleChange("ApiColumns", e.target.value)}
        />

        {/* SpParam */}
        <CustomTextarea
          name={t("CommandPage.SpParameters")}
          value={commandData.SpParam || ""}
          placeholder=""
          onChange={(e) => handleChange("SpParam", e.target.value)}
        />

        {/* Api Mode Selector */}
        <DynamicSelector
          name={t("CommandPage.ApiMode")}
          options={apiModes}
          selectedValue={commandData.CmdType || ""}
          onChange={(e) => handleChange("CmdType", e.target.value)}
          label="Api Mode"
          loading={loadingApiModes}
        />

        {/* Grid Command */}
        <DynamicInput
          name={t("CommandPage.GridCommand")}
          type="text"
          value={commandData.gridCmd || ""}
          placeholder=""
          onChange={(e) => handleChange("gridCmd", e.target.value)}
        />

        {/* Report Command */}
        <DynamicInput
          name={t("CommandPage.ReportCommand")}
          type="text"
          value={commandData.tabCmd || ""}
          placeholder=""
          onChange={(e) => handleChange("tabCmd", e.target.value)}
        />

        {/* ProjectIntensive with DynamicSwitcher */}
        <div className="mt-4">
          <DynamicSwitcher
            isChecked={!!commandData.ProjectIntensive}
            onChange={() =>
              handleChange("ProjectIntensive", !commandData.ProjectIntensive)
            }
            leftLabel=""
            rightLabel={t("CommandPage.ProjectIntensive")}
          />
        </div>
      </TwoColumnLayout>
    );
  }
);

export default CommandSettings;
