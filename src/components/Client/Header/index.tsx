import { TfiMenuAlt } from "react-icons/tfi";
import { PiBellRinging } from "react-icons/pi";
import { GoProjectRoadmap } from "react-icons/go";
import { CiSearch } from "react-icons/ci";
import { TfiDirectionAlt } from "react-icons/tfi";
import { GoGear } from "react-icons/go";
import { CiUser } from "react-icons/ci";
import { GoCommandPalette } from "react-icons/go";
import { VscDebugStart } from "react-icons/vsc";

import { useProject } from "../../../context/Client/projects";
import { useCommand } from "../../../context/Client/commands";

import { useState } from "react";
export default function Header() {
  const { selectedProjects } = useProject();
  const { command, handleSetCommand, handleCommandDecorations } = useCommand();
  const [showCommandInput, setShowCommandInput] = useState(false);

  return (
    <nav className="p-0 pt-10 pb-2 px-2">
      <div className="flex justify-between">
        <div className="flex flex-row items-center">
          <div className="mr-3 cursor-pointer tooltip" data-tip="Unkownd">
            <TfiMenuAlt size={25} className="hover:text-slate-500" />
          </div>
          <div className="mr-3 cursor-pointer tooltip" data-tip="Notification">
            <PiBellRinging size={25} className="hover:text-slate-500" />
          </div>
          <div
            className="mr-3 cursor-pointer tooltip"
            data-tip="Projects selected"
          >
            <div className="dropdown dropdown-hover block">
              <GoProjectRoadmap size={25} className="hover:text-slate-500" />

              <div
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[1] min-w-40 max-w-52 p-2 shadow flex flex-col items-start"
              >
                {selectedProjects.length === 0 && <p>No project selected!</p>}
                {selectedProjects.slice(0, 2).map((project, index) => (
                  <div
                    key={project.ID}
                    className="text-sm text-left hover:text-slate-500 truncate w-full"
                  >
                    <span>{index + 1}-</span> {project.ProjectName}
                  </div>
                ))}
                {selectedProjects.length > 2 && (
                  <div className="text-sm text-left text-gray-500">
                    +{selectedProjects.length - 2} more project
                    {selectedProjects.length - 2 > 1 ? "s are" : " is"} selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div>
          {" "}
          <label className="input input-bordered flex items-center gap-2 mr-2">
            <input type="text" className="grow" placeholder="Search" />
            <CiSearch />
          </label>
        </div>
        <div className="flex items-center mr-4">
          <form
            onSubmit={handleCommandDecorations}
            className={`${
              showCommandInput ? "opacity-100 mr-2 block" : "opacity-0 hidden"
            } `}
          >
            <label className="input input-bordered flex items-center gap-2 mr-2">
              <GoCommandPalette />
              <input
                type="text"
                className="grow"
                placeholder="Type a command"
                onChange={(e) => handleSetCommand(e.target.value)}
                value={command}
              />
              <VscDebugStart onClick={handleCommandDecorations} />
            </label>
          </form>
          <div
            className="mr-3 cursor-pointer tooltip"
            data-tip="Commandbar"
            onClick={() => setShowCommandInput((prev) => !prev)}
          >
            <TfiDirectionAlt size={25} className="hover:text-slate-500" />
          </div>
          <div className="mr-3 cursor-pointer tooltip" data-tip="Settings">
            <GoGear size={25} className="hover:text-slate-500" />
          </div>
          <div className="mr-3 cursor-pointer tooltip" data-tip="User">
            <CiUser size={25} className="hover:text-slate-500" />
          </div>
        </div>
      </div>
    </nav>
  );
}
