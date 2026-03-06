import {
  Modal,
  Stack,
  Group,
  TextInput,
  PasswordInput,
  Select,
  Button,
  Alert
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useCreateUser } from "@/api/useUser";

interface CreateFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

interface Props {
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

export function CreateUserModal({ opened, onClose }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateFormValues>({
    defaultValues: { role: "user", status: "active" }
  });

  const mutation = useCreateUser({
    onSuccess: () => {
      reset();
      onClose();
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  const handleClose = () => {
    reset();
    mutation.reset();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="New User" size="md">
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
          <PasswordInput
            label="Password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Minimum 8 characters" }
            })}
            error={errors.password?.message}
          />
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
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting || mutation.isPending}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
