// src/components/MainAccordion.tsx

import React, { useState, useEffect } from "react";
import Accordion1 from "../RightRibbon/Accordion1";
import Accordion2 from "../RightRibbon/Accordion2";
import Accordion3 from "../RightRibbon/Accordion3";
import "./style.css"

// تعریف نوع برای داده‌های Ribbons
interface RibbonRow {
  ID: number;
  Name: string;
}

interface RowData1 {
  ID: number;
  Name: string;
  Description: string;
  Order: number;
}

interface RowData2 {
  ID: number;
  Name: string;
  Description: string;
  Order: number;
}

const MainAccordion: React.FC<{ selectedRow?: RibbonRow }> = ({
  selectedRow,
}) => {
  const [selectedRow1, setSelectedRow1] = useState<RowData1 | null>(null);
  const [selectedRow2, setSelectedRow2] = useState<RowData2 | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(
    selectedRow?.ID || null
  );

  const [accordionsOpen, setAccordionsOpen] = useState<{
    [key: number]: boolean;
  }>({
    1: true, // Accordion1 به صورت پیش‌فرض باز
    2: false,
    3: false,
  });

  const toggleAccordion = (index: number) => {
    setAccordionsOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // هر زمان که انتخاب Ribbon تغییر کند، Accordion1 را دوباره بارگذاری می‌کنیم
  useEffect(() => {
    if (selectedRow) {
      setSelectedMenuId(selectedRow.ID); // ID Ribbon انتخاب‌شده
      setSelectedRow1(null); // پاک کردن داده‌های Accordion1
      setSelectedRow2(null); // پاک کردن داده‌های Accordion2
      setAccordionsOpen({ 1: true, 2: false, 3: false }); // باز کردن Accordion1
      console.log("Selected Ribbon:", selectedRow);
    }
  }, [selectedRow]);

  useEffect(() => {
    if (selectedRow1) {
      setAccordionsOpen((prev) => ({ ...prev, 2: true })); // باز کردن Accordion2
    } else {
      setAccordionsOpen((prev) => ({ ...prev, 2: false, 3: false })); // بستن سایر اکاردئون‌ها
    }
  }, [selectedRow1]);

  useEffect(() => {
    if (selectedRow2) {
      setAccordionsOpen((prev) => ({ ...prev, 3: true })); // باز کردن Accordion3
    } else {
      setAccordionsOpen((prev) => ({ ...prev, 3: false })); // بستن Accordion3
    }
  }, [selectedRow2]);

  return (
    <div className="-mt-5">
      <Accordion1
        onRowClick={(row: RowData1 | null) => {
          setSelectedRow1(row);
          setSelectedRow2(null); // پاک کردن انتخاب Accordion2
        }}
        onRowDoubleClick={(menuTabId: number) => {
          console.log(`Double clicked MenuTab ID: ${menuTabId}`);
        }}
        isOpen={accordionsOpen[1]}
        toggleAccordion={() => toggleAccordion(1)}
        selectedMenuId={selectedMenuId} // انتقال ID Ribbon به Accordion1
      />
      <Accordion2
        selectedMenuTabId={selectedRow1 ? selectedRow1.ID : null}
        onRowClick={(row: RowData2 | null) => {
          setSelectedRow2(row);
        }}
        onRowDoubleClick={(menuGroupId: number) => {
          console.log(`Double clicked MenuGroup ID: ${menuGroupId}`);
        }}
        isOpen={accordionsOpen[2]}
        toggleAccordion={() => toggleAccordion(2)}
      />
      <Accordion3
        selectedMenuGroupId={selectedRow2 ? selectedRow2.ID : null}
        onRowDoubleClick={() => {
          console.log("Double clicked MenuItem");
        }}
        isOpen={accordionsOpen[3]}
        toggleAccordion={() => toggleAccordion(3)}
      />
    </div>
  );
};

export default MainAccordion;
