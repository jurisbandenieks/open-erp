import { useState, useMemo } from "react";
import {
  Title,
  Group,
  Stack,
  Alert,
  Loader,
  Center,
  Paper,
  Text,
  ActionIcon,
  Tooltip,
  Button
} from "@mantine/core";
import {
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react";
import { useWeeklyApprovals } from "@/hooks/useTimelog";
import type { WeeklyApprovalSummary } from "@/types/Timelog.model";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import {
  getApprovalsColumnDefs,
  defaultApprovalsColDef
} from "./Approvals.columns";
import { ReviewWeekModal } from "./Modals/ReviewWeekModal";
import { getMonday, toDateStr, formatWeekLabel } from "@/utils";

// ─── Component ────────────────────────────────────────────────────────────────

export function Approvals() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [reviewSummary, setReviewSummary] =
    useState<WeeklyApprovalSummary | null>(null);

  const { weekStart, weekEnd } = useMemo(() => {
    const monday = getMonday(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    return { weekStart: toDateStr(monday), weekEnd: toDateStr(sunday) };
  }, [weekOffset]);

  const { data, isLoading, error } = useWeeklyApprovals(weekStart, weekEnd);
  const summaries = data?.data ?? [];

  const columnDefs = useMemo(
    () => getApprovalsColumnDefs({ onReview: (s) => setReviewSummary(s) }),
    []
  );

  const isCurrentWeek = weekOffset === 0;

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Approvals</Title>
          <Text size="sm" c="dimmed">
            {summaries.length} employee{summaries.length !== 1 ? "s" : ""}
          </Text>
        </Group>

        {/* Week navigator */}
        <Paper withBorder p="sm" radius="sm">
          <Group justify="space-between" align="center">
            <Tooltip label="Previous week">
              <ActionIcon
                variant="subtle"
                onClick={() => setWeekOffset((o) => o - 1)}
              >
                <IconChevronLeft size="1rem" />
              </ActionIcon>
            </Tooltip>

            <Stack gap={0} align="center">
              <Text fw={500}>{formatWeekLabel(weekStart)}</Text>
              <Text size="xs" c="dimmed">
                {weekStart} – {weekEnd}
              </Text>
            </Stack>

            <Group gap="xs">
              <Tooltip label="Next week">
                <ActionIcon
                  variant="subtle"
                  onClick={() => setWeekOffset((o) => o + 1)}
                  disabled={isCurrentWeek}
                >
                  <IconChevronRight size="1rem" />
                </ActionIcon>
              </Tooltip>
              {!isCurrentWeek && (
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setWeekOffset(0)}
                >
                  Today
                </Button>
              )}
            </Group>
          </Group>
        </Paper>

        {error && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            color="red"
            title="Failed to load approvals"
          >
            {(error as { message?: string })?.message ?? "Unknown error"}
          </Alert>
        )}

        {isLoading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : (
          <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
            <DataGrid
              rowData={summaries}
              columnDefs={columnDefs}
              defaultColDef={defaultApprovalsColDef}
              getRowId={({ data }) => data.employeeId}
              pagination={false}
              style={{ height: "500px", width: "100%" }}
            />
          </Paper>
        )}
      </Stack>

      <ReviewWeekModal
        opened={!!reviewSummary}
        onClose={() => setReviewSummary(null)}
        summary={reviewSummary}
      />
    </>
  );
}
