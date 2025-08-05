import React, { useState, useEffect } from "react";
import {
  AlertingWfTemplateItem,
  Role,
} from "../../../services/api.services";
import AppServices from "../../../services/api.services";
import DataTable from "../../TableDynamic/DataTable";
import { FaPlus, FaTrash } from "react-icons/fa";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicInput from "../../utilities/DynamicInput";

type AlertObj = {
  SensitiveItemWFTemp: string;
  Duration: string;
  SensitivityWFTemp: string;
  WFState: string;
  nPostID: string;
  sendType: string;
  Comment: string;
};

type AlertTabProps = {
  nWFBoxTemplateId: number;
};

// گزینه‌های انتخاب
const sensitiveItemWFTempList = [
  { value: "2", label: "DateComplete" },
  { value: "1", label: "DateRun" },
];
const sensitivityWFTempList = [{ value: "0", label: "Status" }];
// اگر نیاز به نمایش متن برای مراحل دارید، این لیست را مطابق با نیاز پر کنید
const wfStateList: { value: string; label: string }[] = [
  // مثال: { value: "0", label: "Initial" },
];
const sendTypeOptions = [
  { value: "1", label: "Email" },
  { value: "2", label: "SMS" },
  { value: "3", label: "Push Notification" },
];

export default function AlertTab({ nWFBoxTemplateId }: AlertTabProps) {
  const [oldVersion, setOldVersion] = useState(true);
  const [newVersion, setNewVersion] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [rows, setRows] = useState<AlertObj[]>([]);
  const [selectedRow] = useState<number | null>(null);

  const [form, setForm] = useState<AlertObj>({
    SensitiveItemWFTemp: "",
    Duration: "",
    SensitivityWFTemp: "",
    WFState: "",
    nPostID: "",
    sendType: "",
    Comment: "",
  });

  // بارگذاری رول‌ها
  useEffect(() => {
    AppServices.getAllRoles().then(setRoles).catch(console.error);
  }, []);

  // بارگذاری هشدارها بر اساس TemplateId
  useEffect(() => {
    if (!nWFBoxTemplateId) {
      setRows([]);
      return;
    }
    AppServices.getAllAlertingWfTemplateByWFBoxTemplateId(nWFBoxTemplateId)
      .then((data) =>
        setRows(
          data.map((d) => ({
            SensitiveItemWFTemp: d.SensitiveItemWFTemp?.toString() || "",
            Duration: d.Duration?.toString() || "",
            SensitivityWFTemp: d.SensitivityWFTemp?.toString() || "",
            WFState: d.WFState?.toString() || "",
            nPostID: d.nPostID,
            sendType: d.SendType?.toString() || "",
            Comment: d.Comment || "",
          }))
        )
      )
      .catch(console.error);
  }, [nWFBoxTemplateId]);

  const setField =
    (key: keyof AlertObj) =>
    (val: string) =>
      setForm((prev) => ({ ...prev, [key]: val }));

  const handleAdd = async () => {
    const payload: AlertingWfTemplateItem = {
      Duration: oldVersion ? parseInt(form.Duration, 10) : 0,
      SensitiveItemWFTemp: oldVersion
        ? parseInt(form.SensitiveItemWFTemp, 10)
        : 0,
      SensitivityWFTemp: newVersion
        ? parseInt(form.SensitivityWFTemp, 10)
        : 0,
      WFState: newVersion ? parseInt(form.WFState, 10) : 0,
      SendType: parseInt(form.sendType, 10),
      nPostTypeID: null,
      nPostID: form.nPostID,
      nWFBoxTemplateId: nWFBoxTemplateId,
      Comment: form.Comment,
      IsVisible: true,
      ModifiedById: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    };

    try {
      await AppServices.insertAlertingWfTemplate(payload);
      setRows((prev) => [...prev, form]);
      // ریست فرم
      setForm({
        SensitiveItemWFTemp: "",
        Duration: "",
        SensitivityWFTemp: "",
        WFState: "",
        nPostID: "",
        sendType: "",
        Comment: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ستون‌های جدول با نمایش لیبل به جای مقدار
  const columnDefs = [
    {
      headerName: "Sensitive Item",
      field: "SensitiveItemWFTemp",
      valueGetter: (params: any) =>
        sensitiveItemWFTempList.find((o) => o.value === params.data.SensitiveItemWFTemp)
          ?.label || params.data.SensitiveItemWFTemp,
    },
    { headerName: "Day", field: "Duration" },
    {
      headerName: "Sensitivity",
      field: "SensitivityWFTemp",
      valueGetter: (params: any) =>
        sensitivityWFTempList.find((o) => o.value === params.data.SensitivityWFTemp)
          ?.label || params.data.SensitivityWFTemp,
    },
    {
      headerName: "Step",
      field: "WFState",
      valueGetter: (params: any) =>
        wfStateList.find((o) => o.value === params.data.WFState)
          ?.label || params.data.WFState,
    },
    {
      headerName: "Send Type",
      field: "sendType",
      valueGetter: (params: any) =>
        sendTypeOptions.find((o) => o.value === params.data.sendType)
          ?.label || params.data.sendType,
    },
    {
      headerName: "Receiver",
      field: "nPostID",
      valueGetter: (params: any) =>
        roles.find((r) => r.ID === params.data.nPostID)?.Name || params.data.nPostID,
    },
    { headerName: "Comment", field: "Comment" },
  ];

  // گزینه‌های سلکت
  const roleOptions = roles.map((r) => ({
    value: r.ID || "",
    label: r.Name || "",
  }));

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* نسخه قدیم یا جدید */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
        <label className="flex items-center space-x-1 sm:col-span-1">
          <input
            type="radio"
            name="ver"
            checked={oldVersion}
            onChange={() => {
              setOldVersion(true);
              setNewVersion(false);
            }}
          />
          <span>Time Based</span>
        </label>

        <div className="sm:col-span-2">
          <DynamicSelector
            label="Time Field"
            options={sensitiveItemWFTempList}
            selectedValue={form.SensitiveItemWFTemp}
            onChange={(e) => setField("SensitiveItemWFTemp")(e.target.value)}
            disabled={!oldVersion}
          />
        </div>

        <div className="sm:col-span-2">
          <DynamicInput
            label="Days"
            name="Duration"
            type="number"
            value={form.Duration}
            onChange={(e) => setField("Duration")(e.target.value)}
            disabled={!oldVersion}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
        <label className="flex items-center space-x-1 sm:col-span-1">
          <input
            type="radio"
            name="ver"
            checked={newVersion}
            onChange={() => {
              setNewVersion(true);
              setOldVersion(false);
            }}
          />
          <span>Change Based</span>
        </label>

        <div className="sm:col-span-2">
          <DynamicSelector
            label="Changing Field"
            options={sensitivityWFTempList}
            selectedValue={form.SensitivityWFTemp}
            onChange={(e) => setField("SensitivityWFTemp")(e.target.value)}
            disabled={!newVersion}
          />
        </div>

        <div className="sm:col-span-2">
          <DynamicInput
            label="Step"
            name="WFState"
            type="number"
            value={form.WFState}
            onChange={(e) => setField("WFState")(e.target.value)}
            disabled={!newVersion}
          />
        </div>
      </div>

      {/* اطلاعات پیام */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-2">
          <DynamicSelector
            label="Send Type"
            options={sendTypeOptions}
            selectedValue={form.sendType}
            onChange={(e) => setField("sendType")(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <DynamicSelector
            label="Receiver"
            options={roleOptions}
            selectedValue={form.nPostID}
            onChange={(e) => setField("nPostID")(e.target.value)}
          />
        </div>
      </div>

      <textarea
        placeholder="Comment"
        value={form.Comment}
        onChange={(e) => setField("Comment")(e.target.value)}
        className="w-full border rounded px-2 py-1 h-24 resize-none text-xs"
      />

      <div className="flex items-center space-x-2">
        <button
          onClick={handleAdd}
          className="flex items-center bg-green-600 text-white px-3 py-2 rounded text-xs"
        >
          <FaPlus className="mr-1" /> Add
        </button>
        <button
          disabled
          className="flex items-center bg-red-300 cursor-not-allowed text-white px-3 py-2 rounded text-xs"
        >
          <FaTrash className="mr-1" /> Delete
        </button>
      </div>

      <div className="h-80">
        <DataTable
          columnDefs={columnDefs}
          rowData={rows}
          onRowClick={() => {}}
          showAddIcon={false}
          showEditIcon={false}
          showDeleteIcon={false}
          showSearch={false}
        />
      </div>
    </div>
  );
}