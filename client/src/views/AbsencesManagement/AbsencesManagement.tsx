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
  TextInput,
  Text
} from "@mantine/core";
import { IconAlertCircle, IconCalendar, IconSearch } from "@tabler/icons-react";
import { useAbsences } from "@/api/useAbsence";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import {
  getManagementAbsenceColumnDefs,
  defaultAbsenceColDef
} from "./AbsencesManagement.columns";
import { ReviewAbsenceModal } from "./Modals/ReviewAbsenceModal";
import type { Absence, AbsenceFilters } from "@/types/Absence.model";
import { AbsenceStatus } from "@/types/Absence.model";

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: AbsenceStatus.PENDING, label: "Pending" },
  { value: AbsenceStatus.APPROVED, label: "Approved" },
  { value: AbsenceStatus.REJECTED, label: "Rejected" },
  { value: AbsenceStatus.CANCELLED, label: "Cancelled" }
];

export function AbsencesManagement() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [statusFilter, setStatusFilter] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [reviewAbsence, setReviewAbsence] = useState<Absence | null>(null);

  const filters: AbsenceFilters = useMemo(
    () => ({
      year: Number(year),
      ...(statusFilter ? { status: statusFilter as never } : {})
    }),
    [year, statusFilter]
  );

  const { data, isLoading, error } = useAbsences(filters);

  const absences = useMemo(() => {
    const all = data?.data ?? [];
    if (!employeeSearch.trim()) return all;
    const q = employeeSearch.toLowerCase();
    return all.filter((a) => (a.employeeName ?? "").toLowerCase().includes(q));
  }, [data, employeeSearch]);

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
            data={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v ?? "")}
            w={160}
            clearable
          />
          <TextInput
            label="Filter by employee"
            placeholder="Name…"
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.currentTarget.value)}
            w={200}
            leftSection={<IconSearch size="1rem" />}
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
