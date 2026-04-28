import { useState, useEffect, useCallback, useMemo } from "react";
import { Stack, Group, Button, Badge } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconSend } from "@tabler/icons-react";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import { getWeekGridColumnDefs } from "./Timelogs.columns";
import type { GridRow } from "./Timelogs.columns";
import type { CellValueChangedEvent } from "ag-grid-community";
import dayjs from "dayjs";
import {
  useCreateTimelog,
  useUpdateTimelog,
  useBulkSubmitTimelogs
} from "@/hooks/useTimelog";
import type { Timelog, TimelogType } from "@/types/Timelog.model";
import { CreateTimelogModal } from "./Modals/CreateTimelogModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildWeekRows = (weekStart: Date, timelogs: Timelog[]): GridRow[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = dayjs(weekStart).add(i, "day");
    const dateStr = d.format("YYYY-MM-DD");
    const existing = timelogs.find((t) => t.date.startsWith(dateStr));
    return {
      date: dateStr,
      dayLabel: d.format("ddd, MMM D"),
      existingId: existing?.id ?? null,
      totalHours: existing?.totalHours ?? null,
      type: existing?.type ?? "standard",
      description: existing?.description ?? "",
      status: existing?.status ?? null,
      isDirty: false,
      isSaving: false
    };
  });

// ─── Component ────────────────────────────────────────────────────────────────

export interface EmployeeWeekGridProps {
  employeeId: string;
  weekStart: Date;
  timelogs: Timelog[];
}

export function EmployeeWeekGrid({
  employeeId,
  weekStart,
  timelogs
}: EmployeeWeekGridProps) {
  const [rows, setRows] = useState<GridRow[]>(() =>
    buildWeekRows(weekStart, [])
  );
  const [createDate, setCreateDate] = useState<string | null>(null);

  const createTimelog = useCreateTimelog();
  const updateTimelog = useUpdateTimelog();
  const submitWeek = useBulkSubmitTimelogs();

  // Rebuild skeleton immediately when the week changes
  useEffect(() => {
    setRows(buildWeekRows(weekStart, []));
  }, [weekStart]);

  // Merge server data into rows as it arrives; preserve dirty edits
  useEffect(() => {
    setRows((prev) =>
      prev.map((row) => {
        const existing = timelogs.find((t) => t.date.startsWith(row.date));
        if (!existing) return { ...row, existingId: null };
        // Keep local edits but sync id and approval status
        if (row.isDirty)
          return { ...row, existingId: existing.id, status: existing.status };
        return {
          ...row,
          existingId: existing.id,
          totalHours: existing.totalHours,
          type: existing.type,
          description: existing.description ?? "",
          status: existing.status
        };
      })
    );
  }, [timelogs]);

  const handleSave = useCallback(
    (row: GridRow) => {
      if (!row.totalHours) return;

      setRows((prev) =>
        prev.map((r) => (r.date === row.date ? { ...r, isSaving: true } : r))
      );

      const onSuccess = (saved: Timelog) => {
        setRows((prev) =>
          prev.map((r) =>
            r.date === row.date
              ? {
                  ...r,
                  existingId: saved.id,
                  status: saved.status,
                  isDirty: false,
                  isSaving: false
                }
              : r
          )
        );
        notifications.show({
          title: "Saved",
          message: `${row.dayLabel} timelog saved.`,
          color: "green"
        });
      };

      const onError = () => {
        setRows((prev) =>
          prev.map((r) => (r.date === row.date ? { ...r, isSaving: false } : r))
        );
        notifications.show({
          title: "Error",
          message: "Failed to save timelog.",
          color: "red"
        });
      };

      if (row.existingId) {
        updateTimelog.mutate(
          {
            id: row.existingId,
            data: {
              totalHours: row.totalHours,
              type: row.type as TimelogType,
              description: row.description
            }
          },
          { onSuccess, onError }
        );
      } else {
        createTimelog.mutate(
          {
            employeeId,
            date: row.date,
            totalHours: row.totalHours,
            type: row.type as TimelogType,
            description: row.description
          },
          { onSuccess, onError }
        );
      }
    },
    [employeeId, createTimelog, updateTimelog]
  );

  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent<GridRow>) => {
      setRows((prev) =>
        prev.map((r) =>
          r.date === event.data.date ? { ...event.data, isDirty: true } : r
        )
      );
    },
    []
  );

  const totalHours = rows.reduce((sum, r) => sum + (r.totalHours ?? 0), 0);

  const draftIds = rows
    .filter((r) => r.existingId && r.status === "draft")
    .map((r) => r.existingId!);

  const columnDefs = useMemo(
    () => getWeekGridColumnDefs(handleSave, setCreateDate),
    [handleSave, setCreateDate]
  );

  return (
    <Stack gap={0} h="100%">
      <Group justify="space-between" px="md" py="xs">
        <Button
          leftSection={<IconSend size={14} />}
          size="xs"
          variant="light"
          color="teal"
          disabled={draftIds.length === 0}
          loading={submitWeek.isPending}
          onClick={() =>
            submitWeek.mutate(draftIds, {
              onSuccess: () =>
                notifications.show({
                  title: "Submitted",
                  message: "Week submitted for approval.",
                  color: "teal"
                }),
              onError: () =>
                notifications.show({
                  title: "Error",
                  message: "Failed to submit week.",
                  color: "red"
                })
            })
          }
        >
          Submit week
        </Button>
        <Badge size="lg" variant="light" color="blue">
          {totalHours.toFixed(1)}h this week
        </Badge>
      </Group>
      <div style={{ flex: 1, minHeight: 0 }}>
        <DataGrid<GridRow>
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={{ resizable: true, sortable: false, filter: false }}
          pagination={false}
          singleClickEdit
          getRowId={(params) => params.data.date}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
      <CreateTimelogModal
        opened={!!createDate}
        onClose={() => setCreateDate(null)}
        employeeId={employeeId}
        defaultDate={createDate ?? undefined}
      />
    </Stack>
  );
}
