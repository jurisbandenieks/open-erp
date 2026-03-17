import { Modal, Stack, Text, Group, Button, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useDeleteUser } from "@/hooks/useUser";
import type { User } from "@/types/User.model";

interface Props {
  user: User | null;
  opened: boolean;
  onClose: () => void;
}

export function DeleteUserModal({ user, opened, onClose }: Props) {
  const mutation = useDeleteUser({ onSuccess: onClose });

  return (
    <Modal opened={opened} onClose={onClose} title="Delete User" size="sm">
      <Stack gap="md">
        {mutation.error && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            color="red"
            variant="light"
          >
            {(mutation.error as Error).message}
          </Alert>
        )}
        <Text size="sm">
          Are you sure you want to delete{" "}
          <strong>
            {user?.firstName} {user?.lastName}
          </strong>{" "}
          (<em>{user?.email}</em>)? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={mutation.isPending}
            onClick={() => mutation.mutate(user?.id ?? "")}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
