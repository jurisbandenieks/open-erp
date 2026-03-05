import { Modal, Stack, Group, Text, Button, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerApi } from "@/api/ownerApi";
import type { Owner } from "@/types/Owner.model";

interface Props {
  owner: Owner | null;
  onClose: () => void;
}

export function DeleteOwnerModal({ owner, onClose }: Props) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => ownerApi.remove(owner!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      onClose();
    }
  });

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
            onClick={() => mutation.mutate()}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
