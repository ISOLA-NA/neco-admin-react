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

interface AddProgramTemplateProps {
  selectedRow: ProgramTemplateItem | null;
  onSaved: () => void;
}


const ResponsiveForm: React.FC<AddProgramTemplateProps> = ({ selectedRow, onSaved }) => {
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
        console.log("reeeeeeeeeeee", response)
        const formatted = Object.entries(PFIType)
          .filter(([key, value]) => !Number.isNaN(Number(value))) // فقط مقادیر عددی
          .map(([key, value]) => ({
            value: String(value),  // عدد به عنوان رشته ذخیره میشه
            label: key             // "TPP", "FPP", ...
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

  // State management for form fields
  const [formData, setFormData] = useState({
    activityname: "NoName",
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
  });

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
        MetaValues: [],
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

          // انتخابی/nullable
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
          nEntityCollectionID: null,
          nProgramTypeID: null,
          subProgramID: null,
          nEntityTypeID: formData.formname ? Number(formData.formname) : null,

          // جدیدها
          IsInheritMetaColumns: null,
          IsInheritMetaValues: null,

          // بودجه و هزینه
          PCostAct: Number(formData.activityBudget1) || 0,
          PCostAprov: Number(formData.approvalBudget1) || 0,
          PCostSubAct: Number(formData.subCost2Act) || 0,
          PCostSubAprov: Number(formData.subCost2Apr) || 0,

          // وزن‌ها
          Weight1: Number(formData.weight1) || 0,
          Weight2: Number(formData.weight2) || 0,
          Weight3: Number(formData.weight3) || 0,
          WeightWF: Number(formData.programToPlanWeight) || 0,
          WeightSubProg: Number(formData.w2SubProg) || 0,

          // زمان‌ها
          DelayTime: 0,
          WFDuration: Number(formData.programDuration) || 0,
          SubDuration: 0,

          // نوع فعالیت (از enum یا رشته باید بیاد)
          PFIType: formData.activitytype
            ? Number(formData.activitytype)
            : 3, // مقدار پیش‌فرض = Form


          WorkData: null,
          SubProgramMetaDataColumn: ""

        }
      };

      await api.insertProgramTemplateField(payload);
      showAlert("success", null, "Saved", "Program field added successfully.");
      onSaved(); 
      // بستن Modal یا ریست فرم
    } catch (error) {
      console.error("Error saving:", error);
      showAlert("error", null, "Error", "Failed to save field.");
    }
    
  };
  


  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          {/* Activity Name */}
          <div className="mt-1">
            <DynamicInput
              type="text"
              value={formData.activityname}
              name="activityname"
              onChange={handleChange}
            />
          </div>

          {/* Responsible Post - Approval Flow */}
          <div className="mb-4 flex gap-4 items-end">
            <div className="flex-1 mt-4">
              <DynamicSelector
                name="responsiblepost"
                options={roles}
                selectedValue={formData.responsiblepost}
                onChange={handleChange}
                label="Responsible Post"
              />
            </div>
            <div className="flex-1">
              <DynamicSelector
                name="approvalFlow"
                options={approvalFlowOptions}
                selectedValue={formData.approvalFlow}
                onChange={handleChange}
                label="Approval flow"
              />
            </div>
          </div>

          {/* Duration - Lag */}
          <div className="mb-4 flex gap-4 items-end">
            <div className="flex-1 mt-4">
              <DynamicInput
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <DynamicInput
                name="lag"
                type="number"
                value={formData.lag}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Program type */}
          <div className="mb-4">
            <DynamicSelector
              name="programtype"
              options={programtypeOptions}
              selectedValue={formData.programtype}
              onChange={handleChange}
              label="Program type"
            />
          </div>

          {/* Program Template */}
          <div className="mb-4 mt-10">
            <DynamicSelector
              name="programtemplate"
              options={programTemplateOptions}
              selectedValue={formData.programtemplate}
              onChange={handleChange}
              label="Program Template"
            />
          </div>

          {/* Activity Type */}
          <div className="mb-4 mt-10">
            <DynamicSelector
              name="activitytype"
              options={activityTypes}
              selectedValue={formData.activitytype}
              onChange={handleChange}
              label="Activity Type"
            />
          </div>

          {/* Form name */}
          <div className="mb-4 mt-10">
            <DynamicSelector
              name="formname"
              options={forms}
              selectedValue={formData.formname}
              onChange={handleChange}
              label="Form name"
            />
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Start - Finish */}
          <div className="mb-4 flex gap-4 items-end">
            <div className="flex-1 mt-1">
              <DynamicInput
                name="start"
                type="text"
                value={formData.start}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <DynamicInput
                name="finish"
                type="text"
                value={formData.finish}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Check list */}
          <div className="mb-4">
            <DynamicSelector
              name="checkList"
              options={checkListOptions}
              selectedValue={formData.checkList}
              onChange={handleChange}
              label="checkList"
            />
          </div>

          {/* Procedure */}
          <div className="mb-4 mt-10">
            <DynamicSelector
              name="procedure"
              options={procedureOptions}
              selectedValue={formData.procedure}
              onChange={handleChange}
              label="Procedure"
            />
          </div>

          {/* Weights */}
          <div className="mb-4 flex gap-4 items-end">
            <div className="flex-1 mt-4">
              <DynamicInput
                name="weight1"
                type="number"
                value={formData.weight1}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <DynamicInput
                name="weight2"
                type="number"
                value={formData.weight2}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <DynamicInput
                name="weight3"
                type="number"
                value={formData.weight3}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Approval to Execution Weight, WF W2, WF W3 */}
          <div className="mb-4 flex gap-4 items-end">
            <div className="flex-1 ">
              <DynamicInput
                name="approvalToExecutionWeight"
                type="number"
                value={formData.approvalToExecutionWeight}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <DynamicInput
                name="wfW2"
                type="number"
                value={formData.wfW2}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <DynamicInput
                name="wfW3"
                type="number"
                value={formData.wfW3}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Activity Budgets */}
          <div className="mb-4 flex gap-4 items-end">
            <div className="flex-1">
              <DynamicInput
                name="activityBudget1"
                type="number"
                value={formData.activityBudget1}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <DynamicInput
                name="activityBudget2"
                type="number"
                value={formData.activityBudget2}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <DynamicInput
                name="activityBudget3"
                type="number"
                value={formData.activityBudget3}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Approval Budgets */}
          <div className="mb-4 flex gap-4 items-end">
            <div className="flex-1">
              <DynamicInput
                name="approvalBudget1"
                type="number"
                value={formData.approvalBudget1}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <DynamicInput
                name="approvalBudget2"
                type="number"
                value={formData.approvalBudget2}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <DynamicInput
                name="approvalBudget3"
                type="number"
                value={formData.approvalBudget3}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* AF Duration, Program Duration */}
          <div className="mb-4 flex gap-4 items-end">
            <div className="flex-1">
              <DynamicInput
                name="afDuration"
                type="number"
                value={formData.afDuration}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <DynamicInput
                name="programDuration"
                type="number"
                value={formData.programDuration}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Program Execution Budget */}
          <div className="mb-4">
            <DynamicInput
              name="programExecutionBudget"
              type="number"
              value={formData.programExecutionBudget}
              onChange={handleChange}
            />
          </div>

          {/* Program Approval Budget */}
          <div className="mb-4">
            <DynamicInput
              name="programApprovalBudget"
              type="number"
              value={formData.programApprovalBudget}
              onChange={handleChange}
            />
          </div>

          {/* Program to plan weight */}
          <div className="mb-4">
            <DynamicInput
              name="programToPlanWeight"
              type="number"
              value={formData.programToPlanWeight}
              onChange={handleChange}
            />
          </div>

          {/* SubCosts and W2, W3 SubProg */}
          <div className="mb-4 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <DynamicInput
                name="subCost2Act"
                type="number"
                value={formData.subCost2Act}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <DynamicInput
                name="subCost2Apr"
                type="number"
                value={formData.subCost2Apr}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <DynamicInput
                name="subCost3Act"
                type="number"
                value={formData.subCost3Act}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <DynamicInput
                name="subCost3Apr"
                type="number"
                value={formData.subCost3Apr}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <DynamicInput
                name="w2SubProg"
                type="number"
                value={formData.w2SubProg}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <DynamicInput
                name="w3SubProg"
                type="number"
                value={formData.w3SubProg}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-8 gap-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => {
            // این تابع باید Modal را ببنده (با استفاده از prop یا context)
          }}
        >
          Cancel
        </button>
      </div>

    </div>
  );
};

export default ResponsiveForm;
