import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput";

const ExcelCalculator: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [outputValue] = useState("");

  // const handleCalculate = () => {
  //   // Perform some calculation based on the inputValue
  //   // Here we simply reverse the string as a placeholder calculation
  //   setOutputValue(inputValue.split("").reverse().join(""));
  // };

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100  rounded-lg flex items-center justify-center">
      {" "}
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        {/* Input Field */}
        <div className="mb-6">
          <DynamicInput
            name="Input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder=""
            className="w-full"
          />
        </div>

        {/* Output Field */}
        <div className="mb-6">
          <DynamicInput
            name="Output"
            type="text"
            value={outputValue}
            placeholder=""
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ExcelCalculator;
