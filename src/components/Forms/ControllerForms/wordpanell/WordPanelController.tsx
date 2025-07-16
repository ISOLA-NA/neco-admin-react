// WordPanelSwitcher.tsx
import React, { useState, useEffect } from "react";
import WordPanelOld from "./OldWordpanel";
import WordPanelNew from "./NewWordpanel";

interface Props {
  onMetaChange?: (meta: any) => void;
  data?: any;
}

const WordPanelSwitcher: React.FC<Props> = ({ onMetaChange, data }) => {
  /* ------------------------------------------------------------------ */
  /* ---------------------------  Local state  ------------------------- */
  /* ------------------------------------------------------------------ */
  const [isShowNewWindow, setIsShowNewWindow] = useState(
    data?.metaType2 === "1"
  );
  const [panelMode, setPanelMode] = useState<"0" | "1">(
    data?.metaType3 === "1" ? "1" : "0"
  );
  const [showEditor, setShowEditor] = useState<boolean>(false);

  /* ------------------------------------------------------------------ */
  /* -------------------------  Derived state  ------------------------- */
  /* ------------------------------------------------------------------ */
  /** حالت ادیت: وقتی metaType1 مقدار دارد. */
  const isEditMode = !!data?.metaType1;

  /* ------------------------------------------------------------------ */
  /* ------------------------  Sync props → state  --------------------- */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    setIsShowNewWindow(data?.metaType2 === "1");
    setPanelMode(data?.metaType3 === "1" ? "1" : "0");
  }, [data?.metaType2, data?.metaType3]);

  /* ------------------------------------------------------------------ */
  /* -------------------------  Emit changes up  ----------------------- */
  /* ------------------------------------------------------------------ */
  const emitChange = (extra: any = {}) => {
    if (onMetaChange) {
      onMetaChange({
        ...data,
        metaType2: isShowNewWindow ? "1" : "0",
        metaType3: panelMode,
        ...extra,
      });
    }
  };

  useEffect(() => emitChange(), [isShowNewWindow]); // eslint-disable-line
  useEffect(() => emitChange(), [panelMode]);       // eslint-disable-line

  /* ------------------------------------------------------------------ */
  /* ----------------------------  Handlers  --------------------------- */
  /* ------------------------------------------------------------------ */
  const handlePanelChange = (mode: "0" | "1") => {
    if (isEditMode) return; // Old/New تغییر نمی‌کند در حالت ادیت
    setPanelMode(mode);
    setShowEditor(false);
  };

  /** ✅ اکنون در حالت ادیت هم فعال است */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsShowNewWindow(e.target.checked);
  };

  const handleDefValClick = () => setShowEditor(true);

  const handleNew = () => {
    setShowEditor(false);
    setPanelMode("0");
  };

  /* ------------------------------------------------------------------ */
  /* ------------------------------  UI  ------------------------------- */
  /* ------------------------------------------------------------------ */
  return (
    <div style={{ background: "#f4f4f4", padding: 24, borderRadius: 12 }}>
      {/* --------------------  گزینه‌های بالای پانل -------------------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        {/* چک‌باکس نمایش در پنجره جدید (فعال حتی در ادیت) */}
        <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <input
            type="checkbox"
            checked={isShowNewWindow}
            onChange={handleCheckboxChange}
          />
          <span>Is Show New Window</span>
        </label>

        {panelMode === "1" && (
          <button
            style={{
              padding: "4px 22px",
              borderRadius: 6,
              border: "1.5px solid #d1d5db",
              background: "#f3f4f6",
              color: "#3f3f46",
              fontWeight: "bold",
              fontSize: 16,
              boxShadow: showEditor ? "0 0 5px 1px #aaa" : undefined,
              outline: showEditor ? "2px solid #ff6f00" : undefined,
              margin: "0 5px",
              opacity: isEditMode ? 0.5 : 1,
            }}
            onClick={handleDefValClick}
            disabled={isEditMode}
          >
            Def Val
          </button>
        )}

        {/* رادیو بوتن‌ها */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: panelMode === "0" ? "bold" : "normal",
              color: panelMode === "0" ? "#6d28d9" : undefined,
              opacity: isEditMode ? 0.5 : 1,
            }}
          >
            <input
              type="radio"
              name="panelMode"
              checked={panelMode === "0"}
              onChange={() => handlePanelChange("0")}
              disabled={isEditMode}
            />
            Old Version
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: panelMode === "1" ? "bold" : "normal",
              color: panelMode === "1" ? "#6d28d9" : undefined,
              opacity: isEditMode ? 0.5 : 1,
            }}
          >
            <input
              type="radio"
              name="panelMode"
              checked={panelMode === "1"}
              onChange={() => handlePanelChange("1")}
              disabled={isEditMode}
            />
            New Word Panel
          </label>
        </div>
      </div>

      {/* -------------------------  نمای اصلی ------------------------- */}
      {panelMode === "1" && showEditor && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 28,
            margin: "24px auto",
            maxWidth: 650,
          }}
        >
          <WordPanelOld
            data={data}
            onMetaChange={emitChange}
            onNew={handleNew}
          />
        </div>
      )}

      {panelMode === "1" && !showEditor && (
        <div
          style={{
            marginTop: 20,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 22,
            maxWidth: 700,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <WordPanelNew data={data} onMetaChange={emitChange} />
        </div>
      )}

      {panelMode === "0" && (
        <div
          style={{
            marginTop: 30,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 22,
            maxWidth: 700,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <WordPanelOld data={data} onMetaChange={emitChange} />
        </div>
      )}
    </div>
  );
};

export default WordPanelSwitcher;
