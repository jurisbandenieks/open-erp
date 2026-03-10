import { Modal, Stack, Group, Text, Button, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useDeleteOwner } from "@/api/useOwner";
import type { Owner } from "@/types/Owner.model";

interface Props {
  owner: Owner | null;
  onClose: () => void;
}

export function DeleteOwnerModal({ owner, onClose }: Props) {
  const mutation = useDeleteOwner({ onSuccess: onClose });

  const displayName =
    owner?.displayName || `${owner?.user.firstName} ${owner?.user.lastName}`;

  return (
    <Modal opened={!!owner} onClose={onClose} title="Delete Owner" size="sm">
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
          Are you sure you want to delete <strong>{displayName}</strong>? This
          will also delete their user account and cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={mutation.isPending}
            onClick={() => mutation.mutate(owner?.id ?? "")}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
