// src/components/General/Configurations.tsx

import React from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";

const Configurations: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Configurations</h2>
      <TwoColumnLayout>
        {/* First Input Group */}
        <div className="flex flex-col">
          <label
            htmlFor="configName"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Configuration Name
          </label>
          <input
            type="text"
            id="configName"
            name="configName"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter configuration name"
          />
        </div>

        {/* Second Input Group */}
        <div className="flex flex-col">
          <label
            htmlFor="configValue"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Configuration Value
          </label>
          <input
            type="text"
            id="configValue"
            name="configValue"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter configuration value"
          />
        </div>

        {/* Third Input Group */}
        <div className="flex flex-col">
          <label
            htmlFor="configType"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Configuration Type
          </label>
          <select
            id="configType"
            name="configType"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select type</option>
            <option value="typeA">Type A</option>
            <option value="typeB">Type B</option>
          </select>
        </div>

        {/* Fourth Input Group */}
        <div className="flex flex-col">
          <label
            htmlFor="configDescription"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="configDescription"
            name="configDescription"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter description"
            rows={4}
          ></textarea>
        </div>

        {/* Additional Input Groups as Needed */}
      </TwoColumnLayout>
    </div>
  );
};

export default Configurations;
