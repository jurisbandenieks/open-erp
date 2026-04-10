import { Paper, Title, Loader, Stack, Text, Group } from "@mantine/core";
import { useNavigate } from "react-router";
import { useEmployeeManagers } from "@/hooks/useEmployee";
import { PersonChip } from "./PersonChip";

export function EmployeeSection({ employeeId }: { employeeId: string }) {
  const navigate = useNavigate();
  const { data: managers, isLoading } = useEmployeeManagers(employeeId);

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="sm">
        My Team
      </Title>
      {isLoading ? (
        <Loader size="sm" />
      ) : (
        <>
          {managers?.managers?.length > 0 && (
            <Stack gap="xs" mb="sm">
              <Text size="sm" fw={600} c="dimmed">
                Managers
              </Text>
              <Group gap="xs">
                {managers.managers.map(
                  (m: { id: string; firstName: string; lastName: string }) => (
                    <PersonChip
                      key={m.id}
                      name={`${m.firstName} ${m.lastName}`}
                      onClick={() => navigate(`/management/employees`)}
                    />
                  )
                )}
              </Group>
            </Stack>
          )}
          {managers?.managees?.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" fw={600} c="dimmed">
                Direct Reports
              </Text>
              <Group gap="xs">
                {managers.managees.map(
                  (m: { id: string; firstName: string; lastName: string }) => (
                    <PersonChip
                      key={m.id}
                      name={`${m.firstName} ${m.lastName}`}
                      onClick={() => navigate(`/management/employees`)}
                    />
                  )
                )}
              </Group>
            </Stack>
          )}
          {!managers?.managers?.length && !managers?.managees?.length && (
            <Text size="sm" c="dimmed">
              No managers or direct reports assigned.
            </Text>
          )}
        </>
      )}
    </Paper>
  );
}
