// MainAccardeon.tsx

import React, { useState, useEffect } from "react";
import Accordion1 from "../RightRibbon/Accordion1";
import Accordion2 from "../RightRibbon/Accordion2";
import Accordion3 from "../RightRibbon/Accordion3";

// تعریف نوع برای ردیف‌های Accordion1
interface RowData1 {
  ID: number;
  Name: string;
  Description: string;
  Order: number;
}

// تعریف نوع برای ردیف‌های Accordion2
interface RowData2 {
  ID: number;
  Name: string;
  Description: string;
  Order: number;
}

const MainAccardeon: React.FC = () => {
  const [selectedRow1, setSelectedRow1] = useState<RowData1 | null>(null);
  const [selectedRow2, setSelectedRow2] = useState<RowData2 | null>(null);

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

  // باز کردن اکاردئون بعدی با استفاده از useEffect
  useEffect(() => {
    if (selectedRow1) {
      setAccordionsOpen((prev) => ({ ...prev, 2: true }));
    } else {
      setAccordionsOpen((prev) => ({ ...prev, 2: false, 3: false }));
    }
  }, [selectedRow1]);

  useEffect(() => {
    if (selectedRow2) {
      setAccordionsOpen((prev) => ({ ...prev, 3: true }));
    } else {
      setAccordionsOpen((prev) => ({ ...prev, 3: false }));
    }
  }, [selectedRow2]);

  return (
    <div className="-mt-5">
      <Accordion1
        onRowClick={(row: RowData1 | null) => {
          setSelectedRow1(row);
          setSelectedRow2(null); // پاکسازی انتخاب در Accordion2
        }}
        onRowDoubleClick={(menuTabId: number) => {
          console.log(`Double clicked MenuTab ID: ${menuTabId}`);
          // اکاردئون بعدی به طور خودکار توسط useEffect باز می‌شود
        }}
        isOpen={accordionsOpen[1]}
        toggleAccordion={() => toggleAccordion(1)}
      />
      <Accordion2
        selectedMenuTabId={selectedRow1 ? selectedRow1.ID : null}
        onRowClick={(row: RowData2 | null) => {
          setSelectedRow2(row);
        }}
        onRowDoubleClick={(menuGroupId: number) => {
          console.log(`Double clicked MenuGroup ID: ${menuGroupId}`);
          // اکاردئون بعدی به طور خودکار توسط useEffect باز می‌شود
        }}
        isOpen={accordionsOpen[2]}
        toggleAccordion={() => toggleAccordion(2)}
      />
      <Accordion3
        selectedMenuGroupId={selectedRow2 ? selectedRow2.ID : null}
        onRowDoubleClick={() => {
          console.log("Double clicked MenuItem");
          // اکاردئون بعدی ندارد
        }}
        isOpen={accordionsOpen[3]}
        toggleAccordion={() => toggleAccordion(3)}
      />
    </div>
  );
};

export default MainAccardeon;
