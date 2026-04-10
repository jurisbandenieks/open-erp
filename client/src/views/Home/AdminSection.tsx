import { Stack, SimpleGrid, Paper, Title, Group } from "@mantine/core";
import {
  IconUser,
  IconBuilding,
  IconUsers,
  IconBuildingSkyscraper,
  IconClock
} from "@tabler/icons-react";
import { useUsers } from "@/hooks/useUser";
import { useOwners } from "@/hooks/useOwner";
import { useAllCompanies } from "@/hooks/useCompany";
import { useEmployees } from "@/hooks/useEmployee";
import { StatCard } from "./StatCard";
import { QuickLink } from "./QuickLink";

export function AdminSection() {
  const { data: users } = useUsers();
  const { data: owners } = useOwners();
  const { data: companies } = useAllCompanies();
  const { data: employees } = useEmployees();

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <StatCard
          icon={<IconUser size={18} />}
          label="Users"
          value={users?.total ?? "—"}
          color="blue"
        />
        <StatCard
          icon={<IconBuildingSkyscraper size={18} />}
          label="Owners"
          value={owners?.length ?? "—"}
          color="violet"
        />
        <StatCard
          icon={<IconBuilding size={18} />}
          label="Companies"
          value={companies?.total ?? "—"}
          color="teal"
        />
        <StatCard
          icon={<IconUsers size={18} />}
          label="Employees"
          value={employees?.total ?? "—"}
          color="green"
        />
      </SimpleGrid>

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="md">
          Quick Links
        </Title>
        <Group gap="xs" wrap="wrap">
          <QuickLink
            to="/admin/users"
            label="Users"
            icon={<IconUser size={14} />}
          />
          <QuickLink
            to="/admin/owners"
            label="Owners"
            icon={<IconBuildingSkyscraper size={14} />}
          />
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
          <QuickLink
            to="/management/reports"
            label="Reports"
            icon={<IconClock size={14} />}
          />
        </Group>
      </Paper>
    </Stack>
  );
}
