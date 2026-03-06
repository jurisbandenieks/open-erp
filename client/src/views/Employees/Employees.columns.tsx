import { Badge, ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconUsersGroup, IconTrash } from "@tabler/icons-react";
import type { ColDef } from "ag-grid-community";
import type { Employee } from "@/types/Employee.model";

const statusColorMap: Record<string, string> = {
  active: "green",
  inactive: "gray",
  on_leave: "yellow",
  terminated: "red"
};

type ActionHandlers = {
  onManageRelations: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

export const getEmployeeColumnDefs = ({
  onManageRelations,
  onDelete
}: ActionHandlers): ColDef<Employee>[] => [
  {
    headerName: "Name",
    valueGetter: (p) =>
      p.data ? `${p.data.firstName} ${p.data.lastName}` : "",
    flex: 1,
    minWidth: 160
  },
  {
    headerName: "Email",
    field: "email",
    flex: 1,
    minWidth: 200
  },
  {
    headerName: "Employee #",
    field: "employeeNumber",
    width: 130
  },
  {
    headerName: "Department",
    field: "department",
    width: 140
  },
  {
    headerName: "Position",
    field: "position",
    flex: 1,
    minWidth: 140
  },
  {
    headerName: "Status",
    field: "status",
    width: 120,
    cellRenderer: (p: { value: string }) => (
      <Badge
        color={statusColorMap[p.value] ?? "gray"}
        variant="light"
        size="sm"
        tt="capitalize"
      >
        {p.value?.replace("_", " ")}
      </Badge>
    )
  },
  {
    headerName: "Managers",
    field: "managerIds",
    width: 100,
    sortable: false,
    filter: false,
    cellRenderer: (p: { value?: string[] }) => (
      <Badge variant="light" color="blue" size="sm">
        {p.value?.length ?? 0}
      </Badge>
    )
  },
  {
    headerName: "Managees",
    field: "manageeIds",
    width: 100,
    sortable: false,
    filter: false,
    cellRenderer: (p: { value?: string[] }) => (
      <Badge variant="light" color="teal" size="sm">
        {p.value?.length ?? 0}
      </Badge>
    )
  },
  {
    headerName: "",
    colId: "actions",
    width: 90,
    sortable: false,
    filter: false,
    resizable: false,
    pinned: "right",
    cellRenderer: (p: { data?: Employee }) => {
      if (!p.data) return null;
      return (
        <Group gap={4} justify="flex-end" wrap="nowrap" h="100%" align="center">
          <Tooltip label="Manage relations">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => onManageRelations(p.data!)}
            >
              <IconUsersGroup size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onDelete(p.data!)}
            >
              <IconTrash size="1rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      );
    }
  }
];

export const defaultEmployeeColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true
};
