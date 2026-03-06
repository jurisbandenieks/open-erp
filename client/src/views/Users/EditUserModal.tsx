import {
  Modal,
  Stack,
  Group,
  TextInput,
  Select,
  Button,
  Alert,
  Checkbox
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useUpdateUser } from "@/api/useUser";
import type { User } from "@/types/User.model";

interface EditFormValues {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  status: string;
  emailVerified: boolean;
}

interface Props {
  user: User | null;
  opened: boolean;
  onClose: () => void;
}

const roleOptions = [
  { value: "user", label: "User" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
  { value: "sysadmin", label: "Sysadmin" }
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" }
];

export function EditUserModal({ user, opened, onClose }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EditFormValues>();

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phoneNumber: user.phoneNumber ?? "",
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified
      });
    }
  }, [user, reset]);

  const mutation = useUpdateUser({ onSuccess: onClose });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync({ id: user!.id, payload: values });
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Edit User" size="md">
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
              {...register("firstName")}
              error={errors.firstName?.message}
            />
            <TextInput
              label="Last name"
              {...register("lastName")}
              error={errors.lastName?.message}
            />
          </Group>
          <TextInput
            label="Email"
            type="email"
            {...register("email", { required: "Email is required" })}
            error={errors.email?.message}
          />
          <TextInput label="Phone number" {...register("phoneNumber")} />
          <Group grow>
            <Select
              label="Role"
              data={roleOptions}
              value={watch("role")}
              onChange={(v) => setValue("role", v ?? "user")}
            />
            <Select
              label="Status"
              data={statusOptions}
              value={watch("status")}
              onChange={(v) => setValue("status", v ?? "active")}
            />
          </Group>
          <Checkbox
            label="Email verified"
            checked={watch("emailVerified") ?? false}
            onChange={(e) => setValue("emailVerified", e.currentTarget.checked)}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting || mutation.isPending}>
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
