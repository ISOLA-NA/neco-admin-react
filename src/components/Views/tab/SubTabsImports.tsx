// src/components/views/tab/subTabImports.ts
// This file consolidates all dynamic imports for sub-tabs.

import React from "react";

export const subTabComponents: {
  [key: string]: React.LazyExoticComponent<React.FC>;
} = {
  // General
  Configurations: React.lazy(
    () => import("../../../components/General/Configurations")
  ),
  Commands: React.lazy(
    () => import("../../../components/General/CommandSettings")
  ),
  Ribbons: React.lazy(() => import("../../../components/General/Ribbons")),
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
    () => import("../../../components/ApprovalFlows/ApprovalFlows")
  ),
  ApprovalChecklist: React.lazy(
    () => import("../../../components/ApprovalFlows/ApprovalChecklist")
  ),

  // Programs
  ProgramTemplate: React.lazy(
    () => import("../../../components/Programs/ProgramTemplate")
  ),
  ProgramTypes: React.lazy(
    () => import("../../../components/Programs/ProgramTypes")
  ),

  // Projects
  Projects: React.lazy(() => import("../../../components/Projects/Projects")),
  ProjectsAccess: React.lazy(
    () => import("../../../components/Projects/ProjectsAccess")
  ),
  Odp: React.lazy(() => import("../../../components/Projects/Odp")),
  Procedures: React.lazy(
    () => import("../../../components/Projects/Procedures")
  ),
  Calendars: React.lazy(() => import("../../../components/Projects/Calendars")),
};
