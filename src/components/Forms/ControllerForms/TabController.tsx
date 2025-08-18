import React, { useState, useEffect, useRef } from "react";
import CustomTextarea from "../../utilities/DynamicTextArea";
import { useTranslation } from "react-i18next";

interface TabControllerProps {
  onMetaChange: (meta: {
    metaType1: string;
    metaTypeJson: string | null;
  }) => void;
  data?: { metaType1?: string; metaTypeJson?: string | null };
  raw?: boolean;
}

const TabController: React.FC<TabControllerProps> = ({
  onMetaChange,
  data = {},
  raw = false,
}) => {
  const { t } = useTranslation();
  // مقدار اولیه (اولویت با metaType1 اگر نبود metaTypeJson)
  const [tabs, setTabs] = useState<string>(() => {
    if (data.metaType1 && data.metaType1.trim() !== "") {
      return data.metaType1;
    }
    if (data.metaTypeJson && data.metaTypeJson.trim() !== "") {
      return data.metaTypeJson.replace(/\\n|\/n/g, "\n");
    }
    return "";
  });

  // سینک شدن فقط زمانی که props واقعی عوض شود (مثلاً در حالت ادیت)
  const prevData = useRef<{ metaType1?: string; metaTypeJson?: string | null }>(
    {}
  );
  useEffect(() => {
    const curMetaType1 =
      data.metaType1 && data.metaType1.trim() !== ""
        ? data.metaType1
        : undefined;
    const curMetaTypeJson =
      data.metaTypeJson && data.metaTypeJson.trim() !== ""
        ? data.metaTypeJson
        : undefined;

    // اگر مقدار واقعا جدید بود، اعمال کن
    if (
      curMetaType1 !== prevData.current.metaType1 ||
      curMetaTypeJson !== prevData.current.metaTypeJson
    ) {
      let next = "";
      if (curMetaType1 !== undefined) {
        next = curMetaType1;
      } else if (curMetaTypeJson !== undefined) {
        next = curMetaTypeJson.replace(/\\n|\/n/g, "\n");
      }
      setTabs(next);
      prevData.current = {
        metaType1: curMetaType1,
        metaTypeJson: curMetaTypeJson,
      };
    }
  }, [data.metaType1, data.metaTypeJson, data]);

  // اعلام تغییر
  const prevMeta = useRef("");
  useEffect(() => {
    const meta = {
      metaType1: tabs,
      metaTypeJson: tabs.trim() ? tabs.replace(/\n/g, "\\n") : null,
    };
    const s = JSON.stringify(meta);
    if (s !== prevMeta.current) {
      prevMeta.current = s;
      onMetaChange(meta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setTabs(e.target.value);

  const rows = Math.max(4, tabs.split("\n").length);

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        {raw ? (
          <textarea
            name={t("tabcontroller.Placeholders.Tab")}
            className="w-full border rounded p-2 focus:outline-none focus:ring"
            rows={rows}
            value={tabs}
            onChange={handleChange}
            placeholder={t("tabcontroller.Placeholders.EnterEachTab")}
          />
        ) : (
          <CustomTextarea
            name={t("tabcontroller.Placeholders.Tab")}
            value={tabs}
            onChange={handleChange}
            rows={rows}
            placeholder={t("tabcontroller.Placeholders.EnterEachTab")}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
};

export default TabController;
