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
import { IconPlus, IconAlertCircle, IconSearch } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useAllCompanies, useUpdateCompany } from "@/hooks/useCompany";
import { useMyOwner } from "@/hooks/useOwner";
import { useAuth } from "@/context/AuthContext";
import type { Company } from "@/types/Company.model";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import {
  getCompanyColumnDefs,
  defaultCompanyColDef
} from "./Companies.columns";
import { CreateCompanyModal } from "./Modals/CreateCompanyModal";
import { EditCompanyModal } from "./Modals/EditCompanyModal";
import { COMPANY_STATUS_OPTIONS } from "@/utils/constants";

export function Companies() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);

  const { user } = useAuth();
  const { data: myOwner } = useMyOwner();

  const isAdmin = user?.role === "admin";
  const isOwner = !!myOwner;

  const { data, isLoading, error } = useAllCompanies({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter ? { status: statusFilter } : {})
  });

  const updateCompany = useUpdateCompany();

  const handleDeactivate = (company: Company) => {
    if (window.confirm(`Deactivate "${company.name}"?`)) {
      updateCompany.mutate(
        { id: company.id, payload: { status: "inactive" } },
        {
          onSuccess: () =>
            notifications.show({
              title: "Company deactivated",
              message: `"${company.name}" has been set to inactive.`,
              color: "orange"
            }),
          onError: () =>
            notifications.show({
              title: "Error",
              message: "Failed to deactivate company",
              color: "red"
            })
        }
      );
    }
  };

  const columnDefs = useMemo(
    () =>
      getCompanyColumnDefs({
        onEdit: setEditCompany,
        onDeactivate: handleDeactivate
      }),
    []
  );

  const companies = data?.data ?? [];

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Companies</Title>
          {(isAdmin || isOwner) && (
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={() => setCreateOpen(true)}
            >
              New Company
            </Button>
          )}
        </Group>

        <Group gap="sm" align="flex-end">
          <TextInput
            placeholder="Search by name, registration number…"
            leftSection={<IconSearch size="1rem" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ maxWidth: 360 }}
          />
          <Select
            placeholder="All statuses"
            data={COMPANY_STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            style={{ minWidth: 160 }}
          />
        </Group>

        <Paper withBorder radius="md" style={{ height: 560 }}>
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
              Failed to load companies
            </Alert>
          )}

          {!isLoading && !error && (
            <DataGrid<Company>
              rowData={companies}
              columnDefs={columnDefs}
              defaultColDef={defaultCompanyColDef}
            />
          )}
        </Paper>
      </Stack>

      <CreateCompanyModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        myOwner={myOwner ?? null}
        isAdmin={isAdmin}
      />

      <EditCompanyModal
        company={editCompany}
        onClose={() => setEditCompany(null)}
      />
    </>
  );
}
