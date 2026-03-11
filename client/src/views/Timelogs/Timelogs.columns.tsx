import { Badge, Group, Text } from "@mantine/core";
import type { ColDef } from "ag-grid-community";
import dayjs from "dayjs";
import type { Timelog } from "@/types/Timelog.model";

const statusRenderer = (params: { value: string }) => {
  const colorMap: Record<string, string> = {
    draft: "gray",
    submitted: "blue",
    approved: "green",
    rejected: "red"
  };
  return (
    <Badge color={colorMap[params.value] || "gray"} variant="light">
      {params.value?.toUpperCase()}
    </Badge>
  );
};

const typeRenderer = (params: { value: string }) => {
  const colorMap: Record<string, string> = {
    standard: "blue",
    overtime: "orange",
    holiday: "teal",
    sick: "red",
    other: "gray"
  };
  return (
    <Badge color={colorMap[params.value] || "gray"} variant="outline">
      {params.value?.replace("_", " ").toUpperCase()}
    </Badge>
  );
};

const billableRenderer = (params: { data: Timelog }) => {
  if (!params.data.billable) return <Text size="sm">-</Text>;
  return (
    <Group gap="xs">
      <Badge color="green" size="sm" variant="dot">
        ${(params.data.billableHours || 0) * (params.data.hourlyRate || 0)}
      </Badge>
    </Group>
  );
};

const dateRenderer = (params: { value: string }) =>
  dayjs(params.value).format("ddd, MMM DD");

export const getTimelogColumnDefs = (
  hideEmployee: boolean
): ColDef<Timelog>[] => [
  {
    headerName: "Date",
    field: "date",
    cellRenderer: dateRenderer,
    width: 130,
    pinned: "left"
  },
  {
    headerName: "Employee",
    field: "employeeName",
    width: 180,
    pinned: "left",
    hide: hideEmployee
  },
  {
    headerName: "Entity/Project",
    field: "entityName",
    width: 180,
    valueGetter: (params) => params.data?.entityName || "-"
  },
  {
    headerName: "Hours",
    field: "totalHours",
    width: 90,
    type: "numericColumn",
    valueFormatter: (params) => `${params.value}h`
  },
  {
    headerName: "Type",
    field: "type",
    cellRenderer: typeRenderer,
    width: 120
  },
  {
    headerName: "Status",
    field: "status",
    cellRenderer: statusRenderer,
    width: 120
  },
  {
    headerName: "Description",
    field: "description",
    flex: 1,
    minWidth: 250,
    tooltipField: "description"
  },
  {
    headerName: "Location",
    field: "location",
    width: 150,
    valueGetter: (params) => {
      if (params.data?.isRemote) return "Remote";
      return params.data?.location || "-";
    }
  },
  {
    headerName: "Billable",
    field: "billable",
    cellRenderer: billableRenderer,
    width: 120
  },
  {
    headerName: "Approved By",
    field: "approvedByName",
    width: 150,
    valueGetter: (params) => params.data?.approvedByName || "-"
  }
];

export const defaultTimelogColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true
};
