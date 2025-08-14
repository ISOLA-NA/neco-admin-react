// src/components/ProgramTemplate/AddProgramTemplate.tsx

import React, { useEffect, useState, ChangeEvent } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import {
  useApi,
  ApprovalChecklist,
  ProgramType,
} from "../../../context/ApiContext";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import { ProgramTemplateItem } from "../../../services/api.services";
import AddColumnForm from "../../Forms/AddForm";
import ListSelector from "../../ListSelector/ListSelector";
import { useTranslation } from "react-i18next";

interface AddProgramTemplateProps {
  selectedRow: ProgramTemplateItem | null;
  onSaved: () => void;
  onSuccessAdd?: (newItem: { ID: number; Name: string }) => void;
  editingRow?: any;
  onCancel?: () => void;
}

const AddProgramTemplate: React.FC<AddProgramTemplateProps> = ({
  selectedRow,
  onSaved,
  editingRow,
  onCancel,
}) => {
  const { t } = useTranslation();

  // مقدار اولیه فرم با همه فیلدها
  const initialFormData = {
    activityname: "",
    responsiblepost: "",
    approvalFlow: "",
    checkList: "",
    duration: "1",
    lag: "0",
    procedure: "",
    programtype: "",
    weight1: "0",
    weight2: "",
    weight3: "",
    programtemplate: "",
    approvalToExecutionWeight: "0.2",
    wfW2: "",
    wfW3: "",
    activityBudget1: "0",
    activityBudget2: "0",
    activityBudget3: "0",
    approvalBudget1: "0",
    approvalBudget2: "0",
    approvalBudget3: "0",
    activitytype: "",
    formname: "",
    afDuration: "0",
    programDuration: "0",
    programExecutionBudget: "0",
    programApprovalBudget: "0",
    programToPlanWeight: "0",
    subCost2Act: "",
    subCost2Apr: "",
    subCost3Act: "",
    subCost3Apr: "",
    w2SubProg: "",
    w3SubProg: "",
    start: "",
    finish: "",
    Code: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const api = useApi();

  // داده‌های انتخابی برای selector ها
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [activityTypes, setActivityTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const [wfTemplates, setWfTemplates] = useState<any[]>([]);
  const [forms, setForms] = useState<{ value: string; label: string }[]>([]);
  const [programTemplates, setProgramTemplates] = useState<
    { ID: number; Name: string }[]
  >([]);
  const [checklists, setChecklists] = useState<ApprovalChecklist[]>([]);
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);
  const [procedures, setProcedures] = useState<
    { value: string; label: string }[]
  >([]);

  // متادیتا
  const [metaValues, setMetaValues] = useState<{ ID: string; Name: string }[]>(
    []
  );
  const [metaNames, setMetaNames] = useState<{ ID: string; Name: string }[]>(
    []
  );
  const [selectedMetaIds, setSelectedMetaIds] = useState<string[]>([]);
  const [programTemplateField, setProgramTemplateField] = useState<any>({
    SubProgramMetaDataColumn: "",
  });

  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // همگام‌سازی selectedMetaIds با metaNames و SubProgramMetaDataColumn
  useEffect(() => {
    const mapped = selectedMetaIds
      .map((id) => {
        const match = metaValues.find((item) => String(item.ID) === String(id));
        return match ? { ID: id, Name: match.Name || "" } : null;
      })
      .filter(Boolean) as { ID: string; Name: string }[];

    setMetaNames(mapped);
    setProgramTemplateField((prev: any) => ({
      ...prev,
      SubProgramMetaDataColumn:
        mapped.length > 0 ? mapped.map((m) => m.ID).join("|") + "|" : "",
    }));
  }, [selectedMetaIds, metaValues]);

  // دریافت لیست Roles
  useEffect(() => {
    setIsLoadingRoles(true);
    api
      .getAllRoles()
      .then((res) => {
        // فرض: res آرایه‌ای از { ID: something, Name: string }
        setRoles(res.map((r) => ({ value: String(r.ID), label: r.Name })));
      })
      .catch((err) => {
        console.error("Failed to fetch roles:", err);
      })
      .finally(() => {
        setIsLoadingRoles(false);
      });
  }, [api]);

  // دریافت Activity Types از enum
  useEffect(() => {
    api
      .getEnum({ str: "PFIType" })
      .then((r) => {
        // فرض: r یک شی است با کلید:نام، مقدار:عدد یا مقدار مناسب
        const arr = Object.entries(r).map(([key, value]) => ({
          value: String(value),
          label: key,
        }));
        setActivityTypes(arr);
      })
      .catch((err) => {
        console.error("Error fetching activity types:", err);
      });
  }, [api]);

  // دریافت Approval Flows
  useEffect(() => {
    api
      .getAllWfTemplate()
      .then((res) => {
        setWfTemplates(res);
      })
      .catch((err) => {
        console.error("Failed to fetch approval flows:", err);
      });
  }, [api]);

  // دریافت Forms
  useEffect(() => {
    api
      .getTableTransmittal()
      .then((res) => {
        setForms(res.map((f) => ({ value: String(f.ID), label: f.Name })));
      })
      .catch((err) => {
        console.error("Failed to fetch forms:", err);
      });
  }, [api]);

  // دریافت Program Templates
  useEffect(() => {
    api
      .getAllProgramTemplates()
      .then((res) => {
        setProgramTemplates(res);
      })
      .catch((err) => {
        console.error("Failed to fetch program templates:", err);
      });
  }, [api]);

  // دریافت Checklists
  useEffect(() => {
    api
      .getApprovalCheckList()
      .then((res) => {
        setChecklists(res);
      })
      .catch((err) => {
        console.error("Failed to fetch checklists:", err);
      });
  }, [api]);

  // دریافت Program Types
  useEffect(() => {
    api
      .getAllProgramType()
      .then((res) => {
        setProgramTypes(res);
      })
      .catch((err) => {
        console.error("Failed to fetch program types:", err);
      });
  }, [api]);

  // دریافت Procedures
  useEffect(() => {
    api
      .getAllEntityCollection()
      .then((res) => {
        setProcedures(
          res.map((p: any) => ({
            value: String(p.ID),
            label: p.Name,
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to fetch procedures:", err);
      });
  }, [api]);

  // تابع ساده handleChange برای همه input/selectorهای مبتنی بر event
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // آماده‌سازی گزینه‌ها برای JSX
  const roleOptions = roles;
  const approvalFlowOptions = wfTemplates.map((w) => ({
    value: String(w.ID),
    label: w.Name,
  }));
  const checkListOptions = checklists.map((c) => ({
    value: String(c.ID),
    label: c.Name,
  }));
  const activityTypeOptions = activityTypes;
  const formOptions = forms;
  const programTypeOptions = programTypes.map((p) => ({
    value: String(p.ID),
    label: p.Name,
  }));
  const programTemplateOptions = programTemplates.map((pt) => ({
    value: String(pt.ID),
    label: pt.Name,
  }));
  const procedureOptions = procedures;

  // هنگام Save (اضافه جدید)
  const handleSave = async () => {
    try {
      if (!formData.activityname) {
        showAlert("warning", null, "Validation", "Name is required");
        return;
      }
      const payload = {
        MetaValues: [],
        PFI: {
          ID: 0,
          IsVisible: true,
          LastModified: null,
          Name: formData.activityname,
          ActDuration: Number(formData.duration) || 0,
          Left: Number(formData.start) || 0,
          Top: Number(formData.finish) || 0,
          Order: 0,
          Code: formData.Code || "",
          GPIC: null,
          ParrentIC: null,
          PredecessorForItemStr: "",
          PredecessorForSubStr: "",
          nProgramTemplateID: selectedRow?.ID,
          // ارسال رشته GUID یا null به جای Number(...)
          nPostId: formData.responsiblepost ? formData.responsiblepost : null,
          nPostTypeId: null,
          nWFTemplateID: formData.approvalFlow
            ? Number(formData.approvalFlow)
            : null,
          nQuestionTemplateID: null,
          nEntityCollectionID: formData.procedure
            ? Number(formData.procedure)
            : null,
          nProgramTypeID: formData.programtype
            ? Number(formData.programtype)
            : null,
          subProgramID: null,
          nEntityTypeID: formData.formname ? Number(formData.formname) : null,
          IsInheritMetaColumns: null,
          IsInheritMetaValues: null,
          PCostAct: Number(formData.activityBudget1) || 0,
          PCostAprov: Number(formData.approvalBudget1) || 0,
          PCostSubAct: Number(formData.programExecutionBudget) || 0,
          PCostSubAprov: Number(formData.programApprovalBudget) || 0,
          Weight1: Number(formData.weight1) || 0,
          Weight2: Number(formData.weight2) || 0,
          Weight3: Number(formData.weight3) || 0,
          WeightWF: Number(formData.approvalToExecutionWeight) || 0,
          WeightSubProg: Number(formData.programToPlanWeight) || 0,
          DelayTime: 0,
          WFDuration: Number(formData.programDuration) || 0,
          SubDuration: 0,
          PFIType: formData.activitytype ? Number(formData.activitytype) : 3,
          SubProgramMetaDataColumn:
            programTemplateField.SubProgramMetaDataColumn || "",
        },
      };
      console.log("Saving payload:", payload);
      await api.insertProgramTemplateField(payload);
      showAlert("success", null, "Saved", "Program field added successfully.");
      onSaved();
      // ریست فرم بعد از ذخیره
      setFormData(initialFormData);
      setSelectedMetaIds([]);
      setMetaValues([]);
      setMetaNames([]);
    } catch (error: any) {
      console.error("Error saving:", error);
      const msg =
        error?.response?.data || error?.message || "Failed to save field.";
      showAlert("error", null, "Save Failed", msg);
    }
  };

  // هنگام Update (ویرایش)
  const handleUpdate = async () => {
    try {
      if (!formData.activityname) {
        showAlert("warning", null, "Validation", "Name is required");
        return;
      }
      const payload = {
        MetaValues: [],
        PFI: {
          ...editingRow,
          Name: formData.activityname,
          ActDuration: Number(formData.duration) || 0,
          Left: Number(formData.start) || 0,
          Top: Number(formData.finish) || 0,
          nProgramTemplateID: selectedRow?.ID,
          nPostId: formData.responsiblepost ? formData.responsiblepost : null,
          nWFTemplateID: formData.approvalFlow
            ? Number(formData.approvalFlow)
            : null,
          nEntityCollectionID: formData.procedure
            ? Number(formData.procedure)
            : null,
          nProgramTypeID: formData.programtype
            ? Number(formData.programtype)
            : null,
          nEntityTypeID: formData.formname ? Number(formData.formname) : null,
          PCostAct: Number(formData.activityBudget1) || 0,
          PCostAprov: Number(formData.approvalBudget1) || 0,
          PCostSubAct: Number(formData.programExecutionBudget) || 0,
          PCostSubAprov: Number(formData.programApprovalBudget) || 0,
          Weight1: Number(formData.weight1) || 0,
          Weight2: Number(formData.weight2) || 0,
          Weight3: Number(formData.weight3) || 0,
          WeightWF: Number(formData.approvalToExecutionWeight) || 0,
          WeightSubProg: Number(formData.programToPlanWeight) || 0,
          WFDuration: Number(formData.programDuration) || 0,
          PFIType: formData.activitytype ? Number(formData.activitytype) : 3,
          SubProgramMetaDataColumn:
            programTemplateField.SubProgramMetaDataColumn || "",
          Code: formData.Code || "",
        },
      };
      console.log("Updating payload:", payload);
      await api.updateProgramTemplateField(payload);
      showAlert(
        "success",
        null,
        "Updated",
        "Program field updated successfully."
      );
      // ریست فرم بعد از ویرایش
      setFormData(initialFormData);
      setSelectedMetaIds([]);
      setMetaValues([]);
      setMetaNames([]);
      if (onSaved) onSaved();
      if (onCancel) onCancel();
    } catch (error: any) {
      console.error("Error updating:", error);
      const msg =
        error?.response?.data || error?.message || "Failed to update field.";
      showAlert("error", null, "Update Failed", msg);
    }
  };

  // مقداردهی اولیه فرم وقتی editingRow تغییر کند
  useEffect(() => {
    if (editingRow) {
      // تنظیم فرم بر اساس داده ویرایشی
      setFormData({
        activityname: editingRow.Name || "",
        responsiblepost: editingRow.nPostId ? String(editingRow.nPostId) : "",
        approvalFlow: editingRow.nWFTemplateID
          ? String(editingRow.nWFTemplateID)
          : "",
        checkList: editingRow.checkList || "",
        duration: editingRow.ActDuration ? String(editingRow.ActDuration) : "1",
        lag: editingRow.lag ? String(editingRow.lag) : "0",
        procedure: editingRow.nEntityCollectionID
          ? String(editingRow.nEntityCollectionID)
          : "",
        programtype: editingRow.nProgramTypeID
          ? String(editingRow.nProgramTypeID)
          : "",
        weight1: editingRow.Weight1 ? String(editingRow.Weight1) : "0",
        weight2: editingRow.Weight2 ? String(editingRow.Weight2) : "",
        weight3: editingRow.Weight3 ? String(editingRow.Weight3) : "",
        programtemplate: editingRow.nProgramTemplateID
          ? String(editingRow.nProgramTemplateID)
          : "",
        approvalToExecutionWeight: editingRow.WeightWF
          ? String(editingRow.WeightWF)
          : "0.2",
        wfW2: editingRow.wfW2 ? String(editingRow.wfW2) : "",
        wfW3: editingRow.wfW3 ? String(editingRow.wfW3) : "",
        activityBudget1: editingRow.PCostAct
          ? String(editingRow.PCostAct)
          : "0",
        activityBudget2: editingRow.activityBudget2
          ? String(editingRow.activityBudget2)
          : "0",
        activityBudget3: editingRow.activityBudget3
          ? String(editingRow.activityBudget3)
          : "0",
        approvalBudget1: editingRow.PCostAprov
          ? String(editingRow.PCostAprov)
          : "0",
        approvalBudget2: editingRow.approvalBudget2
          ? String(editingRow.approvalBudget2)
          : "0",
        approvalBudget3: editingRow.approvalBudget3
          ? String(editingRow.approvalBudget3)
          : "0",
        activitytype: editingRow.PFIType ? String(editingRow.PFIType) : "",
        formname: editingRow.nEntityTypeID
          ? String(editingRow.nEntityTypeID)
          : "",
        afDuration: editingRow.afDuration ? String(editingRow.afDuration) : "0",
        programDuration: editingRow.WFDuration
          ? String(editingRow.WFDuration)
          : "0",
        programExecutionBudget: editingRow.PCostSubAct
          ? String(editingRow.PCostSubAct)
          : "0",
        programApprovalBudget: editingRow.PCostSubAprov
          ? String(editingRow.PCostSubAprov)
          : "0",
        programToPlanWeight: editingRow.WeightSubProg
          ? String(editingRow.WeightSubProg)
          : "0",
        subCost2Act: editingRow.subCost2Act
          ? String(editingRow.subCost2Act)
          : "",
        subCost2Apr: editingRow.subCost2Apr
          ? String(editingRow.subCost2Apr)
          : "",
        subCost3Act: editingRow.subCost3Act
          ? String(editingRow.subCost3Act)
          : "",
        subCost3Apr: editingRow.subCost3Apr
          ? String(editingRow.subCost3Apr)
          : "",
        w2SubProg: editingRow.w2SubProg ? String(editingRow.w2SubProg) : "",
        w3SubProg: editingRow.w3SubProg ? String(editingRow.w3SubProg) : "",
        start: editingRow.Top ? String(editingRow.Top) : "",
        finish: editingRow.Left ? String(editingRow.Left) : "",
        Code: editingRow.Code || "",
      });

      // متادیتا: اگر SubProgramMetaDataColumn وجود داشت، لیست GUIDها را بگیریم و نام‌ها را fetch کنیم
      if (editingRow.SubProgramMetaDataColumn) {
        const metaIds =
          editingRow.SubProgramMetaDataColumn.split("|").filter(Boolean);
        setSelectedMetaIds(metaIds);
        setLoadingMeta(true);
        Promise.all(
          metaIds.map((id) =>
            api
              .getEntityFieldById(Number(id))
              .then((res) => ({
                ID: String(res.ID),
                Name: res.DisplayName || res.Name || "",
              }))
              .catch((err) => {
                console.error("Error fetching meta for ID:", id, err);
                return null;
              })
          )
        )
          .then((vals) => {
            const valid = vals.filter(Boolean) as {
              ID: string;
              Name: string;
            }[];
            setMetaValues(valid);
            setMetaNames(valid);
          })
          .catch((err) => {
            console.error("Error in fetching metadata:", err);
          })
          .finally(() => {
            setLoadingMeta(false);
          });
      } else {
        setSelectedMetaIds([]);
        setMetaValues([]);
        setMetaNames([]);
      }
    } else {
      // حالت اضافه جدید
      setFormData(initialFormData);
      setSelectedMetaIds([]);
      setMetaValues([]);
      setMetaNames([]);
    }
  }, [editingRow, selectedRow, api]);

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* بخش اصلی فرم */}
      <div className="flex-1 px-2 sm:px-4 py-6 overflow-auto">
        <div className="grid grid-cols-2 gap-x-8 gap-y-8">
          {/* ستون چپ */}
          <div className="space-y-6">
            {/* ردیف اول: Activity Name و Code */}
            <div className="grid grid-cols-2 gap-6">
              <DynamicInput
                name="activityname"
                label={t("AddProgramTemplate.ActivityName")}
                type="text"
                value={formData.activityname}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="Code"
                label={t("AddProgramTemplate.Code")}
                type="text"
                value={formData.Code}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            {/* ردیف دوم: Responsible Post و Approval Flow */}
            <div className="grid grid-cols-2 gap-6">
              <DynamicSelector
                name="responsiblepost"
                label={t("AddProgramTemplate.ResponsiblePost")}
                options={roleOptions}
                selectedValue={formData.responsiblepost}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
                loading={isLoadingRoles}
              />
              <DynamicSelector
                name="approvalFlow"
                label={t("AddProgramTemplate.ApprovalFlow")}
                options={approvalFlowOptions}
                selectedValue={formData.approvalFlow}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
                loading={isLoadingRoles}
              />
            </div>
            {/* ردیف سوم: Duration و Lag */}
            <div className="grid grid-cols-2 gap-6">
              <DynamicInput
                name="duration"
                label={t("AddProgramTemplate.Duration")}
                type="number"
                value={formData.duration}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="lag"
                label={t("AddProgramTemplate.Lag")}
                type="number"
                value={formData.lag}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            {/* Program Type */}
            <DynamicSelector
              name="programtype"
              label={t("AddProgramTemplate.ProgramType")}
              options={programTypeOptions}
              selectedValue={formData.programtype}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />
            {/* Program Template */}
            <DynamicSelector
              label={t("AddProgramTemplate.ProgramTemplate")}
              options={programTemplateOptions}
              selectedValue={formData.programtemplate}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />
            {/* Activity Type */}
            <DynamicSelector
              name="activitytype"
              label={t("AddProgramTemplate.ActivityType")}
              options={activityTypeOptions}
              selectedValue={formData.activitytype}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />
            {/* Form Name */}
            <DynamicSelector
              name="formname"
              label={t("AddProgramTemplate.FormName")}
              options={formOptions}
              selectedValue={formData.formname}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />
            {/* Meta Data Selector */}
            <div className="mt-6 rounded-md">
              <ListSelector
                title={t("AddProgramTemplate.MetaData")}
                columnDefs={[{ field: "Name", headerName: "Name" }]}
                rowData={metaNames.map((m) => ({
                  ID: String(m.ID),
                  Name: m.Name,
                }))}
                selectedIds={selectedMetaIds}
                onSelectionChange={(ids) => setSelectedMetaIds(ids.map(String))}
                showSwitcher={false}
                isGlobal={false}
                ModalContentComponent={AddColumnForm}
                modalContentProps={{
                  onSave: (newField) => {
                    if (!newField) return;
                    const stringId = String(newField.ID);
                    const obj = { ID: stringId, Name: newField.Name };
                    setSelectedMetaIds((prev) =>
                      prev.includes(stringId) ? prev : [...prev, stringId]
                    );
                    setMetaValues((prev) => {
                      const exists = prev.find((m) => m.ID === stringId);
                      return exists ? prev : [...prev, obj];
                    });
                    setMetaNames((prev) => {
                      const exists = prev.find((m) => m.ID === stringId);
                      return exists ? prev : [...prev, obj];
                    });
                  },
                  onSuccessAdd: (newField) => {
                    if (!newField) return;
                    const stringId = String(newField.ID);
                    const obj = { ID: stringId, Name: newField.Name };
                    setSelectedMetaIds((prev) =>
                      prev.includes(stringId) ? prev : [...prev, stringId]
                    );
                    setMetaValues((prev) => {
                      const exists = prev.find((m) => m.ID === stringId);
                      return exists ? prev : [...prev, obj];
                    });
                    setMetaNames((prev) => {
                      const exists = prev.find((m) => m.ID === stringId);
                      return exists ? prev : [...prev, obj];
                    });
                  },
                  entityTypeId: formData.formname,
                }}
                loading={loadingMeta}
              />
            </div>
          </div>

          {/* ستون راست */}
          <div className="space-y-6">
            {/* Start و Finish */}
            <div className="grid grid-cols-2 gap-6">
              <DynamicInput
                name="start"
                label={t("AddProgramTemplate.Start")}
                type="text"
                value={formData.start}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="finish"
                label={t("AddProgramTemplate.Finish")}
                type="text"
                value={formData.finish}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            {/* Check List */}
            <DynamicSelector
              name="checkList"
              label={t("AddProgramTemplate.CheckList")}
              options={checkListOptions}
              selectedValue={formData.checkList}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />
            {/* Procedure */}
            <DynamicSelector
              name="procedure"
              label={t("AddProgramTemplate.Procedure")}
              options={procedureOptions}
              selectedValue={formData.procedure}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />
            {/* وزن‌ها */}
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="weight1"
                label={t("AddProgramTemplate.Weight1")}
                type="number"
                value={formData.weight1}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="weight2"
                label={t("AddProgramTemplate.Weight2")}
                type="number"
                value={formData.weight2}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="weight3"
                label={t("AddProgramTemplate.Weight3")}
                type="number"
                value={formData.weight3}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            {/* Approval Execution Weight و WF W2 و WF W3 */}
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="approvalToExecutionWeight"
                label={t("AddProgramTemplate.ApprovalExecution")}
                type="number"
                value={formData.approvalToExecutionWeight}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="wfW2"
                label={t("AddProgramTemplate.WFW2")}
                type="number"
                value={formData.wfW2}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="wfW3"
                label={t("AddProgramTemplate.WFW3")}
                type="number"
                value={formData.wfW3}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            {/* بودجه فعالیت */}
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="activityBudget1"
                label={t("AddProgramTemplate.ActivityBudget1")}
                type="number"
                value={formData.activityBudget1}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="activityBudget2"
                label={t("AddProgramTemplate.ActivityBudget2")}
                type="number"
                value={formData.activityBudget2}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="activityBudget3"
                label={t("AddProgramTemplate.ActivityBudget3")}
                type="number"
                value={formData.activityBudget3}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            {/* بودجه تأیید */}
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="approvalBudget1"
                label={t("AddProgramTemplate.ApprovalBudget1")}
                type="number"
                value={formData.approvalBudget1}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="approvalBudget2"
                label={t("AddProgramTemplate.ApprovalBudget2")}
                type="number"
                value={formData.approvalBudget2}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="approvalBudget3"
                label={t("AddProgramTemplate.ApprovalBudget3")}
                type="number"
                value={formData.approvalBudget3}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            {/* AF Duration و Program Duration */}
            <div className="grid grid-cols-2 gap-6">
              <DynamicInput
                name="afDuration"
                label={t("AddProgramTemplate.AFDuration")}
                type="number"
                value={formData.afDuration}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="programDuration"
                label={t("AddProgramTemplate.ProgramDuration")}
                type="number"
                value={formData.programDuration}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            {/* بودجه زیرمجموعه و هزینه‌های بعد */}
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="programExecutionBudget"
                label={t("AddProgramTemplate.ProgramExecBudget")}
                type="number"
                value={formData.programExecutionBudget}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="subCost2Act"
                label={t("AddProgramTemplate.SubCost2Act")}
                type="number"
                value={formData.subCost2Act}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="subCost3Act"
                label={t("AddProgramTemplate.SubCost3Act")}
                type="number"
                value={formData.subCost3Act}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="programApprovalBudget"
                label={t("AddProgramTemplate.ProgramApprovalBudget")}
                type="number"
                value={formData.programApprovalBudget}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="subCost2Apr"
                label={t("AddProgramTemplate.SubCost2Apr")}
                type="number"
                value={formData.subCost2Apr}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="subCost3Apr"
                label={t("AddProgramTemplate.SubCost3Apr")}
                type="number"
                value={formData.subCost3Apr}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            {/* Program To Plan Weight و W2SubProg و W3SubProg */}
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="programToPlanWeight"
                label={t("AddProgramTemplate.ProgramToPlanWeight")}
                type="number"
                value={formData.programToPlanWeight}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="w2SubProg"
                label={t("AddProgramTemplate.W2SubProg")}
                type="number"
                value={formData.w2SubProg}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="w3SubProg"
                label={t("AddProgramTemplate.W3SubProg")}
                type="number"
                value={formData.w3SubProg}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* footer با دکمه‌های Save/Update و Cancel */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-white pt-4 pb-2">
        <div className="flex justify-center gap-8">
          {editingRow ? (
            <button
              onClick={handleUpdate}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              {t("Global.Edit")}
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              {t("Global.Add")}
            </button>
          )}
          <button
            onClick={() => {
              setFormData(initialFormData);
              setSelectedMetaIds([]);
              setMetaValues([]);
              setMetaNames([]);
              if (onCancel) onCancel();
            }}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            {t("Global.Cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProgramTemplate;
