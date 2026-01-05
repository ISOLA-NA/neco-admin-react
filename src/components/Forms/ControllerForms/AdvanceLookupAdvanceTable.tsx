// src/components/ControllerForms/LookUp/LookUpAdvanceTable.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { useApi } from "../../../context/ApiContext";
import AppServices from "../../../services/api.services";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicInput from "../../utilities/DynamicInput";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import DynamicModal from "../../utilities/DynamicModal";
import { useTranslation } from "react-i18next";

interface LookUpAdvanceTableProps {
  data?: {
    metaType1?: string | number | null;
    metaType2?: string | number | null;
    metaType3?: string;
    metaType4?: string;
    metaType5?: string;
    LookupMode?: string | number | null;
    CountInReject?: boolean;
    BoolMeta1?: boolean;
    /** JSON متا؛ اینجا هم access و هم CombinedEntityType می‌آیند */
    metaTypeJson?: string | null;
    /** (اختیاری) ID نوع انتیتی فرم فعلی برای تأمین DesField وقتی srcFields پاس نشده */
    currentEntityTypeId?: string | number | null;
  };
  onMetaChange?: (updated: any) => void;
  onMetaExtraChange?: (updated: { metaType4: string }) => void;
  /** 🔑 سیگنال ریست از والد هنگام تغییر Type of Information */
  resetKey?: number | string;

  /** ✅ فهرست فیلدهای فرم فعلی (برای ستون DesField). اگر پاس شود، از همین استفاده می‌کنیم. */
  srcFields?: Array<{ ID: string | number; DisplayName: string }>;

  /** ✅ اگر srcFields پاس نشد، از این ID (یا data.currentEntityTypeId) برای واکشی فیلدهای فرم فعلی استفاده می‌کنیم */
  srcEntityTypeId?: string | number;
}

interface TableRow {
  ID: string;
  SrcFieldID: string; // ✅ فقط فیلدهای "فرم اول" (metaType1)
  FilterOpration: string;
  FilterText: string;
  DesFieldID: string; // از فیلدهای فرم فعلی (baseFields)
}

const genId = () =>
  typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : uuidv4();

const toStr = (v: any, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

const shallowEqualMeta = (a: any, b: any) => {
  return (
    a.metaType1 === b.metaType1 &&
    a.metaType2 === b.metaType2 &&
    a.metaType3 === b.metaType3 &&
    a.metaType4 === b.metaType4 &&
    a.metaType5 === b.metaType5 &&
    a.LookupMode === b.LookupMode
  );
};

const rowsEqual = (a: TableRow[], b: TableRow[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ra = a[i],
      rb = b[i];
    if (
      ra.ID !== rb.ID ||
      ra.SrcFieldID !== rb.SrcFieldID ||
      ra.FilterOpration !== rb.FilterOpration ||
      ra.FilterText !== rb.FilterText ||
      ra.DesFieldID !== rb.DesFieldID
    )
      return false;
  }
  return true;
};

/* ─────────────────────────────
   دسترسی‌ها (چک‌باکس‌ها)
   ───────────────────────────── */

const ACCESS_FLAGS = [
  { key: "AddByActor", labelKey: "AdvanceLookupAdvanceTable.Access.AddByActor" },
  { key: "EditByActor", labelKey: "AdvanceLookupAdvanceTable.Access.EditByActor" },
  {
    key: "DeleteByActor",
    labelKey: "AdvanceLookupAdvanceTable.Access.DeleteByActor",
  },
  {
    key: "AddByApproval",
    labelKey: "AdvanceLookupAdvanceTable.Access.AddByApproval",
  },
  {
    key: "EditByApproval",
    labelKey: "AdvanceLookupAdvanceTable.Access.EditByApproval",
  },
  {
    key: "DeleteByApproval",
    labelKey: "AdvanceLookupAdvanceTable.Access.DeleteByApproval",
  },
];

const buildAccessString = (accessState: Record<string, boolean>) =>
  ACCESS_FLAGS.filter((a) => accessState[a.key])
    .map((a) => a.key + "-")
    .join("");

// ✅ metaTypeJson ممکن است string باشد یا object (در Add/Edit بسته به Parent)
const parseMetaJson = (metaTypeJson?: any): any => {
  if (!metaTypeJson) return {};
  if (typeof metaTypeJson === "object") return metaTypeJson ?? {};
  if (typeof metaTypeJson === "string") {
    try {
      const obj = JSON.parse(metaTypeJson);
      return typeof obj === "object" && obj !== null ? obj : {};
    } catch {
      return {};
    }
  }
  return {};
};

const onlyDigits = (s: string) => s.replace(/[^\d]/g, "");

/* ─────────────────────────────
   Helpers: pipe-ids for metaType3
   ───────────────────────────── */
const parsePipeIds = (s?: string | null) =>
  String(s || "")
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);

