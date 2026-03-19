import { useMemo } from "react";
import {
  Modal,
  Stack,
  Group,
  Select,
  TextInput,
  Button,
  Alert
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useForm, Controller } from "react-hook-form";
import { useCreateOwnerFromUser } from "@/hooks/useOwner";
import { useUsers } from "@/hooks/useUser";
import { notifications } from "@mantine/notifications";

interface CreateFormValues {
  userId: string;
  displayName: string;
  taxId: string;
}

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function CreateOwnerModal({ opened, onClose }: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateFormValues>({
    defaultValues: { userId: "", displayName: "", taxId: "" }
  });

  const { data: usersData } = useUsers({ limit: 200 }, { enabled: opened });

  const userOptions = useMemo(
    () =>
      (usersData?.data ?? []).map((u) => ({
        value: u.id,
        label: `${u.firstName} ${u.lastName} (${u.email})`
      })),
    [usersData]
  );

  const mutation = useCreateOwnerFromUser({
    onSuccess: () => {
      notifications.show({
        title: "Owner created",
        message: "User has been assigned as owner.",
        color: "green"
      });
      reset();
      onClose();
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync({
      userId: values.userId,
      displayName: values.displayName || undefined,
      taxId: values.taxId || undefined
    });
  });

  const handleClose = () => {
    reset();
    mutation.reset();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="New Owner" size="md">
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
                label="User"
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
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
