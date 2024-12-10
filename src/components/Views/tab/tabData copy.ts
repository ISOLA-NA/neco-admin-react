// src/components/views/tab/tabData.ts

export interface TabsData {
  [key: string]: {
    groups?: Array<{
      label: string;
      subtabs: string[];
    }>;
    subtabs?: string[];
  };
}

export interface SubTabData {
  columnDefs: any[];
  rowData: any[];
}

export const tabsData: TabsData = {
  General: {
    groups: [
      {
        label: "Settings",
        subtabs: ["Configurations", "Commands", "Ribbons"],
      },
      {
        label: "Users Roles",
        subtabs: ["Users", "Roles", "Staffing", "RoleGroups", "Enterprises"],
      },
    ],
  },
  Forms: {
    subtabs: ["Forms", "Categories"],
  },
  ApprovalFlows: {
    subtabs: ["ApprovalFlows", "ApprovalChecklist"],
  },
  Programs: {
    subtabs: ["ProgramTemplate", "ProgramTypes"],
  },
  Projects: {
    subtabs: ["Projects", "ProjectsAccess", "Odp", "Procedures", "Calendars"],
  },
};

export const subTabDataMapping: { [key: string]: SubTabData } = {
  // General -> Configurations
  Configurations: {
  columnDefs: [
    { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
    { headerName: "Prg.Template", field: "FirstIDProgramTemplate", filter: "agTextColumnFilter" },
    { headerName: "Default Ribbon", field: "SelMenuIDForMain", filter: "agTextColumnFilter" },
  ],
  rowData: [
    {
      Name: "Configuration A",
      FirstIDProgramTemplate: "FirstIDProgramTemplate A",
      SelMenuIDForMain: "SelMenuIDForMain A",
    },
    {
      Name: "Configuration B",
      FirstIDProgramTemplate: "FirstIDProgramTemplate B",
      SelMenuIDForMain: "SelMenuIDForMain B",
    },
    {
      Name: "Configuration C",
      FirstIDProgramTemplate: "FirstIDProgramTemplate C",
      SelMenuIDForMain: "SelMenuIDForMain C",
    },
  ],
}
,
  // General -> Commands
  Commands: {
    columnDefs: [
      {
        headerName: "Command ID",
        field: "commandId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Command Name",
        field: "commandName",
        filter: "agTextColumnFilter",
      },
      { headerName: "Status", field: "status", filter: "agTextColumnFilter" },
      {
        headerName: "Created Date",
        field: "createdDate",
        filter: "agDateColumnFilter",
      },
    ],
    rowData: [
      {
        commandId: 101,
        commandName: "Start Process",
        status: "Active",
        createdDate: "2023-01-15",
      },
      {
        commandId: 102,
        commandName: "Stop Process",
        status: "Inactive",
        createdDate: "2023-02-20",
      },
      {
        commandId: 103,
        commandName: "Restart Service",
        status: "Active",
        createdDate: "2023-03-10",
      },
    ],
  },
  // General -> Ribbons
  Ribbons: {
    columnDefs: [
      { headerName: "ID", field: "id", filter: "agNumberColumnFilter" },
      {
        headerName: "Ribbon Name",
        field: "ribbonName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        id: 1,
        ribbonName: "Main Ribbon",
        description: "Main ribbon of the application",
      },
      {
        id: 2,
        ribbonName: "Tool Ribbon",
        description: "Additional tool ribbons",
      },
    ],
  },
  // General -> Users
  Users: {
    columnDefs: [
      {
        headerName: "User ID",
        field: "userId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "User Name",
        field: "userName",
        filter: "agTextColumnFilter",
      },
      { headerName: "Email", field: "email", filter: "agTextColumnFilter" },
      { headerName: "Role", field: "role", filter: "agTextColumnFilter" },
    ],
    rowData: [
      {
        userId: 1,
        userName: "Ali Ahmadi",
        email: "ali@example.com",
        role: "Admin",
      },
      {
        userId: 2,
        userName: "Zahra Mohammadi",
        email: "zahra@example.com",
        role: "User",
      },
    ],
  },
  // General -> Roles
  Roles: {
    columnDefs: [
      {
        headerName: "Role ID",
        field: "roleId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Role Name",
        field: "roleName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      { roleId: 1, roleName: "Admin", description: "Full access" },
      { roleId: 2, roleName: "User", description: "Limited access" },
    ],
  },
  // General -> Staffing
  Staffing: {
    columnDefs: [
      { headerName: "ID", field: "id", filter: "agNumberColumnFilter" },
      { headerName: "Name", field: "name", filter: "agTextColumnFilter" },
      {
        headerName: "Position",
        field: "position",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Hire Date",
        field: "hireDate",
        filter: "agDateColumnFilter",
      },
    ],
    rowData: [
      {
        id: 1,
        name: "Sara Rezaei",
        position: "Developer",
        hireDate: "2022-05-10",
      },
      {
        id: 2,
        name: "Mohammad Hosseini",
        position: "Project Manager",
        hireDate: "2021-03-15",
      },
    ],
  },
  // General -> RoleGroups
  RoleGroups: {
    columnDefs: [
      {
        headerName: "Group ID",
        field: "groupId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Group Name",
        field: "groupName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        groupId: 1,
        groupName: "Management Group",
        description: "Administrative roles",
      },
      {
        groupId: 2,
        groupName: "Technical Group",
        description: "Technical roles",
      },
    ],
  },
  // General -> Enterprises
  Enterprises: {
    columnDefs: [
      {
        headerName: "Enterprise ID",
        field: "enterpriseId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Enterprise Name",
        field: "enterpriseName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Location",
        field: "location",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      { enterpriseId: 1, enterpriseName: "Company A", location: "Tehran" },
      { enterpriseId: 2, enterpriseName: "Company B", location: "Isfahan" },
    ],
  },
  // Forms -> Forms
  Forms: {
    columnDefs: [
      {
        headerName: "Form ID",
        field: "formId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Form Name",
        field: "formName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Created Date",
        field: "createdDate",
        filter: "agDateColumnFilter",
      },
    ],
    rowData: [
      { formId: 1, formName: "Registration Form", createdDate: "2023-01-01" },
      { formId: 2, formName: "Login Form", createdDate: "2023-02-15" },
    ],
  },
  // Forms -> Categories
  Categories: {
    columnDefs: [
      {
        headerName: "Category ID",
        field: "categoryId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Category Name",
        field: "categoryName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        categoryId: 1,
        categoryName: "Category A",
        description: "Description for Category A",
      },
      {
        categoryId: 2,
        categoryName: "Category B",
        description: "Description for Category B",
      },
    ],
  },
  // ApprovalFlows -> ApprovalFlows
  ApprovalFlows: {
    columnDefs: [
      {
        headerName: "Flow ID",
        field: "flowId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Flow Name",
        field: "flowName",
        filter: "agTextColumnFilter",
      },
      { headerName: "Status", field: "status", filter: "agTextColumnFilter" },
    ],
    rowData: [
      { flowId: 1, flowName: "Approval Flow A", status: "Active" },
      { flowId: 2, flowName: "Approval Flow B", status: "Inactive" },
    ],
  },
  // ApprovalFlows -> ApprovalChecklist
  ApprovalChecklist: {
    columnDefs: [
      {
        headerName: "Checklist ID",
        field: "checkId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Checklist Title",
        field: "title",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        checkId: 1,
        title: "Checklist 1",
        description: "Description for Checklist 1",
      },
      {
        checkId: 2,
        title: "Checklist 2",
        description: "Description for Checklist 2",
      },
    ],
  },
  // Programs -> ProgramTemplate
  ProgramTemplate: {
    columnDefs: [
      {
        headerName: "Template ID",
        field: "templateId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Template Name",
        field: "templateName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        templateId: 1,
        templateName: "Program Template A",
        description: "Description for Template A",
      },
      {
        templateId: 2,
        templateName: "Program Template B",
        description: "Description for Template B",
      },
    ],
  },
  // Programs -> ProgramTypes
  ProgramTypes: {
    columnDefs: [
      {
        headerName: "Type ID",
        field: "typeId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Type Name",
        field: "typeName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      { typeId: 1, typeName: "Type A", description: "Description for Type A" },
      { typeId: 2, typeName: "Type B", description: "Description for Type B" },
    ],
  },
  // Projects -> Projects
  Projects: {
    columnDefs: [
      {
        headerName: "Project ID",
        field: "projectId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Project Name",
        field: "projectName",
        filter: "agTextColumnFilter",
      },
      { headerName: "Status", field: "status", filter: "agTextColumnFilter" },
      {
        headerName: "Start Date",
        field: "startDate",
        filter: "agDateColumnFilter",
      },
    ],
    rowData: [
      {
        projectId: 1,
        projectName: "Project X",
        status: "In Progress",
        startDate: "2023-01-01",
      },
      {
        projectId: 2,
        projectName: "Project Y",
        status: "Completed",
        startDate: "2022-05-15",
      },
    ],
  },
  // Projects -> ProjectsAccess
  ProjectsAccess: {
    columnDefs: [
      {
        headerName: "Access ID",
        field: "accessId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Access Name",
        field: "accessName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Access Level",
        field: "accessLevel",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      { accessId: 1, accessName: "Read Access", accessLevel: "Read" },
      { accessId: 2, accessName: "Write Access", accessLevel: "Write" },
    ],
  },
  // Projects -> Odp
  Odp: {
    columnDefs: [
      { headerName: "ODP ID", field: "odpId", filter: "agNumberColumnFilter" },
      {
        headerName: "ODP Name",
        field: "odpName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      { odpId: 1, odpName: "ODP 1", description: "Description for ODP 1" },
      { odpId: 2, odpName: "ODP 2", description: "Description for ODP 2" },
    ],
  },
  // Projects -> Procedures
  Procedures: {
    columnDefs: [
      {
        headerName: "Procedure ID",
        field: "procedureId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Procedure Name",
        field: "procedureName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        procedureId: 1,
        procedureName: "Procedure A",
        description: "Description for Procedure A",
      },
      {
        procedureId: 2,
        procedureName: "Procedure B",
        description: "Description for Procedure B",
      },
    ],
  },
  // Projects -> Calendars
  Calendars: {
    columnDefs: [
      {
        headerName: "Calendar ID",
        field: "calendarId",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Calendar Name",
        field: "calendarName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        calendarId: 1,
        calendarName: "Calendar 1",
        description: "Description for Calendar 1",
      },
      {
        calendarId: 2,
        calendarName: "Calendar 2",
        description: "Description for Calendar 2",
      },
    ],
  },
};
