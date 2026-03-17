import { useState, useMemo } from "react";
import {
  Title,
  Group,
  Stack,
  Alert,
  Loader,
  Center,
  Paper,
  Select,
  Text
} from "@mantine/core";
import { IconAlertCircle, IconCalendar } from "@tabler/icons-react";
import { useAbsences } from "@/hooks/useAbsence";
import { useEmployees } from "@/hooks/useEmployee";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import {
  getManagementAbsenceColumnDefs,
  defaultAbsenceColDef
} from "./AbsencesManagement.columns";
import { ReviewAbsenceModal } from "./Modals/ReviewAbsenceModal";
import type { Absence, AbsenceFilters } from "@/types/Absence.model";
import { ABSENCE_STATUS_OPTIONS } from "@/utils/constants";

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

export function AbsencesManagement() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [statusFilter, setStatusFilter] = useState("");
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [reviewAbsence, setReviewAbsence] = useState<Absence | null>(null);

  const { data: employeesData } = useEmployees({ limit: 200 });
  const employeeOptions = useMemo(() => {
    const opts = (employeesData?.data ?? []).map((e) => ({
      value: e.id,
      label: `${e.firstName} ${e.lastName}`.trim() || e.employeeNumber
    }));
    return [{ value: "", label: "All employees" }, ...opts];
  }, [employeesData]);

  const filters: AbsenceFilters = useMemo(
    () => ({
      year: Number(year),
      ...(statusFilter ? { status: statusFilter as never } : {}),
      ...(employeeId ? { employeeId } : {})
    }),
    [year, statusFilter, employeeId]
  );

  const { data, isLoading, error } = useAbsences(filters);

  const absences = data?.data ?? [];

  const columnDefs = useMemo(
    () =>
      getManagementAbsenceColumnDefs({
        onReview: (a: Absence) => setReviewAbsence(a)
      }),
    []
  );

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Absence Tracker</Title>
          <Text size="sm" c="dimmed">
            {data?.total ?? 0} records
          </Text>
        </Group>

        <Group gap="sm" align="flex-end">
          <Select
            label="Year"
            data={YEAR_OPTIONS}
            value={year}
            onChange={(v) => setYear(v ?? String(new Date().getFullYear()))}
            w={120}
            leftSection={<IconCalendar size="1rem" />}
          />
          <Select
            label="Status"
            data={ABSENCE_STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v ?? "")}
            w={160}
            clearable
          />
          <Select
            label="Employee"
            data={employeeOptions}
            value={employeeId ?? ""}
            onChange={(v) => setEmployeeId(v || null)}
            w={220}
            searchable
            clearable
          />
        </Group>

        {error && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            color="red"
            title="Error"
          >
            {(error as { message?: string }).message ??
              "Failed to load absences"}
          </Alert>
        )}

        {isLoading ? (
          <Center h={200}>
            <Loader />
          </Center>
        ) : (
          <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
            <DataGrid
              rowData={absences}
              columnDefs={columnDefs}
              defaultColDef={defaultAbsenceColDef}
            />
          </Paper>
        )}
      </Stack>

      <ReviewAbsenceModal
        opened={!!reviewAbsence}
        onClose={() => setReviewAbsence(null)}
        absence={reviewAbsence}
      />
    </>
  );
}
