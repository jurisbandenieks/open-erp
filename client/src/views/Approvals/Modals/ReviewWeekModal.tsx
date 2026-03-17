import {
  Modal,
  Stack,
  Textarea,
  Group,
  Button,
  Text,
  Badge,
  Divider,
  SimpleGrid
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm } from "react-hook-form";
import { useBulkReviewWeek } from "@/hooks/useTimelog";
import type { WeeklyApprovalSummary } from "@/types/Timelog.model";
import { STATUS_COLORS } from "@/utils/constants";

interface Props {
  opened: boolean;
  onClose: () => void;
  summary: WeeklyApprovalSummary | null;
}

export function ReviewWeekModal({ opened, onClose, summary }: Props) {
  const {
    register,
    getValues,
    reset,
    setError,
    formState: { errors }
  } = useForm({ defaultValues: { rejectionReason: "" } });

  const bulkReview = useBulkReviewWeek();

  if (!summary) return null;

  const handleReview = (action: "approved" | "rejected") => {
    const rejectionReason = getValues("rejectionReason");
    if (action === "rejected" && !rejectionReason.trim()) {
      setError("rejectionReason", { message: "Rejection reason is required" });
      return;
    }

    bulkReview.mutate(
      {
        employeeId: summary.employeeId,
        weekStart: summary.weekStart,
        weekEnd: summary.weekEnd,
        action,
        ...(action === "rejected"
          ? { rejectionReason: rejectionReason.trim() }
          : {})
      },
      {
        onSuccess: ({ updated }) => {
          notifications.show({
            title: action === "approved" ? "Week approved" : "Week rejected",
            message: `${updated} timelog${updated !== 1 ? "s" : ""} have been ${action}.`,
            color: action === "approved" ? "green" : "red"
          });
          reset();
          onClose();
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to review week";
          notifications.show({ title: "Error", message, color: "red" });
        }
      }
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isPending = bulkReview.isPending;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Review week — ${summary.employeeName}`}
      size="md"
    >
      <Stack gap="md">
        <SimpleGrid cols={2}>
          <Text size="sm" c="dimmed">
            Week
          </Text>
          <Text size="sm">
            {summary.weekStart} – {summary.weekEnd}
          </Text>

          <Text size="sm" c="dimmed">
            Total hours
          </Text>
          <Text size="sm" fw={500}>
            {summary.totalHours.toFixed(1)} h
          </Text>

          <Text size="sm" c="dimmed">
            Status
          </Text>
          <Badge color={STATUS_COLORS[summary.weekStatus]} size="sm">
            {summary.weekStatus}
          </Badge>

          <Text size="sm" c="dimmed">
            Timelogs
          </Text>
          <Group gap={4}>
            {summary.draftCount > 0 && (
              <Badge color="gray" size="xs" variant="light">
                {summary.draftCount} draft
              </Badge>
            )}
            {summary.submittedCount > 0 && (
              <Badge color="blue" size="xs" variant="light">
                {summary.submittedCount} submitted
              </Badge>
            )}
            {summary.approvedCount > 0 && (
              <Badge color="green" size="xs" variant="light">
                {summary.approvedCount} approved
              </Badge>
            )}
            {summary.rejectedCount > 0 && (
              <Badge color="red" size="xs" variant="light">
                {summary.rejectedCount} rejected
              </Badge>
            )}
          </Group>
        </SimpleGrid>

        <Divider />

        <Textarea
          label="Rejection reason"
          description="Required only when rejecting"
          placeholder="Explain why this week is being rejected…"
          error={errors.rejectionReason?.message}
          minRows={3}
          autosize
          {...register("rejectionReason")}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            color="red"
            variant="light"
            onClick={() => handleReview("rejected")}
            loading={isPending}
          >
            Reject week
          </Button>
          <Button
            color="green"
            onClick={() => handleReview("approved")}
            loading={isPending}
          >
            Approve week
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
