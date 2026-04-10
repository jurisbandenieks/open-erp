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
  ThemeIcon
} from "@mantine/core";
import {
  IconUser,
  IconBuilding,
  IconUsers,
  IconClock,
  IconCalendar
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import { useMyEmployee } from "@/hooks/useEmployee";
import { useMyOwner } from "@/hooks/useOwner";
import { QuickLink } from "./QuickLink";
import { EmployeeSection } from "./EmployeeSection";
import { OwnerSection } from "./OwnerSection";
import { AdminSection } from "./AdminSection";

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
      {isEmployee && (
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
      )}

      {/* Employee section */}
      {isEmployee && <EmployeeSection employeeId={myEmployee.id} />}

      {/* Owner section */}
      {(myOwner || isOwnerRole) && <OwnerSection />}

      {/* Admin section */}
      {isAdmin && <AdminSection />}
    </Stack>
  );
};
