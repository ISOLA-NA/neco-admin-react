import {
  Grid,
  GridColumn as Column,
  GridToolbar,
} from "@progress/kendo-react-grid";
import "@progress/kendo-theme-default/dist/all.css";

export default function DataGrid() {
  const data = [
    { id: 1, name: "John Doe", age: 30, city: "New York" },
    { id: 2, name: "Jane Smith", age: 25, city: "Los Angeles" },
    { id: 3, name: "Michael Brown", age: 40, city: "Chicago" },
  ];

  return (
    <div>
      <Grid data={data} filterable resizable>
        <Column field="id" title="ID" width="50px" />
        <Column field="name" title="Name" />
        <Column field="age" title="Age" width="100px" />
        <Column field="city" title="City" />
      </Grid>
    </div>
  );
}
