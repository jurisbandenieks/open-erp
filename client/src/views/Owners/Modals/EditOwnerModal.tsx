import { useMemo } from "react";
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
import { notifications } from "@mantine/notifications";
import { useForm, Controller } from "react-hook-form";
import { useUpdateOwner } from "@/hooks/useOwner";
import { useUsers } from "@/hooks/useUser";
import type { Owner } from "@/types/Owner.model";
import { COMPANY_STATUS_OPTIONS } from "@/utils/constants";

interface EditFormValues {
  userId: string;
  displayName: string;
  taxId: string;
  status: string;
}

interface Props {
  owner: Owner | null;
  onClose: () => void;
}

export function EditOwnerModal({ owner, onClose }: Props) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EditFormValues>({
    values: owner
      ? {
          userId: owner.userId,
          displayName: owner.displayName ?? "",
          taxId: owner.taxId ?? "",
          status: owner.status
        }
      : undefined
  });

  const { data: usersData } = useUsers({ limit: 200 }, { enabled: !!owner });

  const userOptions = useMemo(
    () =>
      (usersData?.data ?? []).map((u) => ({
        value: u.id,
        label: `${u.firstName} ${u.lastName} (${u.email})`
      })),
    [usersData]
  );

  const statusValue = watch("status");
  const mutation = useUpdateOwner({
    onSuccess: () => {
      notifications.show({
        title: "Owner updated",
        message: "Owner has been saved.",
        color: "green"
      });
      onClose();
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync({
      id: owner!.id,
      payload: {
        userId: values.userId !== owner?.userId ? values.userId : undefined,
        displayName: values.displayName || undefined,
        taxId: values.taxId || undefined,
        status: values.status
      }
    });
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
          <Controller
            name="userId"
            control={control}
            rules={{ required: "Please select a user" }}
            render={({ field }) => (
              <Select
                label="Linked user"
                placeholder="Search and select a user"
                required
                searchable
                data={userOptions}
                value={field.value}
                onChange={(v) => field.onChange(v ?? "")}
                error={errors.userId?.message}
              />
            )}
          />
          <TextInput label="Display name" {...register("displayName")} />
          <TextInput label="Tax ID" {...register("taxId")} />
          <Select
            label="Status"
            data={COMPANY_STATUS_OPTIONS}
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
