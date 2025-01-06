import { TfiMenuAlt } from "react-icons/tfi";
import { PiBellRinging } from "react-icons/pi";
import { GoProjectRoadmap } from "react-icons/go";
import { CiSearch } from "react-icons/ci";
import { TfiDirectionAlt } from "react-icons/tfi";
import { GoGear } from "react-icons/go";
import { CiUser } from "react-icons/ci";

export default function Header() {
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
            <GoProjectRoadmap size={25} className="hover:text-slate-500" />
          </div>
        </div>
        <div className="flex items-center mr-4">
          <label className="input input-bordered flex items-center gap-2 mr-2">
            <input type="text" className="grow" placeholder="Search" />
            <CiSearch />
          </label>
          <div className="mr-3 cursor-pointer tooltip" data-tip="Commandbar">
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
