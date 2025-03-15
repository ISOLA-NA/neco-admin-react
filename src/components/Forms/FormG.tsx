// src/components/FormG.tsx
import React from "react";
import { Rule } from "../../services/formGeneratorHelper";

// وارد کردن کامپوننت‌های داینامیک
import CtrTextBox from "./ControllerForms/TextController";
import CtrTextArea from "./ControllerForms/RichTextController";
import CtrRadio from "./ControllerForms/ChoiceController";
import CtrInputNumber from "./ControllerForms/NumberController";
import CtrSelect from "./ControllerForms/ChoiceController";
import CtrDatePicker from "./ControllerForms/DateTimeEnglishController";
import CtrPersianDate from "./ControllerForms/DateTimePersianController";
import CtrLookup from "./ControllerForms/LookupController";
import CtrLookupRealValue from "./ControllerForms/LookupRealValueController";
import CtrLookupAdvanceTable from "./ControllerForms/LookUpAdvanceTable";
import CtrAvanceLookupAdvanceTable from "./ControllerForms/AdvanceLookupAdvanceTable";
import CtrLookupImage from "./ControllerForms/LookupImage";
import CtrSwitch from "./ControllerForms/YesNoController";
import CtrHyperLink from "./ControllerForms/HyperLinkController";
import CtrSelectUserInPost from "./ControllerForms/SelectUserInPost";
import CtrPFILookup from "./ControllerForms/PfiLookUpController";
import CtrCalCulatedField from "./ControllerForms/CalculatedField";
import CtrExcelCalculator from "./ControllerForms/ExcelCalculator";
import CtrMap from "./ControllerForms/MapController";
import Tab from "./ControllerForms/TabController";
import CtrUpload from "./ControllerForms/AttachFileController";
import CtrPictureBox from "./ControllerForms/PictureBoxController";
import CtrWordPanel from "./ControllerForms/WordPanelController";
import CtrExcelPanel from "./ControllerForms/ExceclPanelController";
import CtrTitle from "./ControllerForms/TitleController";

interface FormGProps {
  ctrForm: Rule[];
  selectedRow?: any;
  getFileName?: (fileName: string) => void;
  emitmetaTypes: (meta: any) => void;
}

const componentMapping: { [key: string]: React.FC<any> } = {
  CtrTextBox,
  CtrTextArea,
  CtrRadio,
  CtrInputNumber,
  CtrSelect,
  CtrDatePicker,
  CtrPersianDate,
  CtrLookup,
  CtrLookupRealValue,
  CtrLookupAdvanceTable,
  CtrAvanceLookupAdvanceTable,
  CtrLookupImage,
  CtrSwitch,
  CtrHyperLink,
  CtrSelectUserInPost,
  CtrPFILookup,
  CtrCalCulatedField,
  CtrExcelCalculator,
  CtrMap,
  Tab,
  CtrUpload,
  CtrPictureBox,
  CtrWordPanel,
  CtrExcelPanel,
  CtrTitle
};

const FormG: React.FC<FormGProps> = ({
  ctrForm,
  selectedRow,
  getFileName,
  emitmetaTypes,
}) => {
  return (
    <div className="form-g">
      <div className="box-card">
        <div className="form-g-container">
          {ctrForm.map((child, i) => {
            const Component = componentMapping[child.name];
            if (!Component) return null;
            return (
              <Component
                key={i}
                data={child}
                selectedRow={selectedRow}
                getFileName={getFileName}
                emitmetaTypes={emitmetaTypes}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormG;
