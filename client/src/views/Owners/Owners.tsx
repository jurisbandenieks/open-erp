import { useState } from "react";
import {
  Title,
  Button,
  Group,
  Stack,
  Table,
  Badge,
  ActionIcon,
  Text,
  Alert,
  Loader,
  Center,
  Paper,
  Tooltip
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle
} from "@tabler/icons-react";
import { useOwners } from "@/api/useOwner";
import type { Owner } from "@/types/Owner.model";
import { CreateOwnerModal } from "./CreateOwnerModal";
import { EditOwnerModal } from "./EditOwnerModal";
import { DeleteOwnerModal } from "./DeleteOwnerModal";

// ─── Status badge ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "active" ? "green" : status === "suspended" ? "red" : "gray";
  return (
    <Badge color={color} variant="light" size="sm">
      {status}
    </Badge>
  );
}

// ─── Main view ───────────────────────────────────────────────────────────────

export function Owners() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOwner, setEditOwner] = useState<Owner | null>(null);
  const [deleteOwner, setDeleteOwner] = useState<Owner | null>(null);

  const {
    data: owners,
    isLoading,
    error
  } = useOwners();

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Owners</Title>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={() => setCreateOpen(true)}
          >
            New Owner
          </Button>
        </Group>

        <Paper withBorder radius="md" p={0}>
          {isLoading && (
            <Center p="xl">
              <Loader size="md" />
            </Center>
          )}

          {error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="red"
              variant="light"
              m="md"
            >
              Failed to load owners
            </Alert>
          )}

          {!isLoading && !error && (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Display Name</Table.Th>
                  <Table.Th>Tax ID</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {owners?.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text ta="center" c="dimmed" py="md" size="sm">
                        No owners yet
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {owners?.map((owner) => (
                  <Table.Tr key={owner.id}>
                    <Table.Td>
                      {owner.user.firstName} {owner.user.lastName}
                    </Table.Td>
                    <Table.Td>{owner.user.email}</Table.Td>
                    <Table.Td>{owner.displayName || "—"}</Table.Td>
                    <Table.Td>{owner.taxId || "—"}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={owner.status} />
                    </Table.Td>
                    <Table.Td>
                      {new Date(owner.createdAt).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <Tooltip label="Edit">
                          <ActionIcon
                            variant="subtle"
                            onClick={() => setEditOwner(owner)}
                          >
                            <IconEdit size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => setDeleteOwner(owner)}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>

      <CreateOwnerModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EditOwnerModal owner={editOwner} onClose={() => setEditOwner(null)} />
      <DeleteOwnerModal
        owner={deleteOwner}
        onClose={() => setDeleteOwner(null)}
      />
    </>
  );
}
