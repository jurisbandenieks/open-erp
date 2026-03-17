import { useState, useEffect } from "react";
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
import { useCreateTimelog, useUpdateTimelog } from "@/hooks/useTimelog";
import type { Timelog } from "@/types/Timelog.model";
import { TYPE_OPTIONS } from "../constants";
import type { TimelogType } from "@/types/Timelog.model";
import dayjs from "dayjs";

interface Props {
  opened: boolean;
  onClose: () => void;
  employeeId: string;
  defaultDate?: string; // YYYY-MM-DD
  editTimelog?: Timelog | null;
}

const EMPTY_FORM = {
  date: null as Date | null,
  totalHours: null as number | null,
  type: "standard" as string,
  description: "",
  notes: ""
};

export function CreateTimelogModal({
  opened,
  onClose,
  employeeId,
  defaultDate,
  editTimelog
}: Props) {
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (opened) {
      if (editTimelog) {
        setForm({
          date: dayjs(editTimelog.date).toDate(),
          totalHours: editTimelog.totalHours,
          type: editTimelog.type,
          description: editTimelog.description ?? "",
          notes: editTimelog.notes ?? ""
        });
      } else {
        setForm({
          ...EMPTY_FORM,
          date: defaultDate ? dayjs(defaultDate).toDate() : null
        });
      }
    }
  }, [opened, defaultDate, editTimelog]);

  const createTimelog = useCreateTimelog();
  const updateTimelog = useUpdateTimelog();

  const isPending = createTimelog.isPending || updateTimelog.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.date || !form.totalHours) {
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
            date: dayjs(form.date).format("YYYY-MM-DD"),
            totalHours: form.totalHours,
            type: form.type as TimelogType,
            description: form.description || undefined,
            notes: form.notes || undefined
          }
        },
        callbacks
      );
    } else {
      createTimelog.mutate(
        {
          employeeId,
          date: dayjs(form.date).format("YYYY-MM-DD"),
          totalHours: form.totalHours,
          type: form.type as TimelogType,
          ...(form.description ? { description: form.description } : {}),
          ...(form.notes ? { notes: form.notes } : {})
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
      <form onSubmit={handleSubmit}>
        <Stack>
          <DatePickerInput
            label="Date"
            required
            value={form.date}
            onChange={(val) =>
              setForm((f) => ({ ...f, date: val as Date | null }))
            }
          />
          <NumberInput
            label="Hours"
            required
            min={0}
            max={24}
            step={0.5}
            decimalScale={1}
            value={form.totalHours ?? ""}
            onChange={(val) =>
              setForm((f) => ({
                ...f,
                totalHours: typeof val === "number" ? val : null
              }))
            }
          />
          <Select
            label="Type"
            data={TYPE_OPTIONS}
            value={form.type}
            onChange={(val) =>
              setForm((f) => ({ ...f, type: val ?? "standard" }))
            }
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.currentTarget.value }))
            }
          />
          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.currentTarget.value }))
            }
          />
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
