import { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  Select,
  Textarea,
  Group,
  Button,
  Title,
  Text,
  Alert
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { useCreateAbsence, useUpdateAbsence } from "@/api/useAbsence";
import { AbsenceType } from "@/types/Absence.model";
import type { Absence, CreateAbsenceData } from "@/types/Absence.model";

const TYPE_OPTIONS = [
  { value: AbsenceType.VACATION, label: "Vacation" },
  { value: AbsenceType.SICK_LEAVE, label: "Sick Leave" },
  { value: AbsenceType.PERSONAL, label: "Personal" },
  { value: AbsenceType.UNPAID, label: "Unpaid" },
  { value: AbsenceType.MATERNITY, label: "Maternity" },
  { value: AbsenceType.PATERNITY, label: "Paternity" },
  { value: AbsenceType.BEREAVEMENT, label: "Bereavement" },
  { value: AbsenceType.STUDY, label: "Study" },
  { value: AbsenceType.TIME_IN_LIEU, label: "Time in Lieu" }
];

interface TimeInLieuOption {
  id: string;
  hours: number;
  earnedDate: string;
  reason: string;
}

interface Props {
  opened: boolean;
  onClose: () => void;
  employeeId: string;
  editAbsence?: Absence | null;
  timeInLieus?: TimeInLieuOption[];
}

const EMPTY_FORM = {
  type: AbsenceType.VACATION as string,
  startDate: null as Date | null,
  endDate: null as Date | null,
  notes: "",
  timeInLieuId: null as string | null
};

export function CreateAbsenceModal({
  opened,
  onClose,
  employeeId,
  editAbsence,
  timeInLieus = []
}: Props) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [overlapError, setOverlapError] = useState<string | null>(null);

  const createAbsence = useCreateAbsence();
  const updateAbsence = useUpdateAbsence();

  const isEditing = !!editAbsence;

  // Populate form when editing
  useEffect(() => {
    if (editAbsence) {
      setForm({
        type: editAbsence.type,
        startDate: new Date(editAbsence.startDate),
        endDate: new Date(editAbsence.endDate),
        notes: editAbsence.notes ?? "",
        timeInLieuId: editAbsence.timeInLieuId ?? null
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setOverlapError(null);
  }, [editAbsence, opened]);

  const availableTils = timeInLieus.map((t) => ({
    value: t.id,
    label: `${t.hours}h — ${t.earnedDate} (${t.reason})`
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOverlapError(null);

    if (!form.startDate || !form.endDate) {
      notifications.show({
        title: "Validation error",
        message: "Please select a date range",
        color: "red"
      });
      return;
    }

    const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

    const payload: CreateAbsenceData = {
      employeeId,
      type: form.type as never,
      startDate: fmtDate(form.startDate),
      endDate: fmtDate(form.endDate),
      ...(form.notes ? { notes: form.notes } : {}),
      ...(form.type === AbsenceType.TIME_IN_LIEU && form.timeInLieuId
        ? { timeInLieuId: form.timeInLieuId }
        : {})
    };

    const onError = (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save absence";
      if (message.toLowerCase().includes("overlap")) {
        setOverlapError(message);
      } else {
        notifications.show({ title: "Error", message, color: "red" });
      }
    };

    if (isEditing && editAbsence) {
      updateAbsence.mutate(
        {
          id: editAbsence.id,
          data: {
            type: payload.type,
            startDate: payload.startDate,
            endDate: payload.endDate,
            notes: payload.notes,
            timeInLieuId: payload.timeInLieuId
          }
        },
        {
          onSuccess: () => {
            notifications.show({
              title: "Absence updated",
              message: "Your absence request has been updated.",
              color: "green"
            });
            handleClose();
          },
          onError
        }
      );
    } else {
      createAbsence.mutate(payload, {
        onSuccess: () => {
          notifications.show({
            title: "Absence submitted",
            message: "Your absence request has been submitted.",
            color: "green"
          });
          handleClose();
        },
        onError
      });
    }
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    setOverlapError(null);
    onClose();
  };

  const isPending = createAbsence.isPending || updateAbsence.isPending;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="md"
      title={
        <Title order={4}>
          {isEditing ? "Edit Absence Request" : "New Absence Request"}
        </Title>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {overlapError && (
            <Alert
              color="red"
              icon={<IconAlertCircle size="1rem" />}
              title="Date conflict"
            >
              {overlapError}
            </Alert>
          )}

          <Select
            label="Absence type"
            placeholder="Select type"
            data={TYPE_OPTIONS}
            value={form.type}
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                type: v ?? AbsenceType.VACATION,
                timeInLieuId: null
              }))
            }
            required
          />

          {form.type === AbsenceType.TIME_IN_LIEU && (
            <Select
              label="Time in Lieu to use"
              placeholder="Select a time in lieu record"
              data={availableTils}
              value={form.timeInLieuId}
              onChange={(v) => setForm((p) => ({ ...p, timeInLieuId: v }))}
              required
              description={
                availableTils.length === 0
                  ? "No approved time in lieu records available"
                  : undefined
              }
            />
          )}

          <DatePickerInput
            type="range"
            label="Date range"
            placeholder="Pick start and end dates"
            value={[form.startDate, form.endDate]}
            onChange={(range) => {
              const [start, end] = range as [Date | null, Date | null];
              setForm((p) => ({ ...p, startDate: start, endDate: end }));
            }}
            excludeDate={(date) => {
              const d = new Date(date as unknown as string);
              return d.getDay() === 0 || d.getDay() === 6;
            }}
            required
          />

          {form.startDate && form.endDate && (
            <Text size="xs" c="dimmed">
              Weekends are excluded from the day count.
            </Text>
          )}

          <Textarea
            label="Notes / Reason"
            placeholder="Optional reason or notes"
            value={form.notes}
            onChange={(e) =>
              setForm((p) => ({ ...p, notes: e.currentTarget.value }))
            }
            rows={3}
          />

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isEditing ? "Save changes" : "Submit request"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
