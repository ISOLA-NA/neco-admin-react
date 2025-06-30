import React from "react";

const HelpBox: React.FC = () => (
  <details className="mb-3 bg-yellow-50 rounded border-l-4 border-yellow-400 p-3 text-sm">
    <summary className="cursor-pointer font-semibold text-yellow-700">
      راهنمای تولید فرمان
    </summary>

    <div className="mt-2 space-y-2 leading-6 text-gray-700">
      <p>
        <b>Form&nbsp;Command</b> :
        <br />
        <code>NecoPM:\ncmd\forms?TypeID=&lt;ID&gt;</code>
      </p>

      <p>
        <b>Project&nbsp;Command</b> :
        <br />
        ابتدا پروژه را انتخاب کنید؛ سپس زیر-برنامهٔ دلخواه را از درخت انتخاب
        کنید.
        <br />
        <code>NecoPM:\cmd\prj?id=&lt;subProgramID&gt;</code>
      </p>

      <p>
        <b>ProgramType&nbsp;Command</b> :
        <br />
        <code>NecoPM:\cmd\prg?id=&lt;ProgramTypeID&gt;</code>
      </p>
    </div>
  </details>
);

export default HelpBox;
