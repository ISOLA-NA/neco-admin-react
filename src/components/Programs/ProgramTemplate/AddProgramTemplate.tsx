import React, { useEffect, useState } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import {
  useApi,
  ApprovalChecklist,
  ProgramType,
} from "../../../context/ApiContext";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import { PFIType, ProgramTemplateItem } from "../../../services/api.services";
import AddColumnForm from "../../Forms/AddForm";
import ListSelector from "../../ListSelector/ListSelector";

interface AddProgramTemplateProps {
  selectedRow: ProgramTemplateItem | null;
  onSaved: () => void;
  onSuccessAdd?: (newItem: { ID: number; Name: string }) => void;
  editingRow?: any;
  onCancel?: () => void;
}

const ResponsiveForm: React.FC<AddProgramTemplateProps> = ({
  selectedRow,
  onSaved,
  editingRow,
  onCancel,
}) => {
  // 👇 مقدار اولیه فرم را یکجا تعریف کن
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
  };

  const [formData, setFormData] = useState(initialFormData);

  const api = useApi();

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

  const [metaValues, setMetaValues] = useState<any[]>([]);
  const [metaNames, setMetaNames] = useState<{ ID: string; Name: string }[]>(
    []
  );

  const [selectedMetaIds, setSelectedMetaIds] = useState<string[]>([]);
  const [programTemplateField, setProgramTemplateField] = useState<any>({
    SubProgramMetaDataColumn: "",
  });

  useEffect(() => {
    const mapped = selectedMetaIds
      .map((id) => {
        const match = metaValues.find((item) => String(item.ID) === String(id));
        return match
          ? { ID: id, Name: match.DisplayName || match.Name || "" }
          : null;
      })
      .filter(Boolean) as { ID: string; Name: string }[];

    setMetaNames(mapped);
  }, [selectedMetaIds, metaValues]);

  useEffect(() => {
    setProgramTemplateField((prev: any) => ({
      ...prev,
      SubProgramMetaDataColumn: selectedMetaIds.join("|") + "|",
    }));
  }, [selectedMetaIds]);

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const result = await api.getAllEntityCollection();
        console.log("Fetched procedures:", result);
        const formatted = result.map((item: any) => ({
          value: String(item.ID),
          label: item.Name,
        }));
        console.log("Formatted procedure options:", formatted);
        setProcedures(formatted);
      } catch (error) {
        console.error("Failed to fetch procedures:", error);
      }
    };

    fetchProcedures();
  }, []);

  useEffect(() => {
    const fetchProgramTypes = async () => {
      try {
        const result = await api.getAllProgramType();
        console.log("📦 Program types from API:", result);
        setProgramTypes(result);
      } catch (error) {
        console.error("❌ Failed to fetch program types:", error);
      }
    };

    fetchProgramTypes();
  }, []);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const result = await api.getApprovalCheckList();
        setChecklists(result);
      } catch (error) {
        console.error("Failed to fetch checklists", error);
      }
    };

    fetchChecklists();
  }, []);

  useEffect(() => {
    const fetchProgramTemplates = async () => {
      try {
        const result = await api.getAllProgramTemplates();
        setProgramTemplates(result);
      } catch (error) {
        console.error("خطا در دریافت Program Templates:", error);
      }
    };

    fetchProgramTemplates();
  }, []);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const result = await api.getTableTransmittal();
        const formatted = result.map((form: any) => ({
          value: String(form.ID),
          label: form.Name,
        }));
        setForms(formatted);
      } catch (error) {
        console.error("Failed to fetch forms", error);
      }
    };
    fetchForms();
  }, []);

  useEffect(() => {
    const fetchActivityTypes = async () => {
      try {
        const response = await api.getEnum({ str: "PFIType" });
        console.log("reeeeeeeeeeee", response);
        const formatted = Object.entries(response)
          .filter(([key, value]) => !Number.isNaN(Number(value)))
          .map(([key, value]) => ({
            value: String(value),
            label: key,
          }));
        setActivityTypes(formatted);

        console.log("formatted", formatted);
      } catch (error) {
        console.error("Error fetching activity types:", error);
      }
    };

    fetchActivityTypes();
  }, []);

  useEffect(() => {
    api
      .getAllWfTemplate()
      .then((res) => setWfTemplates(res))
      .catch((err) => console.error("Failed to load Approval Flows:", err));
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const result = await api.getAllRoles(); // فرض بر این که چنین تابعی وجود دارد
        const formattedRoles = result.map((role: any) => ({
          value: role.ID, // یا role.Name اگر فقط name داری
          label: role.Name,
        }));
        setRoles(formattedRoles);
      } catch (error) {
        console.error("خطا در دریافت نقش‌ها:", error);
      }
    };

    fetchRoles();
  }, []);

  // Handler for input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const approvalFlowOptions = wfTemplates.map((item) => ({
    value: String(item.ID),
    label: item.Name,
  }));

  const programTemplateOptions = programTemplates.map((item) => ({
    value: String(item.ID),
    label: item.Name,
  }));

  const checkListOptions = checklists.map((item) => ({
    value: String(item.ID),
    label: item.Name,
  }));

  const programtypeOptions = programTypes.map((item) => ({
    value: String(item.ID),
    label: item.Name,
  }));

  const procedureOptions = procedures.map((item) => ({
    value: String(item.value),
    label: item.label,
  }));

  const handleSave = async () => {
    try {
      if (!formData.activityname) {
        showAlert("warning", null, "Validation", "Name is required");
        return;
      }

      const payload = {
        MetaValues: metaValues, // لیست کامل متافیلدها

        PFI: {
          ID: 0,
          IsVisible: true,
          LastModified: null,

          // الزامی
          Name: formData.activityname,
          ActDuration: Number(formData.duration) || 0,
          Left: Number(formData.start) || 0,
          Top: Number(formData.finish) || 0,
          Order: 0,

          // انتخابی / nullable
          Code: "",
          GPIC: null,
          ParrentIC: null,
          PredecessorForItemStr: "",
          PredecessorForSubStr: "",

          nProgramTemplateID: selectedRow?.ID,
          nPostId: formData.responsiblepost || null,
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

          // جدیدها
          IsInheritMetaColumns: null,
          IsInheritMetaValues: null,

          // بودجه و هزینه
          PCostAct: Number(formData.activityBudget1) || 0,
          PCostAprov: Number(formData.approvalBudget1) || 0,
          PCostSubAct: Number(formData.programExecutionBudget) || 0,
          PCostSubAprov: Number(formData.programApprovalBudget) || 0,

          // وزن‌ها
          Weight1: Number(formData.weight1) || 0,
          Weight2: Number(formData.weight2) || 0,
          Weight3: Number(formData.weight3) || 0,
          WeightWF: Number(formData.approvalToExecutionWeight) || 0,
          WeightSubProg: Number(formData.programToPlanWeight) || 0,

          // زمان‌ها
          DelayTime: 0,
          WFDuration: Number(formData.programDuration) || 0,
          SubDuration: 0,

          // نوع فعالیت
          PFIType: formData.activitytype ? Number(formData.activitytype) : 3,

          // متادیتای انتخاب شده
          SubProgramMetaDataColumn:
            programTemplateField.SubProgramMetaDataColumn || "",
        },
      };

      console.log("nPostId before send:", formData.responsiblepost);

      await api.insertProgramTemplateField(payload);
      showAlert("success", null, "Saved", "Program field added successfully.");
      onSaved();
      setFormData(initialFormData); // ✅ پاکسازی فرم بعد از Save
      setSelectedMetaIds([]); // ✅ پاکسازی انتخاب‌های متادیتا
      setMetaValues([]);
      setMetaNames([]);
    } catch (error) {
      console.error("Error saving:", error);
      showAlert("error", null, "Error", "Failed to save field.");
    }
  };

  const handleMetaFieldSave = (newField?: { ID: number; Name: string }) => {
    if (!newField || !newField.ID || !newField.Name) return;

    const newId = newField.ID.toString();

    // فقط وقتی اضافه نشده باشه
    setSelectedMetaIds((prev) => {
      const updated = prev.includes(newId) ? prev : [...prev, newId];
      return updated;
    });

    // اضافه به metaValues
    setMetaValues((prev) => {
      const exists = prev.find((m) => m.ID === newField.ID);
      return exists ? prev : [...prev, newField];
    });

    // اضافه به metaNames
    setMetaNames((prev) => {
      const exists = prev.find((m) => m.ID === newId);
      return exists ? prev : [...prev, { ID: newId, Name: newField.Name }];
    });
  };

  const handleUpdate = async () => {
    try {
      if (!formData.activityname) {
        showAlert("warning", null, "Validation", "Name is required");
        return;
      }

      // ساخت payload مطابق نیاز API برای ویرایش
      const payload = {
        MetaValues: metaValues, // متافیلدها

        PFI: {
          ...editingRow, // شناسه و سایر اطلاعات
          Name: formData.activityname,
          ActDuration: Number(formData.duration) || 0,
          Left: Number(formData.start) || 0,
          Top: Number(formData.finish) || 0,
          nProgramTemplateID: selectedRow?.ID,
          nPostId: formData.responsiblepost || null,
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
          PFIType: Number(formData.activitytype) || 3, // همیشه عدد یا ۳
          SubProgramMetaDataColumn:
            programTemplateField.SubProgramMetaDataColumn || "",
          // هر چیزی که نیاز باشد اضافه کن...
        },
      };

      console.log("ppppp", payload.PFI);

      console.log("nPostId before update:", formData.responsiblepost);

      await api.updateProgramTemplateField(payload); // کال به API ویرایش

      showAlert(
        "success",
        null,
        "Updated",
        "Program field updated successfully."
      );

      setFormData(initialFormData); // ✅ پاکسازی فرم بعد از Save
      setSelectedMetaIds([]); // ✅ پاکسازی انتخاب‌های متادیتا
      setMetaValues([]);
      setMetaNames([]);
      if (onSaved) onSaved();
      if (onCancel) onCancel(); // مودال بسته شود
    } catch (error) {
      console.error("Error updating:", error);
      showAlert("error", null, "Error", "Failed to update field.");
    }
  };

  useEffect(() => {
    if (editingRow) {
      console.log("🔧 editingRow دریافت شد:", editingRow);

      // مقداردهی اولیه فرم
      setFormData({
        activityname: editingRow.Name || "",
        responsiblepost: editingRow.nPostId ? String(editingRow.nPostId) : "",
        approvalFlow: editingRow.nWFTemplateID
          ? String(editingRow.nWFTemplateID)
          : "",
        checkList: editingRow.checkList || "",
        duration: editingRow.ActDuration ? String(editingRow.ActDuration) : "1",
        lag: editingRow.lag || "0",
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
      });

      // متادیتا
      console.log(
        "🟡 SubProgramMetaDataColumn →",
        editingRow.SubProgramMetaDataColumn
      );

      if (editingRow.SubProgramMetaDataColumn) {
        const metaIds =
          editingRow.SubProgramMetaDataColumn.split("|").filter(Boolean);

        console.log("🟡 Extracted metaIds →", metaIds);

        setSelectedMetaIds(metaIds);

        const fetchMetaData = async () => {
          try {
            const fetched = await Promise.all(
              metaIds.map(async (id) => {
                console.log("📡 Fetching meta for ID:", id);
                try {
                  const res = await api.getEntityFieldById(Number(id));
                  console.log("rrrrrrrrrrrrrrrrrrr", res);
                  return {
                    ID: String(res.ID),
                    Name: res.DisplayName || "",
                  };
                } catch (err) {
                  console.error("❌ Error fetching metadata for ID:", id, err);
                  return null;
                }
              })
            );

            const validMeta = fetched.filter(Boolean) as {
              ID: string;
              Name: string;
            }[];

            console.log("🟢 metaNames →", validMeta);

            setMetaValues(validMeta);
            setMetaNames(validMeta);

            console.log(
              "🎯 rowData for ListSelector →",
              validMeta.map((m) => ({ ID: String(m.ID), Name: m.Name }))
            );
          } catch (err) {
            console.error("❌ خطای کلی در دریافت متادیتا:", err);
          }
        };

        fetchMetaData();
      } else {
        setSelectedMetaIds([]);
        setMetaValues([]);
        setMetaNames([]);
      }
    } else {
      // حالت افزودن جدید
      setFormData(initialFormData);
      setSelectedMetaIds([]);
      setMetaValues([]);
      setMetaNames([]);
    }
  }, [editingRow, selectedRow]);

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* محتوا (اسکرول بالا/پایین) */}
      <div className="flex-1 px-2 sm:px-4 py-6 overflow-auto">
        <div className="grid grid-cols-2 gap-x-8 gap-y-8">
          {/* ستون چپ */}
          <div className="space-y-6">
            {/* ردیف‌ها */}
            <div className="grid grid-cols-2 gap-6">
              <DynamicInput
                name="activityname"
                type="text"
                value={formData.activityname}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="code"
                type="text"
                value={formData.code || ""}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <DynamicSelector
                name="responsiblepost"
                label="Responsible Post"
                options={roles}
                selectedValue={formData.responsiblepost}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicSelector
                name="approvalFlow"
                label="Approval flow"
                options={approvalFlowOptions}
                selectedValue={formData.approvalFlow}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <DynamicInput
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="lag"
                type="number"
                value={formData.lag}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            <DynamicSelector
              name="programtype"
              label="Program type"
              options={programtypeOptions}
              selectedValue={formData.programtype}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />
            <DynamicSelector
              name="programtemplate"
              label="Program Template"
              options={programTemplateOptions}
              selectedValue={formData.programtemplate}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />
            <DynamicSelector
              name="activitytype"
              label="Activity Type"
              options={activityTypes}
              selectedValue={formData.activitytype}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />
            <DynamicSelector
              name="formname"
              label="Form name"
              options={forms}
              selectedValue={formData.formname}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />

            {/* Meta Data با فاصله بالاتر */}
            <div className="mt-6 rounded-md">
              <ListSelector
                title="Meta Data"
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
                  onSave: handleMetaFieldSave,
                  onSuccessAdd: handleMetaFieldSave,
                  onClose: () => {},
                  entityTypeId: formData.formname,
                }}
              />
            </div>
          </div>

          {/* ستون راست */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <DynamicInput
                name="start"
                type="text"
                value={formData.start}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="finish"
                type="text"
                value={formData.finish}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            <DynamicSelector
              name="checkList"
              label="Check list"
              options={checkListOptions}
              selectedValue={formData.checkList}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />
            <DynamicSelector
              name="procedure"
              label="Procedure"
              options={procedureOptions}
              selectedValue={formData.procedure}
              onChange={handleChange}
              className="w-full h-12 rounded-md"
            />

            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="weight1"
                type="number"
                value={formData.weight1}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="weight2"
                type="number"
                value={formData.weight2}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="weight3"
                type="number"
                value={formData.weight3}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="Approval Execution"
                type="number"
                value={formData.approvalToExecutionWeight}
                onChange={handleChange}
                className="w-full h-12 rounded-md "
              />
              <DynamicInput
                name="wfW2"
                type="number"
                value={formData.wfW2}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="wfW3"
                type="number"
                value={formData.wfW3}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="activityBudget1"
                type="number"
                value={formData.activityBudget1}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="activityBudget2"
                type="number"
                value={formData.activityBudget2}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="activityBudget3"
                type="number"
                value={formData.activityBudget3}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="approvalBudget1"
                type="number"
                value={formData.approvalBudget1}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="approvalBudget2"
                type="number"
                value={formData.approvalBudget2}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="approvalBudget3"
                type="number"
                value={formData.approvalBudget3}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>

            {/* ردیف afDuration/programDuration دو‌ستون */}
            <div className="grid grid-cols-2 gap-6">
              <DynamicInput
                name="afDuration"
                type="number"
                value={formData.afDuration}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="programDuration"
                type="number"
                value={formData.programDuration}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="programExecutionBudget"
                type="number"
                value={formData.programExecutionBudget}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="subCost2Act"
                type="number"
                value={formData.subCost2Act}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="subCost3Act"
                type="number"
                value={formData.subCost3Act}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="programApprovalBudget"
                type="number"
                value={formData.programApprovalBudget}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="subCost2Apr"
                type="number"
                value={formData.subCost2Apr}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="subCost3Apr"
                type="number"
                value={formData.subCost3Apr}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <DynamicInput
                name="programToPlanWeight"
                type="number"
                value={formData.programToPlanWeight}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="w2SubProg"
                type="number"
                value={formData.w2SubProg}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
              <DynamicInput
                name="w3SubProg"
                type="number"
                value={formData.w3SubProg}
                onChange={handleChange}
                className="w-full h-12 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* footer کاملاً چسبیده */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-white pt-4 pb-2">
        <div className="flex justify-center gap-8">
          {editingRow ? (
            <button
              onClick={handleUpdate}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Update
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Save
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
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveForm;
