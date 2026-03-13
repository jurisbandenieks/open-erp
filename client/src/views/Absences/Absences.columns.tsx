import type { ColDef } from "ag-grid-community";
import { Badge, ActionIcon, Tooltip, Group } from "@mantine/core";
import { IconEdit, IconX } from "@tabler/icons-react";
import type { Absence } from "@/types/Absence.model";

export const STATUS_COLORS: Record<string, string> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
  cancelled: "gray"
};

export const TYPE_LABELS: Record<string, string> = {
  vacation: "Vacation",
  sick_leave: "Sick Leave",
  personal: "Personal",
  unpaid: "Unpaid",
  maternity: "Maternity",
  paternity: "Paternity",
  bereavement: "Bereavement",
  study: "Study",
  time_in_lieu: "Time in Lieu"
};

export const defaultAbsenceColDef: ColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  minWidth: 100
};

interface ColumnOptions {
  onEdit?: (absence: Absence) => void;
  onCancel?: (absence: Absence) => void;
}

export function getAbsenceColumnDefs({
  onEdit,
  onCancel
}: ColumnOptions): ColDef<Absence>[] {
  const cols: ColDef<Absence>[] = [
    {
      field: "startDate",
      headerName: "Start Date",
      width: 120
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 120
    },
    {
      field: "totalDays",
      headerName: "Days",
      width: 80,
      type: "numericColumn"
    },
    {
      field: "type",
      headerName: "Type",
      width: 140,
      cellRenderer: ({ value }: { value: string }) =>
        TYPE_LABELS[value] ?? value
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      cellRenderer: ({ value }: { value: string }) => {
        const color = STATUS_COLORS[value] ?? "gray";
        return (
          <Badge color={color} size="sm" variant="light">
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      }
    },
    {
      field: "notes",
      headerName: "Notes",
      flex: 1,
      minWidth: 150
    },
    {
      field: "requestedAt",
      headerName: "Requested",
      width: 130,
      valueFormatter: ({ value }: { value: string }) =>
        value ? new Date(value).toLocaleDateString() : ""
    }
  ];

  // Actions column
  cols.push({
    headerName: "Actions",
    width: 80,
    sortable: false,
    filter: false,
    cellRenderer: ({ data }: { data: Absence }) => {
      if (!data) return null;
      const isPending = data.status === "pending";
      if (!isPending) return null;
      return (
        <Group gap={4} align="center" style={{ height: "100%" }} wrap="nowrap">
          {onEdit && (
            <Tooltip label="Edit" withArrow position="left">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                onClick={() => onEdit(data)}
              >
                <IconEdit size="1rem" />
              </ActionIcon>
            </Tooltip>
          )}
          {onCancel && (
            <Tooltip label="Cancel" withArrow position="left">
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => onCancel(data)}
              >
                <IconX size="1rem" />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      );
    }
  });

  return cols;
}
