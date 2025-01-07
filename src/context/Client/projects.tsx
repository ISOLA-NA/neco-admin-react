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
  data: Project[];
  loading: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({
  children,
}) => {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AppServices.GetAllUserProject();
      console.log("Projects", response);
      setData(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ProjectContext.Provider value={{ data, loading, error }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within an ProjectProvider");
  }
  return context;
};
