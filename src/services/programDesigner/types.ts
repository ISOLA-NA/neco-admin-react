// src/services/programDesigner/types.ts

// ================== Enums ==================

export enum PFIType {
  TPP = 1,
  FPP = 2,
  Form = 3,
  InFPP = 4,
}

export enum ChangeMode {
  None = 0,
  Add = 1,
  Edit = 2,
  Delete = 3,
}

export enum ConditionOperator {
  None = "None",
  and = "and",
  or = "or",
}

// ================== ردیف اصلی Program Designer (فرم Details) ==================

export interface SinglePFI {
  ID: number;
  GPIC: string | null;
  Name: string;
  PersianName: string;
  Address: string;
  Order: number;
  Code: string;
  Weight: number;
  WeightWF: number;
  WeightSubProg: number;
  PCostAct: number;
  PCostAprov: number;
  PCostSubAct: number;
  PCostSubAprov: number;
  nCalendarID: number | null;
  PredecessorInItem: string | null;
  PredecessorInSub: string | null;
  PredecessorOutItem: string | null;
  PredecessorOutSub: string | null;
  ActorId: string | null;
  DelayTime: number;
  ActDuration: number;
  nWFTemplateID: number | null;
  PFIType: PFIType;
  ChangeMode: ChangeMode;
  DatePlanStart: string | null;
  DatePlanEnd: string | null;
  DateMostStart: string | null;
  nEntityTypeID: number | null;
  nEntityCollectionID: number | null;
  nProgramTypeID: number | null;
  SubProgramMetaDataColumn: string | null;
  subProgramTemplateID: number | null;
  subProgramID: number | null;
  SubDuration: number;
  IsInheritMetaColumns: boolean | null;
  IsInheritMetaValues: boolean | null;
  IsHistory: boolean | null;
  metaJson: string | null;
}

// ================== بادی Add / Update ==================

export interface UpdateProgramFieldPayload {
  parentPfiId: number | null;
  parentGPIC: string | null;
  mainProgramId: number;
  pfi: SinglePFI;
}

// ================== ردیف جدول درختی (خروجی Command/GCMDZip) ==================

export interface ProgramDesignerRow {
  ID: string;
  "Activity Code": string;
  Order: string;
  "Activity Name": string;
  "Persian Activity Name": string;
  Duration: string;
  "Responsible Post": string;
  "Approval Flow": string;
  Lag: string;
  "Activity Type": string;
  "Form Name": string;
  Weight: string;
  "Activity Budget": string;
  "Approval to execution Weight (%)": string;
  "Approval Budjet": string;
  "AF Duration": string;
  "Program Type": string;
  "Program Duration": string;
  "Program Approval Budget": string;
  "Program Execution Budjet": string;
  "Program to plan Weight (%)": string;
  "Check LIST": string;
  Procedure: string;
  GPIC: string;
  PredecessorForItemStr: string;
  PredecessorForSubStr: string;
  PredecessorForItemNames: string;
  PredecessorForSubNames: string;
  ParrentIC: string | null;
}

// ================== Conditions (تب Conditions) ==================

export interface FormCondition {
  FieldID: number;
  ValueText: string;
  entityTypeId: number;
  predecessorId: number;
}

export interface ConditionsOfProgramDTO {
  ConditionOperator: ConditionOperator;
  ConditionOperatorInForms: ConditionOperator;
  ApprovalStatusTexts: string[];
  FormFieldsAndValues: FormCondition[];
}

// ================== Health Check (CheckValidation) ==================

export interface ProgramValidationResult {
  activityAllowedBudget: number;
  activityAssignedBudget: number;
  AFAllowedBudget: number;
  AFAssignedBudget: number;
  allowedDuration: number;
  assignedWeight: number;
  usedDuration: number;
}

// ================== Import / Export ==================

export interface ImportExcelTemplatePayload {
  FileID: string;
  IsForceEdit: boolean;
  PostID: string;
  ProgramID: number;
}

export interface ExcelTemplateFileInfo {
  FileName: string;
  FolderName: string;
}