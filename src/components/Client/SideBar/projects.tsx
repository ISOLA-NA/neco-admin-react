import { useEffect, useState } from "react";
import { MdApps } from "react-icons/md";
import AppServices from "../../../services/api.services";
import { useProject } from "../../../context/Client/projects";
export default function ProjectsBar() {
  const {
    projects,
    selectedProjects,
    toggleProjectSelection,
    selectAllProjects,
    deselectAllProjects,
  } = useProject();
  console.log(selectedProjects);

  //   const getAllUserProject = async () => {
  //     const res = await AppServices.GetAllUserProject();
  //     console.log(res);
  //     if (res.status === 200) {
  //       if (res.data.length > 0) {
  //         setProjects(res.data);
  //       }
  //     } else {
  //       console.log("Error", res);
  //     }
  //   };
  //   useEffect(() => {
  //     getAllUserProject();
  //   }, []);
  return (
    <div className={"mb-2"}>
      <div>
        <MdApps
          className={
            "cursor-pointer rounded-md hover:bg-slate-400 duration-300 tooltip"
          }
          data-tip="Project"
          size={25}
          onClick={() => document.getElementById("projectIcon").showModal()}
        />
      </div>
      <dialog id="projectIcon" className="modal">
        <div className="modal-box">
          <div className="flex justify-start space-x-2 mb-2">
            <label className="label">
              <span className="label-text font-bold">Select Project</span>
            </label>
            <button className="btn btn-sm" onClick={selectAllProjects}>
              Select All
            </button>
            <button className="btn btn-sm" onClick={deselectAllProjects}>
              Deselect All
            </button>
          </div>
          <div className="form-control max-h-[75vh] overflow-auto space-y-2 bg-slate-50 border p-2 my-2">
            {projects &&
              projects.length > 0 &&
              projects.map((project) => (
                <label
                  key={project.ID}
                  className="flex items-center space-x-2 cursor-pointer border rounded border-slate-500 p-2 hover:bg-slate-200 duration-150"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-neutral-content"
                    checked={selectedProjects.some((p) => p.ID === project.ID)}
                    onChange={() => toggleProjectSelection(project)}
                  />
                  <span className="text-gray-700">{project.ProjectName}</span>
                </label>
              ))}
          </div>
          <div className="">
            <form method="dialog" className="flex justify-around">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
