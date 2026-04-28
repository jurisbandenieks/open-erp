import { ActionIcon, Badge, Button, Group, Text } from "@mantine/core";
import type { ColDef } from "ag-grid-community";
import { IconPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { Timelog } from "@/types/Timelog.model";
import { STATUS_COLORS } from "@/utils/constants";

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
    headerName: "Company/Project",
    field: "companyName",
    width: 180,
    valueGetter: (params) => params.data?.companyName || "-"
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

// ─── Employee week grid ───────────────────────────────────────────────────────

export type GridRow = {
  date: string;
  dayLabel: string;
  existingId: string | null;
  totalHours: number | null;
  type: string;
  description: string;
  status: string | null;
  isDirty: boolean;
  isSaving: boolean;
};

export const getWeekGridColumnDefs = (
  handleSave: (row: GridRow) => void,
  setCreateDate: (date: string | null) => void
): ColDef<GridRow>[] => {
  const isEditable = (params: { data?: GridRow }) =>
    params.data?.status !== "submitted" && params.data?.status !== "approved";

  return [
    {
      headerName: "Day",
      field: "dayLabel",
      width: 160,
      pinned: "left",
      editable: false,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data: GridRow }) => {
        const isEmpty = !params.data.existingId && !params.data.isDirty;
        return (
          <Group gap={4} align="center" h="100%" wrap="nowrap">
            <Text size="sm">{params.data.dayLabel}</Text>
            {isEmpty && (
              <ActionIcon
                size="xs"
                variant="subtle"
                color="blue"
                onClick={() => setCreateDate(params.data.date)}
              >
                <IconPlus size={10} />
              </ActionIcon>
            )}
          </Group>
        );
      }
    },
    {
      headerName: "Hours",
      field: "totalHours",
      width: 90,
      type: "numericColumn",
      editable: isEditable,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: { min: 0, max: 24, precision: 1 },
      valueFormatter: (p) => (p.value != null ? `${p.value}h` : "–")
    },
    {
      headerName: "Type",
      field: "type",
      width: 140,
      editable: isEditable,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["standard", "overtime", "holiday", "sick", "other"]
      },
      cellRenderer: (params: { value: string }) => {
        const colorMap: Record<string, string> = {
          standard: "blue",
          overtime: "orange",
          holiday: "teal",
          sick: "red",
          other: "gray"
        };
        if (!params.value) return null;
        return (
          <Badge
            color={colorMap[params.value] ?? "gray"}
            variant="outline"
            size="sm"
          >
            {params.value.toUpperCase()}
          </Badge>
        );
      }
    },
    {
      headerName: "Description",
      field: "description",
      flex: 1,
      minWidth: 200,
      editable: isEditable,
      tooltipField: "description"
    },
    {
      headerName: "Status",
      field: "status",
      width: 120,
      editable: false,
      sortable: false,
      filter: false,
      cellRenderer: (params: { value: string | null }) => {
        if (!params.value)
          return (
            <Text size="xs" c="dimmed">
              –
            </Text>
          );
        return (
          <Badge
            color={STATUS_COLORS[params.value] ?? "gray"}
            variant="light"
            size="sm"
          >
            {params.value.toUpperCase()}
          </Badge>
        );
      }
    },
    {
      headerName: "",
      field: "isDirty",
      width: 90,
      pinned: "right",
      editable: false,
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: (params: { data: GridRow }) => {
        if (!params.data?.isDirty) return null;
        return (
          <Button
            size="xs"
            loading={params.data.isSaving}
            disabled={!params.data.totalHours}
            onClick={() => handleSave(params.data)}
          >
            Save
          </Button>
        );
      }
    }
  ];
};
