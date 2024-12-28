// tabData.ts

export interface SubTabData {
  columnDefs: any[];
  rowData: any[];
}

export const subTabDataMapping: { [key: string]: SubTabData } = {
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
        headerName: "Calendar",
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

  Staffing: {
    columnDefs: [
      {
        headerName: "Project Name",
        field: "nProjectID",
        filter: "agTextColumnFilter",
        valueGetter: (params: any) => {
          const projectID = params.data.nProjectID; // "1" یا "2"
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
          const ownerID = params.data.OwnerID; // "u1234567-89ab-cdef-0123-456789abcdef" و غیره
          const user = userList.find((u) => u.ID === ownerID);
          return user ? user.Name : "";
        },
      },
    ],
    rowData: [
      {
        ID: 1,
        nProjectID: "1",
        OwnerID: "u1234567-89ab-cdef-0123-456789abcdef",
      },
      {
        ID: 2,
        nProjectID: "2",
        OwnerID: "u2234567-89ab-cdef-0123-456789abcdef",
      },
    ],
  },
};

// استخراج لیست پروژه‌ها و کاربران برای استفاده در valueGetters
const projectLists = subTabDataMapping.Projects.rowData;
const userList = subTabDataMapping.Users.rowData;
