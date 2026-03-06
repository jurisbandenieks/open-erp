import { Badge, ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { ColDef } from "ag-grid-community";
import type { User } from "@/types/User.model";

const roleColorMap: Record<string, string> = {
  admin: "blue",
  user: "gray"
};

const statusColorMap: Record<string, string> = {
  active: "green",
  pending: "yellow",
  suspended: "red",
  inactive: "gray"
};

type ActionHandlers = {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export const getUserColumnDefs = ({
  onEdit,
  onDelete
}: ActionHandlers): ColDef<User>[] => [
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
    headerName: "Role",
    field: "role",
    width: 110,
    cellRenderer: (p: { value: string }) => (
      <Badge
        color={roleColorMap[p.value] ?? "gray"}
        variant="light"
        size="sm"
        tt="capitalize"
      >
        {p.value}
      </Badge>
    )
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
        {p.value}
      </Badge>
    )
  },
  {
    headerName: "Verified",
    field: "emailVerified",
    width: 100,
    cellRenderer: (p: { value: boolean }) => (
      <Badge color={p.value ? "green" : "gray"} variant="dot" size="sm">
        {p.value ? "Yes" : "No"}
      </Badge>
    )
  },
  {
    headerName: "Created",
    field: "createdAt",
    width: 120,
    valueFormatter: (p) =>
      p.value ? new Date(p.value as string).toLocaleDateString() : ""
  },
  {
    headerName: "",
    colId: "actions",
    width: 90,
    sortable: false,
    filter: false,
    resizable: false,
    pinned: "right",
    cellRenderer: (p: { data?: User }) => {
      if (!p.data) return null;
      return (
        <Group gap={4} justify="flex-end" wrap="nowrap" h="100%" align="center">
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" onClick={() => onEdit(p.data!)}>
              <IconEdit size="1rem" />
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

export const defaultUserColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true
};
