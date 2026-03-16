import {
  Stack,
  Title,
  Text,
  Group,
  Paper,
  Badge,
  SimpleGrid,
  Avatar,
  Divider,
  Loader,
  Center,
  ThemeIcon,
  Button
} from "@mantine/core";
import {
  IconUser,
  IconBuilding,
  IconUsers,
  IconBuildingSkyscraper,
  IconClock,
  IconCalendar
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import {
  useMyEmployee,
  useEmployees,
  useEmployeeManagers
} from "@/api/useEmployee";
import { useMyOwner, useOwners } from "@/api/useOwner";
import { useMyCompanies, useAllCompanies } from "@/api/useCompany";
import { useUsers } from "@/api/useUser";

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color = "blue"
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color?: string;
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group>
        <ThemeIcon size="lg" variant="light" color={color}>
          {icon}
        </ThemeIcon>
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
          <Text fw={700} size="lg">
            {value}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}

// ─── Quick link button ────────────────────────────────────────────────────────

function QuickLink({
  to,
  label,
  icon
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <Button
      variant="light"
      leftSection={icon}
      onClick={() => navigate(to)}
      size="sm"
    >
      {label}
    </Button>
  );
}

// ─── Person chip (manager / managee) ─────────────────────────────────────────

function PersonChip({ name, onClick }: { name: string; onClick?: () => void }) {
  return (
    <Badge
      variant="outline"
      size="lg"
      style={{ cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      {name}
    </Badge>
  );
}

// ─── Employee section ─────────────────────────────────────────────────────────

function EmployeeSection({ employeeId }: { employeeId: string }) {
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

// ─── Owner section ────────────────────────────────────────────────────────────

function OwnerSection() {
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

// ─── Admin section ────────────────────────────────────────────────────────────

function AdminSection() {
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

// ─── Home ─────────────────────────────────────────────────────────────────────

export const Home = () => {
  const { user } = useAuth();
  const { data: myEmployee, isLoading: empLoading } = useMyEmployee();
  const { data: myOwner, isLoading: ownerLoading } = useMyOwner();

  const isAdmin = user?.role === "admin";
  const isOwnerRole = user?.role === "owner";
  const isEmployee = !!myEmployee;

  if (empLoading || ownerLoading) {
    return (
      <Center h="60vh">
        <Loader size="lg" />
      </Center>
    );
  }

  const roleColor: Record<string, string> = {
    admin: "red",
    owner: "violet",
    manager: "orange",
    employee: "blue"
  };

  return (
    <Stack gap="lg" p="md">
      {/* Profile summary */}
      <Paper withBorder p="md" radius="md">
        <Group>
          <Avatar size="lg" radius="xl" color="blue">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
          <div>
            <Title order={3}>
              Welcome, {user?.firstName} {user?.lastName}
            </Title>
            <Group gap="xs" mt={4}>
              <Badge
                color={roleColor[user?.role ?? "employee"] ?? "gray"}
                variant="light"
              >
                {user?.role}
              </Badge>
              <Text size="sm" c="dimmed">
                {user?.email}
              </Text>
            </Group>
          </div>
        </Group>

        {isEmployee && (
          <>
            <Divider my="sm" />
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="blue">
                  <IconBuilding size={12} />
                </ThemeIcon>
                <Text size="sm">
                  <Text span fw={500}>
                    Position:{" "}
                  </Text>
                  {myEmployee.position}
                </Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="teal">
                  <IconUsers size={12} />
                </ThemeIcon>
                <Text size="sm">
                  <Text span fw={500}>
                    Department:{" "}
                  </Text>
                  {myEmployee.department}
                </Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="green">
                  <IconUser size={12} />
                </ThemeIcon>
                <Text size="sm" span fw={500}>
                  Status:
                </Text>
                <Badge
                  size="xs"
                  color={myEmployee.status === "active" ? "green" : "gray"}
                  variant="dot"
                >
                  {myEmployee.status}
                </Badge>
              </Group>
            </SimpleGrid>
          </>
        )}
      </Paper>

      {/* My Space quick links */}
      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="md">
          My Space
        </Title>
        <Group gap="xs">
          <QuickLink
            to="/timelogs"
            label="Timelogs"
            icon={<IconClock size={14} />}
          />
          <QuickLink
            to="/absences"
            label="Absences"
            icon={<IconCalendar size={14} />}
          />
        </Group>
      </Paper>

      {/* Employee section */}
      {isEmployee && <EmployeeSection employeeId={myEmployee.id} />}

      {/* Owner section */}
      {(myOwner || isOwnerRole) && <OwnerSection />}

      {/* Admin section */}
      {isAdmin && <AdminSection />}
    </Stack>
  );
};
