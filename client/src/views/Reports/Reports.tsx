import { useState, useMemo } from "react";
import {
  Paper,
  Stack,
  Title,
  Group,
  Select,
  Text,
  SimpleGrid,
  Alert,
  Loader,
  Center
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconAlertCircle } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEmployees } from "@/api/useEmployee";
import { useTimelogSummary } from "@/api/useTimelog";
import type { EmployeeReportRow } from "@/types/Timelog.model";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import {
  getReportsColumnDefs,
  defaultReportsColDef,
  TYPES,
  STATUSES,
  TYPE_COLORS,
  STATUS_COLORS,
  capitalize
} from "./Reports.columns";

export function Reports() {
  const [startDate, setStartDate] = useState<Date | null>(
    dayjs().startOf("month").toDate()
  );
  const [endDate, setEndDate] = useState<Date | null>(
    dayjs().endOf("month").toDate()
  );
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  const startStr = startDate ? dayjs(startDate).format("YYYY-MM-DD") : "";
  const endStr = endDate ? dayjs(endDate).format("YYYY-MM-DD") : "";

  const { data: employeesData } = useEmployees();
  const { data, isLoading, error } = useTimelogSummary(
    {
      startDate: startStr,
      endDate: endStr,
      employeeId: employeeId ?? undefined
    },
    { enabled: !!startStr && !!endStr }
  );

  const employeeOptions = useMemo(
    () =>
      employeesData?.data?.map((e) => ({
        value: e.id,
        label: `${e.firstName} ${e.lastName}`
      })) ?? [],
    [employeesData]
  );

  const rows = data?.data ?? [];
  const totals = data?.totals;

  const columnDefs = useMemo(() => getReportsColumnDefs(), []);

  return (
    <Stack gap="md" p="md">
      {/* Filters */}
      <Paper withBorder p="md" shadow="xs">
        <Stack gap="md">
          <Title order={2}>Reports</Title>
          <Group align="flex-end" gap="md" wrap="wrap">
            <DatePickerInput
              label="From"
              value={startDate}
              onChange={(v) => setStartDate(v as Date | null)}
              style={{ minWidth: 150 }}
            />
            <DatePickerInput
              label="To"
              value={endDate}
              onChange={(v) => setEndDate(v as Date | null)}
              style={{ minWidth: 150 }}
            />
            <Select
              label="Employee"
              placeholder="All employees"
              clearable
              searchable
              data={employeeOptions}
              value={employeeId}
              onChange={setEmployeeId}
              style={{ minWidth: 240 }}
            />
          </Group>
        </Stack>
      </Paper>

      {/* Aggregate totals */}
      {totals && (
        <SimpleGrid cols={{ base: 3, sm: 5, md: 9 }} spacing="xs">
          <Paper withBorder p="sm" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Total
            </Text>
            <Text fw={700} size="lg">
              {totals.totalHours.toFixed(1)}h
            </Text>
          </Paper>
          {TYPES.map((t) => (
            <Paper key={t} withBorder p="sm" radius="md">
              <Text
                size="xs"
                c="dimmed"
                tt="uppercase"
                fw={600}
                style={{ color: TYPE_COLORS[t] }}
              >
                {capitalize(t)}
              </Text>
              <Text fw={700}>{(totals.byType[t] ?? 0).toFixed(1)}h</Text>
            </Paper>
          ))}
          {STATUSES.map((s) => (
            <Paper key={s} withBorder p="sm" radius="md">
              <Text
                size="xs"
                c="dimmed"
                tt="uppercase"
                fw={600}
                style={{ color: STATUS_COLORS[s] }}
              >
                {capitalize(s)}
              </Text>
              <Text fw={700}>{(totals.byStatus[s] ?? 0).toFixed(1)}h</Text>
            </Paper>
          ))}
        </SimpleGrid>
      )}

      {/* Table */}
      <Paper
        withBorder
        shadow="xs"
        style={{ height: "calc(100vh - 420px)", minHeight: 300 }}
      >
        {!startStr || !endStr ? (
          <Alert icon={<IconAlertCircle size={16} />} color="yellow" m="md">
            Select a date range to view the report.
          </Alert>
        ) : isLoading ? (
          <Center h="100%">
            <Loader size="lg" />
          </Center>
        ) : error ? (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error loading report"
            color="red"
            m="md"
          >
            {error instanceof Error ? error.message : "An error occurred"}
          </Alert>
        ) : rows.length === 0 ? (
          <Alert icon={<IconAlertCircle size={16} />} color="blue" m="md">
            No timelog data found for the selected range.
          </Alert>
        ) : (
          <DataGrid<EmployeeReportRow>
            rowData={rows}
            columnDefs={columnDefs}
            defaultColDef={defaultReportsColDef}
            pagination={false}
            getRowId={(p) => p.data.employeeId}
          />
        )}
      </Paper>
    </Stack>
  );
}
