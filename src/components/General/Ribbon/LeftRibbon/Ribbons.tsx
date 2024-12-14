// Ribbons.tsx

import React, { useState } from "react";
import Accordion1 from "../RightRibbon/Accordion1";
import Accordion2 from "../RightRibbon/Accordion2";
import Accordion3 from "../RightRibbon/Accordion3";

const Ribbons: React.FC = () => {
  const [selectedRow1, setSelectedRow1] = useState<any>(null);
  const [selectedRow2, setSelectedRow2] = useState<any>(null);

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

  // هندلر باز کردن اکاردئون بعدی با دابل کلیک روی ردیف
  const openNextAccordion = (currentIndex: number) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex <= 3) {
      setAccordionsOpen((prev) => ({ ...prev, [nextIndex]: true }));
    }
  };

  return (
    <div className="p-4">
      <Accordion1
        onRowClick={(row) => {
          setSelectedRow1(row);
          setSelectedRow2(null);
        }}
        onRowDoubleClick={() => {
          openNextAccordion(1); // اکاردئون بعدی، اکاردئون 2 را باز می‌کند
        }}
        isOpen={accordionsOpen[1]}
        toggleAccordion={() => toggleAccordion(1)}
      />
      <Accordion2
        selectedRow={selectedRow1}
        onRowClick={(row) => {
          setSelectedRow2(row);
        }}
        onRowDoubleClick={() => {
          openNextAccordion(2); // اکاردئون بعدی، اکاردئون 3 را باز می‌کند
        }}
        isOpen={accordionsOpen[2]}
        toggleAccordion={() => toggleAccordion(2)}
      />
      <Accordion3
        selectedRow={selectedRow2}
        onRowDoubleClick={() => {
          // اکاردئون بعدی ندارد
        }}
        isOpen={accordionsOpen[3]}
        toggleAccordion={() => toggleAccordion(3)}
      />
    </div>
  );
};

export default Ribbons;
