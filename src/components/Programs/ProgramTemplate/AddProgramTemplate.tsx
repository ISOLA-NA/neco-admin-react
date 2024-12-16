import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";

const ResponsiveForm: React.FC = () => {
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

  // Sample options for selectors
  const responsiblePostOptions = [
    { value: "manager", label: "Manager" },
    { value: "developer", label: "Developer" },
    { value: "designer", label: "Designer" },
  ];

  const approvalFlowOptions = [
    { value: "initial", label: "Initial Approval" },
    { value: "secondary", label: "Secondary Approval" },
    { value: "final", label: "Final Approval" },
  ];

  const checkListOptions = [
    { value: "check1", label: "Check 1" },
    { value: "check2", label: "Check 2" },
    { value: "check3", label: "Check 3" },
  ];

  const procedureOptions = [
    { value: "procedure1", label: "Procedure 1" },
    { value: "procedure2", label: "Procedure 2" },
    { value: "procedure3", label: "Procedure 3" },
  ];

  const programtypeOptions = [
    { value: "program1", label: "Program 1" },
    { value: "program2", label: "Program 2" },
    { value: "program3", label: "Program 3" },
  ];

  const programtemplateOptions = [
    { value: "template1", label: "Template 1" },
    { value: "template2", label: "Template 2" },
    { value: "template3", label: "Template 3" },
  ];

  const activitytypeOptions = [
    { value: "type1", label: "Type 1" },
    { value: "type2", label: "Type 2" },
    { value: "type3", label: "Type 3" },
  ];

  const formnameOptions = [
    { value: "formA", label: "Form A" },
    { value: "formB", label: "Form B" },
    { value: "formC", label: "Form C" },
  ];

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
                options={responsiblePostOptions}
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
              options={programtemplateOptions}
              selectedValue={formData.programtemplate}
              onChange={handleChange}
              label="Program Template"
            />
          </div>

          {/* Activity Type */}
          <div className="mb-4 mt-10">
            <DynamicSelector
              name="activitytype"
              options={activitytypeOptions}
              selectedValue={formData.activitytype}
              onChange={handleChange}
              label="Activity Type"
            />
          </div>

          {/* Form name */}
          <div className="mb-4 mt-10">
            <DynamicSelector
              name="formname"
              options={formnameOptions}
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
    </div>
  );
};

export default ResponsiveForm;
