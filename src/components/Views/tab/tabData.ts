// src/components/Views/tab/tabData.ts

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

// **1. تعریف Program Templates**
export const programTemplates = [
  {
    ID: 1,
    Name: "Template Alpha",
    Description: "Description for Template Alpha",
    IsVisible: true,
    LastModified: "2024-10-08T15:31:11.947",
  },
  {
    ID: 2,
    Name: "Template Beta",
    Description: "Description for Template Beta",
    IsVisible: true,
    LastModified: "2024-10-09T16:32:12.123",
  },
  {
    ID: 3,
    Name: "Template Gamma",
    Description: "Description for Template Gamma",
    IsVisible: true,
    LastModified: "2024-10-10T17:33:13.456",
  },
  // افزودن بیشتر قالب‌ها در صورت نیاز
];

// **2. تعریف Default Ribbons**
export const defaultRibbons = [
  {
    ID: 1,
    Name: "Ribbon One",
    Description: "Description for Ribbon One",
    IsVisible: true,
    LastModified: "2024-05-27T16:18:54.03",
  },
  {
    ID: 2,
    Name: "Ribbon Two",
    Description: "Description for Ribbon Two",
    IsVisible: true,
    LastModified: "2024-05-28T16:18:54.03",
  },
  {
    ID: 3,
    Name: "Ribbon Three",
    Description: "Description for Ribbon Three",
    IsVisible: true,
    LastModified: "2024-05-29T16:18:54.03",
  },
  {
    ID: 4,
    Name: "Ribbon Four",
    Description: "Description for Ribbon Four",
    IsVisible: true,
    LastModified: "2024-05-30T16:18:54.03",
  },
  // افزودن بیشتر Ribbon‌ها در صورت نیاز
];

// **3. تعریف Buttons**
export const buttons = [
  {
    ID: 1,
    IconImageId: "icon-1",
    IsVisible: true,
    LastModified: "2023-03-15T13:17:58.24",
    ModifiedById: "user-1",
    Name: "Approve as noted",
    Order: 1,
    StateText: "Approved as noted",
    Tooltip: "Approved as noted",
    WFCommand: 1,
    WFStateForDeemed: 1,
  },
  // ... سایر دکمه‌ها تا ID 10
  {
    ID: 10,
    IconImageId: "icon-10",
    IsVisible: true,
    LastModified: "2023-03-24T22:26:07.24",
    ModifiedById: "user-10",
    Name: "Mark as urgent",
    Order: 10,
    StateText: "Urgent",
    Tooltip: "Mark the submission as urgent",
    WFCommand: 10,
    WFStateForDeemed: 10,
  },
  // افزودن بیشتر دکمه‌ها در صورت نیاز
];

// **4. تعریف TabsData**
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

