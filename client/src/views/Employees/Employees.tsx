import { useState, useMemo, useEffect } from "react";
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
import { useEmployees, usePatchEmployee } from "@/api/useEmployee";
import { useMyCompanies } from "@/api/useCompany";
import { useMyOwner } from "@/api/useOwner";
import { useAuth } from "@/context/AuthContext";
import type { Employee } from "@/types/Employee.model";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import {
  getEmployeeColumnDefs,
  defaultEmployeeColDef
} from "./Employees.columns";
import { ManageRelationsModal } from "./Modals/ManageRelationsModal";
import { CreateEmployeeModal } from "./Modals/CreateEmployeeModal";

export function Employees() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [relationsEmployee, setRelationsEmployee] = useState<Employee | null>(
    null
  );
  const [createOpen, setCreateOpen] = useState(false);

  const { user } = useAuth();
  const { data: myCompanies = [] } = useMyCompanies();
  const { data: myOwner } = useMyOwner();

  const isOwner = !!myOwner;

  // Auto-select when the user has exactly one company
  useEffect(() => {
    if (myCompanies.length === 1) {
      setCompanyId(myCompanies[0].id);
    }
  }, [myCompanies]);

  const { data, isLoading, error } = useEmployees({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(companyId ? { companyId } : {})
  });

  const patchEmployee = usePatchEmployee();

  const handleDeactivate = (employee: Employee) => {
    if (
      window.confirm(`Deactivate ${employee.firstName} ${employee.lastName}?`)
    ) {
      patchEmployee.mutate({ id: employee.id, data: { status: "inactive" } });
    }
  };

  const columnDefs = useMemo(
    () =>
      getEmployeeColumnDefs({
        onManageRelations: setRelationsEmployee,
        onDeactivate: handleDeactivate
      }),
    []
  );

  const employees = data?.data ?? [];

  const companyOptions = myCompanies.map((c) => ({
    value: c.id,
    label: c.name
  }));
  const isAdmin = user?.role === "admin";
  const showCompanyFilter = isAdmin || myCompanies.length > 1;

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Employees</Title>
          {(isOwner || isAdmin) && (
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={() => setCreateOpen(true)}
            >
              New Employee
            </Button>
          )}
        </Group>

        <Group gap="sm" align="flex-end">
          <TextInput
            placeholder="Search by name, email, position, department…"
            leftSection={<IconSearch size="1rem" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ maxWidth: 360 }}
          />
          {showCompanyFilter && (
            <Select
              placeholder="All companies"
              data={companyOptions}
              value={companyId}
              onChange={setCompanyId}
              clearable={isAdmin}
              style={{ minWidth: 200 }}
            />
          )}
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
              Failed to load employees
            </Alert>
          )}

          {!isLoading && !error && (
            <DataGrid<Employee>
              rowData={employees}
              columnDefs={columnDefs}
              defaultColDef={defaultEmployeeColDef}
            />
          )}
        </Paper>
      </Stack>

      <ManageRelationsModal
        employee={relationsEmployee}
        onClose={() => setRelationsEmployee(null)}
      />

      <CreateEmployeeModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        companies={myCompanies}
        defaultCompanyId={companyId}
      />
    </>
  );
}
