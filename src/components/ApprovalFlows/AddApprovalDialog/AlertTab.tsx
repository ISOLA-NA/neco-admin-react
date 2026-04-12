import React, { useState, useEffect } from "react";
import { AlertingWfTemplateItem, Role } from "../../../services/api.services";
import AppServices from "../../../services/api.services";
import DataTable from "../../TableDynamic/DataTable";
import { FaPlus, FaTrash } from "react-icons/fa";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicInput from "../../utilities/DynamicInput";
import { useTranslation } from "react-i18next";
import { showAlert } from "../../utilities/Alert/DynamicAlert";

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

const sensitiveItemWFTempList = [
  { value: "2", label: "DateComplete" },
  { value: "1", label: "DateRun" },
];

const sensitivityWFTempList = [{ value: "0", label: "Status" }];

const wfStateList: { value: string; label: string }[] = [];

const sendTypeOptions = [
  { value: "1", label: "Email" },
  { value: "2", label: "SMS" },
  { value: "3", label: "Push Notification" },
];

export default function AlertTab({ nWFBoxTemplateId }: AlertTabProps) {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

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

  useEffect(() => {
    AppServices.getAllRoles().then(setRoles).catch(console.error);
  }, []);

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
    (val: string): void =>
      setForm((prev) => ({ ...prev, [key]: val }));

  const isEmpty = (v?: string | null) => !v || !String(v).trim();

  const handleAdd = async () => {
    const hasTimeField = !isEmpty(form.SensitiveItemWFTemp);
    const hasChangingField = !isEmpty(form.SensitivityWFTemp);

    if (!hasTimeField && !hasChangingField) {
      showAlert(
        "warning",
        null,
        t("AlertsTab.Titles.Attention"),
        t("AlertsTab.Messages.TimeOrChangeRequired")
      );
      return;
    }

    if (hasTimeField && isEmpty(form.Duration)) {
      showAlert(
        "warning",
        null,
        t("AlertsTab.Titles.Attention"),
        t("AlertsTab.Messages.DaysRequired")
      );
      return;
    }

    if (hasChangingField && isEmpty(form.WFState)) {
      showAlert(
        "warning",
        null,
        t("AlertsTab.Titles.Attention"),
        t("AlertsTab.Messages.StepRequired")
      );
      return;
    }

    if (isEmpty(form.sendType)) {
      showAlert(
        "warning",
        null,
        t("AlertsTab.Titles.Attention"),
        t("AlertsTab.Messages.SendTypeRequired")
      );
      return;
    }

    if (isEmpty(form.nPostID)) {
      showAlert(
        "warning",
        null,
        t("AlertsTab.Titles.Attention"),
        t("AlertsTab.Messages.ReceiverRequired")
      );
      return;
    }

    const payload: AlertingWfTemplateItem = {
      Duration: oldVersion ? parseInt(form.Duration, 10) : 0,
      SensitiveItemWFTemp: oldVersion
        ? parseInt(form.SensitiveItemWFTemp, 10)
        : 0,
      SensitivityWFTemp: newVersion ? parseInt(form.SensitivityWFTemp, 10) : 0,
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

      showAlert(
        "success",
        null,
        "",
        t("AlertsTab.Messages.Added")
      );

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

  const columnDefs = [
  {
    headerName: t("AlertsTab.TableHeaders.SensitiveItem"),
    field: "SensitiveItemWFTemp",
    valueGetter: (params: any) =>
      sensitiveItemWFTempList.find(
        (o) => o.value === params.data.SensitiveItemWFTemp
      )?.label || params.data.SensitiveItemWFTemp,
  },
  {
    headerName: t("AlertsTab.TableHeaders.Sensitivity"),
    field: "SensitivityWFTemp",
    valueGetter: (params: any) =>
      sensitivityWFTempList.find(
        (o) => o.value === params.data.SensitivityWFTemp
      )?.label || params.data.SensitivityWFTemp,
  },
  {
    headerName: t("AlertsTab.TableHeaders.Step"),
    field: "WFState",
    valueGetter: (params: any) =>
      wfStateList.find((o) => o.value === params.data.WFState)?.label ||
      params.data.WFState,
  },
  {
    headerName: t("AlertsTab.TableHeaders.Days"),
    field: "Duration",
  },
  {
    headerName: t("AlertsTab.TableHeaders.SendType"),
    field: "sendType",
    valueGetter: (params: any) =>
      sendTypeOptions.find((o) => o.value === params.data.sendType)?.label ||
      params.data.sendType,
  },
  {
    headerName: t("AlertsTab.TableHeaders.Receiver"),
    field: "nPostID",
    valueGetter: (params: any) =>
      roles.find((r) => r.ID === params.data.nPostID)?.Name ||
      params.data.nPostID,
  },
  {
    headerName: t("AlertsTab.TableHeaders.Comment"),
    field: "Comment",
  },
];

  const roleOptions = roles.map((r) => ({
    value: r.ID || "",
    label: r.Name || "",
  }));

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6" dir={dir}>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
        <div className="sm:col-span-1 flex flex-col">
          <span className="text-xs text-gray-700 mb-1">
            {t("AlertsTab.AlertType")}
          </span>
          <label className="flex items-center gap-2 h-10">
            <input
              type="radio"
              name="ver"
              className="h-4 w-4"
              checked={oldVersion}
              onChange={() => {
                setOldVersion(true);
                setNewVersion(false);
                setForm((prev) => ({
                  ...prev,
                  SensitivityWFTemp: "",
                  WFState: "",
                }));
              }}
            />
            <span className="text-sm">{t("AlertsTab.TimeBased")}</span>
          </label>
        </div>

        <div className="sm:col-span-2">
          <DynamicSelector
            label={t("AlertsTab.TimeField")}
            options={sensitiveItemWFTempList}
            selectedValue={form.SensitiveItemWFTemp}
            onChange={(e) => setField("SensitiveItemWFTemp")(e.target.value)}
            disabled={!oldVersion}
          />
        </div>

        <div className="sm:col-span-2">
          <DynamicInput
            label={t("AlertsTab.Days")}
            name="Duration"
            type="number"
            value={form.Duration}
            onChange={(e) => setField("Duration")(e.target.value)}
            disabled={!oldVersion}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
        <div className="sm:col-span-1 flex flex-col">
          <span className="text-xs text-gray-700 mb-1 opacity-0">
            {t("AlertsTab.AlertType")}
          </span>
          <label className="flex items-center gap-2 h-10">
            <input
              type="radio"
              name="ver"
              className="h-4 w-4"
              checked={newVersion}
              onChange={() => {
                setNewVersion(true);
                setOldVersion(false);
                setForm((prev) => ({
                  ...prev,
                  SensitiveItemWFTemp: "",
                  Duration: "",
                }));
              }}
            />
            <span className="text-sm">{t("AlertsTab.ChangeBased")}</span>
          </label>
        </div>

        <div className="sm:col-span-2">
          <DynamicSelector
            label={t("AlertsTab.ChangingField")}
            options={sensitivityWFTempList}
            selectedValue={form.SensitivityWFTemp}
            onChange={(e) => setField("SensitivityWFTemp")(e.target.value)}
            disabled={!newVersion}
          />
        </div>

        <div className="sm:col-span-2">
          <DynamicInput
            label={t("AlertsTab.Step")}
            name="WFState"
            type="number"
            value={form.WFState}
            onChange={(e) => setField("WFState")(e.target.value)}
            disabled={!newVersion}
          />
        </div>
      </div>

      <div className="pt-2">
        <span className="text-xs text-gray-700 block mb-3">
          {t("AlertsTab.MessageInfo")}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <DynamicSelector
              label={t("AlertsTab.SendType")}
              options={sendTypeOptions}
              selectedValue={form.sendType}
              onChange={(e) => setField("sendType")(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <DynamicSelector
              label={t("AlertsTab.Receiver")}
              options={roleOptions}
              selectedValue={form.nPostID}
              onChange={(e) => setField("nPostID")(e.target.value)}
            />
          </div>
        </div>
      </div>

      <textarea
        placeholder={t("AlertsTab.Comment")}
        value={form.Comment}
        onChange={(e) => setField("Comment")(e.target.value)}
        className="w-full border rounded px-2 py-1 h-24 resize-none text-xs"
      />

      <div className="flex items-center gap-2">
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded text-xs"
        >
          <FaPlus /> {t("AlertsTab.Add")}
        </button>

        <button
          disabled
          className="flex items-center gap-1 bg-red-300 cursor-not-allowed text-white px-3 py-2 rounded text-xs"
        >
         <FaTrash /> {t("AlertsTab.Delete")}
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