import { useState, useMemo } from "react";
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
import {
  IconChevronLeft,
  IconChevronRight,
  IconAlertCircle
} from "@tabler/icons-react";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import { getTimelogColumnDefs, defaultTimelogColDef } from "./Timelogs.columns";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useMyEmployee, useEmployees } from "@/api/useEmployee";
import { useTimelogsByEmployeeAndWeek } from "@/api/useTimelog";
import { useAuth } from "@/context/AuthContext";
import type { Timelog } from "@/types/Timelog.model";

dayjs.extend(isoWeek);

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

  const columnDefs = useMemo(
    () => getTimelogColumnDefs(!isPrivileged || !!effectiveEmployeeId),
    [isPrivileged, effectiveEmployeeId]
  );

  const timelogs: Timelog[] = timelogsResult?.data ?? [];

  const totalHours = timelogs.reduce((sum, t) => sum + (t.totalHours ?? 0), 0);

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
            <Badge size="lg" variant="light" color="blue">
              {totalHours.toFixed(1)}h this week
            </Badge>
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
        ) : isLoading ? (
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
        )}
      </Paper>
    </Stack>
  );
};
