import { useEffect, useState } from "react";
import {
  Modal,
  Stack,
  Tabs,
  MultiSelect,
  Button,
  Group,
  Text,
  Loader,
  Center,
  Alert
} from "@mantine/core";
import { IconUsersGroup, IconAlertCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  useEmployee,
  useAssignManagers,
  useAssignManagees
} from "@/hooks/useEmployee";
import { useEmployees } from "@/hooks/useEmployee";
import type { Employee } from "@/types/Employee.model";

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

export function ManageRelationsModal({ employee, onClose }: Props) {
  const opened = !!employee;

  // Full detail for current manager/managee IDs
  const { data: detail, isLoading: detailLoading } = useEmployee(
    employee?.id ?? "",
    { enabled: opened }
  );

  // All employees for the multiselect options (exclude self)
  const { data: allEmployeesData, isLoading: allLoading } = useEmployees(
    undefined,
    { enabled: opened }
  );

  const allEmployees = allEmployeesData?.data ?? [];
  const options = allEmployees
    .filter((e) => e.id !== employee?.id)
    .map((e) => ({
      value: e.id,
      label: `${e.firstName} ${e.lastName} (${e.position})`
    }));

  const [managerIds, setManagerIds] = useState<string[]>([]);
  const [manageeIds, setManageeIds] = useState<string[]>([]);

  // Sync state when detail loads
  useEffect(() => {
    if (detail) {
      setManagerIds(detail.managerIds ?? []);
      setManageeIds(detail.manageeIds ?? []);
    }
  }, [detail]);

  const assignManagers = useAssignManagers();
  const assignManagees = useAssignManagees();

  const isSaving = assignManagers.isPending || assignManagees.isPending;

  const handleSave = async () => {
    if (!employee) return;
    try {
      await Promise.all([
        assignManagers.mutateAsync({ id: employee.id, managerIds }),
        assignManagees.mutateAsync({ id: employee.id, manageeIds })
      ]);
      notifications.show({
        title: "Saved",
        message: "Relations updated successfully",
        color: "green"
      });
      onClose();
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to update relations",
        color: "red"
      });
    }
  };

  const isLoading = detailLoading || allLoading;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        employee ? (
          <Group gap="xs">
            <IconUsersGroup size="1.2rem" />
            <Text fw={600}>
              Manage Relations — {employee.firstName} {employee.lastName}
            </Text>
          </Group>
        ) : null
      }
      size="lg"
    >
      {isLoading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <Stack gap="md">
          <Tabs defaultValue="managers">
            <Tabs.List>
              <Tabs.Tab value="managers">
                Managers{" "}
                <Text span c="dimmed" size="xs">
                  ({managerIds.length})
                </Text>
              </Tabs.Tab>
              <Tabs.Tab value="managees">
                Managees{" "}
                <Text span c="dimmed" size="xs">
                  ({manageeIds.length})
                </Text>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="managers" pt="md">
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Select who manages{" "}
                  <Text span fw={500} c="dark">
                    {employee?.firstName} {employee?.lastName}
                  </Text>
                  .
                </Text>
                <MultiSelect
                  data={options}
                  value={managerIds}
                  onChange={setManagerIds}
                  placeholder="Search and select managers…"
                  searchable
                  clearable
                  nothingFoundMessage="No employees found"
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="managees" pt="md">
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Select who{" "}
                  <Text span fw={500} c="dark">
                    {employee?.firstName} {employee?.lastName}
                  </Text>{" "}
                  manages.
                </Text>
                <MultiSelect
                  data={options}
                  value={manageeIds}
                  onChange={setManageeIds}
                  placeholder="Search and select managees…"
                  searchable
                  clearable
                  nothingFoundMessage="No employees found"
                />
              </Stack>
            </Tabs.Panel>
          </Tabs>

          {(assignManagers.isError || assignManagees.isError) && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="red"
              variant="light"
            >
              Failed to save relations. Please try again.
            </Alert>
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={isSaving} onClick={handleSave}>
              Save
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
