import {
  Paper,
  Title,
  Loader,
  Stack,
  Text,
  Group,
  ThemeIcon
} from "@mantine/core";
import { IconBuilding, IconUsers } from "@tabler/icons-react";
import { useMyCompanies } from "@/hooks/useCompany";
import { QuickLink } from "./QuickLink";

export function OwnerSection() {
  const { data: companies = [], isLoading } = useMyCompanies();

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4} mb="sm">
        My Companies
      </Title>
      {isLoading ? (
        <Loader size="sm" />
      ) : companies.length === 0 ? (
        <Text size="sm" c="dimmed">
          No companies found.
        </Text>
      ) : (
        <Stack gap="xs">
          {companies.map((c) => (
            <Group key={c.id} justify="space-between">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="teal">
                  <IconBuilding size={12} />
                </ThemeIcon>
                <Text size="sm">{c.name}</Text>
              </Group>
            </Group>
          ))}
        </Stack>
      )}
      <Group mt="md" gap="xs">
        <QuickLink
          to="/management/companies"
          label="Companies"
          icon={<IconBuilding size={14} />}
        />
        <QuickLink
          to="/management/employees"
          label="Employees"
          icon={<IconUsers size={14} />}
        />
      </Group>
    </Paper>
  );
}
