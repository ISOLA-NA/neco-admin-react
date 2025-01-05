import { MdApps } from "react-icons/md";
import AppServices from "../../../services/api.services";
import { useEffect, useState } from "react";
import { unGZip } from "../../../utils/ungzip";
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
    <div className="flex flex-col  h-full">
      <div className={"menu "}>
        <MdApps size={30} />
      </div>
      <div className="max-h-[80vh] overflow-auto ">
        <ul className="menu bg-base-200">
          {ribbon &&
            ribbon.length > 0 &&
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
      </div>
    </div>
  );
}
