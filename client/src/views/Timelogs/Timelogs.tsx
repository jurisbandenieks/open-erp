import { useState, useMemo, useCallback } from "react";
import {
  Paper,
  Title,
  Group,
  Select,
  Button,
  Stack,
  Text,
  Badge,
  Loader,
  Alert
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconAlertCircle
} from "@tabler/icons-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent } from "ag-grid-community";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  useTimelogsByEmployeeAndWeek,
  useTimelogsByWeek
} from "@/api/useTimelog";
import type { Timelog } from "@/types/Timelog.model";
import employeesData from "@/mock/Employees.json";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

dayjs.extend(isoWeek);

export const Timelogs = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [weekStart, setWeekStart] = useState<Date>(
    dayjs().startOf("isoWeek").toDate()
  );

  const weekEnd = useMemo(
    () => dayjs(weekStart).endOf("isoWeek").toDate(),
    [weekStart]
  );

  // Format dates for API
  const startDateStr = dayjs(weekStart).format("YYYY-MM-DD");
  const endDateStr = dayjs(weekEnd).format("YYYY-MM-DD");

  // Fetch timelogs based on filters
  const {
    data: timelogsData,
    isLoading,
    error
  } = selectedEmployeeId
    ? useTimelogsByEmployeeAndWeek(selectedEmployeeId, startDateStr, endDateStr)
    : useTimelogsByWeek(startDateStr, endDateStr);

  // Employee options for select
  const employeeOptions = useMemo(
    () =>
      employeesData.map((emp) => ({
        value: emp.id,
        label: `${emp.firstName} ${emp.lastName} (${emp.employeeNumber})`
      })),
    []
  );

  // Navigate week
  const goToPreviousWeek = useCallback(() => {
    setWeekStart(dayjs(weekStart).subtract(1, "week").toDate());
  }, [weekStart]);

  const goToNextWeek = useCallback(() => {
    setWeekStart(dayjs(weekStart).add(1, "week").toDate());
  }, [weekStart]);

  const goToCurrentWeek = useCallback(() => {
    setWeekStart(dayjs().startOf("isoWeek").toDate());
  }, []);

  // Status badge renderer
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

  // Type badge renderer
  const typeRenderer = (params: { value: string }) => {
    const colorMap: Record<string, string> = {
      regular: "blue",
      overtime: "orange",
      remote: "teal",
      on_site: "violet"
    };
    return (
      <Badge color={colorMap[params.value] || "gray"} variant="outline">
        {params.value?.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  // Billable renderer
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

  // Date renderer
  const dateRenderer = (params: { value: string }) => {
    return dayjs(params.value).format("ddd, MMM DD");
  };

  // Column definitions
  const columnDefs = useMemo<ColDef<Timelog>[]>(
    () => [
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
        hide: !!selectedEmployeeId
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
    ],
    [selectedEmployeeId]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true
    }),
    []
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    const timelogs = timelogsData?.data || [];
    return {
      totalHours: timelogs.reduce((sum, t) => sum + t.totalHours, 0),
      billableHours: timelogs.reduce(
        (sum, t) => sum + (t.billableHours || 0),
        0
      ),
      entries: timelogs.length
    };
  }, [timelogsData]);

  return (
    <Stack gap="md" p="md">
      {/* Header Section */}
      <Paper shadow="xs" p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={2}>Timelogs</Title>
            <Group gap="md">
              <Badge size="lg" variant="light" color="blue">
                {totals.entries} entries
              </Badge>
              <Badge size="lg" variant="light" color="green">
                {totals.totalHours.toFixed(1)}h total
              </Badge>
              {totals.billableHours > 0 && (
                <Badge size="lg" variant="light" color="teal">
                  {totals.billableHours.toFixed(1)}h billable
                </Badge>
              )}
            </Group>
          </Group>

          {/* Filters */}
          <Group align="flex-end" grow>
            <Select
              label="Employee"
              placeholder="All Employees"
              data={employeeOptions}
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              clearable
              searchable
              maxDropdownHeight={300}
              style={{ flex: 1 }}
            />

            <Stack gap="xs" style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                Week Range
              </Text>
              <Group gap="xs">
                <Button
                  variant="default"
                  size="sm"
                  onClick={goToPreviousWeek}
                  leftSection={<IconChevronLeft size={16} />}
                >
                  Previous
                </Button>
                <DatePickerInput
                  value={weekStart}
                  onChange={(date) =>
                    date &&
                    setWeekStart(dayjs(date).startOf("isoWeek").toDate())
                  }
                  leftSection={<IconCalendar size={16} />}
                  placeholder="Select week"
                  valueFormat="MMM DD, YYYY"
                  style={{ flex: 1 }}
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={goToNextWeek}
                  rightSection={<IconChevronRight size={16} />}
                >
                  Next
                </Button>
              </Group>
            </Stack>

            <Button
              onClick={goToCurrentWeek}
              variant="light"
              style={{ flex: 0, minWidth: 120 }}
            >
              Current Week
            </Button>
          </Group>

          <Text size="sm" c="dimmed">
            Showing: {dayjs(weekStart).format("MMM DD, YYYY")} -{" "}
            {dayjs(weekEnd).format("MMM DD, YYYY")}
          </Text>
        </Stack>
      </Paper>

      {/* Grid Section */}
      <Paper shadow="xs" withBorder style={{ height: "calc(100vh - 320px)" }}>
        {isLoading ? (
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
          <div
            className="ag-theme-quartz"
            style={{ height: "100%", width: "100%" }}
          >
            <AgGridReact<Timelog>
              rowData={timelogsData?.data || []}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              pagination={true}
              paginationPageSize={50}
              paginationPageSizeSelector={[25, 50, 100]}
              rowSelection="multiple"
              animateRows={true}
              tooltipShowDelay={500}
            />
          </div>
        )}
      </Paper>
    </Stack>
  );
};
