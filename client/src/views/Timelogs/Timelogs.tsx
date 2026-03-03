import { useState, useMemo } from "react";
import {
  Paper,
  Title,
  Group,
  Select,
  Stack,
  Badge,
  Loader,
  Alert
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { WeekPicker } from "@/components/DatePickers/WeekPicker";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import { getTimelogColumnDefs, defaultTimelogColDef } from "./Timelogs.columns";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  useTimelogsByEmployeeAndWeek,
  useTimelogsByWeek
} from "@/api/useTimelog";
import employeesData from "@/mock/Employees.json";

import type { Timelog } from "@/types/Timelog.model";

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

  const columnDefs = useMemo(
    () => getTimelogColumnDefs(!!selectedEmployeeId),
    [selectedEmployeeId]
  );

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
          <Group align="flex-start" grow>
            <Select
              label="Employee"
              placeholder="All Employees"
              data={employeeOptions}
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              clearable
              searchable
              size="sm"
              maxDropdownHeight={300}
              style={{ flex: 1 }}
            />

            <WeekPicker
              weekStart={weekStart}
              onChange={setWeekStart}
              label="Week Range"
            />
          </Group>
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
          <DataGrid<Timelog>
            rowData={timelogsData?.data || []}
            columnDefs={columnDefs}
            defaultColDef={defaultTimelogColDef}
          />
        )}
      </Paper>
    </Stack>
  );
};
