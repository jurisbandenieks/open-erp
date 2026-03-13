import type { ColDef } from "ag-grid-community";
import { Badge } from "@mantine/core";
import type { Absence } from "@/types/Absence.model";
import {
  STATUS_COLORS,
  TYPE_LABELS,
  defaultAbsenceColDef
} from "@/views/Absences/Absences.columns";

export { defaultAbsenceColDef };

interface ManagementColumnOptions {
  onReview?: (absence: Absence) => void;
}

export function getManagementAbsenceColumnDefs({
  onReview
}: ManagementColumnOptions): ColDef<Absence>[] {
  return [
    {
      field: "employeeName",
      headerName: "Employee",
      width: 160
    },
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
      field: "rejectionReason",
      headerName: "Rejection Reason",
      width: 180
    },
    {
      field: "requestedAt",
      headerName: "Requested",
      width: 130,
      valueFormatter: ({ value }: { value: string }) =>
        value ? new Date(value).toLocaleDateString() : ""
    },
    {
      headerName: "Actions",
      width: 120,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data: Absence }) => {
        if (!data) return null;
        const canReview =
          data.status === "pending" || data.status === "approved";
        if (!canReview || !onReview) return null;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%"
            }}
          >
            <button
              style={{
                fontSize: 12,
                padding: "2px 8px",
                cursor: "pointer",
                color: data.status === "approved" ? "orange" : "green"
              }}
              onClick={() => onReview(data)}
            >
              {data.status === "approved" ? "Re-review" : "Review"}
            </button>
          </div>
        );
      }
    }
  ];
}
