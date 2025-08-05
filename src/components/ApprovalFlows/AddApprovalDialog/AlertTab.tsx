// AlertTab.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import AppServices, {
  AlertingWfTemplateItem,
  Role,
} from "../../../services/api.services";
import DataTable from "../../TableDynamic/DataTable";

type AlertObj = {
  SensitiveItemWFTemp: string;
  Duration: string;
  SensitivityWFTemp: string;
  WFState: string;
  nPostID: string;
  sendType: string;
  Comment: string;
  nWFBoxTemplateId: string;
};

type AlertTabProps = {
  /** شناسهٔ جعبهٔ کاری (WFBoxTemplate) – در حالت Edit مقدار >0 است */
  nWFBoxTemplateId: number;
};

/** لیست ثابت برای Time-Based Alert */
const sensitiveItemWFTempList = [
  { value: "2", Name: "DateComplete" },
  { value: "1", Name: "DateRun" },
];
/** لیست ثابت برای Change-Based Alert */
const sensitivityWFTempList = [{ value: "0", Name: "Status" }];

export default function AlertTab({ nWFBoxTemplateId }: AlertTabProps) {
  /** اگر prop غیرصفر باشد یعنی در حالت Edit هستیم و BoxTemplate قفل است */
  const isFixedBoxTemplate = nWFBoxTemplateId > 0;

  const [oldVersion, setOldVersion] = useState(true);
  const [newVersion, setNewVersion] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [boxTemplates, setBoxTemplates] = useState<
    { ID: number; Name: string }[]
  >([]);

  const [alertObj, setAlertObj] = useState<AlertObj>({
    SensitiveItemWFTemp: "",
    Duration: "",
    SensitivityWFTemp: "",
    WFState: "",
    nPostID: "",
    sendType: "",
    Comment: "",
    nWFBoxTemplateId: nWFBoxTemplateId.toString(),
  });

  const [rows, setRows] = useState<AlertObj[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // --- بارگذاری نقش‌ها، BoxTemplateها و هشدارهای موجود ---
  useEffect(() => {
    AppServices.getAllRoles().then(setRoles).catch(console.error);

    // اگر صرفاً برای نمایش در حالت Edit لازم باشد، همین یک آیتم کافی است
    AppServices.getAllBoxTemplatesByWfTemplateId(16)
      .then(setBoxTemplates)
      .catch(console.error);
  }, []);

  // هر بار که ID جعبه عوض شد (مثلاً بین Add و Edit سوییچ شد)
  useEffect(() => {
    setAlertObj((prev) => ({
      ...prev,
      nWFBoxTemplateId: nWFBoxTemplateId.toString(),
    }));

    // دریافت هشدارهای موجود برای این BoxTemplate
    if (nWFBoxTemplateId) {
      AppServices.getAllAlertingWfTemplateByWFBoxTemplateId(nWFBoxTemplateId)
        .then((data) =>
          setRows(
            data.map((item) => ({
              SensitiveItemWFTemp: item.SensitiveItemWFTemp?.toString() || "",
              Duration: item.Duration?.toString() || "",
              SensitivityWFTemp: item.SensitivityWFTemp?.toString() || "",
              WFState: item.WFState?.toString() || "",
              nPostID: item.nPostID,
              sendType: item.SendType?.toString() || "",
              Comment: item.Comment || "",
              nWFBoxTemplateId: item.nWFBoxTemplateId.toString(),
            }))
          )
        )
        .catch(console.error);
    } else {
      setRows([]);
    }
  }, [nWFBoxTemplateId]);

  const handleChange =
    (key: keyof AlertObj) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setAlertObj((prev) => ({ ...prev, [key]: e.target.value }));
    };

  // --- افزودن ردیف جدید ---
  const handleAdd = async () => {
    /** در حالت Edit همیشه از prop استفاده می‌کنیم؛ در غیر این صورت از فرم */
    const finalBoxTemplateId = isFixedBoxTemplate
      ? nWFBoxTemplateId
      : parseInt(alertObj.nWFBoxTemplateId, 10);

    const payload: AlertingWfTemplateItem = {
      Duration: oldVersion ? parseInt(alertObj.Duration, 10) : 0,
      SensitiveItemWFTemp: oldVersion
        ? parseInt(alertObj.SensitiveItemWFTemp, 10)
        : 0,
      SensitivityWFTemp: newVersion
        ? parseInt(alertObj.SensitivityWFTemp, 10)
        : 0,
      WFState: newVersion ? parseInt(alertObj.WFState, 10) : 0,
      SendType: parseInt(alertObj.sendType, 10),
      nPostTypeID: null,
      nPostID: alertObj.nPostID,
      nWFBoxTemplateId: finalBoxTemplateId,
      Comment: alertObj.Comment,
      IsVisible: true,
      ModifiedById: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    };

    try {
      await AppServices.insertAlertingWfTemplate(payload);

      // سطر جدید در جدول
      const newRow: AlertObj = {
        ...alertObj,
        nWFBoxTemplateId: finalBoxTemplateId.toString(),
      };
      setRows((prev) => [...prev, newRow]);

      // ریست فرم (به جز nWFBoxTemplateId در حالت Edit)
      setAlertObj({
        SensitiveItemWFTemp: "",
        Duration: "",
        SensitivityWFTemp: "",
        WFState: "",
        nPostID: "",
        sendType: "",
        Comment: "",
        nWFBoxTemplateId: finalBoxTemplateId.toString(),
      });
    } catch (err: any) {
      if (err.response?.data?.errors) console.error(err.response.data.errors);
      else console.error(err);
    }
  };

  const handleDeleteRow = (idx: number | null) => {
    if (idx === null) return;
    setRows((prev) => prev.filter((_, i) => i !== idx));
    setSelectedRowIndex(null);
  };

  // --- ستون‌های جدول ---
  const columnDefs = [
    { headerName: "Sensitive Item", field: "SensitiveItemWFTemp" },
    { headerName: "Day", field: "Duration" },
    { headerName: "Sensitivity", field: "SensitivityWFTemp" },
    { headerName: "Step", field: "WFState" },
    { headerName: "Send Type", field: "sendType" },
    {
      headerName: "Receiver",
      field: "nPostID",
      valueGetter: (p: any) =>
        roles.find((r) => r.ID === p.data.nPostID)?.Name || "",
    },
    {
      headerName: "Box Template",
      field: "nWFBoxTemplateId",
      valueGetter: (p: any) =>
        boxTemplates.find((bt) => bt.ID === +p.data.nWFBoxTemplateId)?.Name ||
        "",
    },
    { headerName: "Comment", field: "Comment" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* ــــــــــــــ Time-Based / Change-Based ــــــــــــــ */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <label className="flex items-center space-x-1">
          <input
            type="radio"
            name="version"
            checked={oldVersion}
            onChange={() => {
              setOldVersion(true);
              setNewVersion(false);
            }}
            className="form-radio"
          />
          <span>Time Based</span>
        </label>

        <select
          value={alertObj.SensitiveItemWFTemp}
          onChange={handleChange("SensitiveItemWFTemp")}
          disabled={!oldVersion}
          className="w-full border rounded px-2 py-1 disabled:bg-gray-100"
        >
          <option value="" hidden>
            Time Field
          </option>
          {sensitiveItemWFTempList.map((item) => (
            <option key={item.value} value={item.value}>
              {item.Name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="days"
          value={alertObj.Duration}
          onChange={handleChange("Duration")}
          disabled={!oldVersion}
          className="w-full border rounded px-2 py-1 disabled:bg-gray-100"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <label className="flex items-center space-x-1">
          <input
            type="radio"
            name="version"
            checked={newVersion}
            onChange={() => {
              setNewVersion(true);
              setOldVersion(false);
            }}
            className="form-radio"
          />
          <span>Change Based</span>
        </label>

        <select
          value={alertObj.SensitivityWFTemp}
          onChange={handleChange("SensitivityWFTemp")}
          disabled={!newVersion}
          className="w-full border rounded px-2 py-1 disabled:bg-gray-100"
        >
          <option value="" hidden>
            Changing Field
          </option>
          {sensitivityWFTempList.map((item) => (
            <option key={item.value} value={item.value}>
              {item.Name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="step"
          value={alertObj.WFState}
          onChange={handleChange("WFState")}
          disabled={!newVersion}
          className="w-full border rounded px-2 py-1 disabled:bg-gray-100"
        />
      </div>

      {/* ــــــــــــــ اطلاعات پیام ــــــــــــــ */}
      <h6 className="font-medium">Message Information:</h6>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <select
          value={alertObj.sendType}
          onChange={handleChange("sendType")}
          className="w-full border rounded px-2 py-1"
        >
          <option value="" hidden>
            Send Type
          </option>
          <option value="1">Email</option>
          <option value="2">SMS</option>
          <option value="3">Push Notification</option>
        </select>

        <select
          value={alertObj.nPostID}
          onChange={handleChange("nPostID")}
          className="w-full border rounded px-2 py-1"
        >
          <option value="" hidden>
            Receiver
          </option>
          {roles.map((r) => (
            <option key={r.ID} value={r.ID || ""}>
              {r.Name || ""}
            </option>
          ))}
        </select>

        {/* در حالت Edit این فیلد قفل می‌شود */}
        <select
          value={
            isFixedBoxTemplate
              ? nWFBoxTemplateId.toString()
              : alertObj.nWFBoxTemplateId
          }
          onChange={handleChange("nWFBoxTemplateId")}
          disabled={isFixedBoxTemplate}
          className="w-full border rounded px-2 py-1 disabled:bg-gray-100"
        >
          <option value="" hidden>
            Box Template
          </option>
          {boxTemplates.map((bt) => (
            <option key={bt.ID} value={bt.ID.toString()}>
              {bt.Name}
            </option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="comment"
        value={alertObj.Comment}
        onChange={handleChange("Comment")}
        className="w-full border rounded px-2 py-1 h-24 resize-none"
      />

      <div className="flex space-x-2">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Add
        </button>
      </div>

      {/* ــــــــــــــ جدول هشدارها ــــــــــــــ */}
      <div className="h-80">
        <DataTable
          columnDefs={columnDefs}
          rowData={rows}
          onRowClick={(_, idx) => setSelectedRowIndex(idx)}
          showDeleteIcon
          showAddIcon={false}
          showEditIcon={false}
          onDelete={() => handleDeleteRow(selectedRowIndex)}
          showSearch={false}
        />
      </div>
    </div>
  );
}
