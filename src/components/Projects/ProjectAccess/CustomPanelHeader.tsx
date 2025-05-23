/* ----------------------------------------------------------
   src/components/Projects/ProjectAccess/PAHeader.tsx
   ---------------------------------------------------------- */
   import React from "react";
   import { FaSave, FaEdit } from "react-icons/fa";
   
   interface Props {
     onSave?: () => void;
     onUpdate?: () => void;
     onClose?: () => void;
     isEditMode: boolean;
   }
   
   const PAHeader: React.FC<Props> = ({
     onSave,
     onUpdate,
     onClose,
     isEditMode,
   }) => (
     <div className="flex items-center justify-end gap-2 bg-white border-b px-3 py-2 shadow-sm">
       {/* Save / Update  ← سمت چپ Cancel */}
       {isEditMode ? (
         <button
           onClick={onUpdate}
           className="flex items-center gap-1 px-4 py-1 text-xs rounded bg-amber-500 hover:bg-amber-600 text-white"
         >
           <FaEdit />
           Update
         </button>
       ) : (
         <button
           onClick={onSave}
           className="flex items-center gap-1 px-4 py-1 text-xs rounded bg-green-500 hover:bg-green-600 text-white"
         >
           <FaSave />
           Save
         </button>
       )}
   
       {/* Cancel (راست‌ترین) */}
       {onClose && (
         <button
           onClick={onClose}
           className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
         >
           Cancel
         </button>
       )}
     </div>
   );
   
   export default PAHeader;
   