import { Badge, ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { ColDef } from "ag-grid-community";
import type { Owner } from "@/types/Owner.model";

type ActionHandlers = {
  onEdit: (owner: Owner) => void;
  onDelete: (owner: Owner) => void;
};

export const getOwnerColumnDefs = ({
  onEdit,
  onDelete
}: ActionHandlers): ColDef<Owner>[] => [
  {
    headerName: "Name",
    valueGetter: (p) =>
      p.data ? `${p.data.user.firstName} ${p.data.user.lastName}` : "",
    flex: 1,
    minWidth: 160
  },
  {
    headerName: "Email",
    valueGetter: (p) => p.data?.user.email ?? "",
    flex: 1,
    minWidth: 200
  },
  {
    headerName: "Display Name",
    field: "displayName",
    flex: 1,
    minWidth: 150,
    valueFormatter: (p) => p.value || "—"
  },
  {
    headerName: "Tax ID",
    field: "taxId",
    width: 140,
    valueFormatter: (p) => p.value || "—"
  },
  {
    headerName: "Status",
    field: "status",
    width: 120,
    cellRenderer: (p: { value: string }) => {
      const color =
        p.value === "active"
          ? "green"
          : p.value === "suspended"
            ? "red"
            : "gray";
      return (
        <Badge color={color} variant="light" size="sm">
          {p.value}
        </Badge>
      );
    }
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
    cellRenderer: (p: { data?: Owner }) => {
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

export const defaultOwnerColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true
};
