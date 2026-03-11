import { useState, useMemo } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import {
  Title,
  Button,
  Group,
  Stack,
  Alert,
  Loader,
  Center,
  Paper,
  TextInput,
  Select
} from "@mantine/core";
import {
  IconPlus,
  IconAlertCircle,
  IconSearch,
  IconBuilding
} from "@tabler/icons-react";
import { useUsers } from "@/api/useUser";
import { useCompanies } from "@/api/useCompany";
import type { User } from "@/types/User.model";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import { getUserColumnDefs, defaultUserColDef } from "./Users.columns";
import { CreateUserModal } from "./Modals/CreateUserModal";
import { EditUserModal } from "./Modals/EditUserModal";
import { DeleteUserModal } from "./Modals/DeleteUserModal";

export function Users() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const { data: companiesData } = useCompanies();
  const companyOptions = (companiesData ?? []).map((c) => ({
    value: c.id,
    label: c.name
  }));

  const params: Record<string, string> = {};
  if (debouncedSearch) params.search = debouncedSearch;
  if (companyId) params.companyId = companyId;

  const { data, isLoading, error } = useUsers(
    Object.keys(params).length ? params : undefined
  );

  const users = data?.data ?? [];

  const columnDefs = useMemo(
    () => getUserColumnDefs({ onEdit: setEditUser, onDelete: setDeleteUser }),
    []
  );

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

        <Group gap="sm">
          <TextInput
            placeholder="Search by name or email…"
            leftSection={<IconSearch size="1rem" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ minWidth: 240 }}
          />
          <Select
            placeholder="All companies"
            leftSection={<IconBuilding size="1rem" />}
            data={companyOptions}
            value={companyId}
            onChange={setCompanyId}
            clearable
            style={{ minWidth: 200 }}
          />
        </Group>

        <Paper withBorder radius="md" style={{ height: 520 }}>
          {isLoading && (
            <Center h="100%">
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
            <DataGrid<User>
              rowData={users}
              columnDefs={columnDefs}
              defaultColDef={defaultUserColDef}
            />
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
