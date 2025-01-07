import { IoMdInformationCircleOutline } from "react-icons/io";

import AppServices from "../../../services/api.services";
import { useEffect, useState } from "react";
import { unGZip } from "../../../utils/ungzip";
import ProjectsBar from "./projects";
export default function SideBar() {
  const [ribbon, setRibbon] = useState([]);
  const getAllMenuClient = async () => {
    const res = await AppServices.GetAllMenuClient();
    console.log(res);

    if (res.data && res.data.length > 0) {
      const res1 = await AppServices.GetZipFullMenuClient(res.data[0].ID);
      const unZipedMenu = unGZip(res1.data);
      setRibbon(unZipedMenu);
      console.log(unZipedMenu);
    }
  };
  useEffect(() => {
    getAllMenuClient();
  }, []);
  return (
    <aside className="flex flex-col justify-between h-full py-12 px-2">
      <ProjectsBar />
      <div className="h-[60vh] overflow-auto border p-1">
        {ribbon && (
          <ul className="menu bg-base-200">
            {ribbon.length > 0 &&
              ribbon.map(
                (item) =>
                  item.Groups.length > 0 && (
                    <li key={item.MenuTab.ID}>
                      <details>
                        <summary>{item.MenuTab.Name}</summary>
                        <ul>
                          {item.Groups.map((group) => (
                            <li key={group.ID}>
                              <details>
                                <summary>{group.Name}</summary>
                                <ul>
                                  {group.MenuItems.map((groupItem) => (
                                    <li key={groupItem.ID}>
                                      <a>{groupItem.Name}</a>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            </li>
                          ))}
                        </ul>
                      </details>
                      {/* <a></a> */}
                    </li>
                  ),
              )}
          </ul>
        )}
      </div>
      <div
        className="self-end cursor-pointer  rounded-md hover:bg-slate-400 duration-300 mb-2 tooltip tooltip-left"
        data-tip="Information"
      >
        <IoMdInformationCircleOutline size={25} />
      </div>
    </aside>
  );
}
