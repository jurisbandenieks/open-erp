import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Paper,
  Title,
  Group,
  Select,
  Stack,
  Badge,
  Button,
  Text,
  ActionIcon,
  Loader,
  Alert
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconChevronLeft,
  IconChevronRight,
  IconAlertCircle
} from "@tabler/icons-react";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import { getTimelogColumnDefs, defaultTimelogColDef } from "./Timelogs.columns";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useMyEmployee, useEmployees } from "@/api/useEmployee";
import {
  useTimelogsByEmployeeAndWeek,
  useCreateTimelog,
  useUpdateTimelog
} from "@/api/useTimelog";
import { useAuth } from "@/context/AuthContext";
import type { Timelog, TimelogType } from "@/types/Timelog.model";
import { STATUS_COLORS } from "./constants";

dayjs.extend(isoWeek);

// ─── Employee week row ────────────────────────────────────────────────────────

type GridRow = {
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

// ─── Employee inline editing grid ────────────────────────────────────────────

interface EmployeeWeekGridProps {
  employeeId: string;
  weekStart: Date;
  timelogs: Timelog[];
}

function EmployeeWeekGrid({
  employeeId,
  weekStart,
  timelogs
}: EmployeeWeekGridProps) {
  const [rows, setRows] = useState<GridRow[]>(() =>
    buildWeekRows(weekStart, [])
  );

  const createTimelog = useCreateTimelog();
  const updateTimelog = useUpdateTimelog();

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

  const isEditable = (params: { data?: GridRow }) =>
    params.data?.status !== "submitted" && params.data?.status !== "approved";

  const columnDefs = useMemo<ColDef<GridRow>[]>(
    () => [
      {
        headerName: "Day",
        field: "dayLabel",
        width: 130,
        pinned: "left",
        editable: false,
        sortable: false,
        filter: false
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
    ],
    [handleSave]
  );

  return (
    <Stack gap={0} h="100%">
      <Group justify="flex-end" px="md" py="xs">
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
    </Stack>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export const Timelogs = () => {
  const { user } = useAuth();
  const isPrivileged = ["admin", "owner", "manager"].includes(user?.role ?? "");

  const [weekStart, setWeekStart] = useState<Date>(
    dayjs().startOf("isoWeek").toDate()
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );

  const startDateStr = dayjs(weekStart).format("YYYY-MM-DD");
  const endDateStr = dayjs(weekStart).endOf("isoWeek").format("YYYY-MM-DD");

  const { data: myEmployee } = useMyEmployee();
  const { data: employeesData } = useEmployees(undefined, {
    enabled: isPrivileged
  });

  const effectiveEmployeeId = isPrivileged
    ? selectedEmployeeId
    : (myEmployee?.id ?? null);

  const {
    data: timelogsResult,
    isLoading,
    error
  } = useTimelogsByEmployeeAndWeek(
    effectiveEmployeeId ?? "",
    startDateStr,
    endDateStr,
    undefined,
    { enabled: !!effectiveEmployeeId }
  );

  const goToPrevWeek = () =>
    setWeekStart((d) => dayjs(d).subtract(1, "week").toDate());
  const goToNextWeek = () =>
    setWeekStart((d) => dayjs(d).add(1, "week").toDate());
  const goToCurrentWeek = () =>
    setWeekStart(dayjs().startOf("isoWeek").toDate());

  const employeeOptions = useMemo(
    () =>
      employeesData?.data?.map((emp) => ({
        value: emp.id,
        label: `${emp.firstName} ${emp.lastName}`
      })) ?? [],
    [employeesData]
  );

  const timelogs: Timelog[] = timelogsResult?.data ?? [];

  const privilegedTotalHours = timelogs.reduce(
    (sum, t) => sum + (t.totalHours ?? 0),
    0
  );

  const columnDefs = useMemo(
    () => getTimelogColumnDefs(!isPrivileged || !!effectiveEmployeeId),
    [isPrivileged, effectiveEmployeeId]
  );

  const isCurrentWeek = dayjs(weekStart).isSame(
    dayjs().startOf("isoWeek"),
    "day"
  );

  return (
    <Stack gap="md" p="md">
      <Paper shadow="xs" p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={2}>Timelogs</Title>
            {isPrivileged && effectiveEmployeeId && (
              <Badge size="lg" variant="light" color="blue">
                {privilegedTotalHours.toFixed(1)}h this week
              </Badge>
            )}
          </Group>

          <Group align="flex-end" gap="md">
            {isPrivileged && (
              <Select
                label="Employee"
                placeholder="Select employee"
                data={employeeOptions}
                value={selectedEmployeeId}
                onChange={setSelectedEmployeeId}
                clearable
                searchable
                size="sm"
                style={{ minWidth: 240 }}
              />
            )}

            <Stack gap={4}>
              <Text size="sm" fw={500}>
                Week
              </Text>
              <Group gap="xs">
                <ActionIcon variant="default" onClick={goToPrevWeek}>
                  <IconChevronLeft size={16} />
                </ActionIcon>
                <Text
                  size="sm"
                  fw={500}
                  style={{ minWidth: 170, textAlign: "center" }}
                >
                  {dayjs(weekStart).format("MMM D")} –{" "}
                  {dayjs(weekStart).endOf("isoWeek").format("MMM D, YYYY")}
                </Text>
                <ActionIcon variant="default" onClick={goToNextWeek}>
                  <IconChevronRight size={16} />
                </ActionIcon>
                {!isCurrentWeek && (
                  <Button size="xs" variant="light" onClick={goToCurrentWeek}>
                    Today
                  </Button>
                )}
              </Group>
            </Stack>
          </Group>
        </Stack>
      </Paper>

      <Paper shadow="xs" withBorder style={{ height: "calc(100vh - 300px)" }}>
        {!effectiveEmployeeId ? (
          <Alert icon={<IconAlertCircle size={16} />} color="yellow" m="md">
            {isPrivileged
              ? "Select an employee to view timelogs."
              : "No employee record found for your account."}
          </Alert>
        ) : isPrivileged ? (
          isLoading ? (
            <Group justify="center" align="center" h="100%">
              <Loader size="lg" />
            </Group>
          ) : error ? (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error loading timelogs"
              color="red"
              m="md"
            >
              {error instanceof Error ? error.message : "An error occurred"}
            </Alert>
          ) : (
            <DataGrid<Timelog>
              rowData={timelogs}
              columnDefs={columnDefs}
              defaultColDef={defaultTimelogColDef}
            />
          )
        ) : (
          // Employee view: always show 7-day editable grid; scaffold appears
          // immediately and populates once server data arrives.
          <EmployeeWeekGrid
            key={effectiveEmployeeId}
            employeeId={effectiveEmployeeId}
            weekStart={weekStart}
            timelogs={timelogs}
          />
        )}
      </Paper>
    </Stack>
  );
};
