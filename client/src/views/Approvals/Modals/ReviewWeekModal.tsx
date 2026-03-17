import { useState } from "react";
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
import { useBulkReviewWeek } from "@/api/useTimelog";
import type { WeeklyApprovalSummary } from "@/types/Timelog.model";

interface Props {
  opened: boolean;
  onClose: () => void;
  summary: WeeklyApprovalSummary | null;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "gray",
  submitted: "blue",
  approved: "green",
  rejected: "red"
};

export function ReviewWeekModal({ opened, onClose, summary }: Props) {
  const [rejectionReason, setRejectionReason] = useState("");
  const bulkReview = useBulkReviewWeek();

  if (!summary) return null;

  const handleReview = (action: "approved" | "rejected") => {
    if (action === "rejected" && !rejectionReason.trim()) {
      notifications.show({
        title: "Validation error",
        message: "Please provide a rejection reason",
        color: "red"
      });
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
          setRejectionReason("");
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
    setRejectionReason("");
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
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.currentTarget.value)}
          minRows={3}
          autosize
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
