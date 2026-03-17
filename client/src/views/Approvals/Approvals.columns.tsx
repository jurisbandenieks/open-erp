import type { ColDef } from "ag-grid-community";
import { Badge, ActionIcon, Tooltip, Group } from "@mantine/core";
import { IconClipboardCheck, IconRefresh } from "@tabler/icons-react";
import type { WeeklyApprovalSummary } from "@/types/Timelog.model";

const STATUS_COLORS: Record<string, string> = {
  draft: "gray",
  submitted: "blue",
  approved: "green",
  rejected: "red"
};

export const defaultApprovalsColDef: ColDef<WeeklyApprovalSummary> = {
  sortable: true,
  filter: true,
  resizable: true
};

interface ColumnOptions {
  onReview: (summary: WeeklyApprovalSummary) => void;
}

export function getApprovalsColumnDefs({
  onReview
}: ColumnOptions): ColDef<WeeklyApprovalSummary>[] {
  return [
    {
      field: "employeeName",
      headerName: "Employee",
      width: 180
    },
    {
      field: "totalHours",
      headerName: "Total Hours",
      width: 120,
      type: "numericColumn",
      valueFormatter: ({ value }: { value: number }) =>
        value != null ? `${value.toFixed(1)} h` : ""
    },
    {
      field: "submittedCount",
      headerName: "Submitted",
      width: 110,
      type: "numericColumn"
    },
    {
      field: "approvedCount",
      headerName: "Approved",
      width: 110,
      type: "numericColumn"
    },
    {
      field: "rejectedCount",
      headerName: "Rejected",
      width: 110,
      type: "numericColumn"
    },
    {
      field: "draftCount",
      headerName: "Draft",
      width: 90,
      type: "numericColumn"
    },
    {
      field: "weekStatus",
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
      headerName: "Actions",
      width: 80,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data: WeeklyApprovalSummary }) => {
        if (!data) return null;
        const isApproved = data.weekStatus === "approved";
        const label = isApproved ? "Re-review" : "Review";
        const color = isApproved ? "orange" : "green";
        return (
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <Group gap={4}>
              <Tooltip label={label} withArrow position="left">
                <ActionIcon
                  variant="subtle"
                  color={color}
                  size="sm"
                  onClick={() => onReview(data)}
                >
                  {isApproved ? (
                    <IconRefresh size="1rem" />
                  ) : (
                    <IconClipboardCheck size="1rem" />
                  )}
                </ActionIcon>
              </Tooltip>
            </Group>
          </div>
        );
      }
    }
  ];
}
