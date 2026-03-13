import { useState, useMemo } from "react";
import {
  Title,
  Button,
  Group,
  Stack,
  Alert,
  Loader,
  Center,
  Paper,
  Select,
  Text,
  SimpleGrid
} from "@mantine/core";
import { IconPlus, IconAlertCircle, IconCalendar } from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import {
  useAbsences,
  useDeleteAbsence,
  useVacationBalance
} from "@/api/useAbsence";
import { useMyEmployee } from "@/api/useEmployee";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import { getAbsenceColumnDefs, defaultAbsenceColDef } from "./Absences.columns";
import { CreateAbsenceModal } from "./Modals/CreateAbsenceModal";
import { ReviewAbsenceModal } from "./Modals/ReviewAbsenceModal";
import type { Absence, AbsenceFilters } from "@/types/Absence.model";
import { AbsenceStatus } from "@/types/Absence.model";
import { notifications } from "@mantine/notifications";

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

export function Absences() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [statusFilter, setStatusFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editAbsence, setEditAbsence] = useState<Absence | null>(null);
  const [reviewAbsence, setReviewAbsence] = useState<Absence | null>(null);

  const { data: myEmployee } = useMyEmployee();

  const filters: AbsenceFilters = useMemo(
    () => ({
      year: Number(year),
      ...(statusFilter ? { status: statusFilter as never } : {})
    }),
    [year, statusFilter]
  );

  const { data, isLoading, error } = useAbsences(filters);
  const deleteAbsence = useDeleteAbsence();

  const { data: vacationBalance } = useVacationBalance(
    myEmployee?.id ?? "",
    Number(year),
    { enabled: !!myEmployee?.id }
  );

  const handleCancel = (absence: Absence) => {
    if (!window.confirm("Cancel this absence request?")) return;
    deleteAbsence.mutate(absence.id, {
      onSuccess: () =>
        notifications.show({
          title: "Cancelled",
          message: "Absence request cancelled.",
          color: "orange"
        }),
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to cancel absence";
        notifications.show({ title: "Error", message, color: "red" });
      }
    });
  };

  const columnDefs = useMemo(
    () =>
      getAbsenceColumnDefs({
        isAdmin,
        onEdit: (a) => setEditAbsence(a),
        onCancel: handleCancel,
        onReview: (a) => setReviewAbsence(a)
      }),
    [isAdmin]
  );

  const absences = data?.data ?? [];

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Absences</Title>
          {myEmployee && (
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={() => setCreateOpen(true)}
            >
              Request Absence
            </Button>
          )}
        </Group>

        {/* Vacation balance banner */}
        {vacationBalance && (
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            <Paper withBorder p="sm" radius="md">
              <Text size="xs" c="dimmed">
                Allowance
              </Text>
              <Text fw={700} size="lg">
                {vacationBalance.totalAllowed} days
              </Text>
            </Paper>
            <Paper withBorder p="sm" radius="md">
              <Text size="xs" c="dimmed">
                Used
              </Text>
              <Text fw={700} size="lg" c="blue">
                {vacationBalance.usedDays} days
              </Text>
            </Paper>
            <Paper withBorder p="sm" radius="md">
              <Text size="xs" c="dimmed">
                Pending
              </Text>
              <Text fw={700} size="lg" c="yellow">
                {vacationBalance.pendingDays} days
              </Text>
            </Paper>
            <Paper withBorder p="sm" radius="md">
              <Text size="xs" c="dimmed">
                Remaining
              </Text>
              <Text
                fw={700}
                size="lg"
                c={vacationBalance.remainingDays < 0 ? "red" : "green"}
              >
                {vacationBalance.remainingDays} days
              </Text>
            </Paper>
          </SimpleGrid>
        )}

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

      {/* Create / Edit Modal */}
      {myEmployee && (
        <CreateAbsenceModal
          opened={createOpen || !!editAbsence}
          onClose={() => {
            setCreateOpen(false);
            setEditAbsence(null);
          }}
          employeeId={myEmployee.id}
          editAbsence={editAbsence}
        />
      )}

      {/* Review Modal (admin) */}
      <ReviewAbsenceModal
        opened={!!reviewAbsence}
        onClose={() => setReviewAbsence(null)}
        absence={reviewAbsence}
      />
    </>
  );
}
