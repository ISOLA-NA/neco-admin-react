// src/components/Programs/ProgramTemplate/HealthCheckPanel.tsx

import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { ProgramValidationResult } from "../../../services/programDesigner/types";

interface HealthCheckPanelProps {
  result: ProgramValidationResult;
}

/**
 * ⚠️ در پاسخ سرور (CheckValidation) مقداری برای "Required Weight" وجود ندارد.
 * طبق مشاهده‌ی رفتار نسخه‌ی ویندوزی و تأییدهای گرفته‌شده، فعلاً این مقدار
 * را ثابت ۱ در نظر می‌گیریم. اگر بعداً منبع دقیقش کشف شد (مثلاً محاسبه‌شده
 * از یک فیلد دیگر)، فقط همین مقدار باید جایگزین شود؛ بقیه‌ی منطق دست نمی‌خورد.
 */
const REQUIRED_WEIGHT = 1;

interface HealthCheckRow {
  assignedLabel: string;
  assignedValue: number;
  limitLabel: string;
  limitValue: number;
  isOk: boolean;
}

const HealthCheckPanel: React.FC<HealthCheckPanelProps> = ({ result }) => {
  const rows: HealthCheckRow[] = [
    {
      assignedLabel: "Used Duration",
      assignedValue: result.usedDuration,
      limitLabel: "Allowed Duration",
      limitValue: result.allowedDuration,
      // Duration/Budget: اگر Assigned بیشتر از Allowed باشد ❌
      isOk: result.usedDuration <= result.allowedDuration,
    },
    {
      assignedLabel: "Assigned Weight",
      assignedValue: result.assignedWeight,
      limitLabel: "Required Weight",
      limitValue: REQUIRED_WEIGHT,
      // Weight: اگر Assigned کمتر از Required باشد ❌
      isOk: result.assignedWeight >= REQUIRED_WEIGHT,
    },
    {
      assignedLabel: "Activity Assigned Budget",
      assignedValue: result.activityAssignedBudget,
      limitLabel: "Activity Allowed Budget",
      limitValue: result.activityAllowedBudget,
      isOk: result.activityAssignedBudget <= result.activityAllowedBudget,
    },
    {
      assignedLabel: "AF Assigned Budget",
      assignedValue: result.AFAssignedBudget,
      limitLabel: "AF Allowed Budget",
      limitValue: result.AFAllowedBudget,
      isOk: result.AFAssignedBudget <= result.AFAllowedBudget,
    },
  ];

  return (
    <div
      dir="ltr"
      className="mb-3 inline-grid grid-cols-[auto_auto_auto_auto_auto] gap-x-3 gap-y-1.5 items-center rounded-lg border border-purple-200 bg-white p-3 text-sm"
    >
      {rows.map((row) => (
        <React.Fragment key={row.assignedLabel}>
          {row.isOk ? (
            <CheckCircleIcon
              sx={{ fontSize: 16 }}
              className="text-green-600 shrink-0"
            />
          ) : (
            <CancelIcon
              sx={{ fontSize: 16 }}
              className="text-red-500 shrink-0"
            />
          )}
          <span className="text-gray-700 whitespace-nowrap">
            {row.assignedLabel}:
          </span>
          <span className="font-medium text-purple-700 whitespace-nowrap">
            {row.assignedValue}
          </span>
          <span className="text-gray-700 whitespace-nowrap">
            {row.limitLabel}:
          </span>
          <span className="font-medium text-gray-800 whitespace-nowrap">
            {row.limitValue}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default HealthCheckPanel;
