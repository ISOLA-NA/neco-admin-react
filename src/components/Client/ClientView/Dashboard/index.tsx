import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";
import { useProject } from "../../../../context/Client/projects";
import { SiCodefactor } from "react-icons/si";
import { RiChatFollowUpLine } from "react-icons/ri";
import { LuOctagonAlert } from "react-icons/lu";
import { GoCommentDiscussion } from "react-icons/go";
import { GoTasklist } from "react-icons/go";
import { SiGotomeeting } from "react-icons/si";
import { GoIssueReopened } from "react-icons/go";
import { SlEnvolopeLetter } from "react-icons/sl";

const data = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ClientDashboard() {
  const { projects, selectedProjects, toggleProjectSelection } = useProject();

  return (
    <div className=" flex flex-col justify-between ">
      <div className="grid grid-cols-2 h-[200px]">
        <div className="flex flex-row">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart width={200} height={200}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-lg font-semibold">Total</h1>
              <span>5724</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-4">
                <span className="w-4 h-4 bg-yellow-400"></span>
                <span className="text-gray-700">Inprogress</span>
                <span className="ml-auto text-gray-700 font-medium">724</span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="w-4 h-4 bg-gray-400"></span>
                <span className="text-gray-700">Completed</span>
                <span className="ml-auto text-gray-700 font-medium">1560</span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="w-4 h-4 bg-green-200"></span>
                <span className="text-gray-700">Started</span>
                <span className="ml-auto text-gray-700 font-medium">234</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart width={400} height={400}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-lg font-semibold">Total Delayed</h1>
              <span>5724</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-4">
                <span className="w-4 h-4 bg-yellow-400"></span>
                <span className="text-gray-700">Delayed Inprogress</span>
                <span className="ml-auto text-gray-700 font-medium">724</span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="w-4 h-4 bg-gray-400"></span>
                <span className="text-gray-700">Delayed Completed</span>
                <span className="ml-auto text-gray-700 font-medium">1560</span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="w-4 h-4 bg-green-200"></span>
                <span className="text-gray-700">Delayed Started</span>
                <span className="ml-auto text-gray-700 font-medium">234</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-5 px-2 grid grid-cols-4 h-[400px]  ">
        <div className="bg-slate-50 flex flex-col justify-start items-center gap-2 p-2 overflow-auto">
          {projects.map((project) => {
            const isSelected = selectedProjects.some(
              (selected) => selected.ID === project.ID,
            );
            return (
              <div
                key={project.ID}
                className={`border p-2 rounded-lg w-full flex justify-start items-center cursor-pointer duration-150 ${
                  isSelected
                    ? "bg-blue-100 border-blue-500"
                    : "hover:bg-slate-100 hover:border-slate-500"
                }`}
                onClick={() => toggleProjectSelection(project)}
              >
                <div className="mr-3">
                  <SiCodefactor />
                </div>
                <div className="truncate">{project.ProjectName}</div>
              </div>
            );
          })}
        </div>
        <div className="col-span-3 flex justify-between flex-wrap p-4 bg-slate-50 gap-3">
          <div className="flex justify-center items-center grow  border rounded-xl text-center hover:bg-slate-100 hover:border-slate-500 cursor-pointer duration-150">
            <div className="mr-2">
              <LuOctagonAlert size={25} />
            </div>
            Alert
          </div>
          <div className="flex justify-center items-center grow  border rounded-xl text-center hover:bg-slate-100 hover:border-slate-500 cursor-pointer duration-150">
            <div className="mr-2">
              <RiChatFollowUpLine size={25} />
            </div>
            Follow Up
          </div>
          <div className="flex justify-center items-center grow  border rounded-xl text-center hover:bg-slate-100 hover:border-slate-500 cursor-pointer duration-150">
            <div className="mr-2">
              <GoCommentDiscussion size={25} />
            </div>
            Comments
          </div>
          <div className="flex justify-center items-center w-full  border rounded-xl text-center hover:bg-slate-100 hover:border-slate-500 cursor-pointer duration-150">
            <div className="mr-2">
              <GoTasklist size={25} />
            </div>
            Tasks
          </div>
          <div className="flex justify-center items-center grow  border rounded-xl text-center hover:bg-slate-100 hover:border-slate-500 cursor-pointer duration-150">
            <div className="mr-2">
              <SiGotomeeting size={25} />
            </div>
            Meetings
          </div>
          <div className="flex justify-center items-center grow  border rounded-xl text-center hover:bg-slate-100 hover:border-slate-500 cursor-pointer duration-150">
            <div className="mr-2">
              <GoIssueReopened size={25} />
            </div>
            Issues
          </div>
          <div className="flex justify-center items-center grow  border rounded-xl text-center hover:bg-slate-100 hover:border-slate-500 cursor-pointer duration-150">
            <div className="mr-2">
              <SlEnvolopeLetter size={25} />
            </div>
            Letters
          </div>
        </div>
      </div>
    </div>
  );
}
