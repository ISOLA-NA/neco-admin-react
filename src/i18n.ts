// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English files
import enGlobal from "./components/locales/en/global.json";
import enLogin from "./components/locales/en/login.json";
import enMenu from "./components/locales/en/Menu.json";
import enConfiguration from "./components/locales/en/configuration.json";
import enCommand from "./components/locales/en/Command.json";
import enRibbon from "./components/locales/en/Ribbons.json";
import enCompany from "./components/locales/en/Company.json";
import enUser from "./components/locales/en/User.json";
import enRole from "./components/locales/en/Roles.json";
import enStaffing from "./components/locales/en/Staffing.json";
import enRoleGroup from "./components/locales/en/RoleGroup.json";
import enForms from "./components/locales/en/Forms.json";
import enAddForms from "./components/locales/en/AddForms.json";
import enCategory from "./components/locales/en/Category.json";
import enApprovalFlows from "./components/locales/en/ApprovalFlows.json";
import enAddApprovalFlows from "./components/locales/en/AddApprovalFlows.json";
import enAlertsTab from "./components/locales/en/AlertsTab.json";
import enProgramTemplate from "./components/locales/en/ProgramTemplate.json";
import enAddProgramTemplate from "./components/locales/en/AddProgramTemplate.json";
import enProgramType from "./components/locales/en/ProgramType.json";
import enProjects from "./components/locales/en/Projects.json";
import enProjectsAccess from "./components/locales/en/ProjectAccess.json";
import enODP from "./components/locales/en/ODP.json";
import enProcedure from "./components/locales/en/Procedure.json";
import enCalendar from "./components/locales/en/Calendar.json";
import enDataTable from "./components/locales/en/DataTable.json";
import enAlerts from "./components/locales/en/Alerts.json";
import enDynamicConfirm from "./components/locales/en/DynamicConfirm.json";
import enTextController from "./components/locales/en/Forms/TextController.json";
import enChoiceController from "./components/locales/en/Forms/ChoiceController.json";
import enNumberController from "./components/locales/en/Forms/NumberController.json";
import enDateTimeEnglish from "./components/locales/en/Forms/DateTimeEnglish.json";
import enLookUp from "./components/locales/en/Forms/LookUp.json";
import enLookUpRealValue from "./components/locales/en/Forms/LookUpRealValue.json";
import enLookUpAdvanceTable from "./components/locales/en/Forms/LookUpAdvanceTable.json";
import enAdvanceLookUpAdvanceTable from "./components/locales/en/Forms/AdvanceLookupAdvanceTable.json";
import enHyperLink from "./components/locales/en/Forms/HyperLinkController.json";
import enPostPickerList from "./components/locales/en/Forms/PostPickerList.json";
import enLookupImage from "./components/locales/en/Forms/Lookupimage.json";
import enSelectUserInPost from "./components/locales/en/Forms/SelectUserInPost.json";
import enYesNo from "./components/locales/en/Forms/YesNoController.json";
import enAttachFile from "./components/locales/en/Forms/AttachFile.json";
import enPictureBox from "./components/locales/en/Forms/PictureBoxFile.json";
import enTable from "./components/locales/en/Forms/TableController.json";
import enPfiLookUp from "./components/locales/en/Forms/PfiLookup.json";
import enAdvanceTable from "./components/locales/en/Forms/AdvanceTable.json";
import enSeqenialNumber from "./components/locales/en/Forms/SeqenialNumber.json";
import enWordPanel from "./components/locales/en/Forms/WordPanel.json";
import enExcelPanel from "./components/locales/en/Forms/ExcelPanel.json";
import enCalculatedField from "./components/locales/en/Forms/Calculatedfield.json";
import enExcelCalculator from "./components/locales/en/Forms/Excelcalculator.json";
import enTab from "./components/locales/en/Forms/Tabcontroller.json";
import enMap from "./components/locales/en/Forms/Map.json";
import enInfo from "./components/locales/en/Info.json";
import enAccount from "./components/locales/en/Account.json";
import enSidebarDrawer from "./components/locales/en/SideBarDrawer.json";
// Farsi files
import faGlobal from "./components/locales/fa/global.json";
import faLogin from "./components/locales/fa/login.json";
import faMenu from "./components/locales/fa/Menu.json";
import faConfiguration from "./components/locales/fa/configuration.json";
import faCommand from "./components/locales/fa/Command.json";
import faRibbon from "./components/locales/fa/Ribbons.json";
import faCompany from "./components/locales/fa/Company.json";
import faUser from "./components/locales/fa/User.json";
import faRole from "./components/locales/fa/Roles.json";
import faStaffing from "./components/locales/fa/Staffing.json";
import faRoleGroup from "./components/locales/fa/RoleGroup.json";
import faForms from "./components/locales/fa/Forms.json";
import faAddForms from "./components/locales/fa/AddForms.json";
import faCategory from "./components/locales/fa/Category.json";
import faApprovalFlows from "./components/locales/fa/ApprovalFlows.json";
import faAddApprovalFlows from "./components/locales/fa/AddApprovalFlows.json";
import faAlertsTab from "./components/locales/fa/AlertsTab.json";
import faProgramTemplate from "./components/locales/fa/ProgramTemplate.json";
import faAddProgramTemplate from "./components/locales/fa/AddProgramTemplate.json";
import faProgramType from "./components/locales/fa/ProgramType.json";
import faProjects from "./components/locales/fa/Projects.json";
import faProjectsAccess from "./components/locales/fa/ProjectAccess.json";
import faODP from "./components/locales/fa/ODP.json";
import faProcedure from "./components/locales/fa/Procedure.json";
import faCalendar from "./components/locales/fa/Calendar.json";
import faDataTable from "./components/locales/fa/DataTable.json";
import faAlerts from "./components/locales/fa/Alerts.json";
import faDynamicConfirm from "./components/locales/fa/DynamicConfirm.json";
import faTextController from "./components/locales/fa/Forms/TextController.json";
import faChoiceController from "./components/locales/fa/Forms/ChoiceController.json";
import faNumberController from "./components/locales/fa/Forms/NumberController.json";
import faDateTimeEnglish from "./components/locales/fa/Forms/DateTimeEnglish.json";
import faLookUp from "./components/locales/fa/Forms/LookUp.json";
import faLookUpRealValue from "./components/locales/fa/Forms/LookUpRealValue.json";
import faLookUpAdvanceTable from "./components/locales/fa/Forms/LookUpAdvanceTable.json";
import faAdvanceLookUpAdvanceTable from "./components/locales/fa/Forms/AdvanceLookupAdvanceTable.json";
import faHyperLink from "./components/locales/fa/Forms/HyperLinkController.json";
import faPostPickerList from "./components/locales/fa/Forms/PostPickerList.json";
import faLookupImage from "./components/locales/fa/Forms/Lookupimage.json";
import faSelectUserInPost from "./components/locales/fa/Forms/SelectUserInPost.json";
import faYesNo from "./components/locales/fa/Forms/YesNoController.json";
import faAttachFile from "./components/locales/fa/Forms/AttachFile.json";
import faPictureBox from "./components/locales/fa/Forms/PictureBoxFile.json";
import faTable from "./components/locales/fa/Forms//TableController.json";
import faPfiLookUp from "./components/locales/fa/Forms/PfiLookup.json";
import faAdvanceTable from "./components/locales/fa/Forms/AdvanceTable.json";
import faSeqenialNumber from "./components/locales/fa/Forms/SeqenialNumber.json";
import faWordPanel from "./components/locales/fa/Forms/WordPanel.json";
import faExcelPanel from "./components/locales/fa/Forms/ExcelPanel.json";
import faCalculatedField from "./components/locales/fa/Forms/Calculatedfield.json";
import faExcelCalculator from "./components/locales/fa/Forms/Excelcalculator.json";
import faTab from "./components/locales/fa/Forms/Tabcontroller.json";
import faMap from "./components/locales/fa/Forms/Map.json";
import faInfo from "./components/locales/fa/Info.json";
import faAccount from "./components/locales/fa/Account.json";
import faSidebarDrawer from "./components/locales/fa/SideBarDrawer.json";

