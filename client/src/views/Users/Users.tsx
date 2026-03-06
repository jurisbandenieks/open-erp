import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
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
  Tooltip,
  TextInput
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconSearch
} from "@tabler/icons-react";
import { useUsers } from "@/api/useUser";
import type { User } from "@/types/User.model";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";
import { DeleteUserModal } from "./DeleteUserModal";

function RoleBadge({ role }: { role: string }) {
  const colorMap: Record<string, string> = {
    sysadmin: "violet",
    admin: "blue",
    manager: "teal",
    user: "gray",
    viewer: "gray"
  };
  return (
    <Badge
      color={colorMap[role] ?? "gray"}
      variant="light"
      size="sm"
      tt="capitalize"
    >
      {role}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "green",
    pending: "yellow",
    suspended: "red",
    inactive: "gray"
  };
  return (
    <Badge
      color={colorMap[status] ?? "gray"}
      variant="light"
      size="sm"
      tt="capitalize"
    >
      {status}
    </Badge>
  );
}

export function Users() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const { data, isLoading, error } = useUsers(
    debouncedSearch ? { search: debouncedSearch } : undefined
  );

  const users = data?.data ?? [];

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Users</Title>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={() => setCreateOpen(true)}
          >
            New User
          </Button>
        </Group>

        <TextInput
          placeholder="Search by name or email…"
          leftSection={<IconSearch size="1rem" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ maxWidth: 320 }}
        />

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
              Failed to load users
            </Alert>
          )}

          {!isLoading && !error && (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Verified</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text ta="center" c="dimmed" py="md" size="sm">
                        No users found
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {users.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      {user.firstName} {user.lastName}
                    </Table.Td>
                    <Table.Td>{user.email}</Table.Td>
                    <Table.Td>
                      <RoleBadge role={user.role} />
                    </Table.Td>
                    <Table.Td>
                      <StatusBadge status={user.status} />
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={user.emailVerified ? "green" : "gray"}
                        variant="dot"
                        size="sm"
                      >
                        {user.emailVerified ? "Yes" : "No"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end">
                        <Tooltip label="Edit">
                          <ActionIcon
                            variant="subtle"
                            onClick={() => setEditUser(user)}
                          >
                            <IconEdit size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => setDeleteUser(user)}
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

      <CreateUserModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EditUserModal
        user={editUser}
        opened={!!editUser}
        onClose={() => setEditUser(null)}
      />
      <DeleteUserModal
        user={deleteUser}
        opened={!!deleteUser}
        onClose={() => setDeleteUser(null)}
      />
    </>
  );
}
