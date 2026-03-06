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
  TextInput
} from "@mantine/core";
import { IconPlus, IconAlertCircle, IconSearch } from "@tabler/icons-react";
import { useEmployees, useDeleteEmployee } from "@/api/useEmployee";
import type { Employee } from "@/types/Employee.model";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import {
  getEmployeeColumnDefs,
  defaultEmployeeColDef
} from "./Employees.columns";
import { ManageRelationsModal } from "./ManageRelationsModal";

export function Employees() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [relationsEmployee, setRelationsEmployee] = useState<Employee | null>(
    null
  );

  const { data, isLoading, error } = useEmployees(
    debouncedSearch ? { search: debouncedSearch } : undefined
  );

  const deleteEmployee = useDeleteEmployee();

  const handleDelete = (employee: Employee) => {
    if (
      window.confirm(
        `Remove ${employee.firstName} ${employee.lastName}? This cannot be undone.`
      )
    ) {
      deleteEmployee.mutate(employee.id);
    }
  };

  const columnDefs = useMemo(
    () =>
      getEmployeeColumnDefs({
        onManageRelations: setRelationsEmployee,
        onDelete: handleDelete
      }),
    []
  );

  const employees = data?.data ?? [];

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Employees</Title>
          <Button leftSection={<IconPlus size="1rem" />} disabled>
            New Employee
          </Button>
        </Group>

        <TextInput
          placeholder="Search by name, email, position, department…"
          leftSection={<IconSearch size="1rem" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ maxWidth: 360 }}
        />

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
    </>
  );
}
