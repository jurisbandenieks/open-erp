import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellValueChangedEvent,
  GetRowIdFunc,
  GridReadyEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  RowSelectionOptions,
  SelectionChangedEvent,
  SortModelItem
} from "ag-grid-community";
import { useCallback } from "react";

// ─── Shared props ────────────────────────────────────────────────────────────

interface DataGridBaseProps<TData> {
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
  onSelectionChanged?: (event: SelectionChangedEvent<TData>) => void;
  onCellValueChanged?: (event: CellValueChangedEvent<TData>) => void;
  getRowId?: GetRowIdFunc<TData>;
  singleClickEdit?: boolean;
}

// ─── Client-side mode ────────────────────────────────────────────────────────

interface ClientSideProps<TData> extends DataGridBaseProps<TData> {
  serverSide?: false;
  rowData: TData[];
  datasource?: never;
}

// ─── Server-side mode ────────────────────────────────────────────────────────

interface ServerSideProps<TData> extends DataGridBaseProps<TData> {
  serverSide: true;
  datasource: IServerSideDatasource;
  rowData?: never;
}

export type DataGridProps<TData> =
  | ClientSideProps<TData>
  | ServerSideProps<TData>;

// ─── Helper types exported for consumers building a datasource ───────────────

export type { IServerSideDatasource, IServerSideGetRowsParams, SortModelItem };

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultColDefBase: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  suppressMovable: false
};

// ─── Component ───────────────────────────────────────────────────────────────

export const DataGrid = <TData,>({
  columnDefs,
  defaultColDef,
  pagination = true,
  paginationPageSize = 50,
  paginationPageSizeSelector = [25, 50, 100],
  animateRows = true,
  tooltipShowDelay = 500,
  style = { height: "100%", width: "100%" },
  rowSelection,
  onGridReady,
  onSelectionChanged,
  onCellValueChanged,
  getRowId,
  singleClickEdit,
  ...modeProps
}: DataGridProps<TData>) => {
  const handleGridReady = useCallback(
    (params: GridReadyEvent<TData>) => {
      params.api.sizeColumnsToFit();
      onGridReady?.(params);
    },
    [onGridReady]
  );

  const sharedProps = {
    columnDefs,
    defaultColDef: {
      ...(defaultColDefBase as ColDef<TData>),
      ...defaultColDef
    },
    onGridReady: handleGridReady,
    pagination,
    paginationPageSize,
    paginationPageSizeSelector,
    animateRows,
    tooltipShowDelay,
    ...(rowSelection !== undefined ? { rowSelection } : {}),
    ...(onSelectionChanged !== undefined ? { onSelectionChanged } : {}),
    ...(onCellValueChanged !== undefined ? { onCellValueChanged } : {}),
    ...(getRowId !== undefined ? { getRowId } : {}),
    ...(singleClickEdit !== undefined ? { singleClickEdit } : {})
  };

  return (
    <div style={style}>
      {modeProps.serverSide ? (
        <AgGridReact<TData>
          {...sharedProps}
          rowModelType="serverSide"
          serverSideDatasource={modeProps.datasource}
          // Server-side pagination is handled by the grid itself
          cacheBlockSize={paginationPageSize}
        />
      ) : (
        <AgGridReact<TData> {...sharedProps} rowData={modeProps.rowData} />
      )}
    </div>
  );
};
