import { BsColumnsGap } from "react-icons/bs";
import { GrTable } from "react-icons/gr";
// import { FaRegChartBar } from "react-icons/fa6";
import { LuChartBar } from "react-icons/lu";

import { LuChartLine } from "react-icons/lu";
import { IoCalendarOutline } from "react-icons/io5";
import { RiFileExcel2Line } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdGridView } from "react-icons/md";
import { GrPieChart } from "react-icons/gr";
import { TfiDashboard } from "react-icons/tfi";

type ToolbarProps = {
  setActiveView: (
    view: "dashboard" | "kanban" | "table" | "calendar" | "charts",
  ) => void;
};
export default function Toolbar({ setActiveView }: ToolbarProps): JSX.Element {
  return (
    <div className="flex px-2 pt-5">
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Dashboard View"
        onClick={() => setActiveView("dashboard")}
      >
        <TfiDashboard size={25} className="hover:text-slate-500" />
      </div>

      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Kanban View"
        onClick={() => setActiveView("kanban")}
      >
        <BsColumnsGap size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Table View"
        onClick={() => setActiveView("table")}
      >
        <GrTable size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="example"
        onClick={() => setActiveView("dashboard")}
      >
        <LuChartBar size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Charts"
        onClick={() => setActiveView("charts")}
      >
        <LuChartLine size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Calendar"
        onClick={() => setActiveView("calendar")}
      >
        <IoCalendarOutline size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Pie Charts"
        onClick={() => setActiveView("dashboard")}
      >
        <GrPieChart size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Excel Export"
        onClick={() => setActiveView("dashboard")}
      >
        <RiFileExcel2Line size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="example"
        onClick={() => setActiveView("dashboard")}
      >
        <BsThreeDotsVertical size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Views"
        onClick={() => setActiveView("dashboard")}
      >
        <MdGridView size={25} className="hover:text-slate-500" />
      </div>
    </div>
  );
}
