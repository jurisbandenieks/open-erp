import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { useCreateAbsence, useUpdateAbsence } from "@/hooks/useAbsence";
import { AbsenceType } from "@/types/Absence.model";
import type { Absence, CreateAbsenceData } from "@/types/Absence.model";
import { ABSENCE_TYPE_OPTIONS } from "@/utils/constants";

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

interface FormValues {
  type: string;
  dateRange: [Date | null, Date | null];
  notes: string;
  timeInLieuId: string | null;
}

const DEFAULT_VALUES: FormValues = {
  type: AbsenceType.VACATION,
  dateRange: [null, null],
  notes: "",
  timeInLieuId: null
};

export function CreateAbsenceModal({
  opened,
  onClose,
  employeeId,
  editAbsence,
  timeInLieus = []
}: Props) {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors }
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  const selectedType = watch("type");
  const isEditing = !!editAbsence;

  const createAbsence = useCreateAbsence();
  const updateAbsence = useUpdateAbsence();

  useEffect(() => {
    if (editAbsence) {
      reset({
        type: editAbsence.type,
        dateRange: [
          new Date(editAbsence.startDate),
          new Date(editAbsence.endDate)
        ],
        notes: editAbsence.notes ?? "",
        timeInLieuId: editAbsence.timeInLieuId ?? null
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [editAbsence, opened, reset]);

  const availableTils = timeInLieus.map((t) => ({
    value: t.id,
    label: `${t.hours}h — ${t.earnedDate} (${t.reason})`
  }));

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  const onSubmit = (values: FormValues) => {
    const [startDate, endDate] = values.dateRange;

    if (!startDate || !endDate) {
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
      type: values.type as never,
      startDate: fmtDate(startDate),
      endDate: fmtDate(endDate),
      ...(values.notes ? { notes: values.notes } : {}),
      ...(values.type === AbsenceType.TIME_IN_LIEU && values.timeInLieuId
        ? { timeInLieuId: values.timeInLieuId }
        : {})
    };

    const onError = (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save absence";
      if (message.toLowerCase().includes("overlap")) {
        setError("dateRange", { message });
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          {errors.dateRange && (
            <Alert
              color="red"
              icon={<IconAlertCircle size="1rem" />}
              title="Date conflict"
            >
              {errors.dateRange.message}
            </Alert>
          )}

          <Controller
            name="type"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                label="Absence type"
                placeholder="Select type"
                data={ABSENCE_TYPE_OPTIONS}
                value={field.value}
                onChange={(v) => field.onChange(v ?? AbsenceType.VACATION)}
                required
              />
            )}
          />

          {selectedType === AbsenceType.TIME_IN_LIEU && (
            <Controller
              name="timeInLieuId"
              control={control}
              rules={{ required: selectedType === AbsenceType.TIME_IN_LIEU }}
              render={({ field }) => (
                <Select
                  label="Time in Lieu to use"
                  placeholder="Select a time in lieu record"
                  data={availableTils}
                  value={field.value}
                  onChange={field.onChange}
                  required
                  description={
                    availableTils.length === 0
                      ? "No approved time in lieu records available"
                      : undefined
                  }
                />
              )}
            />
          )}

          <Controller
            name="dateRange"
            control={control}
            rules={{
              validate: ([s, e]) => (!!s && !!e) || "Please select a date range"
            }}
            render={({ field, fieldState }) => (
              <>
                <DatePickerInput
                  type="range"
                  label="Date range"
                  placeholder="Pick start and end dates"
                  value={field.value}
                  onChange={(range) =>
                    field.onChange(range as [Date | null, Date | null])
                  }
                  excludeDate={(date) => {
                    const d = new Date(date as unknown as string);
                    return d.getDay() === 0 || d.getDay() === 6;
                  }}
                  required
                  error={fieldState.error?.message}
                />
                {field.value[0] && field.value[1] && (
                  <Text size="xs" c="dimmed">
                    Weekends are excluded from the day count.
                  </Text>
                )}
              </>
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Notes / Reason"
                placeholder="Optional reason or notes"
                value={field.value}
                onChange={field.onChange}
                rows={3}
              />
            )}
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
