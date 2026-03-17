import { useState } from "react";
import {
  Modal,
  Stack,
  Textarea,
  Group,
  Button,
  Text,
  Badge,
  Divider
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useReviewAbsence } from "@/hooks/useAbsence";
import { STATUS_COLORS, TYPE_LABELS } from "@/views/Absences/Absences.columns";
import { DetailRow } from "@/components/DetailRow/DetailRow";
import type { Absence } from "@/types/Absence.model";

interface Props {
  opened: boolean;
  onClose: () => void;
  absence: Absence | null;
}

export function ReviewAbsenceModal({ opened, onClose, absence }: Props) {
  const [rejectionReason, setRejectionReason] = useState("");
  const reviewAbsence = useReviewAbsence();

  if (!absence) return null;

  const handleReview = (status: "approved" | "rejected") => {
    if (status === "rejected" && !rejectionReason.trim()) {
      notifications.show({
        title: "Validation error",
        message: "Please provide a rejection reason",
        color: "red"
      });
      return;
    }

    reviewAbsence.mutate(
      {
        id: absence.id,
        data: {
          status,
          ...(status === "rejected"
            ? { rejectionReason: rejectionReason.trim() }
            : {})
        }
      },
      {
        onSuccess: () => {
          notifications.show({
            title:
              status === "approved" ? "Absence approved" : "Absence rejected",
            message: `The absence has been ${status}.`,
            color: status === "approved" ? "green" : "red"
          });
          setRejectionReason("");
          onClose();
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to review absence";
          notifications.show({ title: "Error", message, color: "red" });
        }
      }
    );
  };

  const handleClose = () => {
    setRejectionReason("");
    onClose();
  };

  const isPending = reviewAbsence.isPending;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="md"
      title="Review Absence"
    >
      <Stack gap="md">
        <Stack gap="xs">
          <DetailRow label="Employee">
            <Text>{absence.employeeName ?? absence.employeeId}</Text>
          </DetailRow>
          <DetailRow label="Type">
            <Text>{TYPE_LABELS[absence.type] ?? absence.type}</Text>
          </DetailRow>
          <DetailRow label="Date range">
            <Text>
              {absence.startDate} – {absence.endDate}
            </Text>
          </DetailRow>
          <DetailRow label="Working days">
            <Text>{absence.totalDays}</Text>
          </DetailRow>
          <DetailRow label="Status">
            <Badge
              color={STATUS_COLORS[absence.status] ?? "gray"}
              variant="light"
            >
              {absence.status.charAt(0).toUpperCase() + absence.status.slice(1)}
            </Badge>
          </DetailRow>
          {absence.notes && (
            <DetailRow label="Notes" align="flex-start">
              <Text style={{ maxWidth: 260 }}>{absence.notes}</Text>
            </DetailRow>
          )}
        </Stack>

        <Divider />

        <Textarea
          label="Rejection reason"
          placeholder="Required when rejecting"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.currentTarget.value)}
          rows={3}
          description="Leave blank if approving"
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            color="red"
            variant="light"
            loading={isPending}
            onClick={() => handleReview("rejected")}
          >
            Reject
          </Button>
          <Button
            color="green"
            loading={isPending}
            onClick={() => handleReview("approved")}
          >
            Approve
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
