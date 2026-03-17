import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColDef } from "ag-grid-community";
import { DataGrid } from "./DataGrid";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// ─── Sample data ─────────────────────────────────────────────────────────────

interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
  salary: number;
}

const columns: ColDef<Employee>[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "name", headerName: "Name" },
  { field: "department", headerName: "Department" },
  { field: "role", headerName: "Role" },
  {
    field: "salary",
    headerName: "Salary",
    valueFormatter: ({ value }) => `$${value.toLocaleString()}`
  }
];

const rows: Employee[] = [
  {
    id: 1,
    name: "Alice Johnson",
    department: "Engineering",
    role: "Developer",
    salary: 90000
  },
  {
    id: 2,
    name: "Bob Smith",
    department: "Design",
    role: "UX Designer",
    salary: 80000
  },
  {
    id: 3,
    name: "Carol White",
    department: "Engineering",
    role: "Tech Lead",
    salary: 110000
  },
  {
    id: 4,
    name: "David Lee",
    department: "HR",
    role: "HR Manager",
    salary: 75000
  },
  {
    id: 5,
    name: "Eva Martinez",
    department: "Finance",
    role: "Accountant",
    salary: 70000
  }
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Components/DataGrid",
  component: DataGrid,
  parameters: { layout: "fullscreen" }
};

export default meta;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Default: StoryObj = {
  render: () => (
    <div className="ag-theme-quartz" style={{ height: 400, padding: 16 }}>
      <DataGrid<Employee> columnDefs={columns} rowData={rows} />
    </div>
  )
};

export const Empty: StoryObj = {
  render: () => (
    <div className="ag-theme-quartz" style={{ height: 400, padding: 16 }}>
      <DataGrid<Employee> columnDefs={columns} rowData={[]} />
    </div>
  )
};

export const WithRowSelection: StoryObj = {
  render: () => (
    <div className="ag-theme-quartz" style={{ height: 400, padding: 16 }}>
      <DataGrid<Employee>
        columnDefs={columns}
        rowData={rows}
        rowSelection="single"
      />
    </div>
  )
};

export const PaginationSmall: StoryObj = {
  render: () => (
    <div className="ag-theme-quartz" style={{ height: 400, padding: 16 }}>
      <DataGrid<Employee>
        columnDefs={columns}
        rowData={rows}
        pagination
        paginationPageSize={2}
        paginationPageSizeSelector={[2, 5, 10]}
      />
    </div>
  )
};