// **5. تعریف subTabDataMapping**
export const subTabDataMapping: { [key: string]: SubTabData } = {
  // General -> Configurations
  Configurations: {
    columnDefs: [
      { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
      {
        headerName: "Prg.Template",
        field: "FirstIDProgramTemplate",
        filter: "agTextColumnFilter",
        valueGetter: (params: any) => {
          const template = programTemplates.find(
            (pt) => pt.ID === params.data.FirstIDProgramTemplate
          );
          return template ? template.Name : "N/A";
        },
      },
      {
        headerName: "Default Ribbon",
        field: "SelMenuIDForMain",
        filter: "agTextColumnFilter",
        valueGetter: (params: any) => {
          const ribbon = defaultRibbons.find(
            (dr) => dr.ID === params.data.SelMenuIDForMain
          );
          return ribbon ? ribbon.Name : "N/A";
        },
      },
    ],
    rowData: [
      {
        ID: 1,
        Name: "Configuration A",
        FirstIDProgramTemplate: 1, // ارجاع به ProgramTemplate ID 1
        SelMenuIDForMain: 1, // ارجاع به Default Ribbon ID 1
        Description: "Description for Configuration A",
        IsVisible: true,
        LastModified: "2024-10-08T07:20:02.92",
        DefaultBtn: "2|3|",
        LetterBtns: "4|5|",
        MeetingBtns: "6|7|",
        EntityTypeIDForLessonLearn: 1,
        SelMenuIDForLessonLearnAfTemplate: 6, // اصلاح شده به ID موجود در "Lesson Learned Af Template"
        EntityTypeIDForTaskComment: 11, // اصلاح شده به ID موجود در "Comment Form Template"
        EntityTypeIDForProcedure: 16, // اصلاح شده به ID موجود در "Procedure Form Template"
      },
      // ... سایر ردیف‌ها تا ID 5
      {
        ID: 2,
        Name: "Configuration B",
        FirstIDProgramTemplate: 2,
        SelMenuIDForMain: 2,
        Description: "Description for Configuration B",
        IsVisible: true,
        LastModified: "2024-10-09T08:15:10.45",
        DefaultBtn: "1|4|",
        LetterBtns: "2|3|",
        MeetingBtns: "5|6|",
        EntityTypeIDForLessonLearn: 2,
        SelMenuIDForLessonLearnAfTemplate: 7, // اصلاح شده
        EntityTypeIDForTaskComment: 12, // اصلاح شده
        EntityTypeIDForProcedure: 17, // اصلاح شده
      },
      {
        ID: 3,
        Name: "Configuration C",
        FirstIDProgramTemplate: 3,
        SelMenuIDForMain: 3,
        Description: "Description for Configuration C",
        IsVisible: true,
        LastModified: "2024-10-10T09:25:30.12",
        DefaultBtn: "7|8|",
        LetterBtns: "9|10|",
        MeetingBtns: "1|2|",
        EntityTypeIDForLessonLearn: 3,
        SelMenuIDForLessonLearnAfTemplate: 8, // اصلاح شده
        EntityTypeIDForTaskComment: 13, // اصلاح شده
        EntityTypeIDForProcedure: 18, // اصلاح شده
      },
      {
        ID: 4,
        Name: "Configuration D",
        FirstIDProgramTemplate: 1,
        SelMenuIDForMain: 4,
        Description: "Description for Configuration D",
        IsVisible: true,
        LastModified: "2024-10-11T10:35:45.67",
        DefaultBtn: "3|4|",
        LetterBtns: "5|6|",
        MeetingBtns: "7|8|",
        EntityTypeIDForLessonLearn: 4,
        SelMenuIDForLessonLearnAfTemplate: 9, // اصلاح شده
        EntityTypeIDForTaskComment: 14, // اصلاح شده
        EntityTypeIDForProcedure: 19, // اصلاح شده
      },
      {
        ID: 5,
        Name: "Configuration E",
        FirstIDProgramTemplate: 2,
        SelMenuIDForMain: 2,
        Description: "Description for Configuration E",
        IsVisible: true,
        LastModified: "2024-10-12T11:45:55.89",
        DefaultBtn: "2|5|",
        LetterBtns: "3|6|",
        MeetingBtns: "4|7|",
        EntityTypeIDForLessonLearn: 5,
        SelMenuIDForLessonLearnAfTemplate: 10, // اصلاح شده
        EntityTypeIDForTaskComment: 15, // اصلاح شده
        EntityTypeIDForProcedure: 20, // اصلاح شده
      },
    ],
  },

  // **ProgramTemplate**
  ProgramTemplate: {
    columnDefs: [
      {
        headerName: "Template Name",
        field: "Name",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "Description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: programTemplates,
  },

  // **DefaultRibbon**
  DefaultRibbon: {
    columnDefs: [
      {
        headerName: "Ribbon Name",
        field: "Name",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "Description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: defaultRibbons,
  },

  // **Lesson Learned Form**
  "Lesson Learned Form": {
    columnDefs: [
      { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
      {
        headerName: "Description",
        field: "EntityCateADescription",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        Code: "",
        EntityCateADescription:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        EntityCateAName: "Start up",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 1,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-04T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Charter",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3838",
        nEntityCateAID: 1,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف دوم",
        EntityCateAName: "Development",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 2,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-05T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Development Plan",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3839",
        nEntityCateAID: 2,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف سوم",
        EntityCateAName: "Marketing",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 3,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-06T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Marketing Strategy",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3840",
        nEntityCateAID: 3,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف چهارم",
        EntityCateAName: "Sales",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 4,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-07T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Sales Plan",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3841",
        nEntityCateAID: 4,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف پنجم",
        EntityCateAName: "HR",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 5,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-08T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "HR Policies",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3842",
        nEntityCateAID: 5,
        nEntityCateBID: null,
      },
    ],
  },

  // **Lesson Learned Af Template**
  "Lesson Learned Af Template": {
    columnDefs: [
      { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
      {
        headerName: "Description",
        field: "EntityCateADescription",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        Code: "",
        EntityCateADescription:
          "توضیحات برای ردیف اول سلکت Lesson Learned Af Template",
        EntityCateAName: "Analysis",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 6,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-09T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Analysis Report",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3843",
        nEntityCateAID: 6,
        nEntityCateBID: null,
      },
      // افزودن ۴ ردیف دیگر به دلخواه
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف دوم",
        EntityCateAName: "Evaluation",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 7,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-10T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Evaluation Summary",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3844",
        nEntityCateAID: 7,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف سوم",
        EntityCateAName: "Feedback",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 8,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-11T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Feedback Report",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3845",
        nEntityCateAID: 8,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف چهارم",
        EntityCateAName: "Review",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 9,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-12T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Review Document",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3850",
        nEntityCateAID: 9,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف پنجم",
        EntityCateAName: "Completion",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 10,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-13T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Completion Report",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3851",
        nEntityCateAID: 10,
        nEntityCateBID: null,
      },
    ],
  },

  // **Comment Form Template**
  "Comment Form Template": {
    columnDefs: [
      { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
      {
        headerName: "Description",
        field: "EntityCateADescription",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        Code: "",
        EntityCateADescription:
          "توضیحات برای ردیف اول سلکت Comment Form Template",
        EntityCateAName: "Feedback Form",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 11,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-14T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Feedback Form A",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3848",
        nEntityCateAID: 11,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف دوم",
        EntityCateAName: "Survey Form",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 12,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-15T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Survey Form B",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3849",
        nEntityCateAID: 12,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف سوم",
        EntityCateAName: "Comment Form",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 13,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-16T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Comment Form C",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3850",
        nEntityCateAID: 13,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف چهارم",
        EntityCateAName: "Review Form",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 14,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-17T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Review Form D",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3851",
        nEntityCateAID: 14,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف پنجم",
        EntityCateAName: "Evaluation Form",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 15,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-18T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Evaluation Form E",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3852",
        nEntityCateAID: 15,
        nEntityCateBID: null,
      },
    ],
  },

  // **Procedure Form Template**
  "Procedure Form Template": {
    columnDefs: [
      { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
      {
        headerName: "Description",
        field: "EntityCateADescription",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        Code: "",
        EntityCateADescription:
          "توضیحات برای ردیف اول سلکت Procedure Form Template",
        EntityCateAName: "Procedure Form A",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 16,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-19T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Procedure Form A",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3853",
        nEntityCateAID: 16,
        nEntityCateBID: null,
      },
      // افزودن ۴ ردیف دیگر به دلخواه
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف دوم",
        EntityCateAName: "Procedure Form B",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 17,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-20T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Procedure Form B",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3854",
        nEntityCateAID: 17,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف سوم",
        EntityCateAName: "Procedure Form C",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 18,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-21T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Procedure Form C",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3855",
        nEntityCateAID: 18,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف چهارم",
        EntityCateAName: "Procedure Form D",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 19,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-22T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Procedure Form D",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3856",
        nEntityCateAID: 19,
        nEntityCateBID: null,
      },
      {
        Code: "",
        EntityCateADescription: "توضیحات برای ردیف پنجم",
        EntityCateAName: "Procedure Form E",
        EntityCateBDescription: null,
        EntityCateBName: null,
        ID: 20,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-23T14:58:30.647",
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Procedure Form E",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3857",
        nEntityCateAID: 20,
        nEntityCateBID: null,
      },
    ],
  },

  // **Commands**
  Commands: {
    columnDefs: [
      {
        headerName: "Command Name",
        field: "name",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "description",
        filter: "agTextColumnFilter",
      },
      // سایر ستون‌ها به دلخواه
    ],
    rowData: [
      {
        id: 1,
        name: "Start Process",
        description: "Start the main process",
        // سایر داده‌ها
      },
      {
        id: 2,
        name: "Stop Process",
        description: "Stop the main process",
        // سایر داده‌ها
      },
      // افزودن ردیف‌های بیشتر در صورت نیاز
    ],
  },
};
