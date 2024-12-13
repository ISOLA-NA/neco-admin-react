// tabIconVisibility.ts
export interface IconVisibility {
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showDuplicate?: boolean;
}

export const subtabIconVisibility: Record<string, IconVisibility> = {
  ProjectsAccess: {
    showAdd: false,
    showEdit: true,
    showDelete: false,
    showDuplicate: false,
  },
};
