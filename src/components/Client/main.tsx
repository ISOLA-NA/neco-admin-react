import ClientDashboard from "./Dashboard";
import Header from "./Header";
import SideBar from "./SideBar";
import Toolbar from "./Toolbar";

// export default function Client({ children }: { childre: React.ReactNode }) {
export default function Client() {
  return (
    <div className={"h-screen w-screen grid grid-cols-9"}>
      <div className="col-span-2 bg-slate-100 border-r-2 border-slate-200  max-h-screen">
        <SideBar />
      </div>
      <div className="col-span-7 max-h-screen flex flex-col overflow-hidden">
        <Header />
        <hr />
        <Toolbar />
        <ClientDashboard />
      </div>
    </div>
  );
}
