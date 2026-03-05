import {
  Modal,
  Stack,
  Group,
  TextInput,
  PasswordInput,
  Button,
  Alert
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useCreateOwner } from "@/api/useOwner";

interface CreateFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateFormValues>();

  const mutation = useCreateOwner({
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
          <Group grow>
            <TextInput
              label="First name"
              {...register("firstName", { required: "First name is required" })}
              error={errors.firstName?.message}
            />
            <TextInput
              label="Last name"
              {...register("lastName", { required: "Last name is required" })}
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
