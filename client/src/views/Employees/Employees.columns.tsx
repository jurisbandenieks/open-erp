import { Badge, ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconUsersGroup, IconUserOff } from "@tabler/icons-react";
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
  onDeactivate: (employee: Employee) => void;
};

export const getEmployeeColumnDefs = ({
  onManageRelations,
  onDeactivate
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
    width: 110,
    sortable: false,
    filter: false,
    cellRenderer: (p: { data?: Employee }) => {
      const names = p.data?.managerNames ?? [];
      const count = p.data?.managerIds?.length ?? 0;
      return (
        <Tooltip
          label={names.length ? names.join(", ") : "None"}
          disabled={count === 0}
          withArrow
          multiline
          maw={260}
        >
          <Badge
            variant="light"
            color="blue"
            size="sm"
            style={{ cursor: count ? "default" : undefined }}
          >
            {count}
          </Badge>
        </Tooltip>
      );
    }
  },
  {
    headerName: "Managees",
    field: "manageeIds",
    width: 110,
    sortable: false,
    filter: false,
    cellRenderer: (p: { data?: Employee }) => {
      const names = p.data?.manageeNames ?? [];
      const count = p.data?.manageeIds?.length ?? 0;
      return (
        <Tooltip
          label={names.length ? names.join(", ") : "None"}
          disabled={count === 0}
          withArrow
          multiline
          maw={260}
        >
          <Badge
            variant="light"
            color="teal"
            size="sm"
            style={{ cursor: count ? "default" : undefined }}
          >
            {count}
          </Badge>
        </Tooltip>
      );
    }
  },
  {
    headerName: "",
    colId: "actions",
    minWidth: 90,
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
          <Tooltip label="Deactivate">
            <ActionIcon
              variant="subtle"
              color="orange"
              onClick={() => onDeactivate(p.data!)}
            >
              <IconUserOff size="1rem" />
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
