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

export default function Toolbar() {
  return (
    <div className="flex px-2 pt-5">
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Canban View"
      >
        <BsColumnsGap size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Table View"
      >
        <GrTable size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="example"
      >
        <LuChartBar size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Charts"
      >
        <LuChartLine size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Calendar"
      >
        <IoCalendarOutline size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Pie Charts"
      >
        <GrPieChart size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Excel Export"
      >
        <RiFileExcel2Line size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="example"
      >
        <BsThreeDotsVertical size={25} className="hover:text-slate-500" />
      </div>
      <div
        className="mr-3 cursor-pointer tooltip tooltip-bottom"
        data-tip="Views"
      >
        <MdGridView size={25} className="hover:text-slate-500" />
      </div>
    </div>
  );
}
