/* ----------------------------------------------------------
   src/components/Projects/ProjectAccess/Panel/RightProjectAccess.tsx
   ---------------------------------------------------------- */
   import React from "react";
   import DynamicSwitcher from "../../../utilities/DynamicSwitcher";
   import { AccessProject } from "../../../../services/api.services";
   
   interface RightProps {
     selectedRow: AccessProject;
     onRowChange: (updated: Partial<AccessProject>) => void;
   }
   
   const RightProjectAccess: React.FC<RightProps> = ({
     selectedRow,
     onRowChange,
   }) => {
     // تعریف مقادیر ثابت برای خوانایی
     const READ_MODE = 1;
     const WRITE_MODE = 2;
   
     // حالا 1 = Read، 2 = Write
     const isRead = selectedRow.AccessMode === READ_MODE;
     const modeLabel = isRead ? "Read" : "Write";
     const labelClass = isRead
       ? "text-gray-500"
       : "text-blue-600 font-semibold";
   
     const booleanKeys = Object.keys(selectedRow).filter(
       (k) => typeof (selectedRow as any)[k] === "boolean"
     );
   
     return (
       <div className="p-2 h-full flex flex-col gap-3 bg-gradient-to-b from-blue-50 to-pink-50 rounded-md overflow-auto">
         {/* Mode switcher */}
         <div className="flex items-center justify-center gap-2">
           <span className="text-sm font-semibold">Mode</span>
           <DynamicSwitcher
             isChecked={isRead}
             onChange={() =>
               onRowChange({
                 AccessMode: isRead ? WRITE_MODE : READ_MODE,
               })
             }
             leftLabel=""
             rightLabel=""
           />
           <span className={`text-sm ${labelClass}`}>{modeLabel}</span>
         </div>
   
         <h2 className="text-center text-lg font-semibold">Access</h2>
   
         <div className="grid grid-cols-2 gap-2 pb-4">
           {booleanKeys.map((key) => (
             <label
               key={key}
               className="flex items-center border px-2 py-1 rounded bg-white"
             >
               <input
                 type="checkbox"
                 checked={(selectedRow as any)[key]}
                 onChange={() =>
                   onRowChange({ [key]: !(selectedRow as any)[key] })
                 }
                 className="h-4 w-4"
               />
               <span className="ml-2 text-xs truncate">{key}</span>
             </label>
           ))}
         </div>
       </div>
     );
   };
   
   export default RightProjectAccess;
   