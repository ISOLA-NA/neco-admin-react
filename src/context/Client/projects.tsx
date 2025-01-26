// ProjectContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AppServices from "../../services/api.services";

interface Project {
  AccessGId: string;
  AcualStartTime?: Date;
  CreateDate: Date;
  ID: string;
  IsIdea: boolean;
  IsPersian: boolean;
  IsVisible: boolean;
  LastModified: Date;
  PCostAct: number;
  PCostAprov: number;
  ParrentId?: string;
  Progress1: number;
  Progress2: number;
  Progress3: number;
  ProjectName: string;
  RCostAct: number;
  RCostAprov: number;
  StarterPostId: string;
  State: number;
  TotalDuration: number;
  nCalendarID?: string;
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  selectedProjects: Project[];
  toggleProjectSelection: (project: Project) => void;
  clearSelectedProjects: () => void;
  selectAllProjects: () => void;
  deselectAllProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AppServices.GetAllUserProject();
      console.log("Projects", response);
      const sortedProjects = response.data
        .filter((project) => project.ProjectName !== "")
        .sort((a, b) =>
          a.ProjectName.toLowerCase().localeCompare(
            b.ProjectName.toLowerCase(),
          ),
        );
      setProjects(sortedProjects);
      if (sortedProjects.length > 0) {
        setSelectedProjects([sortedProjects[0]]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectSelection = (project: Project) => {
    setSelectedProjects(
      (prevSelected) =>
        prevSelected.some((p) => p.ID === project.ID)
          ? prevSelected.filter((p) => p.ID !== project.ID) // Remove if already selected
          : [...prevSelected, project], // Add if not selected
    );
  };

  const clearSelectedProjects = () => {
    setSelectedProjects([]);
  };
  const selectAllProjects = () => {
    setSelectedProjects(projects);
  };

  const deselectAllProjects = () => {
    setSelectedProjects([]);
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        selectedProjects,
        toggleProjectSelection,
        clearSelectedProjects,
        selectAllProjects,
        deselectAllProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
