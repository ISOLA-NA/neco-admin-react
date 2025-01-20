import { ProjectProvider } from "../../context/Client/projects";
import { CommandProvider } from "../../context/Client/commands";
import ClientDashboard from "./ClientView/Dashboard";
import KanbanBoard from "./ClientView/Kanban";
import Header from "./Header";
import SideBar from "./SideBar";
import Toolbar from "./Toolbar";
import { useState } from "react";

type ViewType = "dashboard" | "kanban" | "table" | "calendar" | "charts";

// export default function Client({ children }: { childre: React.ReactNode }) {
export default function Client() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard"); // Default view is Dashboard

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <ClientDashboard />;
      case "kanban":
        return <KanbanBoard />;
      case "table":
        return <TableView />;
      case "calendar":
        return <CalendarView />;
      case "charts":
        return <ChartsView />;
      default:
        return <ClientDashboard />;
    }
  };
  return (
    <CommandProvider>
      <ProjectProvider>
        <div className={"h-screen w-screen grid grid-cols-9"}>
          <div className="col-span-2 bg-slate-100 border-r-2 border-slate-200  max-h-screen">
            <SideBar />
          </div>
          <div className="col-span-7 max-h-screen flex flex-col ">
            <Header />
            <hr />
            <Toolbar setActiveView={setActiveView} />
            <div className="h-full py-10 px-2">{renderView()}</div>
          </div>
        </div>
      </ProjectProvider>
    </CommandProvider>
  );
}
