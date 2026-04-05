// src/components/MainAccordion.tsx

import React, { useState, useEffect } from "react";
import Accordion1 from "../RightRibbon/Accordion1";
import Accordion2 from "../RightRibbon/Accordion2";
import Accordion3 from "../RightRibbon/Accordion3";
import "./style.css";

// تعریف نوع برای داده‌های Ribbons
interface RibbonRow {
  ID: number;
  Name: string;
  PersianName?: string | null;
}

interface RowData1 {
  ID: number;
  Name: string;
  PersianName?: string | null;
  Description: string;
  Order: number;
}

interface RowData2 {
  ID: number;
  Name: string;
  PersianName?: string | null;
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
    1: true,
    2: false,
    3: false,
  });

  const toggleAccordion = (index: number) => {
    setAccordionsOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    if (selectedRow) {
      setSelectedMenuId(selectedRow.ID);
      setSelectedRow1(null);
      setSelectedRow2(null);
      setAccordionsOpen({ 1: true, 2: false, 3: false });
      console.log("Selected Ribbon:", selectedRow);
    }
  }, [selectedRow]);

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

  const ribbonDisplayName =
    selectedRow?.PersianName?.trim() ||
    selectedRow?.Name?.trim() ||
    null;

  const menuTabDisplayName =
    selectedRow1?.PersianName?.trim() ||
    selectedRow1?.Name?.trim() ||
    null;

  const menuGroupDisplayName =
    selectedRow2?.PersianName?.trim() ||
    selectedRow2?.Name?.trim() ||
    null;

  return (
    <div className="-mt-5">
      <Accordion1
        onRowClick={(row: RowData1 | null) => {
          setSelectedRow1(row);
          setSelectedRow2(null);
        }}
        onRowDoubleClick={(menuTabId: number) => {
          console.log(`Double clicked MenuTab ID: ${menuTabId}`);
        }}
        isOpen={accordionsOpen[1]}
        toggleAccordion={() => toggleAccordion(1)}
        selectedMenuId={selectedMenuId}
        selectedMenuName={ribbonDisplayName}
      />
      <Accordion2
        selectedMenuTabId={selectedRow1 ? selectedRow1.ID : null}
        selectedMenuTabName={menuTabDisplayName}
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
        selectedMenuGroupName={menuGroupDisplayName}
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