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
