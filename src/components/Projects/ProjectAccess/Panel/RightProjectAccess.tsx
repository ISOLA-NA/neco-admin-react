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
     const booleanKeys = Object.keys(selectedRow).filter(
       (k) => typeof (selectedRow as any)[k] === "boolean"
     );
   
     return (
       <div className="p-2 h-full flex flex-col gap-2 bg-gradient-to-b from-blue-50 to-pink-50 rounded-md overflow-auto">
         <div className="flex items-center justify-between mb-2">
           <span className="font-bold text-sm">Mode:</span>
           <DynamicSwitcher
             isChecked={selectedRow.AccessMode === 1}
             onChange={() =>
               onRowChange({
                 AccessMode: selectedRow.AccessMode === 1 ? 2 : 1,
               })
             }
           />
         </div>
   
         <h2 className="text-center text-lg font-semibold">Access</h2>
   
         <div className="grid grid-cols-2 gap-2">
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
               <span className="ml-2 text-xs">{key}</span>
             </label>
           ))}
         </div>
       </div>
     );
   };
   
   export default RightProjectAccess;
   