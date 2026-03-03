import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridReadyEvent,
  RowSelectionOptions
} from "ag-grid-community";
import { useCallback } from "react";

export interface DataGridProps<TData> {
  rowData: TData[];
  columnDefs: ColDef<TData>[];

  // Overridable defaults
  defaultColDef?: ColDef<TData>;
  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeSelector?: number[];
  rowSelection?: "single" | "multiple" | RowSelectionOptions<TData>;
  animateRows?: boolean;
  tooltipShowDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  onGridReady?: (params: GridReadyEvent<TData>) => void;
}

const defaultColDefBase: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  suppressMovable: false
};

export const DataGrid = <TData,>({
  rowData,
  columnDefs,
  defaultColDef,
  pagination = true,
  paginationPageSize = 50,
  paginationPageSizeSelector = [25, 50, 100],
  rowSelection = "multiple",
  animateRows = true,
  tooltipShowDelay = 500,
  className = "ag-theme-quartz",
  style = { height: "100%", width: "100%" },
  onGridReady
}: DataGridProps<TData>) => {
  const handleGridReady = useCallback(
    (params: GridReadyEvent<TData>) => {
      params.api.sizeColumnsToFit();
      onGridReady?.(params);
    },
    [onGridReady]
  );

  return (
    <div className={className} style={style}>
      <AgGridReact<TData>
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{ ...(defaultColDefBase as ColDef<TData>), ...defaultColDef }}
        onGridReady={handleGridReady}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={paginationPageSizeSelector}
        rowSelection={rowSelection}
        animateRows={animateRows}
        tooltipShowDelay={tooltipShowDelay}
      />
    </div>
  );
};