const toPipeIds = (ids: string[]) => {
  const clean = ids.map(String).filter(Boolean);
  return clean.length ? clean.join("|") + "|" : "";
};

/* ─────────────────────────────
   Helpers: normalize entity value (sometimes comes as Name instead of ID)
   ───────────────────────────── */
const normalizeEntityValueToId = (
  raw: string,
  entities: { ID: any; Name: string }[]
) => {
  const v = String(raw || "").trim();
  if (!v) return "";
  const ids = new Set(entities.map((e) => String(e.ID)));
  if (ids.has(v)) return v;

  const hit = entities.find(
    (e) => String(e.Name).trim().toLowerCase() === v.toLowerCase()
  );
  return hit ? String(hit.ID) : v;
};

const LookUpAdvanceTable: React.FC<LookUpAdvanceTableProps> = ({
  data = {},
  onMetaChange,
  onMetaExtraChange,
  resetKey,
  srcFields,
  srcEntityTypeId,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  const initialModeRef = useRef(true);
  const baseFieldsLockedRef = useRef(false);

  // ✅ مقداردهی اولیه از props
  const [meta, setMeta] = useState(() => ({
    metaType1: toStr(data.metaType1), // فرم اول
    metaType2: toStr(data.metaType2), // فرم دوم
    metaType3: toStr(data.metaType3, ""), // show columns... (pipe IDs)
    metaType4: data.metaType4 || "[]",
    metaType5: toStr(data.metaType5), // Default Projects pipe IDs
    LookupMode: toStr(data.LookupMode),
  }));

  const [removeSameName, setRemoveSameName] = useState(!!data.CountInReject);
  const [oldLookup, setOldLookup] = useState(!!data.BoolMeta1);

  const [entities, setEntities] = useState<{ ID: any; Name: string }[]>([]);
  const [sourceFields, setSourceFields] = useState<any[]>([]); // ✅ فیلدهای فرم اول
  const [baseFields, setBaseFields] = useState<any[]>([]); // فیلدهای فرم فعلی
  const [modesList, setModesList] = useState<{ value: string; label: string }[]>(
    []
  );
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);

  /* ───── metaTypeJson + access + allowedAddedRows ───── */
  const initialMetaJsonObj = useMemo(
    () => parseMetaJson(data.metaTypeJson),
    [data.metaTypeJson]
  );

  const [metaJsonObj, setMetaJsonObj] = useState<any>(() => initialMetaJsonObj);

  // ✅ ref از آخرین metaJsonObj
  const metaJsonRef = useRef<any>(initialMetaJsonObj);
  useEffect(() => {
    metaJsonRef.current = metaJsonObj ?? {};
  }, [metaJsonObj]);

  const [accessState, setAccessState] = useState<Record<string, boolean>>(() => {
    const mj = parseMetaJson(data.metaTypeJson);
    const accessStr = typeof mj?.access === "string" ? mj.access : "";
    const st: Record<string, boolean> = {};
    ACCESS_FLAGS.forEach((f) => {
      st[f.key] = accessStr.includes(f.key + "-");
    });
    return st;
  });

  const [allowedByActor, setAllowedByActor] = useState<string>(() => {
    const mj = parseMetaJson(data.metaTypeJson);
    const v = mj?.AllowedAddedRowsByActor;
    return v === 0 || v ? String(v) : "";
  });

  const [allowedByApproval, setAllowedByApproval] = useState<string>(() => {
    const mj = parseMetaJson(data.metaTypeJson);
    const v = mj?.AllowedAddedRowsByApproval;
    return v === 0 || v ? String(v) : "";
  });

  /* ✅ FIX: refs برای جلوگیری از stale-state در ساخت metaTypeJson */
  const accessStateRef = useRef<Record<string, boolean>>(accessState);
  const allowedByActorRef = useRef<string>(allowedByActor);
  const allowedByApprovalRef = useRef<string>(allowedByApproval);

  useEffect(() => {
    accessStateRef.current = accessState ?? {};
  }, [accessState]);

  useEffect(() => {
    allowedByActorRef.current = allowedByActor ?? "";
  }, [allowedByActor]);

  useEffect(() => {
    allowedByApprovalRef.current = allowedByApproval ?? "";
  }, [allowedByApproval]);

  // ✅ مهم: هر بار emit انجام می‌دهیم، metaTypeJson را از UI هم “بازسازی” می‌کنیم
  const composeMetaJsonFromUI = (base: any) => {
    const next = { ...(base ?? {}) };

    // access
    const accState = accessStateRef.current ?? {};
    const accessStr = buildAccessString(accState);
    if (accessStr && accessStr.trim() !== "") next.access = accessStr;
    else delete next.access;

    // AllowedAddedRowsByActor
    const a1 = String(allowedByActorRef.current || "").trim();
    if (a1 !== "") next.AllowedAddedRowsByActor = Number(a1);
    else delete next.AllowedAddedRowsByActor;

    // AllowedAddedRowsByApproval
    const a2 = String(allowedByApprovalRef.current || "").trim();
    if (a2 !== "") next.AllowedAddedRowsByApproval = Number(a2);
    else delete next.AllowedAddedRowsByApproval;

    return next;
  };

  // ✅ FIX اصلی: این تابع نباید metaType4 قدیمی بفرسته
  const pokeParentWithMetaJson = (metaType4: string, metaTypeJsonStr: string) => {
    try {
      onMetaExtraChange?.({
        metaType4: metaType4 ?? "[]",
        metaTypeJson: metaTypeJsonStr,
      } as any);
    } catch {
      // ignore
    }
  };

  const emitMetaChange = (nextMeta: any, nextMetaJsonObj?: any) => {
    // ✅ base از metaJsonRef یا patch
    const baseObj = nextMetaJsonObj ?? metaJsonRef.current ?? {};
    // ✅ مرج با UI
    const jsonObj = composeMetaJsonFromUI(baseObj);

    // ✅ ref را هم sync می‌کنیم تا submit بعدی آخرین مقدار را داشته باشد
    metaJsonRef.current = jsonObj;

    // ✅ state را فقط وقتی عوض کن که واقعاً فرق دارد
    try {
      const prevStr = JSON.stringify(metaJsonObj ?? {});
      const nextStr = JSON.stringify(jsonObj ?? {});
      if (prevStr !== nextStr) setMetaJsonObj(jsonObj);
    } catch {
      setMetaJsonObj(jsonObj);
    }

    const metaTypeJsonStr = JSON.stringify(jsonObj);

    onMetaChange?.({
      ...data,
      ...nextMeta,
      CountInReject: removeSameName,
      BoolMeta1: oldLookup,
      metaTypeJson: metaTypeJsonStr,
    });

    // ✅ FIX: اینجا metaType4 درست (همون nextMeta.metaType4) رو همزمان بفرست
    pokeParentWithMetaJson(nextMeta?.metaType4 ?? meta?.metaType4 ?? "[]", metaTypeJsonStr);
  };

  const patchMetaJson = (patch: (prev: any) => any) => {
    const prevObj = metaJsonRef.current ?? {};
    const patched = patch({ ...prevObj });

    // ✅ باز هم از UI مرج می‌کنیم که چیزی حذف نشود
    const nextObj = composeMetaJsonFromUI(patched);

    metaJsonRef.current = nextObj;
    setMetaJsonObj(nextObj);

    emitMetaChange(meta, nextObj);
  };

  const updateAccess = (key: string, checked: boolean) => {
    // ✅ FIX: اول ref را به‌روز کن تا composeMetaJsonFromUI همیشه دقیق باشد
    const newAccessState = { ...(accessStateRef.current ?? {}), [key]: checked };
    accessStateRef.current = newAccessState;
    setAccessState(newAccessState);

    const accessStr = buildAccessString(newAccessState);

    patchMetaJson((prev) => {
      return { ...prev, access: accessStr };
    });
  };

  const updateAllowedRows = (kind: "actor" | "approval", raw: string) => {
    const cleaned = onlyDigits(raw);

    // ✅ FIX: ref را قبل از patch sync کن
    if (kind === "actor") {
      allowedByActorRef.current = cleaned;
      setAllowedByActor(cleaned);
    } else {
      allowedByApprovalRef.current = cleaned;
      setAllowedByApproval(cleaned);
    }

    patchMetaJson((prev) => {
      const next = { ...prev };

      if (kind === "actor") {
        if (cleaned === "") delete next.AllowedAddedRowsByActor;
        else next.AllowedAddedRowsByActor = Number(cleaned);
      } else {
        if (cleaned === "") delete next.AllowedAddedRowsByApproval;
        else next.AllowedAddedRowsByApproval = Number(cleaned);
      }

      return next;
    });
  };

  const LEFT_KEYS = ["AddByActor", "EditByActor", "DeleteByActor"];
  const RIGHT_KEYS = ["AddByApproval", "EditByApproval", "DeleteByApproval"];

  const renderAccessAndLimits = () => {
    const leftItems = ACCESS_FLAGS.filter((x) => LEFT_KEYS.includes(x.key));
    const rightItems = ACCESS_FLAGS.filter((x) => RIGHT_KEYS.includes(x.key));

    const renderItem = (item: { key: string; labelKey: string }) => {
      const fullText = t(item.labelKey);
      return (
        <label
          key={item.key}
          className="flex items-start gap-1 text-[10px] leading-4 font-normal text-gray-700"
          title={fullText}
        >
          <input
            type="checkbox"
            checked={!!accessState[item.key]}
            onChange={(e) => updateAccess(item.key, e.target.checked)}
            className="mt-[2px] h-4 w-4 accent-pink-500 cursor-pointer shrink-0"
          />
          <span className="whitespace-normal break-words">{fullText}</span>
        </label>
      );
    };

    const actorLabel = "Allowed added numbers of rows by actor:";
    const approvalLabel = "Allowed added numbers of rows by approval:";

    return (
      <div className="w-full flex flex-col md:flex-row gap-2 md:gap-3 items-stretch">
        <div className="p-3 rounded-lg shadow-sm border border-gray-200 flex-1 h-full min-h-[140px]">
          <div className="grid grid-cols-2 gap-x-2 gap-y-3">
            <div className="flex flex-col gap-3">{leftItems.map(renderItem)}</div>
            <div className="flex flex-col gap-3">{rightItems.map(renderItem)}</div>
          </div>
        </div>

        <div className="p-3 rounded-lg shadow-sm border border-gray-200 h-full min-h-[140px] flex items-stretch">
          <div className="w-full md:w-[210px] lg:w-[220px] flex flex-col h-full justify-between gap-3">
            <div className="flex flex-col justify-start" title={actorLabel}>
              <DynamicInput
                name="AllowedAddedRowsByActor"
                type="number"
                value={allowedByActor}
                onChange={(e) => updateAllowedRows("actor", e.target.value)}
                label={actorLabel}
                labelClassName="text-[11px] font-normal text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis mb-0.5"
                placeholder="actor"
                min={0}
                step={1}
                className="w-full"
                style={{ height: 30 }}
              />
            </div>

            <div className="flex flex-col justify-start" title={approvalLabel}>
              <DynamicInput
                name="AllowedAddedRowsByApproval"
                type="number"
                value={allowedByApproval}
                onChange={(e) => updateAllowedRows("approval", e.target.value)}
                label={approvalLabel}
                labelClassName="text-[11px] font-normal text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis mb-0.5"
                placeholder="approval"
                min={0}
                step={1}
                className="w-full"
                style={{ height: 30 }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Sync from props.data (فقط در صورت تغییر واقعی) ───
  const prevIncomingMetaJsonStrRef = useRef<string | null>(null);

  useEffect(() => {
    const nextMeta = {
      metaType1: toStr(data.metaType1),
      metaType2: toStr(data.metaType2),
      metaType3: toStr(data.metaType3, ""),
      metaType4: data.metaType4 || "[]",
      metaType5: toStr(data.metaType5),
      LookupMode: toStr(data.LookupMode),
    };

    let parsed: any[] = [];
    try {
      parsed = JSON.parse(nextMeta.metaType4 || "[]");
    } catch {
      parsed = [];
    }

    const nextRows: TableRow[] = Array.isArray(parsed)
      ? parsed.map((item) => ({
          ID: toStr(item.ID, genId()),
          SrcFieldID: toStr(item.SrcFieldID),
          FilterOpration: toStr(item.FilterOpration),
          FilterText: toStr(item.FilterText),
          DesFieldID: toStr(item.DesFieldID),
        }))
      : [];

    const metaChanged = !shallowEqualMeta(meta, nextMeta);
    const rowsChanged = !rowsEqual(tableData, nextRows);

    if (metaChanged) setMeta(nextMeta);
    if (rowsChanged) setTableData(nextRows);

    if (removeSameName !== !!data.CountInReject)
      setRemoveSameName(!!data.CountInReject);
    if (oldLookup !== !!data.BoolMeta1) setOldLookup(!!data.BoolMeta1);

    if (metaChanged) initialModeRef.current = true;

    // ✅ FIX: metaTypeJson ورودی اگر {} یا خالی باشد، overwrite نکن
    const incomingIsEmpty = isEffectivelyEmptyMetaJson(data.metaTypeJson);
    const incomingObj = incomingIsEmpty ? {} : parseMetaJson(data.metaTypeJson);

    const prevObj = metaJsonRef.current ?? {};
    const baseObj = incomingIsEmpty ? prevObj : { ...prevObj, ...incomingObj };

    if (!incomingIsEmpty) {
      const incomingAccessStr =
        typeof baseObj?.access === "string" ? baseObj.access : "";
      const nextAccess: Record<string, boolean> = {};
      ACCESS_FLAGS.forEach((f) => {
        nextAccess[f.key] = incomingAccessStr.includes(f.key + "-");
      });
      accessStateRef.current = nextAccess;
      setAccessState(nextAccess);

      const a1 = baseObj?.AllowedAddedRowsByActor;
      const a1Str = a1 === 0 || a1 ? String(a1) : "";
      allowedByActorRef.current = a1Str;
      setAllowedByActor(a1Str);

      const a2 = baseObj?.AllowedAddedRowsByApproval;
      const a2Str = a2 === 0 || a2 ? String(a2) : "";
      allowedByApprovalRef.current = a2Str;
      setAllowedByApproval(a2Str);
    }

    const mj = composeMetaJsonFromUI(baseObj);
    setMetaJsonObj(mj);
    metaJsonRef.current = mj;

    try {
      prevIncomingMetaJsonStrRef.current = JSON.stringify(mj);
    } catch {
      prevIncomingMetaJsonStrRef.current = String(data.metaTypeJson ?? "");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ─── Load entities & enums once ───
  useEffect(() => {
    getAllEntityType()
      .then((res) => Array.isArray(res) && setEntities(res))
      .catch(console.error);

    AppServices.getEnum({ str: "lookMode" })
      .then((resp) =>
        setModesList(
          Object.entries(resp).map(([k, v]) => ({
            value: String(v),
            label: k,
          }))
        )
      )
      .catch(console.error);

    AppServices.getEnum({ str: "FilterOpration" })
      .then((resp) =>
        setOperationList(
          Object.entries(resp).map(([k, v]) => ({
            value: String(v),
            label: k,
          }))
        )
      )
      .catch(console.error);
  }, [getAllEntityType]);

  // ─── After modesList loads, apply initial LookupMode once ───
  useEffect(() => {
    if (initialModeRef.current && modesList.length > 0 && data.LookupMode != null) {
      const mv = String(data.LookupMode);
      if (modesList.some((m) => m.value === mv)) {
        setMeta((prev) => {
          if (prev.LookupMode === mv) return prev;
          return { ...prev, LookupMode: mv };
        });
      }
      initialModeRef.current = false;
    }
  }, [modesList, data.LookupMode]);

  // ✅ normalize metaType1/metaType2 اگر به جای ID، Name آمده باشد
  useEffect(() => {
    if (!entities.length) return;

    const n1 = normalizeEntityValueToId(meta.metaType1, entities);
    const n2 = normalizeEntityValueToId(meta.metaType2, entities);

    if (n1 !== meta.metaType1 || n2 !== meta.metaType2) {
      const next = { ...meta, metaType1: n1, metaType2: n2 };
      setMeta(next);
      emitMetaChange(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entities]);

  // ✅ Load fields of FIRST FORM (metaType1) => SrcField + show columns
  useEffect(() => {
    const etId = Number(meta.metaType1);
    if (!isNaN(etId) && etId > 0) {
      getEntityFieldByEntityTypeId(etId)
        .then((res) => setSourceFields(Array.isArray(res) ? res : []))
        .catch(console.error);
    } else {
      setSourceFields([]);
    }
  }, [meta.metaType1, getEntityFieldByEntityTypeId]);

  /* ─── ثابت‌سازی baseFields از srcFields (اگر پاس داده شده) ─── */
  useEffect(() => {
    if (baseFieldsLockedRef.current) return;
    if (Array.isArray(srcFields) && srcFields.length > 0) {
      setBaseFields(srcFields);
      baseFieldsLockedRef.current = true;
    }
  }, [srcFields]);

  /* ─── اگر srcFields نبود، با srcEntityTypeId یا currentEntityTypeId واکشی کن ─── */
  useEffect(() => {
    if (baseFieldsLockedRef.current) return;
    const rawId =
      (typeof srcEntityTypeId !== "undefined" ? srcEntityTypeId : null) ??
      (typeof data.currentEntityTypeId !== "undefined"
        ? (data.currentEntityTypeId as any)
        : null);

    const idNum = rawId != null ? Number(rawId) : NaN;
    if (!isNaN(idNum) && idNum > 0) {
      getEntityFieldByEntityTypeId(idNum)
        .then((r) => {
          const arr = Array.isArray(r) ? r : [];
          if (arr.length > 0) {
            setBaseFields(arr);
            baseFieldsLockedRef.current = true;
          }
        })
        .catch(console.error);
    }
  }, [srcEntityTypeId, data.currentEntityTypeId, getEntityFieldByEntityTypeId]);

  const pushMeta = (patch: Partial<typeof meta>) => {
    const next = { ...meta, ...patch };
    if (shallowEqualMeta(meta, next)) return;
    setMeta(next);
    emitMetaChange(next);
  };

  const pushTable = (rows: TableRow[]) => {
    if (rowsEqual(tableData, rows)) return;
    setTableData(rows);
    const json = JSON.stringify(rows);
    if (meta.metaType4 === json) return;

    const next = { ...meta, metaType4: json };
    setMeta(next);

    // ✅ parent باید metaType4 جدید رو بگیره
    onMetaExtraChange?.({ metaType4: json });

    // ✅ emit هم با nextMeta صدا زده می‌شه، و چون pokeParentWithMetaJson الان metaType4 درست می‌فرسته
    emitMetaChange(next);
  };

  const firstEmpty = meta.metaType1.trim() === "";
  const noDesOptions = baseFields.length === 0;

  const handleAddRow = () => {
    const defaultDes = noDesOptions ? "" : baseFields[0]?.ID ?? "";
    const defaultSrc = firstEmpty ? "" : sourceFields[0]?.ID ?? "";
    const newRow: TableRow = {
      ID: genId(),
      SrcFieldID: defaultSrc ? String(defaultSrc) : "",
      FilterOpration: "",
      FilterText: "",
      DesFieldID: defaultDes ? String(defaultDes) : "",
    };
    pushTable([...tableData, newRow]);
  };

  const handleCellValueChanged = (e: any) => {
    const updated = e.data as TableRow;
    const next = tableData.map((r) =>
      r.ID === updated.ID
        ? {
            ...updated,
            SrcFieldID: updated.SrcFieldID != null ? String(updated.SrcFieldID) : "",
            DesFieldID: updated.DesFieldID != null ? String(updated.DesFieldID) : "",
          }
        : r
    );
    pushTable(next);
  };

  const sourceFieldsMap = useMemo(
    () => new Map(sourceFields.map((f: any) => [String(f.ID), f.DisplayName])),
    [sourceFields]
  );
  const baseFieldsMap = useMemo(
    () => new Map(baseFields.map((f: any) => [String(f.ID), f.DisplayName])),
    [baseFields]
  );

  const sourceFieldsSig = useMemo(
    () => sourceFields.map((f: any) => String(f.ID)).join("|"),
    [sourceFields]
  );
  const baseFieldsSig = useMemo(
    () => baseFields.map((f: any) => String(f.ID)).join("|"),
    [baseFields]
  );

  useEffect(() => {
    if (!sourceFields.length || firstEmpty) return;
    const valid = new Set(Array.from(sourceFieldsMap.keys()));
    let changed = false;

    const updated = tableData.map((r) => {
      const val = String(r.SrcFieldID || "");
      if (val && !valid.has(val)) {
        changed = true;
        return { ...r, SrcFieldID: sourceFields[0] ? String(sourceFields[0].ID) : "" };
      }
      return r;
    });

    if (changed) pushTable(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFieldsSig, firstEmpty]);

  useEffect(() => {
    if (baseFields.length === 0) {
      const changed = tableData.some((r) => r.DesFieldID);
      if (changed) {
        const cleared = tableData.map((r) => ({ ...r, DesFieldID: "" }));
        pushTable(cleared);
      }
      return;
    }

    if (!noDesOptions) {
      const valid = new Set(Array.from(baseFieldsMap.keys()));
      let changed = false;

      const updated = tableData.map((r) => {
        const val = String(r.DesFieldID || "");
        if (val && !valid.has(val)) {
          changed = true;
          return { ...r, DesFieldID: baseFields[0] ? String(baseFields[0].ID) : "" };
        }
        return r;
      });

      if (changed) pushTable(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFieldsSig, noDesOptions]);

  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const [selectedFieldRow, setSelectedFieldRow] = useState<any>(null);

  const selectedFieldIds = useMemo(() => parsePipeIds(meta.metaType3), [meta.metaType3]);

  useEffect(() => {
    if (!selectedFieldIds.length) return;
    if (!sourceFieldsMap.size) return;

    const valid = new Set(Array.from(sourceFieldsMap.keys()));
    const next = selectedFieldIds.filter((id) => valid.has(String(id)));
    if (next.length !== selectedFieldIds.length) {
      pushMeta({ metaType3: toPipeIds(next) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFieldsSig, sourceFieldsMap.size]);

  const openColumnsModal = () => {
    setSelectedFieldRow(null);
    setColumnsModalOpen(true);
  };

  const closeColumnsModal = () => {
    setColumnsModalOpen(false);
    setSelectedFieldRow(null);
  };

  const handleSelectColumns = () => {
    if (!selectedFieldRow?.ID) return;

    const id = String(selectedFieldRow.ID);
    const set = new Set(selectedFieldIds.map(String));
    set.add(id);

    pushMeta({ metaType3: toPipeIds(Array.from(set)) });
    closeColumnsModal();
  };

  const clearSelectedColumns = () => {
    pushMeta({ metaType3: "" });
  };

  const ellipsisCellStyle = useMemo(() => {
    return isRtl
      ? ({
          textAlign: "right",
          direction: "ltr",
          unicodeBidi: "plaintext",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        } as React.CSSProperties)
      : ({
          textAlign: "left",
          direction: "ltr",
          unicodeBidi: "plaintext",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        } as React.CSSProperties);
  }, [isRtl]);

  const ellipsisHeaderStyle = useMemo(() => {
    return isRtl
      ? ({
          textAlign: "right",
          direction: "ltr",
          unicodeBidi: "plaintext",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        } as React.CSSProperties)
      : ({
          textAlign: "left",
          direction: "ltr",
          unicodeBidi: "plaintext",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        } as React.CSSProperties);
  }, [isRtl]);

  const columnDefs = useMemo(
    () => [
      {
        headerName: t("LookUpAdvanceTable.Columns.SrcField"),
        field: "SrcFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: () => ({
          values: firstEmpty ? [] : Array.from(sourceFieldsMap.keys()),
        }),
        valueFormatter: (p: any) => {
          if (firstEmpty) return "";
          const key = String(p.value ?? "");
          const label = sourceFieldsMap.get(key);
          return label ? String(label) : "";
        },
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
      {
        headerName: t("LookUpAdvanceTable.Columns.Operation"),
        field: "FilterOpration",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: operationList.map((o) => o.value) },
        valueFormatter: (p: any) =>
          operationList.find((o) => o.value === String(p.value))?.label ||
          String(p.value ?? ""),
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
      {
        headerName: t("LookUpAdvanceTable.Columns.FilterText"),
        field: "FilterText",
        editable: true,
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
      {
        headerName: t("LookUpAdvanceTable.Columns.DesField"),
        field: "DesFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: () => ({
          values: noDesOptions ? [] : Array.from(baseFieldsMap.keys()),
        }),
        valueFormatter: (p: any) =>
          noDesOptions
            ? ""
            : baseFieldsMap.get(String(p.value)) ?? String(p.value ?? ""),
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
    ],
    [
      t,
      sourceFieldsMap,
      baseFieldsMap,
      operationList,
      firstEmpty,
      noDesOptions,
      ellipsisCellStyle,
      ellipsisHeaderStyle,
    ]
  );

  const ppKey = useMemo(
    () =>
      `pp-adv-${meta.metaType1}|${meta.metaType2}|${meta.LookupMode}|${resetKey ?? 0}`,
    [meta.metaType1, meta.metaType2, meta.LookupMode, resetKey]
  );

  const entitiesSig = useMemo(
    () => (entities || []).map((e) => String(e.ID)).join("|"),
    [entities]
  );

  const addBtnClass =
    "bg-indigo-500 text-white px-2 py-1 rounded-md hover:bg-indigo-600 flex items-center";

  const isPlainEmptyObject = (o: any) =>
    !o || (typeof o === "object" && !Array.isArray(o) && Object.keys(o).length === 0);

  // اگر metaTypeJson ورودی “عملاً خالی” باشد (null, "", "{}", یا {})
  const isEffectivelyEmptyMetaJson = (v: any) => {
    if (v === undefined || v === null) return true;

    if (typeof v === "object") return isPlainEmptyObject(v);

    const s = String(v).trim();
    if (!s) return true;
    if (s === "{}") return true;

    try {
      const obj = JSON.parse(s);
      return isPlainEmptyObject(obj);
    } catch {
      return false;
    }
  };

  return (
    <div
      dir={i18n.dir()}
      className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg"
    >
      <div className="flex flex-col gap-6">
        <div className="w-full md:w-1/2">
          <DynamicSelector
            key={`first-${entitiesSig}`}
            name="firstFormGetInformationFrom"
            label={"for first form, get information from"}
            options={entities.map((e) => ({
              value: String(e.ID),
              label: e.Name,
            }))}
            selectedValue={String(meta.metaType1 || "")}
            onChange={(e) => pushMeta({ metaType1: e.target.value })}
          />
        </div>

        <div className="w-full md:w-1/2">
          <DynamicSelector
            key={`second-${entitiesSig}`}
            name="secondFormGetInformationFrom"
            label={"for second form, get information from"}
            options={entities.map((e) => ({
              value: String(e.ID),
              label: e.Name,
            }))}
            selectedValue={String(meta.metaType2 || "")}
            onChange={(e) => pushMeta({ metaType2: e.target.value })}
          />
        </div>

        <div
          className={[
            "w-full flex flex-col md:flex-row gap-4 items-stretch",
            isRtl ? "md:flex-row-reverse" : "",
          ].join(" ")}
        >
          <div className="flex-1 min-w-0">
            <PostPickerList
              key={ppKey}
              resetKey={resetKey}
              sourceType="projects"
              initialMetaType={meta.metaType5}
              metaFieldKey="metaType5"
              onMetaChange={(o) => pushMeta(o)}
              label={t("LookUpAdvanceTable.Form.DefaultProjects")}
              fullWidth
            />
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="p-4 bg-white rounded-lg border border-gray-300"
              style={{ minHeight: 120, width: "100%" }}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-700 text-sm font-semibold">
                  show columns of first form as below
                </label>

                <button
                  type="button"
                  onClick={openColumnsModal}
                  className={addBtnClass}
                  disabled={firstEmpty}
                  title={firstEmpty ? "Select first form first" : ""}
                >
                  <span className="mr-1 text-lg leading-none">+</span> Add
                </button>
              </div>

              <div className="overflow-y-auto max-h-32 border border-gray-200 p-2 rounded">
                {selectedFieldIds.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedFieldIds.map((id) => {
                      const nm = sourceFieldsMap.get(String(id)) ?? String(id);
                      return (
                        <div
                          key={String(id)}
                          className="flex items-center bg-gray-100 px-3 py-1 rounded-md"
                          title={String(nm)}
                        >
                          <span className="text-sm">{String(nm)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = selectedFieldIds
                                .map(String)
                                .filter((x) => x !== String(id));
                              pushMeta({ metaType3: toPipeIds(next) });
                            }}
                            className="text-red-500 ml-2 hover:text-red-700"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                    {!!selectedFieldIds.length && (
                      <button
                        type="button"
                        onClick={clearSelectedColumns}
                        className="text-xs text-gray-400 hover:text-gray-700"
                        title="Clear all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No default values selected</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderAccessAndLimits()}

      <div className="mt-4" style={{ height: 300, overflowY: "auto" }}>
        <DataTable
          columnDefs={columnDefs}
          rowData={tableData}
          showAddIcon
          onAdd={handleAddRow}
          onCellValueChanged={handleCellValueChanged}
          domLayout="normal"
          showSearch={false}
          showEditIcon={false}
          showDeleteIcon={false}
          showDuplicateIcon={false}
          onRowDoubleClick={() => {}}
          gridOptions={{
            singleClickEdit: true,
            rowSelection: "single",
            stopEditingWhenCellsLoseFocus: true,
          }}
          direction={i18n.dir()}
        />
      </div>

      <DynamicModal isOpen={columnsModalOpen} onClose={closeColumnsModal}>
        <div className="w-full">
          <div className="text-lg font-semibold mb-3">
            show columns of first form as below
          </div>

          <div style={{ height: 420 }}>
            <DataTable
              columnDefs={[
                {
                  headerName: "Column",
                  field: "DisplayName",
                  flex: 1,
                  minWidth: 180,
                  cellStyle: ellipsisCellStyle,
                  headerStyle: ellipsisHeaderStyle,
                },
              ]}
              rowData={sourceFields}
              setSelectedRowData={setSelectedFieldRow}
              onRowDoubleClick={() => {
                handleSelectColumns();
              }}
              domLayout="normal"
              showSearch={true}
              showAddIcon={false}
              showEditIcon={false}
              showDeleteIcon={false}
              showDuplicateIcon={false}
              showViewIcon={false}
              isEditMode={true}
              direction={i18n.dir()}
            />
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className={[
                "px-10 py-2 rounded-xl text-white font-semibold shadow-sm transition",
                selectedFieldRow?.ID
                  ? "bg-sky-600 hover:bg-sky-700"
                  : "bg-sky-300 cursor-not-allowed",
              ].join(" ")}
              disabled={!selectedFieldRow?.ID}
              onClick={handleSelectColumns}
            >
              Select
            </button>
          </div>
        </div>
      </DynamicModal>
    </div>
  );
};

export default LookUpAdvanceTable;
