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
  [x: string]: any;
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
  File: {
    // تب File بدون گروه‌ها و زیرتب‌ها
  },
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

export const categoriesCata: SubTabData = {
  columnDefs: [
    { headerName: "ID", field: "ID", filter: "agNumberColumnFilter" },
    { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
    {
      headerName: "Description",
      field: "Description",
      filter: "agTextColumnFilter",
    },

    {
      headerName: "Modified By",
      field: "ModifiedById",
      filter: "agTextColumnFilter",
    },
  ],
  rowData: [
    {
      ID: 1,
      Name: "Start up1",
      Description:
        "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
      IsVisible: true,
      LastModified: null,
      ModifiedById: null,
    },
    {
      ID: 2,
      Name: "Start up2",
      Description:
        "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
      IsVisible: true,
      LastModified: null,
      ModifiedById: null,
    },
    {
      ID: 3,
      Name: "Start up3",
      Description:
        "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
      IsVisible: true,
      LastModified: null,
      ModifiedById: null,
    },
  ],
};

// **7. تعریف Categories Catb**
export const categoriesCatb: SubTabData = {
  columnDefs: [
    { headerName: "ID", field: "ID", filter: "agNumberColumnFilter" },
    { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
    {
      headerName: "Description",
      field: "Description",
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Is Visible",
      field: "IsVisible",
      filter: "agBooleanColumnFilter",
    },
    {
      headerName: "Last Modified",
      field: "LastModified",
      filter: "agDateColumnFilter",
    },
    {
      headerName: "Modified By",
      field: "ModifiedById",
      filter: "agTextColumnFilter",
    },
  ],
  rowData: [
    {
      ID: 4,
      Name: "Start up4",
      Description:
        "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
      IsVisible: true,
      LastModified: null,
      ModifiedById: null,
    },
    {
      ID: 5,
      Name: "Start up25",
      Description:
        "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
      IsVisible: true,
      LastModified: null,
      ModifiedById: null,
    },
    {
      ID: 6,
      Name: "Start up6",
      Description:
        "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
      IsVisible: true,
      LastModified: null,
      ModifiedById: null,
    },
  ],
};

const projectLists = [
  {
    ID: 1,
    ProjectName: "Project 1",
    State: "Started",
    AcualStartTime: "2022/12/12",
    TotalDuration: 1,
    PCostAct: 1210000,
    PCostAprov: 56000000,
    IsIdea: "Idea",
    IsPersian: true,
    calendarName: "cal1",
    TaskNum: 1,
    RolesNum: 100,
    LettersNum: 233,
    MeetingsNum: 999,
    IssuesNum: 111111,
    KnowledgeNum: 5656,
  },
  {
    ID: 2,
    ProjectName: "Project 2",
    State: "Closed",
    AcualStartTime: "2019/12/12",
    TotalDuration: 2,
    PCostAct: 34340000,
    PCostAprov: 99000000,
    IsIdea: "not Idea",
    IsPersian: false,
    calendarName: "cal2",
    TaskNum: 2,
    RolesNum: 200,
    LettersNum: 786,
    MeetingsNum: 998,
    IssuesNum: 2222222222,
    KnowledgeNum: 434334,
  },
];

const userLists = [
  {
    ID: "u1234567-89ab-cdef-0123-456789abcdef",
    Name: "Ali",
    LastName: "Rezaei",
    FirstName: "Ali",
    Email: "ali.rezaei@example.com",
    Mobile: "09123456789",
    Password: "password123",
    ConfirmPassword: "password123",
    Website: "https://ali.example.com",
    UserType: 0,
    UserImageId: null,
  },
  {
    ID: "u2234567-89ab-cdef-0123-456789abcdef",
    Name: "Sara",
    LastName: "Karimi",
    FirstName: "Sara",
    Email: "sara.karimi@example.com",
    Mobile: "09234567890",
    Password: "password456",
    ConfirmPassword: "password456",
    Website: "https://sara.example.com",
    UserType: 1,
    UserImageId: null,
  },
  {
    ID: "u3234567-89ab-cdef-0123-456789abcdef",
    Name: "Reza",
    LastName: "Ahmadi",
    FirstName: "Reza",
    Email: "reza.ahmadi@example.com",
    Mobile: "09345678901",
    Password: "password789",
    ConfirmPassword: "password789",
    Website: "https://reza.example.com",
    UserType: 2,
    UserImageId: null,
  },
  {
    ID: "u4234567-89ab-cdef-0123-456789abcdef",
    Name: "Mina",
    LastName: "Hosseini",
    FirstName: "Mina",
    Email: "mina.hosseini@example.com",
    Mobile: "09456789012",
    Password: "password012",
    ConfirmPassword: "password012",
    Website: "https://mina.example.com",
    UserType: 2,
    UserImageId: null,
  },
  {
    ID: "u5234567-89ab-cdef-0123-456789abcdef",
    Name: "Hossein",
    LastName: "Moghadam",
    FirstName: "Hossein",
    Email: "hossein.moghadam@example.com",
    Mobile: "09567890123",
    Password: "password345",
    ConfirmPassword: "password345",
    Website: "https://hossein.example.com",
    UserType: 1,
    UserImageId: null,
  },
];

const roleLists = [
  {
    ID: "r1234567-89ab-cdef-0123-456789abcdef",
    Name: "Project Manager",
    PostCode: "PM001",
    Description: "Oversees project execution.",
    Responsibility: "Manage team, allocate resources.",
    Authorization: "Approve budgets, make strategic decisions.",
    Competencies: "Leadership, communication, problem-solving.",
    Grade: "A",
    Type: "Full-Time",
    isStaticPost: true,
  },
  {
    ID: "r2234567-89ab-cdef-0123-456789abcdef",
    Name: "Software Engineer",
    PostCode: "SE002",
    Description: "Develops software solutions.",
    Responsibility: "Write code, fix bugs.",
    Authorization: "Make technical decisions within project scope.",
    Competencies: "Coding, debugging, teamwork.",
    Grade: "B",
    Type: "Full-Time",
    isStaticPost: false,
  },
  {
    ID: "r3234567-89ab-cdef-0123-456789abcdef",
    Name: "QA Tester",
    PostCode: "QA003",
    Description: "Ensures software quality.",
    Responsibility: "Test software, report issues.",
    Authorization: "Decide on severity of bugs.",
    Competencies: "Attention to detail, analytical skills.",
    Grade: "B",
    Type: "Contract",
    isStaticPost: false,
  },
  {
    ID: "r4234567-89ab-cdef-0123-456789abcdef",
    Name: "Business Analyst",
    PostCode: "BA004",
    Description: "Analyzes business requirements.",
    Responsibility: "Gather requirements, document processes.",
    Authorization: "Approve requirement changes.",
    Competencies: "Analytical thinking, communication.",
    Grade: "A",
    Type: "Full-Time",
    isStaticPost: true,
  },
  {
    ID: "r5234567-89ab-cdef-0123-456789abcdef",
    Name: "UI/UX Designer",
    PostCode: "UI005",
    Description: "Designs user interfaces.",
    Responsibility: "Create wireframes, prototypes.",
    Authorization: "Decide on design elements.",
    Competencies: "Creativity, design tools proficiency.",
    Grade: "B",
    Type: "Part-Time",
    isStaticPost: false,
  },
];

const menuList = [
  {
    ID: 1,
    Name: "Dashboard",
    Description: "Main dashboard view",
    Category: "Navigation",
    Information: "Information about Dashboard",
    IsActive: true,
    IsVisible: true,
    LastModified: "2024-06-01T10:00:00.000",
  },
  {
    ID: 2,
    Name: "Reports",
    Description: "Access to various reports",
    Category: "Analytics",
    Information: "Information about Reports",
    IsActive: true,
    IsVisible: true,
    LastModified: "2024-07-15T12:30:00.000",
  },
  {
    ID: 3,
    Name: "Settings",
    Description: "Application settings",
    Category: "Configuration",
    Information: "Information about Settings",
    IsActive: false,
    IsVisible: false,
    LastModified: "2024-08-20T09:45:00.000",
  },
];

const EnterPriseList = [
  {
    ID: 1,
    ModifiedById: null,
    Name: "Modiriat Tose'e",
    Describtion: "مدیریت توسعه",
    Type: "نوع اول",
    Information: "اطلاعات مدیریت توسعه",
    IsGlobal: true,
    IsVisible: true,
    LastModified: "2024-01-04T14:29:29.413",
  },
  {
    ID: 2,
    ModifiedById: null,
    Name: "Sanat Tose'e",
    Describtion: "صنعت توسعه",
    Type: "نوع دوم",
    Information: "اطلاعات صنعت توسعه",
    IsGlobal: false,
    IsVisible: true,
    LastModified: "2024-02-10T10:15:45.123",
  },
  {
    ID: 3,
    ModifiedById: null,
    Name: "Fanni Tose'e",
    Describtion: "فنی توسعه",
    Type: "نوع سوم",
    Information: "اطلاعات فنی توسعه",
    IsGlobal: false,
    IsVisible: false,
    LastModified: "2024-03-15T08:45:30.789",
  },
  {
    ID: 4,
    ModifiedById: null,
    Name: "Barname Tose'e",
    Describtion: "برنامه توسعه",
    Type: "نوع چهارم",
    Information: "اطلاعات برنامه توسعه",
    IsGlobal: true,
    IsVisible: true,
    LastModified: "2024-04-20T12:00:00.000",
  },
  {
    ID: 5,
    ModifiedById: null,
    Name: "Daryafshan Tose'e",
    Describtion: "دریافتشان توسعه",
    Type: "نوع پنجم",
    Information: "اطلاعات دریافشان توسعه",
    IsGlobal: false,
    IsVisible: true,
    LastModified: "2024-05-25T16:30:15.456",
  },
];

// ParentList.ts

const ParentList = [
  {
    ID: 1,
    Name: "Parent 1",
    Description: "First Parent",
    Type: "Type A",
    Information: "Information about Parent 1",
    IsActive: true,
    IsVisible: true,
    LastModified: "2024-06-01T10:00:00.000",
  },
  {
    ID: 2,
    Name: "Parent 2",
    Description: "Second Parent",
    Type: "Type B",
    Information: "Information about Parent 2",
    IsActive: true,
    IsVisible: false,
    LastModified: "2024-07-15T12:30:00.000",
  },
  {
    ID: 3,
    Name: "Parent 3",
    Description: "Third Parent",
    Type: "Type C",
    Information: "Information about Parent 3",
    IsActive: false,
    IsVisible: true,
    LastModified: "2024-08-20T09:45:00.000",
  },
];

export interface Role {
  ID: string;
  Name: string;
  PostCode: string;
  Description: string;
  Responsibility: string;
  Authorization: string;
  Competencies: string;
  Grade: string;
  Type: string;
  isStaticPost: boolean;
}

export interface SubForm {
  SubID: number;
  Name: string;
  Description: string;
  Status: string;
  CreatedDate: string;
}

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
          return template ? template.Name : "";
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
          return ribbon ? ribbon.Name : "";
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
      // اگر نیاز به ستون‌های بیشتری دارید، اضافه کنید
    ],
    rowData: [
      {
        id: 1,
        name: "Start Process",
        description: "Start the main process",
        viewMode: "option1",
        mainColumnId: "column1",
        colorColumns: "red,blue",
        groupName: "Group A",
        query: "SELECT * FROM process",
        hiddenColumns: "hidden1,hidden2",
        defaultColumns: "default1,default2",
        apiColumns: "api1,api2",
        spParameters: "param1,param2",
        apiMode: "apiMode1",
        gridCommand: "gridCmd1",
        reportCommand: "reportCmd1",
      },
      {
        id: 2,
        name: "Stop Process",
        description: "Stop the main process",
        viewMode: "option2",
        mainColumnId: "column2",
        colorColumns: "green,yellow",
        groupName: "Group B",
        query: "SELECT id, name FROM process",
        hiddenColumns: "hidden3,hidden4",
        defaultColumns: "default3,default4",
        apiColumns: "api3,api4",
        spParameters: "param3,param4",
        apiMode: "apiMode2",
        gridCommand: "gridCmd2",
        reportCommand: "reportCmd2",
      },
      // سایر ردیف‌ها را به همین صورت اضافه کنید
    ],
  },

  Users: {
    columnDefs: [
      {
        headerName: "ID",
        field: "ID",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Last Name",
        field: "LastName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "First Name",
        field: "FirstName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Email",
        field: "Email",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Mobile",
        field: "Mobile",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Website",
        field: "Website",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "User Type",
        field: "UserType",
        filter: "agNumberColumnFilter",
        valueFormatter: (params: any) => {
          const userTypeMap: { [key: number]: string } = {
            0: "Admin",
            1: "Sysadmin",
            2: "Employee",
          };
          return userTypeMap[params.value] || params.value;
        },
      },
    ],
    rowData: [
      {
        ID: "u1234567-89ab-cdef-0123-456789abcdef",
        Name: "Ali",
        LastName: "Rezaei",
        FirstName: "Ali",
        Email: "ali.rezaei@example.com",
        Mobile: "09123456789",
        Password: "password123",
        ConfirmPassword: "password123",
        Website: "https://ali.example.com",
        UserType: 0,
        UserImageId: null,
      },
      {
        ID: "u2234567-89ab-cdef-0123-456789abcdef",
        Name: "Sara",
        LastName: "Karimi",
        FirstName: "Sara",
        Email: "sara.karimi@example.com",
        Mobile: "09234567890",
        Password: "password456",
        ConfirmPassword: "password456",
        Website: "https://sara.example.com",
        UserType: 1,
        UserImageId: null,
      },
      {
        ID: "u3234567-89ab-cdef-0123-456789abcdef",
        Name: "Reza",
        LastName: "Ahmadi",
        FirstName: "Reza",
        Email: "reza.ahmadi@example.com",
        Mobile: "09345678901",
        Password: "password789",
        ConfirmPassword: "password789",
        Website: "https://reza.example.com",
        UserType: 2,
        UserImageId: null,
      },
      {
        ID: "u4234567-89ab-cdef-0123-456789abcdef",
        Name: "Mina",
        LastName: "Hosseini",
        FirstName: "Mina",
        Email: "mina.hosseini@example.com",
        Mobile: "09456789012",
        Password: "password012",
        ConfirmPassword: "password012",
        Website: "https://mina.example.com",
        UserType: 2,
        UserImageId: null,
      },
      {
        ID: "u5234567-89ab-cdef-0123-456789abcdef",
        Name: "Hossein",
        LastName: "Moghadam",
        FirstName: "Hossein",
        Email: "hossein.moghadam@example.com",
        Mobile: "09567890123",
        Password: "password345",
        ConfirmPassword: "password345",
        Website: "https://hossein.example.com",
        UserType: 1,
        UserImageId: null,
      },
    ],
  },

  Roles: {
    columnDefs: [
      {
        headerName: "ID",
        field: "ID",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Role",
        field: "Name",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Job Description",
        field: "Description",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Grade",
        field: "Grade",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Type",
        field: "Type",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        ID: "1",
        Name: "Project Manager",
        PostCode: "PM001",
        Description: "Oversees project execution.",
        Responsibility: "Manage team, allocate resources.",
        Authorization: "Approve budgets, make strategic decisions.",
        Competencies: "Leadership, communication, problem-solving.",
        Grade: "A",
        Type: "Full-Time",
        isStaticPost: true,
      },
      {
        ID: "2",
        Name: "Business Analyst",
        PostCode: "BA004",
        Description: "Analyzes business requirements.",
        Responsibility: "Gather requirements, document processes.",
        Authorization: "Approve requirement changes.",
        Competencies: "Analytical thinking, communication.",
        Grade: "A",
        Type: "Full-Time",
        isStaticPost: true,
      },
      {
        ID: "3",
        Name: "Business Analyst 2222",
        PostCode: "BA004",
        Description: "Analyzes business requirements.",
        Responsibility: "Gather requirements, document processes.",
        Authorization: "Approve requirement changes.",
        Competencies: "Analytical thinking, communication.",
        Grade: "A",
        Type: "Full-Time",
        isStaticPost: true,
      },
    ],
  },

  ProgramTypes: {
    columnDefs: [
      {
        headerName: "Role",
        field: "Name",
        filter: "agTextColumnFilter",
      },

      {
        headerName: "Job Description",
        field: "Description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        ID: "r1234567-89ab-cdef-0123-456789abcdef",
        Name: "Programtype1",
        Description: "Oversees project execution.",
      },
      {
        ID: "r1234567-89ab-cdef-0123-456789abcdef",
        Name: "Programtype2",
        Description: "Oversees project execution.",
      },
      {
        ID: "r1234567-89ab-cdef-0123-456789abcdef",
        Name: "Programtype3",
        Description: "Oversees project execution.",
      },
      {
        ID: "r1234567-89ab-cdef-0123-456789abcdef",
        Name: "Programtype4",
        Description: "Oversees project execution.",
      },
    ],
  },

  RoleGroups: {
    columnDefs: [
      {
        headerName: "Group Name",
        field: "Name",
        filter: "agTextColumnFilter",
        sortable: true,
      },
    ],
    rowData: [
      {
        ID: 1,
        Name: "Admin Group",
        Description: "Group for admin users",
        // اینجا دو تا پروژه داریم که در projectsData تعریف شده اند
        ProjectsStr:
          "08050144-052d-45f9-ae1b-00b7c96b9847|11150144-052d-45f9-ae1b-00b7c96b9847|",
        PostsStr: "User1|User2|User3",
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-01-01",
      },
      {
        ID: 2,
        Name: "Development Team",
        Description: "Group for developers",
        // دو پروژه دیگر
        ProjectsStr:
          "22250144-052d-45f9-ae1b-00b7c96b9847|33350144-052d-45f9-ae1b-00b7c96b9847|",
        PostsStr: "User4|User5",
        IsGlobal: false,
        IsVisible: true,
        LastModified: "2024-02-15",
      },
      {
        ID: 3,
        Name: "Support Team",
        Description: "Group for support members",
        // یک پروژه
        ProjectsStr: "c5d86029-8b93-4578-824c-259a9124f18e|",
        PostsStr: "User6|User7|User8",
        IsGlobal: false,
        IsVisible: false,
        LastModified: "2024-03-20",
      },
    ],
  },

  Enterprises: {
    columnDefs: [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Description",
        field: "Describtion",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Type",
        field: "Type",
        filter: "agTextColumnFilter",
        sortable: true,
      },
    ],
    rowData: [
      {
        ID: 1,
        ModifiedById: null,
        Name: "Modiriat Tose'e",
        Describtion: "مدیریت توسعه",
        Type: "نوع اول",
        Information: "اطلاعات مدیریت توسعه",
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-01-04T14:29:29.413",
      },
      {
        ID: 2,
        ModifiedById: null,
        Name: "Sanat Tose'e",
        Describtion: "صنعت توسعه",
        Type: "نوع دوم",
        Information: "اطلاعات صنعت توسعه",
        IsGlobal: false,
        IsVisible: true,
        LastModified: "2024-02-10T10:15:45.123",
      },
      {
        ID: 3,
        ModifiedById: null,
        Name: "Fanni Tose'e",
        Describtion: "فنی توسعه",
        Type: "نوع سوم",
        Information: "اطلاعات فنی توسعه",
        IsGlobal: false,
        IsVisible: false,
        LastModified: "2024-03-15T08:45:30.789",
      },
      {
        ID: 4,
        ModifiedById: null,
        Name: "Barname Tose'e",
        Describtion: "برنامه توسعه",
        Type: "نوع چهارم",
        Information: "اطلاعات برنامه توسعه",
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-04-20T12:00:00.000",
      },
      {
        ID: 5,
        ModifiedById: null,
        Name: "Daryafshan Tose'e",
        Describtion: "دریافتشان توسعه",
        Type: "نوع پنجم",
        Information: "اطلاعات دریافشان توسعه",
        IsGlobal: false,
        IsVisible: true,
        LastModified: "2024-05-25T16:30:15.456",
      },
    ],
  },

  Forms: {
    columnDefs: [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Transmital",
        field: "IsDoc",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "CatA",
        field: "EntityCateAName",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "CatB",
        field: "EntityCateBName",
        filter: "agTextColumnFilter",
        sortable: true,
      },
    ],
    rowData: [
      {
        ID: 1,
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Charter 1",
        EntityCateAName: "Start up",
        EntityCateADescription:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        EntityCateBName: "AAAAA",
        EntityCateBDescription: null,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-04T14:58:30.647",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        Code: "",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3838",
        nEntityCateAID: 1,
        nEntityCateBID: null,
      },
      {
        ID: 2,
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Charter 2",
        EntityCateAName: "Start up",
        EntityCateADescription:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        EntityCateBName: "BBBBB",
        EntityCateBDescription: null,
        IsDoc: true,
        IsGlobal: false,
        IsVisible: true,
        LastModified: "2024-08-10T10:00:00.000",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        Code: "CMD_START",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3838",
        nEntityCateAID: 1,
        nEntityCateBID: null,
      },
      {
        ID: 3,
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Charter 3",
        EntityCateAName: "Start up",
        EntityCateADescription:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        EntityCateBName: "CCCC",
        EntityCateBDescription: null,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: false,
        LastModified: "2024-08-15T12:30:00.000",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        Code: "CMD_WIN_APP",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3838",
        nEntityCateAID: 1,
        nEntityCateBID: null,
      },
      {
        ID: 4,
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Charter 4",
        EntityCateAName: "Start up",
        EntityCateADescription:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        EntityCateBName: null,
        EntityCateBDescription: null,
        IsDoc: true,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-20T09:15:45.123",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        Code: "CMD_OTHER",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3838",
        nEntityCateAID: 1,
        nEntityCateBID: null,
      },
      {
        ID: 5,
        ModifiedById: "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
        Name: "Charter 5",
        EntityCateAName: "Start up",
        EntityCateADescription:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        EntityCateBName: null,
        EntityCateBDescription: null,
        IsDoc: false,
        IsGlobal: true,
        IsVisible: true,
        LastModified: "2024-08-25T16:45:30.789",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        Code: "",
        TemplateDocID: null,
        TemplateExcelID: "0527346d-51d2-4e97-bf2b-543c7c7a3838",
        nEntityCateAID: 1,
        nEntityCateBID: null,
      },
    ],
    subForms: {
      1: [
        {
          SubID: 101,
          Name: "Sub Form 1-1",
          Description: "Description for Sub Form 1-1",
          Status: "Active",
          CreatedDate: "2024-09-01",
        },
        {
          SubID: 102,
          Name: "Sub Form 1-2",
          Description: "Description for Sub Form 1-2",
          Status: "Inactive",
          CreatedDate: "2024-09-02",
        },
        {
          SubID: 103,
          Name: "Sub Form 1-3",
          Description: "Description for Sub Form 1-3",
          Status: "Active",
          CreatedDate: "2024-09-03",
        },
        {
          SubID: 104,
          Name: "Sub Form 1-4",
          Description: "Description for Sub Form 1-4",
          Status: "Inactive",
          CreatedDate: "2024-09-04",
        },
        {
          SubID: 105,
          Name: "Sub Form 1-5",
          Description: "Description for Sub Form 1-5",
          Status: "Active",
          CreatedDate: "2024-09-05",
        },
      ],
      2: [
        {
          SubID: 201,
          Name: "Sub Form 2-1",
          Description: "Description for Sub Form 2-1",
          Status: "Active",
          CreatedDate: "2024-09-06",
        },
        {
          SubID: 202,
          Name: "Sub Form 2-2",
          Description: "Description for Sub Form 2-2",
          Status: "Inactive",
          CreatedDate: "2024-09-07",
        },
        {
          SubID: 203,
          Name: "Sub Form 2-3",
          Description: "Description for Sub Form 2-3",
          Status: "Active",
          CreatedDate: "2024-09-08",
        },
        {
          SubID: 204,
          Name: "Sub Form 2-4",
          Description: "Description for Sub Form 2-4",
          Status: "Inactive",
          CreatedDate: "2024-09-09",
        },
        {
          SubID: 205,
          Name: "Sub Form 2-5",
          Description: "Description for Sub Form 2-5",
          Status: "Active",
          CreatedDate: "2024-09-10",
        },
      ],
      3: [
        {
          SubID: 301,
          Name: "Sub Form 3-1",
          Description: "Description for Sub Form 3-1",
          Status: "Active",
          CreatedDate: "2024-09-11",
        },
        {
          SubID: 302,
          Name: "Sub Form 3-2",
          Description: "Description for Sub Form 3-2",
          Status: "Inactive",
          CreatedDate: "2024-09-12",
        },
        {
          SubID: 303,
          Name: "Sub Form 3-3",
          Description: "Description for Sub Form 3-3",
          Status: "Active",
          CreatedDate: "2024-09-13",
        },
        {
          SubID: 304,
          Name: "Sub Form 3-4",
          Description: "Description for Sub Form 3-4",
          Status: "Inactive",
          CreatedDate: "2024-09-14",
        },
        {
          SubID: 305,
          Name: "Sub Form 3-5",
          Description: "Description for Sub Form 3-5",
          Status: "Active",
          CreatedDate: "2024-09-15",
        },
      ],
      4: [
        {
          SubID: 401,
          Name: "Sub Form 4-1",
          Description: "Description for Sub Form 4-1",
          Status: "Active",
          CreatedDate: "2024-09-16",
        },
        {
          SubID: 402,
          Name: "Sub Form 4-2",
          Description: "Description for Sub Form 4-2",
          Status: "Inactive",
          CreatedDate: "2024-09-17",
        },
        {
          SubID: 403,
          Name: "Sub Form 4-3",
          Description: "Description for Sub Form 4-3",
          Status: "Active",
          CreatedDate: "2024-09-18",
        },
        {
          SubID: 404,
          Name: "Sub Form 4-4",
          Description: "Description for Sub Form 4-4",
          Status: "Inactive",
          CreatedDate: "2024-09-19",
        },
        {
          SubID: 405,
          Name: "Sub Form 4-5",
          Description: "Description for Sub Form 4-5",
          Status: "Active",
          CreatedDate: "2024-09-20",
        },
      ],
      5: [
        {
          SubID: 501,
          Name: "Sub Form 5-1",
          Description: "Description for Sub Form 5-1",
          Status: "Active",
          CreatedDate: "2024-09-21",
        },
        {
          SubID: 502,
          Name: "Sub Form 5-2",
          Description: "Description for Sub Form 5-2",
          Status: "Inactive",
          CreatedDate: "2024-09-22",
        },
        {
          SubID: 503,
          Name: "Sub Form 5-3",
          Description: "Description for Sub Form 5-3",
          Status: "Active",
          CreatedDate: "2024-09-23",
        },
        {
          SubID: 504,
          Name: "Sub Form 5-4",
          Description: "Description for Sub Form 5-4",
          Status: "Inactive",
          CreatedDate: "2024-09-24",
        },
        {
          SubID: 505,
          Name: "Sub Form 5-5",
          Description: "Description for Sub Form 5-5",
          Status: "Active",
          CreatedDate: "2024-09-25",
        },
      ],
    },
  },

  categoriesCata: {
    columnDefs: [
      { headerName: "ID", field: "ID", filter: "agNumberColumnFilter" },
      { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
      {
        headerName: "Description",
        field: "Description",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Is Visible",
        field: "IsVisible",
        filter: "agBooleanColumnFilter",
      },
      {
        headerName: "Last Modified",
        field: "LastModified",
        filter: "agDateColumnFilter",
      },
      {
        headerName: "Modified By",
        field: "ModifiedById",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        ID: 1,
        Name: "Start up1",
        Description:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      },
      {
        ID: 1,
        Name: "Start up2",
        Description:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      },
      {
        ID: 1,
        Name: "Start up3",
        Description:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      },
    ],
  },
  categoriesCatb: {
    columnDefs: [
      { headerName: "ID", field: "ID", filter: "agNumberColumnFilter" },
      { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
      {
        headerName: "Description",
        field: "Description",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Is Visible",
        field: "IsVisible",
        filter: "agBooleanColumnFilter",
      },
      {
        headerName: "Last Modified",
        field: "LastModified",
        filter: "agDateColumnFilter",
      },
      {
        headerName: "Modified By",
        field: "ModifiedById",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        ID: 1,
        Name: "Start up4",
        Description:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      },
      {
        ID: 1,
        Name: "Start up25",
        Description:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      },
      {
        ID: 1,
        Name: "Start up6",
        Description:
          "فرم های مربوط یه زبانه استارت آپ در نوار ابزار و فرآیند ساماندهی مقدماتی در متدولوژی",
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      },
    ],
  },

  // نمونه داده‌ها با ساب‌رُدی‌ها

  ApprovalFlows: {
    columnDefs: [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Description",
        field: "Description",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Duration",
        field: "MaxDuration",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Budget",
        field: "PCost",
        filter: "agTextColumnFilter",
        sortable: true,
      },
    ],
    rowData: [
      {
        ID: 1,
        Name: "Company Registration AF",
        Description: "Registering a company workflow",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        IsGlobal: true,
        MaxDuration: "3",
        PCost: "122321",
        SubApprovalFlows: [
          {
            ID: "sub1",
            Name: "SubFlow 1",
            Description: "Description of SubFlow 1",
            MaxDuration: "2",
            PCost: "5000",
          },
          {
            ID: "sub2",
            Name: "SubFlow 2",
            Description: "Description of SubFlow 2",
            MaxDuration: "4",
            PCost: "7000",
          },
        ],
      },
      {
        ID: 2,
        Name: "Project Launch AF",
        Description: "Approval flow for launching a project",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        IsGlobal: false,
        MaxDuration: "5",
        PCost: "30000",
        SubApprovalFlows: [
          {
            ID: "sub1",
            Name: "Feasibility SubFlow",
            Description: "Check feasibility",
            MaxDuration: "2",
            PCost: "10000",
          },
        ],
      },
      {
        ID: 3,
        Name: "Budget Allocation AF",
        Description: "Flow for budget approvals",
        ProjectsStr:
          "642bc0ce-4d93-474b-a869-6101211533d4|a1b2c3d4-5678-90ab-cdef-1234567890ab|",
        IsGlobal: true,
        MaxDuration: "7",
        PCost: "50000",
        SubApprovalFlows: [
          {
            ID: "sub1",
            Name: "Initial Review SubFlow",
            Description: "Review budget requirements",
            MaxDuration: "3",
            PCost: "20000",
          },
          {
            ID: "sub2",
            Name: "Final Approval SubFlow",
            Description: "Final budget approval",
            MaxDuration: "2",
            PCost: "30000",
          },
        ],
      },
      {
        ID: 4,
        Name: "Contract Signing AF",
        Description: "Approval flow for signing contracts",
        ProjectsStr: "a1b2c3d4-5678-90ab-cdef-1234567890ab|",
        IsGlobal: false,
        MaxDuration: "2",
        PCost: "15000",
        SubApprovalFlows: [
          {
            ID: "sub1",
            Name: "Legal Review SubFlow",
            Description: "Legal team review",
            MaxDuration: "1",
            PCost: "5000",
          },
        ],
      },
      {
        ID: 5,
        Name: "Vendor Approval AF",
        Description: "Flow to approve new vendors",
        ProjectsStr:
          "642bc0ce-4d93-474b-a869-6101211533d4|a1b2c3d4-5678-90ab-cdef-1234567890ab|",
        IsGlobal: true,
        MaxDuration: "4",
        PCost: "20000",
        SubApprovalFlows: [
          {
            ID: "sub1",
            Name: "Vendor Vetting SubFlow",
            Description: "Check vendor credentials",
            MaxDuration: "2",
            PCost: "10000",
          },
          {
            ID: "sub2",
            Name: "Final Vendor Approval",
            Description: "Final vendor sign-off",
            MaxDuration: "2",
            PCost: "10000",
          },
        ],
      },
    ],
  },

  ApprovalChecklist: {
    columnDefs: [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Description",
        field: "Description",
        filter: "agTextColumnFilter",
        sortable: true,
      },
    ],
    rowData: [
      {
        ID: 1,
        Name: "Company Registration AF",
        Description: "sss",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        IsGlobal: true,
      },
      {
        ID: 2,
        Name: "Employee Onboarding AF",
        Description: "Process for onboarding new employees.",
        ProjectsStr:
          "a1b2c3d4-5678-90ab-cdef-1234567890ab|c3d4e5f6-7890-1bcd-ef12-34567890abcd|",
        IsGlobal: false,
      },
      {
        ID: 3,
        Name: "Expense Approval AF",
        Description: "Approval process for employee expenses.",
        ProjectsStr: "b2c3d4e5-6789-0abc-def1-234567890abc|",
        IsGlobal: true,
      },
      {
        ID: 4,
        Name: "Project Kickoff AF",
        Description: "Initiating new projects.",
        ProjectsStr:
          "c3d4e5f6-7890-1bcd-ef12-34567890abcd|d4e5f6g7-8901-2cde-f123-4567890abcde|",
        IsGlobal: false,
      },
      {
        ID: 5,
        Name: "Leave Approval AF",
        Description: "Process for approving employee leave requests.",
        ProjectsStr: "d4e5f6g7-8901-2cde-f123-4567890abcde|",
        IsGlobal: true,
      },
    ],
  },

  // **ProgramTemplate**
  ProgramTemplate: {
    columnDefs: [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        ID: 1,
        Name: "Open List Tender",
        Description: "sss",
        ProjectsStr: "642bc0ce-4d93-474b-a869-6101211533d4|",
        IsGlobal: true,
        Duration: 4,
        PCost: 1000,
        nProgramTypeID: 1,
      },
      {
        ID: 2,
        Name: "Purchase Order",
        Description: "Process for onboarding new employees.",
        ProjectsStr:
          "a1b2c3d4-5678-90ab-cdef-1234567890ab|c3d4e5f6-7890-1bcd-ef12-34567890abcd|",
        IsGlobal: false,
        Duration: 5,
        PCost: 4000,
        nProgramTypeID: 2,
      },
    ],
  },

  // **DefaultRibbon**
  DefaultRibbon: {
    columnDefs: [
      {
        headerName: "Name",
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

  Odp: {
    columnDefs: [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Description",
        field: "Description",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Address",
        field: "Address",
        filter: "agTextColumnFilter",
        sortable: true,
      },
    ],
    rowData: [
      {
        ID: 1,
        Name: "ODP Alpha",
        Description: "توضیحات مربوط به ODP Alpha",
        Address: "آدرس 1",
        nProgramTemplateID: 1,
        nEntityTypeID: 10,
        nWFTemplateID: 20,
      },
      {
        ID: 2,
        Name: "ODP Beta",
        Description: "توضیحات مربوط به ODP Beta",
        Address: "آدرس 2",
        nProgramTemplateID: 2,
        nEntityTypeID: 11,
        nWFTemplateID: 21,
      },
      {
        ID: 3,
        Name: "ODP Gamma",
        Description: "توضیحات مربوط به ODP Gamma",
        Address: "آدرس 3",
        nProgramTemplateID: 3,
        nEntityTypeID: 12,
        nWFTemplateID: 22,
      },
      {
        ID: 4,
        Name: "ODP Delta",
        Description: "توضیحات مربوط به ODP Delta",
        Address: "آدرس 4",
        nProgramTemplateID: 4,
        nEntityTypeID: 13,
        nWFTemplateID: 23,
      },
    ],
  },

  Procedures: {
    columnDefs: [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "Description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        ID: 1,
        Name: "procedure 1",
        Description: "aaaa",
        ProjectsStr: "1|2|",
      },
      {
        ID: 2,
        Name: "procedure 2",
        Description: "xxxx",
        ProjectsStr: "1|2|",
      },
    ],
  },

  Calendars: {
    columnDefs: [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        ID: 1,
        Name: "Calendar 1",
      },
    ],
  },

  Ribbons: {
    columnDefs: [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "Description",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: [
      {
        ID: 1,
        Name: "Calendar 1",
        Description: "aaa",
      },
      {
        ID: 2,
        Name: "Calendar 2",
        Description: "bbb",
      },
    ],
  },

  Projects: {
    columnDefs: [
      {
        headerName: "Project Name",
        field: "ProjectName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Status",
        field: "State",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Act Start",
        field: "AcualStartTime",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Duration",
        field: "TotalDuration",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Budget Act",
        field: "PCostAct",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Budget Approve",
        field: "PCostAprov",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Phase",
        field: "IsIdea",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Is persian",
        field: "IsPersian",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "calendar",
        field: "calendarName",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: projectLists,
  },

  Staffing: {
    columnDefs: [
      {
        headerName: "Project Name",
        field: "nProjectID",
        filter: "agTextColumnFilter",
        valueGetter: (params: any) => {
          const projectID = params.data.nProjectID;
          const project = projectLists.find(
            (p) => p.ID.toString() === projectID
          );
          return project ? project.ProjectName : "";
        },
      },
      {
        headerName: "UserName",
        field: "OwnerID",
        filter: "agTextColumnFilter",
        valueGetter: (params: any) => {
          const ownerID = params.data.OwnerID;
          const user = userLists.find((u) => u.ID === ownerID);
          return user ? user.Name : "";
        },
      },
      {
        headerName: "Roles Type",
        field: "nPostTypeID",
        filter: "agTextColumnFilter",
        valueGetter: (params: any) => {
          const roleID = params.data.nPostTypeID;
          const role = roleLists.find((r) => r.ID === roleID);
          return role ? role.Name : "";
        },
      },
      {
        headerName: "Enterprise",
        field: "nCompanyID",
        filter: "agTextColumnFilter",
        valueGetter: (params: any) => {
          const companyID = params.data.nCompanyID;
          const enterprise = EnterPriseList.find(
            (e) => e.ID === Number(companyID)
          );
          return enterprise ? enterprise.Name : "";
        },
      },
      {
        headerName: "Parent",
        field: "ParentId",
        filter: "agNumberColumnFilter",
        valueGetter: (params: any) => {
          const parentId = params.data.ParentId;
          const parent = ParentList.find((p) => p.ID === Number(parentId));
          return parent ? parent.Name : "";
        },
      },
      {
        headerName: "Menu",
        field: "nMenuID",
        filter: "agNumberColumnFilter",
        valueGetter: (params: any) => {
          const menuId = params.data.nMenuID;
          const menu = menuList.find((m) => m.ID === Number(menuId));
          return menu ? menu.Name : "";
        },
      },
    ],
    rowData: [
      {
        ID: 1,
        nProjectID: "1",
        OwnerID: "u1234567-89ab-cdef-0123-456789abcdef",
        nPostTypeID: "r1234567-89ab-cdef-0123-456789abcdef",
        nCompanyID: 1,
        ParentId: 1,
        nMenuID: 1,
        isAccessCreateProject: true,
        isHaveAddressbar: true,
      },
      {
        ID: 2,
        nProjectID: "2",
        OwnerID: "u2234567-89ab-cdef-0123-456789abcdef",
        nPostTypeID: "r2234567-89ab-cdef-0123-456789abcdef",
        nCompanyID: 2,
        ParentId: 2,
        nMenuID: 2,
        isAccessCreateProject: false,
        isHaveAddressbar: false,
      },
      // می‌توانید ردیف‌های بیشتری اضافه کنید
    ],
  },

  Parents: {
    columnDefs: [
      {
        headerName: "Parent Name",
        field: "Name",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "Description",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Type",
        field: "Type",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: ParentList,
  },

  Menu: {
    // افزودن بخش جدید Menu
    columnDefs: [
      {
        headerName: "Menu Name",
        field: "Name",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Description",
        field: "Description",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Category",
        field: "Category",
        filter: "agTextColumnFilter",
      },
    ],
    rowData: menuList,
  },
};

// Type Definitions
export interface LeftItem {
  id: string;
  name: string;
}

export interface RightItem {
  detail: string;
}

export interface Staffing {
  id: number;
  nProjectID: number;
}

// ابتدا Projects را تعریف می‌کنیم
export const Projects = {
  columnDefs: [
    {
      headerName: "Project Name",
      field: "ProjectName",
      filter: "agTextColumnFilter",
    },
    { headerName: "Status", field: "State", filter: "agTextColumnFilter" },
    {
      headerName: "Act Start",
      field: "AcualStartTime",
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Duration",
      field: "TotalDuration",
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Budget Act",
      field: "PCostAct",
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Budget Approve",
      field: "PCostAprov",
      filter: "agTextColumnFilter",
    },
    { headerName: "Phase", field: "IsIdea", filter: "agTextColumnFilter" },
    {
      headerName: "Is persian",
      field: "IsPersian",
      filter: "agTextColumnFilter",
    },
    {
      headerName: "calendar",
      field: "calendarName",
      filter: "agTextColumnFilter",
    },
  ],
  rowData: [
    {
      ID: 1,
      ProjectName: "Project 1",
      State: "Started",
      AcualStartTime: "2022/12/12",
      TotalDuration: 1,
      PCostAct: 1210000,
      PCostAprov: 56000000,
      IsIdea: "Idea",
      IsPersian: true,
      calendarName: "cal1",
    },
    {
      ID: 2,
      ProjectName: "Project 2",
      State: "Closed",
      AcualStartTime: "2019/12/12",
      TotalDuration: 2,
      PCostAct: 34340000,
      PCostAprov: 99000000,
      IsIdea: "not Idea",
      IsPersian: false,
      calendarName: "cal2",
    },
  ],
};

// از Projects.rowData استفاده می‌کنیم

export const Staffing = {
  columnDefs: [
    {
      headerName: "Project Name",
      field: "nProjectID",
      filter: "agTextColumnFilter",
      // از valueGetter برای برگرداندن نام پروژه استفاده می‌کنیم
    },
  ],
  rowData: [
    { ID: 1, nProjectID: "1qq" },
    { ID: 2, nProjectID: "2" },
  ],
};

export const ProjectsAccess = {
  columnDefs: [
    {
      headerName: "Role",
      field: "Name",
      filter: "agTextColumnFilter",
    },
  ],
  rowData: [
    {
      ID: 1,
      Name: "Open List Tender",
      Description: "OutSourcing",
    },
    {
      ID: 2,
      Name: "Execution",
      Description: "Process for onboarding new employees.",
    },
  ],
};

export interface LeftItem {
  id: string;
  name: string;
}

export interface RightItem {
  detail: string;
  checked: boolean; // اضافه شده برای ذخیره وضعیت انتخاب یا عدم انتخاب
}

// داده‌های بخش چپ
export const LeftProjectData: { [key: number]: LeftItem[] } = {
  1: [
    { id: "1-1", name: "Sub Item 1 for Project 1" },
    { id: "1-2", name: "Sub Item 2 for Project 1" },
  ],
  2: [
    { id: "2-1", name: "Sub Item 1 for Project 2" },
    { id: "2-2", name: "Sub Item 2 for Project 2" },
  ],
};

// داده‌های بخش راست با true/false برای checked
export const RightProjectData: { [key: string]: RightItem[] } = {
  "1-1": [
    { detail: "Create Letter", checked: true },
    { detail: "Create Meeting", checked: false },
    { detail: "Create Issue", checked: true },
    { detail: "Alert Access", checked: false },
    { detail: "See All Tasks", checked: false },
    { detail: "Create Odp", checked: true },
    { detail: "Edit Prj Request", checked: false },
    { detail: "Comment", checked: false },
    { detail: "Approval Flow", checked: true },
    { detail: "Word Print", checked: false },
    { detail: "Procedure", checked: false },
    { detail: "Logs", checked: false },
    { detail: "Check List", checked: false },
    { detail: "Related Record", checked: false },
    { detail: "Download Group", checked: true },
    { detail: "Lesson Learned", checked: false },
    { detail: "Assignment", checked: false },
  ],
  "1-2": [
    { detail: "Create Letter", checked: false },
    { detail: "Create Meeting", checked: false },
    { detail: "Create Issue", checked: false },
    { detail: "Alert Access", checked: false },
    { detail: "See All Tasks", checked: true },
    { detail: "Create Odp", checked: false },
    { detail: "Edit Prj Request", checked: true },
    { detail: "Comment", checked: false },
    { detail: "Approval Flow", checked: false },
    { detail: "Word Print", checked: false },
    { detail: "Procedure", checked: false },
    { detail: "Logs", checked: true },
    { detail: "Check List", checked: false },
    { detail: "Related Record", checked: false },
    { detail: "Download Group", checked: false },
    { detail: "Lesson Learned", checked: true },
    { detail: "Assignment", checked: false },
  ],
  "2-1": [
    { detail: "Create Letter", checked: true },
    { detail: "Create Meeting", checked: true },
    { detail: "Create Issue", checked: false },
    { detail: "Alert Access", checked: false },
    { detail: "See All Tasks", checked: false },
    { detail: "Create Odp", checked: false },
    { detail: "Edit Prj Request", checked: true },
    { detail: "Comment", checked: false },
    { detail: "Approval Flow", checked: true },
    { detail: "Word Print", checked: false },
    { detail: "Procedure", checked: true },
    { detail: "Logs", checked: false },
    { detail: "Check List", checked: false },
    { detail: "Related Record", checked: true },
    { detail: "Download Group", checked: false },
    { detail: "Lesson Learned", checked: false },
    { detail: "Assignment", checked: false },
  ],
  "2-2": [
    { detail: "Create Letter", checked: false },
    { detail: "Create Meeting", checked: false },
    { detail: "Create Issue", checked: false },
    { detail: "Alert Access", checked: false },
    { detail: "See All Tasks", checked: false },
    { detail: "Create Odp", checked: false },
    { detail: "Edit Prj Request", checked: false },
    { detail: "Comment", checked: true },
    { detail: "Approval Flow", checked: false },
    { detail: "Word Print", checked: true },
    { detail: "Procedure", checked: false },
    { detail: "Logs", checked: false },
    { detail: "Check List", checked: true },
    { detail: "Related Record", checked: false },
    { detail: "Download Group", checked: false },
    { detail: "Lesson Learned", checked: false },
    { detail: "Assignment", checked: true },
  ],
};
