import React, { useState, useEffect, useRef } from "react";
import CustomTextarea from "../../utilities/DynamicTextArea";
import { useTranslation } from "react-i18next";

interface TabControllerProps {
  onMetaChange: (meta: {
    metaType1: string;           // Tabs (عمومی/انگلیسی)
    metaType2: string;           // Tabs فارسی
    metaTypeJson: string | null; // Mirror برای metaType1 با \n اسکیپ‌شده
  }) => void;
  data?: {
    metaType1?: string;
    metaType2?: string;          // ✅ جدید
    metaTypeJson?: string | null;
  };
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

  // ✅ مقدار اولیه برای تب‌های فارسی (صرفاً از metaType2)
  const [tabsFa, setTabsFa] = useState<string>(() => {
    if (data.metaType2 && data.metaType2.trim() !== "") {
      return data.metaType2;
    }
    return "";
  });

  // سینک شدن فقط زمانی که props واقعی عوض شود (مثلاً در حالت ادیت)
  const prevData = useRef<{
    metaType1?: string;
    metaType2?: string;
    metaTypeJson?: string | null;
  }>({});

  useEffect(() => {
    const curMetaType1 =
      data.metaType1 && data.metaType1.trim() !== ""
        ? data.metaType1
        : undefined;

    const curMetaType2 =
      data.metaType2 && data.metaType2.trim() !== ""
        ? data.metaType2
        : undefined;

    const curMetaTypeJson =
      data.metaTypeJson && data.metaTypeJson.trim() !== ""
        ? data.metaTypeJson
        : undefined;

    // اگر مقدار واقعا جدید بود، اعمال کن
    if (
      curMetaType1 !== prevData.current.metaType1 ||
      curMetaType2 !== prevData.current.metaType2 ||
      curMetaTypeJson !== prevData.current.metaTypeJson
    ) {
      let nextTabs = "";
      if (curMetaType1 !== undefined) {
        nextTabs = curMetaType1;
      } else if (curMetaTypeJson !== undefined) {
        nextTabs = curMetaTypeJson.replace(/\\n|\/n/g, "\n");
      }

      setTabs(nextTabs);
      setTabsFa(curMetaType2 ?? "");

      prevData.current = {
        metaType1: curMetaType1,
        metaType2: curMetaType2,
        metaTypeJson: curMetaTypeJson,
      };
    }
  }, [data.metaType1, data.metaType2, data.metaTypeJson, data]);

  // اعلام تغییر به والد (هر دو فیلد)
  const prevMeta = useRef("");
  useEffect(() => {
    const meta = {
      metaType1: tabs,
      metaType2: tabsFa,                         // ✅ ارسال مقدار فارسی
      metaTypeJson: tabs.trim() ? tabs.replace(/\n/g, "\\n") : null,
    };
    const s = JSON.stringify(meta);
    if (s !== prevMeta.current) {
      prevMeta.current = s;
      onMetaChange(meta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, tabsFa]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setTabs(e.target.value);

  const handleChangeFa = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setTabsFa(e.target.value);

  const rows = Math.max(4, tabs.split("\n").length);
  const rowsFa = Math.max(4, tabsFa.split("\n").length);

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
        {/* دو تکست‌اریا کنار هم؛ در موبایل زیر هم */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tabs (عمومی/انگلیسی) */}
          <div className="w-full">
 
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

          {/* ✅ Tabs فارسی (ذخیره در metaType2) */}
          <div className="w-full">
          
            {raw ? (
              <textarea
                name={t("tabcontroller.Placeholders.TabFa")}
                className="w-full border rounded p-2 focus:outline-none focus:ring"
                rows={rowsFa}
                value={tabsFa}
                onChange={handleChangeFa}
                placeholder={t("tabcontroller.Placeholders.EnterEachTabFa")}
              />
            ) : (
              <CustomTextarea
                name={t("tabcontroller.Placeholders.TabFa")}
                value={tabsFa}
                onChange={handleChangeFa}
                rows={rowsFa}
                placeholder={t("tabcontroller.Placeholders.EnterEachTabFa")}
                className="w-full"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabController;