const resources = {
  en: {
    translation: {
      ...enGlobal,
      ...enLogin,
      ...enMenu,
      ...enConfiguration,
      ...enCommand,
      ...enRibbon,
      ...enCompany,
      ...enUser,
      ...enRole,
      ...enStaffing,
      ...enRoleGroup,
      ...enForms,
      ...enAddForms,
      ...enCategory,
      ...enApprovalFlows,
      ...enAddApprovalFlows,
      ...enAlertsTab,
      ...enProgramTemplate,
      ...enAddProgramTemplate,
      ...enProgramType,
      ...enProjects,
      ...enProjectsAccess,
      ...enODP,
      ...enProcedure,
      ...enCalendar,
      ...enDataTable,
      ...enAlerts,
      ...enDynamicConfirm,
      ...enTextController,
      ...enChoiceController,
      ...enNumberController,
      ...enDateTimeEnglish,
      ...enLookUp,
      ...enLookUpRealValue,
      ...enLookUpAdvanceTable,
      ...enAdvanceLookUpAdvanceTable,
      ...enHyperLink,
      ...enPostPickerList,
      ...enLookupImage,
      ...enSelectUserInPost,
      ...enYesNo,
      ...enAttachFile,
      ...enPictureBox,
      ...enTable,
      ...enPfiLookUp,
      ...enAdvanceTable,
      ...enSeqenialNumber,
      ...enWordPanel,
      ...enExcelPanel,
      ...enCalculatedField,
      ...enExcelCalculator,
      ...enTab,
      ...enMap,
      ...enInfo,
      ...enAccount,
      ...enSidebarDrawer,
    },
  },
  fa: {
    translation: {
      ...faGlobal,
      ...faLogin,
      ...faMenu,
      ...faConfiguration,
      ...faCommand,
      ...faRibbon,
      ...faCompany,
      ...faUser,
      ...faRole,
      ...faStaffing,
      ...faRoleGroup,
      ...faForms,
      ...faAddForms,
      ...faCategory,
      ...faApprovalFlows,
      ...faAddApprovalFlows,
      ...faAlertsTab,
      ...faProgramTemplate,
      ...faAddProgramTemplate,
      ...faProgramType,
      ...faProjects,
      ...faProjectsAccess,
      ...faODP,
      ...faProcedure,
      ...faCalendar,
      ...faDataTable,
      ...faAlerts,
      ...faDynamicConfirm,
      ...faTextController,
      ...faChoiceController,
      ...faNumberController,
      ...faDateTimeEnglish,
      ...faLookUp,
      ...faLookUpRealValue,
      ...faLookUpAdvanceTable,
      ...faAdvanceLookUpAdvanceTable,
      ...faHyperLink,
      ...faPostPickerList,
      ...faLookupImage,
      ...faSelectUserInPost,
      ...faYesNo,
      ...faAttachFile,
      ...faPictureBox,
      ...faTable,
      ...faPfiLookUp,
      ...faAdvanceTable,
      ...faSeqenialNumber,
      ...faWordPanel,
      ...faExcelPanel,
      ...faCalculatedField,
      ...faExcelCalculator,
      ...faTab,
      ...faMap,
      ...faInfo,
      ...faAccount,
      ...faSidebarDrawer,
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("i18nextLng") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// ★ هم‌گام‌سازی جهت و زبانِ عنصر <html> با تغییر زبان (fa و fa-IR و ... را پوشش بده)
const setDir = (lng: string) => {
  const isRtl = /^(fa|ar|he|ur)(-|$)/.test(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
  document.documentElement.classList.toggle("rtl", isRtl);
};
setDir(i18n.language);

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("i18nextLng", lng);
  setDir(lng);
});

export default i18n;
