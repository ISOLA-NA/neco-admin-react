import React, { useState } from "react";
import CustomTextarea from "../../utilities/DynamicTextArea";

const TabController: React.FC = () => {
  const [tabs, setTabs] = useState("Enter tab #1\nEnter tab #2");

  const handleTabsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTabs(e.target.value);
  };

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100  rounded-lg flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <CustomTextarea
          id="Type each Tab on a separate line:"
          name="tabs"
          value={tabs}
          onChange={handleTabsChange}
          rows={2}
          placeholder=""
          className="w-full"
        />
      </div>
    </div>
  );
};

export default TabController;
