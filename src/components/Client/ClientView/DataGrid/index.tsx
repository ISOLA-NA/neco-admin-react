import {
  Grid,
  GridColumn as Column,
  GridToolbar,
} from "@progress/kendo-react-grid";
import "@progress/kendo-theme-default/dist/all.css";
import { useCommand } from "../../../../context/Client/commands";
import { useEffect, useState } from "react";

export default function DataGrid() {
  const { handleCommandDecorations, tableData, colsDef } = useCommand();
  console.log("tableData", tableData, colsDef);

  useEffect(() => {
    console.log("DataGrid view activated, executing commands...");
    handleCommandDecorations();
  }, []);

  return (
    <div className="h-full p-6">
      <Grid
        data={tableData}
        resizable
        size="small"
        style={{
          position: "absolute",
          top: "20px",
          right: "10px",
          left: "10px",
          bottom: "20px",
        }}
      >
        {colsDef.map((col) => (
          <Column
            key={col.field}
            field={col.field}
            title={col.title}
            width="150px"
            cell={TruncatedCell}
          />
        ))}
      </Grid>
    </div>
  );
}

const TruncatedCell = (props: any) => {
  const { dataItem, field } = props;
  const cellValue = dataItem[field];

  return (
    <td
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        maxWidth: "150px", // Set max width for truncation
      }}
      title={cellValue} // Show full text on hover
    >
      {cellValue}
    </td>
  );
};
