import { useEffect } from "react";
import {
  Modal,
  Stack,
  Select,
  Textarea,
  Group,
  Button,
  NumberInput
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useForm, Controller } from "react-hook-form";
import { useCreateTimelog, useUpdateTimelog } from "@/hooks/useTimelog";
import type { Timelog, TimelogType } from "@/types/Timelog.model";
import { TIMELOG_TYPE_OPTIONS } from "@/utils/constants";
import dayjs from "dayjs";

interface Props {
  opened: boolean;
  onClose: () => void;
  employeeId: string;
  defaultDate?: string; // YYYY-MM-DD
  editTimelog?: Timelog | null;
}

interface FormValues {
  date: Date | null;
  totalHours: number | null;
  type: string;
  description: string;
  notes: string;
}

export function CreateTimelogModal({
  opened,
  onClose,
  employeeId,
  defaultDate,
  editTimelog
}: Props) {
  const { register, handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: {
      date: null,
      totalHours: null,
      type: "standard",
      description: "",
      notes: ""
    }
  });

  useEffect(() => {
    if (opened) {
      if (editTimelog) {
        reset({
          date: dayjs(editTimelog.date).toDate(),
          totalHours: editTimelog.totalHours,
          type: editTimelog.type,
          description: editTimelog.description ?? "",
          notes: editTimelog.notes ?? ""
        });
      } else {
        reset({
          date: defaultDate ? dayjs(defaultDate).toDate() : null,
          totalHours: null,
          type: "standard",
          description: "",
          notes: ""
        });
      }
    }
  }, [opened, defaultDate, editTimelog, reset]);

  const createTimelog = useCreateTimelog();
  const updateTimelog = useUpdateTimelog();
  const isPending = createTimelog.isPending || updateTimelog.isPending;

  const onSubmit = (data: FormValues) => {
    if (!data.date || !data.totalHours) {
      notifications.show({
        title: "Validation error",
        message: "Date and hours are required",
        color: "red"
      });
      return;
    }

    const callbacks = {
      onSuccess: () => {
        notifications.show({
          title: "Saved",
          message: editTimelog
            ? "Timelog entry updated."
            : "Timelog entry created.",
          color: "green"
        });
        onClose();
      },
      onError: () => {
        notifications.show({
          title: "Error",
          message: editTimelog
            ? "Failed to update timelog entry."
            : "Failed to create timelog entry.",
          color: "red"
        });
      }
    };

    if (editTimelog) {
      updateTimelog.mutate(
        {
          id: editTimelog.id,
          data: {
            date: dayjs(data.date).format("YYYY-MM-DD"),
            totalHours: data.totalHours,
            type: data.type as TimelogType,
            description: data.description || undefined,
            notes: data.notes || undefined
          }
        },
        callbacks
      );
    } else {
      createTimelog.mutate(
        {
          employeeId,
          date: dayjs(data.date).format("YYYY-MM-DD"),
          totalHours: data.totalHours,
          type: data.type as TimelogType,
          description: data.description || undefined,
          notes: data.notes || undefined
        },
        callbacks
      );
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editTimelog ? "Edit Timelog Entry" : "Add Timelog Entry"}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Controller
            name="date"
            control={control}
            rules={{ required: "Date is required" }}
            render={({ field, fieldState }) => (
              <DatePickerInput
                label="Date"
                required
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="totalHours"
            control={control}
            rules={{ required: "Hours are required" }}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Hours"
                required
                min={0}
                max={24}
                step={0.5}
                decimalScale={1}
                value={field.value ?? ""}
                onChange={(v) =>
                  field.onChange(typeof v === "number" ? v : null)
                }
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Type"
                data={TIMELOG_TYPE_OPTIONS}
                value={field.value}
                onChange={(v) => field.onChange(v ?? "standard")}
              />
            )}
          />
          <Textarea label="Description" {...register("description")} />
          <Textarea label="Notes" {...register("notes")} />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
