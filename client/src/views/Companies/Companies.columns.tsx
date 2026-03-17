import { Badge, ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconEdit, IconBuildingOff } from "@tabler/icons-react";
import type { ColDef } from "ag-grid-community";
import type { Company } from "@/types/Company.model";

const statusColorMap: Record<string, string> = {
  active: "green",
  inactive: "gray",
  suspended: "red"
};

type ActionHandlers = {
  onEdit: (company: Company) => void;
  onDeactivate: (company: Company) => void;
};

export const getCompanyColumnDefs = ({
  onEdit,
  onDeactivate
}: ActionHandlers): ColDef<Company>[] => [
  {
    headerName: "Name",
    field: "name",
    flex: 1,
    minWidth: 180
  },
  {
    headerName: "Reg. Number",
    field: "registrationNumber",
    width: 150
  },
  {
    headerName: "VAT Number",
    field: "vatNumber",
    width: 140,
    valueFormatter: (p) => p.value ?? "—"
  },
  {
    headerName: "City",
    field: "city",
    width: 130,
    valueFormatter: (p) => p.value ?? "—"
  },
  {
    headerName: "Country",
    field: "country",
    width: 120,
    valueFormatter: (p) => p.value ?? "—"
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
    headerName: "Owner",
    field: "ownerName",
    flex: 1,
    minWidth: 160,
    valueFormatter: (p) => p.value ?? "—"
  },
  {
    headerName: "Created",
    field: "createdAt",
    width: 130,
    valueFormatter: (p) =>
      p.value ? new Date(p.value).toLocaleDateString() : "—"
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
    cellRenderer: (p: { data?: Company }) => {
      if (!p.data) return null;
      const isInactive = p.data.status === "inactive";
      return (
        <Group gap={4} justify="flex-end" wrap="nowrap" h="100%" align="center">
          <Tooltip label="Edit">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => onEdit(p.data!)}
            >
              <IconEdit size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={isInactive ? "Already inactive" : "Deactivate"}>
            <ActionIcon
              variant="subtle"
              color="orange"
              disabled={isInactive}
              onClick={() => !isInactive && onDeactivate(p.data!)}
            >
              <IconBuildingOff size="1rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      );
    }
  }
];

export const defaultCompanyColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true
};
