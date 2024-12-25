// src/components/views/tab/SubTabsImports.tsx

import React from "react";

export const subTabComponents: {
  [key: string]: React.LazyExoticComponent<React.ComponentType<any>>;
} = {
  // General
  Configurations: React.lazy(
    () => import("../../General/Configuration/Configurations")
  ),
  Commands: React.lazy(
    () => import("../../../components/General/CommandSettings")
  ),
  Ribbons: React.lazy(() => import("../../General/Ribbon/LeftRibbon/Ribbons")),
  Users: React.lazy(() => import("../../../components/General/Users")),
  Roles: React.lazy(() => import("../../../components/General/Roles")),
  Staffing: React.lazy(() => import("../../../components/General/Staffing")),
  RoleGroups: React.lazy(
    () => import("../../../components/General/RoleGroups")
  ),
  Enterprises: React.lazy(
    () => import("../../../components/General/Enterprises")
  ),

  // Forms
  Forms: React.lazy(() => import("../../../components/Forms/Forms")),
  Categories: React.lazy(() => import("../../../components/Forms/Categories")),

  // ApprovalFlows
  ApprovalFlows: React.lazy(
    () => import("../../ApprovalFlows/MainApproval/ApprovalFlows")
  ),
  ApprovalChecklist: React.lazy(
    () => import("../../../components/ApprovalFlows/ApprovalChecklist")
  ),

  // Programs
  ProgramTemplate: React.lazy(
    () => import("../../Programs/ProgramTemplate/ProgramTemplate")
  ),
  ProgramTypes: React.lazy(
    () => import("../../../components/Programs/ProgramTypes")
  ),

  // Projects
  Projects: React.lazy(() => import("../../../components/Projects/Projects")),
  ProjectsAccess: React.lazy(
    () => import("../../Projects/ProjectAccess/ProjectsAccess")
  ),
  Odp: React.lazy(() => import("../../../components/Projects/Odp")),
  Procedures: React.lazy(
    () => import("../../../components/Projects/Procedures")
  ),
  Calendars: React.lazy(() => import("../../../components/Projects/Calendars")),
};
