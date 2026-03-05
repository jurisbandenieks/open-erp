import {
  Modal,
  Stack,
  Group,
  TextInput,
  Select,
  Button,
  Alert
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerApi } from "@/api/ownerApi";
import type { Owner, UpdateOwnerPayload } from "@/types/Owner.model";

interface EditFormValues {
  firstName: string;
  lastName: string;
  displayName: string;
  taxId: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" }
];

interface Props {
  owner: Owner | null;
  onClose: () => void;
}

export function EditOwnerModal({ owner, onClose }: Props) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EditFormValues>({
    values: owner
      ? {
          firstName: owner.user.firstName,
          lastName: owner.user.lastName,
          displayName: owner.displayName ?? "",
          taxId: owner.taxId ?? "",
          status: owner.status
        }
      : undefined
  });

  const statusValue = watch("status");

  const mutation = useMutation({
    mutationFn: (data: UpdateOwnerPayload) => ownerApi.update(owner!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      onClose();
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  return (
    <Modal opened={!!owner} onClose={onClose} title="Edit Owner" size="md">
      <form onSubmit={onSubmit}>
        <Stack gap="sm">
          {mutation.error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="red"
              variant="light"
            >
              {(mutation.error as Error).message}
            </Alert>
          )}
          <Group grow>
            <TextInput
              label="First name"
              {...register("firstName", { required: "Required" })}
              error={errors.firstName?.message}
            />
            <TextInput
              label="Last name"
              {...register("lastName", { required: "Required" })}
              error={errors.lastName?.message}
            />
          </Group>
          <TextInput label="Display name" {...register("displayName")} />
          <TextInput label="Tax ID" {...register("taxId")} />
          <Select
            label="Status"
            data={STATUS_OPTIONS}
            value={statusValue}
            onChange={(val) => setValue("status", val ?? "active")}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
