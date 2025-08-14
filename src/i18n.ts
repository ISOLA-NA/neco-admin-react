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
import enAlerts from "./components/locales/en/Alerts.json";
import enProgramTemplate from "./components/locales/en/ProgramTemplate.json";
import enAddProgramTemplate from "./components/locales/en/AddProgramTemplate.json";
import enProgramType from "./components/locales/en/ProgramType.json";

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
import faAlerts from "./components/locales/fa/Alerts.json";
import faProgramTemplate from "./components/locales/fa/ProgramTemplate.json";
import faAddProgramTemplate from "./components/locales/fa/AddProgramTemplate.json";
import faProgramType from "./components/locales/fa/ProgramType.json";

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
      ...enAlerts,
      ...enProgramTemplate,
      ...enAddProgramTemplate,
      ...enProgramType,
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
      ...faAlerts,
      ...faProgramTemplate,
      ...faAddProgramTemplate,
      ...faProgramType,
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("i18nextLng") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// ★ هم‌گام‌سازی جهت و زبانِ عنصر <html> با تغییر زبان
const setDir = (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "fa" ? "rtl" : "ltr";
};
setDir(i18n.language);

i18n.on("languageChanged", (lng) => setDir(lng));

export default i18n;
