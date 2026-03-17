import type { ColDef, ValueGetterParams } from "ag-grid-community";
import type { EmployeeReportRow } from "@/types/Timelog.model";

export const TYPES = [
  "standard",
  "overtime",
  "holiday",
  "sick",
  "other"
] as const;

export const STATUSES = ["draft", "submitted", "approved", "rejected"] as const;

export const TYPE_COLORS: Record<string, string> = {
  standard: "#228be6",
  overtime: "#fd7e14",
  holiday: "#12b886",
  sick: "#fa5252",
  other: "#868e96"
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "#868e96",
  submitted: "#228be6",
  approved: "#40c057",
  rejected: "#fa5252"
};

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function hoursGetter(field: "byType" | "byStatus", key: string) {
  return (p: ValueGetterParams<EmployeeReportRow>) => {
    const v = p.data?.[field]?.[key];
    return v != null ? v : 0;
  };
}

function hoursFormatter(p: { value: number }) {
  return p.value > 0 ? `${p.value.toFixed(1)}h` : "–";
}

export const defaultReportsColDef: ColDef<EmployeeReportRow> = {
  sortable: true,
  filter: false,
  resizable: true
};

export function getReportsColumnDefs(): ColDef<EmployeeReportRow>[] {
  return [
    {
      headerName: "Employee",
      field: "employeeName",
      flex: 1,
      minWidth: 160,
      pinned: "left"
    },
    {
      headerName: "Total",
      field: "totalHours",
      width: 90,
      pinned: "left",
      type: "numericColumn",
      valueFormatter: (p) =>
        p.value != null ? `${Number(p.value).toFixed(1)}h` : "–"
    },
    // Hours by type
    ...TYPES.map(
      (t): ColDef<EmployeeReportRow> => ({
        headerName: capitalize(t),
        width: 100,
        type: "numericColumn",
        valueGetter: hoursGetter("byType", t),
        valueFormatter: hoursFormatter
      })
    ),
    // Hours by status
    ...STATUSES.map(
      (s): ColDef<EmployeeReportRow> => ({
        headerName: capitalize(s),
        width: 105,
        type: "numericColumn",
        valueGetter: hoursGetter("byStatus", s),
        valueFormatter: hoursFormatter
      })
    )
  ];
}
